import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, CreditCard, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const PaymentMethodsDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'credit_card',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cardholder_name: '',
    billing_address: '',
    is_default: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchPaymentMethods();
    }
  }, [open, user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Mask the card number for security
      const maskedCardNumber = `****-****-****-${formData.card_number.slice(-4)}`;
      
      const { data, error } = await (supabase as any)
        .from('payment_methods')
        .insert([{
          user_id: user.id,
          type: formData.type,
          card_number: maskedCardNumber,
          expiry_month: formData.expiry_month,
          expiry_year: formData.expiry_year,
          cardholder_name: formData.cardholder_name,
          billing_address: formData.billing_address,
          is_default: formData.is_default
        }]);

      if (error) throw error;

      await fetchPaymentMethods();
      setShowAddForm(false);
      setFormData({
        type: 'credit_card',
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        cardholder_name: '',
        billing_address: '',
        is_default: false
      });
      
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPaymentMethods();
      
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
          <DialogDescription>
            Manage your payment options for bidding and purchases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Payment Methods */}
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-medium">{method.cardholder_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.card_number} • {method.expiry_month}/{method.expiry_year}
                      </div>
                      {method.is_default && (
                        <div className="text-xs text-primary">Default</div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Payment Method */}
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Payment Method
            </Button>
          ) : (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Payment Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardholder_name">Cardholder Name</Label>
                    <Input
                      id="cardholder_name"
                      value={formData.cardholder_name}
                      onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
                      placeholder="Name on card"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card_number">Card Number</Label>
                    <Input
                      id="card_number"
                      value={formData.card_number}
                      onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry_month">Expiry Month</Label>
                      <Select value={formData.expiry_month} onValueChange={(value) => setFormData({ ...formData, expiry_month: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_year">Expiry Year</Label>
                      <Select value={formData.expiry_year} onValueChange={(value) => setFormData({ ...formData, expiry_year: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                              {new Date().getFullYear() + i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing_address">Billing Address</Label>
                    <Input
                      id="billing_address"
                      value={formData.billing_address}
                      onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Payment Method'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
