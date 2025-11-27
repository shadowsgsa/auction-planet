
import { Clock, Gavel, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import BidDialog from '@/components/BidDialog';

interface AuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  buyNowPrice?: number;
  category: string;
  isLive?: boolean;
}

const AuctionCard = ({ 
  id,
  title, 
  image, 
  currentBid, 
  timeLeft, 
  buyNowPrice, 
  category,
  isLive = false 
}: AuctionCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isBuyNowItem = timeLeft === 'Buy Now';
  const isAuctionItem = !isBuyNowItem;

  const handleAddToCart = () => {
    if (buyNowPrice) {
      addToCart({
        id,
        title,
        image,
        price: buyNowPrice,
        type: 'buy-now'
      });
      toast({
        title: "Added to cart",
        description: `${title} has been added to your cart.`,
      });
    }
  };

  const handleBuyNow = () => {
    if (buyNowPrice) {
      addToCart({
        id,
        title,
        image,
        price: buyNowPrice,
        type: 'buy-now'
      });
      toast({
        title: "Added to cart",
        description: `${title} has been added to your cart. Proceed to checkout to complete your purchase.`,
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/auction/${id}`);
  };
  const getFirstImage = (image: string | string[]) => {
  if (Array.isArray(image)) return image[0];
  try {
    return JSON.parse(image)[0];
  } catch {
    return typeof image === "string" ? image : "";
  }
};


  return (
    <Card className="group hover:shadow-card transition-all duration-300 overflow-hidden cursor-pointer" onClick={handleCardClick}>
      {/* <div className="relative">
        <img 
          src={getFirstImage(image)} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge variant={isLive ? "destructive" : "secondary"}>
            {isLive ? "LIVE" : category}
          </Badge>
        </div>
        <button className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors">
          <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{title}</h3>
        
        <div className="space-y-2">
          {isAuctionItem && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Current Bid</span>
              <span className="font-bold text-primary">${currentBid.toLocaleString()}</span>
            </div>
          )}
          
          {isBuyNowItem && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Price</span>
              <span className="font-bold text-success">${currentBid.toLocaleString()}</span>
            </div>
          )}
          
          {buyNowPrice && isAuctionItem && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Buy Now</span>
              <span className="font-semibold text-success">${buyNowPrice.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center text-warning text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{timeLeft}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isAuctionItem && (
          <BidDialog itemTitle={title} currentBid={currentBid} auctionItemId={Number(id)}>
            <Button variant="auction" className="flex-1">
              <Gavel className="h-4 w-4 mr-2" />
              Place Bid
            </Button>
          </BidDialog>
        )}
        
        {isBuyNowItem && (
          <>
            <Button variant="buy" className="flex-1" onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="default" className="flex-1" onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}>
              Buy Now
            </Button>
          </>
        )}
        
        {buyNowPrice && isAuctionItem && (
          <Button variant="buy" className="flex-1" onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        )}
      </CardFooter> */}
    </Card>
  );
};

export default AuctionCard;
