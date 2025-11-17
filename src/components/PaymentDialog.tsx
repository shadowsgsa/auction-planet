'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  amount: number;
  isLoading?: boolean;
  showAdminReview?: boolean;
  onUpload?: (file: File) => Promise<void> | void;
  // server check URL (fallback)
  adminCheckUrl?: string; // e.g. 'https://your-domain.com/admin-check'
}

const PaymentDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  amount,
  isLoading = false,
  showAdminReview = false,
  onUpload,
  adminCheckUrl,
}: PaymentDialogProps) => {
  const [processingProvider, setProcessingProvider] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const detectAdmin = async () => {
      console.log('[admin-check] start');

      try {
        // 1) get session & token
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.warn('[admin-check] sessionError', sessionError);
        const session = sessionData?.session ?? null;
        const token = session?.access_token ?? null;
        const userId = session?.user?.id ?? null;

        console.log('[admin-check] session userId:', userId);

        if (!userId) {
          if (mounted) setIsAdmin(false);
          console.log('[admin-check] no user session found -> non-admin');
          return;
        }

        // 2) Try client-side query FIRST (fast when allowed)
        try {
          const { data: rolesData, error: rolesErr } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .limit(1);

          console.log('[admin-check] client rolesData, rolesErr:', rolesData, rolesErr);

          if (!rolesErr && Array.isArray(rolesData) && rolesData.length > 0) {
            if (mounted) setIsAdmin(true);
            console.log('[admin-check] client-side detected admin');
            return;
          }

          // If rolesErr exists or data empty -> fallthrough to server check
          if (rolesErr) console.warn('[admin-check] client query error, will fallback to server check', rolesErr);
        } catch (clientQueryErr) {
          console.warn('[admin-check] client query threw:', clientQueryErr);
        }

        // 3) FALLBACK: call server endpoint that uses service role key
        if (!adminCheckUrl) {
          console.warn('[admin-check] adminCheckUrl not provided; defaulting to non-admin');
          if (mounted) setIsAdmin(false);
          // Informational toast (no variant)
          toast?.({
            title: 'Admin check skipped',
            description: 'No admin-check URL provided; defaulting to regular user.',
          });
          return;
        }

        // call your server endpoint with the user's token
        console.log('[admin-check] calling server fallback', adminCheckUrl);
        const resp = await fetch(adminCheckUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!resp.ok) {
          console.warn('[admin-check] server fallback returned non-OK', resp.status);
          if (mounted) setIsAdmin(false);
          toast?.({
            title: 'Permission check failed',
            description: 'Server fallback returned non-OK response; defaulting to regular user.',
          });
          return;
        }

        const json = await resp.json();
        console.log('[admin-check] server fallback response', json);
        const fallbackIsAdmin = Boolean(json?.isAdmin);
        if (mounted) setIsAdmin(fallbackIsAdmin);
      } catch (err: any) {
        console.error('[admin-check] unexpected error', err);
        if (mounted) setIsAdmin(false);
        toast?.({
          title: 'Admin check error',
          description: 'Unexpected error while checking admin status; defaulting to regular user.',
        });
      }
    };

    detectAdmin();
    return () => { mounted = false; };
  }, [isOpen, adminCheckUrl, toast]);

  if (!isOpen) return null;

  if (isAdmin === null) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePaymentProvider = async (provider: 'stripe' | 'paypal' | 'square') => {
    if (isAdmin) return; // safety
    setProcessingProvider(provider);

    try {
      const payload = { amount, itemTitle: title, currency: 'USD' };
      let response;
      switch (provider) {
        case 'stripe':
          response = await supabase.functions.invoke('create-payment', { body: payload });
          break;
        case 'paypal':
          response = await supabase.functions.invoke('create-paypal-payment', { body: payload });
          break;
        case 'square':
          response = await supabase.functions.invoke('create-square-payment', { body: payload });
          break;
        default:
          response = undefined;
      }

      if (response?.error) throw new Error(response.error.message || 'Payment failed');

      if (response?.data?.url) {
        window.open(response.data.url, '_blank');
        onConfirm();
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('payment error', error);
      // error toasts keep 'destructive' variant
      toast?.({
        title: 'Payment Error',
        description: error?.message || 'Payment failed',
        variant: 'destructive',
      });
    } finally {
      setProcessingProvider(null);
    }
  };

  const handleUploadClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (onUpload) await onUpload(file);
      else { toast?.({ title: 'File Selected', description: file.name }); onConfirm(); }
    } catch (err: any) {
      toast?.({
        title: 'Upload failed',
        description: err?.message || 'There was a problem uploading the file.',
        variant: 'destructive',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Total Amount</span>
              <span className="font-semibold">${amount.toLocaleString()}</span>
            </div>
            <div className="text-sm text-muted-foreground">Secure payment processing</div>
          </div>

          {!isAdmin ? (
            <div className="space-y-3">
              <Button className="w-full bg-[#635BFF] hover:bg-[#5B54E8]" onClick={() => handlePaymentProvider('stripe')} disabled={!!processingProvider}>
                {processingProvider === 'stripe' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Pay with Stripe
              </Button>
              <Button variant="outline" className="w-full bg-[#0070BA] text-white hover:bg-[#005ea6] border-[#0070BA]" onClick={() => handlePaymentProvider('paypal')} disabled={!!processingProvider}>
                {processingProvider === 'paypal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Pay with PayPal
              </Button>
              <Button variant="outline" className="w-full bg-[#006AFF] text-white hover:bg-[#0056D6] border-[#006AFF]" onClick={() => handlePaymentProvider('square')} disabled={!!processingProvider}>
                {processingProvider === 'square' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Pay with Square
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              <Button className="w-full" onClick={handleUploadClick}>Upload</Button>
            </div>
          )}

          {showAdminReview && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-success mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-success">Admin Review</div>
                  <div className="text-muted-foreground">Your item will be reviewed by our team and published within 24 hours.</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="flex gap-2 p-6 pt-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          {!isAdmin && <Button className="flex-1" onClick={onConfirm} disabled={isLoading}>{isLoading ? 'Processing...' : 'Confirm Payment'}</Button>}
        </div>
      </Card>
    </div>
  );
};

export default PaymentDialog;
