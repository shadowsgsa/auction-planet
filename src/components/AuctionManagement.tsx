import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, DollarSign, Gavel, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AuctionData {
  id: string;
  title: string;
  current_price: number;
  starting_price: number;
  reserve_price: number;
  end_time: string;
  status: string;
  category: string;
  image_url: string | null;
  quantity: number;
  bidCount: number;
  watchers: number;
}

const AuctionManagement = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit modal state
  const [editingAuction, setEditingAuction] = useState<AuctionData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [reservePrice, setReservePrice] = useState<number>(0);
  const [endTime, setEndTime] = useState(''); // for datetime-local
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (user?.id) fetchAuctions();
    else setLoading(false);
  }, [user]);

  const fetchAuctions = async () => {
    if (!user?.id) return setLoading(false);
    try {
      const { data, error } = await supabase
        .from('auction_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const auctionsWithMetrics = await Promise.all(
        (data || []).map(async (auction: any) => {
          const { count } = await supabase
            .from('bids')
            .select('*', { count: 'exact', head: true })
            .eq('auction_item_id', auction.id);

          return {
            ...auction,
            bidCount: count || 0,
            watchers: Math.floor(Math.random() * 50) + 5
          } as AuctionData;
        })
      );

      setAuctions(auctionsWithMetrics);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      alert(`Failed to load auctions: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (auction: AuctionData) => {
    setEditingAuction(auction);
    setTitle(auction.title);
    setCategory(auction.category);
    setQuantity(auction.quantity ?? 1);
    setStartingPrice(auction.starting_price ?? 0);
    setReservePrice(auction.reserve_price ?? 0);
    // convert to datetime-local format (YYYY-MM-DDTHH:mm)
    try {
      const dt = new Date(auction.end_time);
      setEndTime(isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 16));
    } catch {
      setEndTime('');
    }
    setImageUrl(auction.image_url ?? null);
    setStatus(auction.status ?? 'pending');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAuction(null);
  };

  const handleSave = async () => {
    if (!editingAuction) return;
    setSaving(true);

    // Basic validation
    if (!title.trim()) {
      alert('Title is required');
      setSaving(false);
      return;
    }

    const payload: any = {
      title: title.trim(),
      category,
      quantity: Number(quantity) || 1,
      starting_price: Number(startingPrice) || 0,
      reserve_price: Number(reservePrice) || 0,
      status,
      image_url: imageUrl
    };

    // end_time: convert from datetime-local to ISO
    if (endTime) {
      const iso = new Date(endTime).toISOString();
      payload.end_time = iso;
    }

    try {
      const { data, error } = await supabase
        .from('auction_items')
        .update(payload)
        .eq('id', editingAuction.id)
        .select()
        .single();

      if (error) throw error;

      // update local state
      setAuctions(prev => prev.map(a => {
        if (a.id === editingAuction.id) {
          return {
            ...a,
            ...data,
            // preserve derived fields if not provided
            bidCount: a.bidCount ?? 0,
            watchers: a.watchers ?? a.watchers
          } as AuctionData;
        }
        return a;
      }));

      closeModal();
    } catch (err) {
      console.error('Failed to update auction:', err);
      alert(`Failed to update listing: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference <= 0) return 'Ended';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string, endTime: string): "default" | "destructive" | "outline" | "secondary" => {
    const isEnded = new Date(endTime) <= new Date();
    if (isEnded) return 'default';

    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'sold': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || auction.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalRevenue = auctions
    .filter(a => a.status === 'sold')
    .reduce((sum, a) => sum + a.current_price, 0);

  const activeAuctions = auctions.filter(a => a.status === 'active' && new Date(a.end_time) > new Date()).length;
  const totalBids = auctions.reduce((sum, a) => sum + a.bidCount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gavel className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Auctions</p>
                <p className="text-2xl font-bold">{activeAuctions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold">{totalBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Sale Price</p>
                <p className="text-2xl font-bold">
                  ${auctions.filter(a => a.status === 'sold').length > 0 
                    ? (totalRevenue / auctions.filter(a => a.status === 'sold').length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Auction Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Art & Antiques">Art & Antiques</SelectItem>
                  <SelectItem value="Watches & Jewelry">Watches & Jewelry</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Collectibles">Collectibles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auction List */}
      <div className="space-y-4">
        {filteredAuctions.map((auction) => (
          <Card key={auction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-24 h-24 bg-muted rounded-lg overflow-hidden">
                  {auction.image_url ? (
                    <img 
                      src={auction.image_url} 
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Gavel className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{auction.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {auction.category} • Qty: {auction.quantity}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(auction.status, auction.end_time)}>
                      {new Date(auction.end_time) <= new Date() ? 'Ended' : auction.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Bid</p>
                      <p className="font-semibold">${auction.current_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Starting Bid</p>
                      <p className="font-medium">${auction.starting_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Left</p>
                      <p className="font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeRemaining(auction.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bids</p>
                      <p className="font-medium flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {auction.bidCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Watchers</p>
                      <p className="font-medium flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {auction.watchers}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(auction)}>
                      Edit Listing
                    </Button>
                    {auction.status === 'active' && (
                      <Button variant="outline" size="sm">
                        End Early
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAuctions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No auctions found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'You haven\'t created any auctions yet. Start by listing your first item!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal (simple implementation) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Edit Listing</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <Label>Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>

              <div>
                <Label>Quantity</Label>
                <Input type="number" value={String(quantity)} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>

              <div>
                <Label>Starting Price</Label>
                <Input type="number" value={String(startingPrice)} onChange={(e) => setStartingPrice(Number(e.target.value))} />
              </div>

              <div>
                <Label>Reserve Price</Label>
                <Input type="number" value={String(reservePrice)} onChange={(e) => setReservePrice(Number(e.target.value))} />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>

              <div className="col-span-2">
                <Label>Image URL (or leave blank)</Label>
                <Input value={imageUrl ?? ''} onChange={(e) => setImageUrl(e.target.value || null)} />
                {imageUrl && (
                  <div className="mt-2">
                    <img src={imageUrl} alt="preview" className="w-48 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionManagement;
