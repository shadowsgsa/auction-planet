import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import PaymentDialog from '@/components/PaymentDialog';

const CartPage = () => {
  const { items, removeFromCart, clearCart, getTotalPrice, getItemCount } = useCart();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      clearCart();
      // Redirect to success page or show success message
      alert('Payment successful! Thank you for your purchase.');
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to get started</p>
            <Link to="/auctions">
              <Button>Browse Auctions</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">{getItemCount()} item{getItemCount() !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={item.type === 'auction' ? 'default' : 'secondary'}>
                          {item.type === 'auction' ? 'Auction' : 'Buy Now'}
                        </Badge>
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${(item.price * (item.quantity || 1)).toLocaleString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="mt-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(getTotalPrice() * 0.08).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${(getTotalPrice() * 1.08).toLocaleString()}</span>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  <Link to="/auctions" className="block">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentDialog
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        title="Complete Your Purchase"
        description="Secure payment for your cart items"
        amount={getTotalPrice() * 1.08}
        isLoading={isProcessing}
        showAdminReview={false}
      />
    </div>
  );
};

export default CartPage;