import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List } from 'lucide-react';
import AuctionCard from '@/components/AuctionCard';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

const categories = ['All Categories', 'Art', 'Watches', 'Jewelry', 'Collectibles', 'Antiques', 'Electronics', 'Fashion'];

const LotPage = () => {
  const { id } = useParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, [id]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch all lots for this auction
      const { data: lots, error } = await supabase
        .from('lots')
        .select('*')
        .eq('auction_id', Number(id))
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2️⃣ Fetch all bids for these lots in one query
      const lotIds = lots.map((l) => l.id);

      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('auction_item_id, amount')
        .in('auction_item_id', lotIds);

      if (bidsError) throw bidsError;

      // 3️⃣ Map highest bid for each lot
      const highestBids: Record<number, number> = {};

      bidsData.forEach((bid) => {
        const lotId = bid.auction_item_id;
        const amount = bid.amount;

        if (!highestBids[lotId] || amount > highestBids[lotId]) {
          highestBids[lotId] = amount;
        }
      });

      // 4️⃣ Format output for AuctionCard
      const formatted = lots.map((item) => {
        const highestBid = highestBids[item.id] || item.starting_bid;

        return {
          id: String(item.id),
          title: item.title,
          image: item.image_urls,
          currentBid: highestBid,
          timeLeft: calculateTimeLeft(item.end_date),
          category: item.category,
          isLive: calculateTimeLeft(item.end_date) !== 'Ended',
        };
      });

      setAuctions(formatted);
      console.log("Formatted Auctions:", formatted);

    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endTime: string) => {
    const now = Date.now();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredAuctions = auctions
    .filter((auction) => {
      const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All Categories' || auction.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'highest-bid':
          return b.currentBid - a.currentBid;
        case 'lowest-bid':
          return a.currentBid - b.currentBid;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Live Auctions</h1>
          <p className="text-muted-foreground">Discover amazing items and place your bids</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="highest-bid">Highest Bid</SelectItem>
                <SelectItem value="lowest-bid">Lowest Bid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'All Categories' && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSelectedCategory('All Categories')}
              >
                {selectedCategory} ×
              </Badge>
            )}
            {searchTerm && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setSearchTerm('')}
              >
                "{searchTerm}" ×
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAuctions.length} of {auctions.length} auctions
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading auctions...</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAuctions.length > 0 ? (
              filteredAuctions.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No auctions found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Auctions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LotPage;
