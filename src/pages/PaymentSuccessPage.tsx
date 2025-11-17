import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');
  const item = searchParams.get('item');

  useEffect(() => {
    // You could add analytics tracking here
    console.log('Payment successful for amount:', amount, 'item:', item);
    const sessionId = searchParams.get('session_id');
    const listingId = searchParams.get('listingId');
    console.log(listingId);
    console.log(sessionId);
    if (sessionId) {
      (async () => {
        try {
          console.log('Verifying session and activating listing via function. session:', sessionId, 'listingId:', listingId);
          const payload: any = { session_id: sessionId, };
          if (listingId) payload.listingId = listingId;

          const { data, error } = await (supabase as any).functions.invoke('verify-and-activate-listing', {
            body: payload
          });
          console.log(payload);
    console.log(listingId);


          if (error) {
            console.error('verify-and-activate-listing function error:', error);
          } else {
            console.log('verify-and-activate-listing result:', data);
          }
        } catch (e) {
          console.error('Exception calling verify-and-activate-listing:', e);
        }
      })();
    }
    
  }, [amount, item]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your bid has been successfully placed
            </p>
            {amount && (
              <p className="text-lg font-semibold text-primary">
                Amount: ${parseFloat(amount).toLocaleString()}
              </p>
            )}
            {item && (
              <p className="text-sm text-muted-foreground">
                Item: {decodeURIComponent(item)}
              </p>
            )}
          </div>
          <div className="pt-4">
            <Link to="/">
              <Button className="w-full" variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Auctions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;