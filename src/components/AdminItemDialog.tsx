import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AdminItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onUpdate: () => void;
}

const categories = [
  'Art & Antiques',
  'Watches & Jewelry', 
  'Electronics',
  'Fashion & Accessories',
  'Collectibles',
  'Sports Memorabilia',
  'Home & Garden',
  'Books & Media',
  'Other'
];

const AdminItemDialog = ({ isOpen, onClose, item, onUpdate }: AdminItemDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    category: item?.category || '',
    condition: item?.condition || '',
    starting_price: item?.starting_price || 0,
    current_price: item?.current_price || 0,
    reserve_price: item?.reserve_price || null,
    status: item?.status || 'active'
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('auction_items')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          starting_price: parseFloat(formData.starting_price.toString()),
          current_price: parseFloat(formData.current_price.toString()),
          reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price.toString()) : null,
          status: formData.status
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Item updated successfully",
        description: "The item has been updated and changes are live on the website."
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error updating item",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('auction_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Item deleted successfully",
        description: "The item has been removed from the website."
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error deleting item",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to this item. Updates will be reflected immediately on the website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Item title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Item description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starting_price">Starting Price ($)</Label>
              <Input
                id="starting_price"
                type="number"
                step="0.01"
                value={formData.starting_price}
                onChange={(e) => setFormData({ ...formData, starting_price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_price">Current Price ($)</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reserve_price">Buy Now Price ($)</Label>
              <Input
                id="reserve_price"
                type="number"
                step="0.01"
                value={formData.reserve_price || ''}
                onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Optional - for buy now items"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete Item
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminItemDialog;