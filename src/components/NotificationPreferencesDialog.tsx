import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const NotificationPreferencesDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    bid_updates: true,
    auction_reminders: true,
    outbid_alerts: true,
    winning_notifications: true,
    new_listings: false,
    price_drop_alerts: false,
    marketing_emails: false
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchPreferences();
    }
  }, [open, user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });
      setOpen(false);
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

  const updatePreference = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Choose what notifications you'd like to receive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Communication Methods */}
          <div className="space-y-4">
            <h4 className="font-medium">Communication Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <Switch
                  id="email_notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms_notifications">SMS Notifications</Label>
                <Switch
                  id="sms_notifications"
                  checked={preferences.sms_notifications}
                  onCheckedChange={(checked) => updatePreference('sms_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <Switch
                  id="push_notifications"
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Auction Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Auction Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="bid_updates">Bid Updates</Label>
                <Switch
                  id="bid_updates"
                  checked={preferences.bid_updates}
                  onCheckedChange={(checked) => updatePreference('bid_updates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auction_reminders">Auction Reminders</Label>
                <Switch
                  id="auction_reminders"
                  checked={preferences.auction_reminders}
                  onCheckedChange={(checked) => updatePreference('auction_reminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="outbid_alerts">Outbid Alerts</Label>
                <Switch
                  id="outbid_alerts"
                  checked={preferences.outbid_alerts}
                  onCheckedChange={(checked) => updatePreference('outbid_alerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="winning_notifications">Winning Notifications</Label>
                <Switch
                  id="winning_notifications"
                  checked={preferences.winning_notifications}
                  onCheckedChange={(checked) => updatePreference('winning_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Other Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Other Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="new_listings">New Listings</Label>
                <Switch
                  id="new_listings"
                  checked={preferences.new_listings}
                  onCheckedChange={(checked) => updatePreference('new_listings', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="price_drop_alerts">Price Drop Alerts</Label>
                <Switch
                  id="price_drop_alerts"
                  checked={preferences.price_drop_alerts}
                  onCheckedChange={(checked) => updatePreference('price_drop_alerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing_emails">Marketing Emails</Label>
                <Switch
                  id="marketing_emails"
                  checked={preferences.marketing_emails}
                  onCheckedChange={(checked) => updatePreference('marketing_emails', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
