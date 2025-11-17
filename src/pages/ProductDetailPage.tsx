import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Heart, Share, Eye, Gavel, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import BidDialog from '@/components/BidDialog';

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  images?: string[] | null; // jsonb column
  current_price: number;
  starting_price: number;
  end_time: string;
  category: string;
  condition: string;
  status: string;
  seller_id: string;
}

interface Bid {
  id: string;
  amount: number;
  bidder_id: string;
  created_at: string;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [item, setItem] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);

  // gallery state
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem();
      fetchBids();
    }
  }, [id]);

  useEffect(() => {
    if (item) {
      // reset main image index if images changed
      setMainImageIndex(0);
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(item.end_time));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [item]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('auction_items')
        .select('*')
        .eq('id', id)
        .eq('consignment_status', 'approved')
        .single();

      if (error) {
        console.error('Error fetching item:', error);
        navigate('/404');
        return;
      }

      // Normalize images: prefer `images` jsonb array, fall back to `image_url`.
      const imgs: string[] = Array.isArray((data as any).images) && (data as any).images.length > 0
        ? (data as any).images
        : (data as any).image_url
          ? [(data as any).image_url]
          : [];

      const normalized: AuctionItem = {
        id: String((data as any).id),
        title: (data as any).title,
        description: (data as any).description,
        image_url: (data as any).image_url ?? null,
        images: imgs,
        current_price: (data as any).current_price,
        starting_price: (data as any).starting_price,
        end_time: (data as any).end_time,
        category: (data as any).category,
        condition: (data as any).condition,
        status: (data as any).status,
        seller_id: (data as any).seller_id
      };

      setItem(normalized);
    } catch (error) {
      console.error('Error in fetchItem:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_item_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching bids:', error);
        return;
      }

      setBids((data as any) || []);
    } catch (error) {
      console.error('Error in fetchBids:', error);
    }
  };

  const calculateTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Auction Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handleWatchItem = () => {
    setIsWatching(!isWatching);
    toast({
      title: isWatching ? 'Removed from Watchlist' : 'Added to Watchlist',
      description: isWatching
        ? 'You will no longer receive updates for this item.'
        : "You'll be notified of bid updates and status changes."
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Product link has been copied to your clipboard.'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading auction item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <p className="text-muted-foreground mb-4">The auction item you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/auctions')}>Browse Auctions</Button>
        </div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : item.image_url ? [item.image_url] : [];
  const currentImage = images[mainImageIndex] ?? 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800';

  const isAuctionEnded = new Date(item.end_time) <= new Date();
  const isAuctionActive = !isAuctionEnded && item.status === 'active';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{item.category}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image + Thumbnails */}
          <div className="lg:col-span-2">
            <div className="relative mb-4">
              <img
                src={currentImage}
                alt={item.title}
                className="w-full h-96 object-contain rounded-lg bg-white"
                onClick={() => images.length > 0 && setGalleryOpen(true)}
              />

              <div className="absolute top-4 left-4">
                <Badge variant={isAuctionActive ? 'default' : 'secondary'}>
                  {isAuctionEnded ? 'ENDED' : item.category}
                </Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((src, idx) => (
                  <button key={src} onClick={() => setMainImageIndex(idx)} className={`rounded border p-1 ${idx === mainImageIndex ? 'ring-2 ring-offset-2' : ''}`}>
                    <img src={src} alt={`thumb-${idx}`} className="w-24 h-24 object-cover rounded" />
                  </button>
                ))}
              </div>
            )}

            {/* Item Details */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                    <p className="text-foreground">{item.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Condition</span>
                    <p className="text-foreground">{item.condition}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <span className="text-sm font-medium text-muted-foreground mb-2 block">Description</span>
                  <p className="text-foreground leading-relaxed">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">127 watching</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleWatchItem} className={isWatching ? 'text-destructive' : ''}>
                      <Heart className={`h-4 w-4 ${isWatching ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">${item.current_price.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Current Bid</div>
                </div>

                <div className="flex items-center justify-center gap-2 text-warning">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{timeLeft}</span>
                </div>

                <div className="space-y-3">
                  {isAuctionActive && (
                    <BidDialog itemTitle={item.title} currentBid={item.current_price} auctionItemId={item.id}>
                      <Button className="w-full" size="lg">
                        <Gavel className="h-4 w-4 mr-2" />
                        Place Bid
                      </Button>
                    </BidDialog>
                  )}

                  {isAuctionEnded && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <span className="text-muted-foreground">This auction has ended</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starting Bid</span>
                    <span className="font-medium">${item.starting_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Bids</span>
                    <span className="font-medium">{bids.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bids */}
            {bids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bids.slice(0, 5).map((bid) => (
                      <div key={bid.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">U</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">User***</span>
                        </div>
                        <div className="text-sm font-medium">${bid.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen gallery modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-5xl bg-background rounded-lg shadow-lg overflow-hidden">
            <button onClick={() => setGalleryOpen(false)} className="absolute top-3 right-3 z-20 p-2 rounded-full bg-muted/80">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center">
              <button onClick={() => setMainImageIndex((i) => (i - 1 + images.length) % images.length)} className="p-4 hidden md:block">
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex-1 p-4">
                <img src={images[mainImageIndex]} alt={`image-${mainImageIndex}`} className="w-full h-[70vh] object-contain" />

                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {images.map((src, idx) => (
                    <button key={src} onClick={() => setMainImageIndex(idx)} className={`rounded border p-1 ${idx === mainImageIndex ? 'ring-2 ring-offset-2' : ''}`}>
                      <img src={src} alt={`thumb-${idx}`} className="w-20 h-20 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setMainImageIndex((i) => (i + 1) % images.length)} className="p-4 hidden md:block">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
