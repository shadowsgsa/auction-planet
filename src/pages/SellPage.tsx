// SellPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Upload, X, CreditCard, RotateCw } from 'lucide-react';

const categories = [
  'Heavy Equipment & Machinery',
  'Construction Equipment',
  'Farm & Agricultural Equipment',
  'Vehicles & Automotive',
  'Industrial Equipment',
  'Art & Antiques',
  'Watches & Jewelry',
  'Collectibles & Memorabilia',
  'Electronics & Technology',
  'Health and Beauty',
  'Furniture & Home Goods',
  'Tools & Hardware',
  'Sporting Goods',
  'Restaurant Equipment',
  'Medical Equipment',
  'Office Equipment',
  'Other'
];

const MAX_IMAGES = 12;
const UPLOAD_TIMEOUT_MS = 300_000; // 5 minutes per attempt

type UploadStatus = 'queued' | 'uploading' | 'done' | 'failed';

interface PendingFile {
  id: string;
  file: File;
  status: UploadStatus;
  attempts: number;
  publicUrl?: string | null;
  error?: string | null;
}

const SellPage = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();

  const isAdminFlag = (() => {
    if (typeof isAdmin === 'boolean') return isAdmin;
    if (typeof isAdmin === 'number') return isAdmin > 0;
    const s = String(isAdmin || '').trim().toLowerCase();
    if (!s || s === 'false' || s === '0' || s === 'null' || s === 'undefined') return false;
    return ['true', '1', 'admin', '2'].includes(s);
  })();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    saleType: 'auction',
    startingBid: '',
    buyNowPrice: '',
    duration: '7',
    condition: '',
    quantity: 1,
    images: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<Record<string, PendingFile>>({});

  const calculateListingFee = (quantity: number) => {
    if (quantity >= 51 && quantity <= 100) return 10.0;
    if (quantity >= 11 && quantity <= 50) return 5.0;
    return 2.99;
  };
  const currentListingFee = calculateListingFee(formData.quantity);

  /* -------------------------
     uploadSingle(file): uploads file to supabase
     - uses upsert:true
     - fallback to signed PUT if SDK upload fails
  ------------------------- */
  async function uploadSingle(file: File, userId: string, timeoutMs = UPLOAD_TIMEOUT_MS): Promise<string> {
    const ext = (file.name.split('.').pop() || '').replace(/\?.*$/, '') || 'bin';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;
    const bucket = 'listing-images';

    const sdkUpload = async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      return data;
    };

    const getPublicUrl = async () => {
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      let publicUrl = publicData?.publicUrl ?? null;
      if (!publicUrl) {
        // Try signed URL as a fallback for read access
        const { data: signedData, error: signedErr } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60);
        if (!signedErr && signedData) {
          publicUrl = (signedData as any)?.signedUrl || (signedData as any)?.signedURL || null;
        }
      }
      return publicUrl ?? filePath;
    };

    const signedPutFallback = async () => {
      // Try to create a signed URL and PUT bytes directly
      const { data: createSigned, error: createSignedErr } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60);
      if (createSignedErr) throw createSignedErr;
      const signedUrl = (createSigned as any)?.signedUrl || (createSigned as any)?.signedURL;
      if (!signedUrl) throw new Error('Signed URL not available for fallback');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          signal: controller.signal,
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          }
        });
        if (!res.ok) throw new Error(`Signed PUT failed with ${res.status}`);
      } finally {
        clearTimeout(timeout);
      }
    };

    const uploadPromise = (async () => {
      try {
        await sdkUpload();
      } catch (sdkErr) {
        console.warn('SDK upload failed, trying signed PUT fallback:', sdkErr);
        await signedPutFallback();
      }

      return await getPublicUrl();
    })();

    const timeoutPromise = new Promise<never>((_, rej) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        rej(new Error('Upload timed out'));
      }, timeoutMs);
    });

    return await Promise.race([uploadPromise, timeoutPromise]);
  }

  /* -------------------------
     concurrency uploader with retries + backoff
     - no compression, no client-side limit
  ------------------------- */
  async function uploadFiles(entries: { id: string; file: File }[], userId: string, concurrency = 2, maxRetries = 3) {
    const updatePending = (id: string, patch: Partial<PendingFile>) => {
      setPendingUploads(prev => {
        const existing: PendingFile = prev[id] ?? ({
          id,
          file: (patch.file as File)!,
          status: 'queued',
          attempts: 0,
          publicUrl: null,
          error: null
        } as PendingFile);
        const updated: PendingFile = { ...existing, ...patch } as PendingFile;
        return { ...prev, [id]: updated };
      });
    };

    setPendingUploads(prev => {
      const next = { ...prev };
      entries.forEach(fe => {
        next[fe.id] = {
          id: fe.id,
          file: fe.file,
          status: 'queued',
          attempts: 0,
          publicUrl: null,
          error: null
        };
      });
      return next;
    });

    let idx = 0;
    const worker = async () => {
      while (true) {
        const i = idx++;
        if (i >= entries.length) return;
        const item = entries[i];
        const id = item.id;

        updatePending(id, { status: 'uploading' });

        let attempt = 0;
        while (attempt < maxRetries) {
          attempt++;
          updatePending(id, { attempts: attempt, error: null });
          try {
            const publicUrl = await uploadSingle(item.file, userId, UPLOAD_TIMEOUT_MS);
            updatePending(id, { status: 'done', publicUrl });
            // add to formData.images (dedupe)
            setFormData(prev => ({ ...prev, images: prev.images.includes(publicUrl) ? prev.images : [...prev.images, publicUrl] }));
            break;
          } catch (err: any) {
            console.error(`Upload attempt ${attempt} failed for ${item.file.name}`, err);
            updatePending(id, { error: String(err?.message || err) });
            if (attempt >= maxRetries) {
              updatePending(id, { status: 'failed' });
              break;
            }
            const backoff = 700 * Math.pow(2, attempt - 1);
            await new Promise(r => setTimeout(r, backoff));
          }
        }
      }
    };

    const workers = new Array(Math.min(concurrency, entries.length)).fill(0).map(() => worker());
    await Promise.all(workers);
  }

  /* ----------------------------
     handleImageUpload (UI entry)
  ---------------------------- */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      alert('Please login before uploading images.');
      return;
    }

    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (formData.images.length + files.length > MAX_IMAGES) {
      alert(`You can upload up to ${MAX_IMAGES} images total.`);
      e.currentTarget.value = '';
      return;
    }

    const nonImages = files.filter(f => !f.type.startsWith('image/'));
    if (nonImages.length > 0) {
      alert(`Some files are not images: ${nonImages.map(f => f.name).join(', ')}`);
      e.currentTarget.value = '';
      return;
    }

    setUploading(true);
    const entries = files.map((f, i) => ({ id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`, file: f }));

    try {
      await uploadFiles(entries, user.id, 2, 3);
    } catch (err) {
      console.error('uploadFiles overall error', err);
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const retryUpload = async (id: string) => {
    const p = pendingUploads[id];
    if (!p) return;
    setUploading(true);
    try {
      await uploadFiles([{ id, file: p.file }], user!.id, 1, 3);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  /* Payment & Insert logic */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (isAdminFlag) {
      await handleConfirmPayment();
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase.functions.invoke('calculate-listing-fee', {
        body: { quantity: formData.quantity, itemTitle: formData.title }
      });

      if (error) {
        console.error('Error calling listing fee function:', error);
        alert('Failed to process payment. Please try again.');
        return;
      }

      if (data?.url) window.open(data.url, '_blank');
      else {
        console.error('No URL returned from listing fee function:', data);
        alert('Payment provider did not return a checkout URL.');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      alert('User must be logged in.');
      return;
    }

    if (!formData.title?.trim()) {
      alert('Please enter a title for your listing.');
      return;
    }
    if (formData.quantity <= 0) {
      alert('Quantity must be at least 1.');
      return;
    }
    if ((formData.saleType === 'auction' || formData.saleType === 'both') && !formData.startingBid) {
      alert('Please enter a starting bid for auction listings.');
      return;
    }
    if ((formData.saleType === 'buy-now' || formData.saleType === 'both') && !formData.buyNowPrice) {
      alert('Please enter a buy now price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + parseInt(String(formData.duration), 10));

      const consignmentStatus = isAdminFlag ? 'approved' : 'pending';
      const listingFeePaid = isAdminFlag ? true : false;

      const startingPrice = Number(parseFloat(String(formData.startingBid)) || 0);
      let currentPrice = 0;
      if (formData.saleType === 'auction') currentPrice = startingPrice;
      else if (formData.saleType === 'buy-now') currentPrice = Number(parseFloat(String(formData.buyNowPrice)) || 0);
      else if (formData.saleType === 'both') currentPrice = startingPrice || Number(parseFloat(String(formData.buyNowPrice)) || 0);

      const insertPayload = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        condition: formData.condition || null,
        starting_price: startingPrice,
        current_price: currentPrice,
        end_time: endTime.toISOString(),
        image_url: formData.images[0] || null,
        images: formData.images.length > 0 ? formData.images : null,
        seller_id: user.id,
        status: 'active',
        consignment_status: consignmentStatus,
        quantity: formData.quantity,
        listing_fee: currentListingFee,
        commission_rate: 10.0,
        listing_fee_paid: listingFeePaid,
        reserve_price:
          formData.saleType === 'buy-now'
            ? (parseFloat(String(formData.buyNowPrice)) || null)
            : null
      };

      console.log('Attempting insert payload (with images array):', insertPayload);

      const res = await supabase
        .from('auction_items')
        .insert(insertPayload)
        .select()
        .single();

      console.log('Insert response (full):', res);

      if (res.error) {
        console.error('Insert error -> message:', res.error.message);
        console.error('Insert error -> details:', res.error.details);
        console.error('Insert error -> hint:', res.error.hint);
        console.error('Insert error -> code:', res.error.code);
        // console.error('Insert error -> context:', res.error.context);
        alert(`Failed to create listing: ${res.error.message}. Check console for details.`);
        return;
      }

      navigate('/account');
    } catch (err) {
      console.error('Unexpected error in handleConfirmPayment:', err);
      alert('An unexpected error occurred. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">List Your Item</h1>
          <p className="text-muted-foreground">Create an auction or direct sale listing</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Item Photos</CardTitle>
              <CardDescription>Upload clear, high-quality photos of your item. No enforced client-side size limit is applied.</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(pendingUploads).length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Upload status:</div>
                  <div className="space-y-2">
                    {Object.values(pendingUploads).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <div className="truncate max-w-lg">
                          <span className="font-medium">{p.file.name}</span>
                          <span className="ml-2 text-xs">— {p.status}</span>
                          {p.attempts ? <span className="ml-2 text-xs text-muted-foreground">({p.attempts})</span> : null}
                        </div>

                        <div className="flex items-center gap-2">
                          {p.status === 'failed' && (
                            <>
                              <div className="text-xs text-destructive">{p.error}</div>
                              <button type="button" className="inline-flex items-center gap-1 px-2 py-1 border rounded" onClick={() => retryUpload(p.id)}>
                                <RotateCw className="w-4 h-4" />
                                <span className="text-xs">Retry</span>
                              </button>
                            </>
                          )}
                          {p.status === 'uploading' && <div className="text-xs text-muted-foreground">Uploading…</div>}
                          {p.status === 'done' && <div className="text-xs text-muted-foreground">Done</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <label
                  className={`border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center transition-colors ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'}`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Add Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading || formData.images.length >= MAX_IMAGES}
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">Upload up to {MAX_IMAGES} photos. First photo will be the main image.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Provide detailed information about your item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Vintage Rolex Submariner Watch" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" max="100" placeholder="1" value={String(formData.quantity)} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })} required />
                <p className="text-sm text-muted-foreground">For multiple items, listing fee is tiered: $2.99 (1-10), $5.00 (11-50), $10.00 (51-100)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your item in detail..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={6} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sale Type & Pricing</CardTitle>
              <CardDescription>Choose how you want to sell your item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
  <div className="space-y-3">
    <Label>Sale Type</Label>
    <RadioGroup value={formData.saleType} onValueChange={(value) => setFormData({ ...formData, saleType: value })}>
      {/* 
      <div className="flex items-center space-x-2 p-3 border rounded-lg">
        <RadioGroupItem value="auction" id="auction" />
        <Label htmlFor="auction" className="flex-1 cursor-pointer">
          <div className="font-medium">Auction</div>
          <div className="text-sm text-muted-foreground">Let buyers bid on your item</div>
        </Label>
      </div>
      */}

      <div className="flex items-center space-x-2 p-3 border rounded-lg">
        <RadioGroupItem value="buy-now" id="buy-now" />
        <Label htmlFor="buy-now" className="flex-1 cursor-pointer">
          <div className="font-medium">Buy Now</div>
          <div className="text-sm text-muted-foreground">Set a fixed price for immediate purchase</div>
        </Label>
      </div>

      {/*
      <div className="flex items-center space-x-2 p-3 border rounded-lg">
        <RadioGroupItem value="both" id="both" />
        <Label htmlFor="both" className="flex-1 cursor-pointer">
          <div className="font-medium">Auction with Buy Now</div>
          <div className="text-sm text-muted-foreground">Auction with option to buy immediately</div>
        </Label>
      </div>
      */}
    </RadioGroup>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/*
    {(formData.saleType === 'auction' || formData.saleType === 'both') && (
      <div className="space-y-2">
        <Label htmlFor="startingBid">Starting Bid ($)</Label>
        <Input id="startingBid" type="number" placeholder="0.99" value={formData.startingBid} onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })} required={formData.saleType === 'auction' || formData.saleType === 'both'} />
      </div>
    )}
    */}

    {(formData.saleType === 'buy-now') && (
      <div className="space-y-2">
        <Label htmlFor="buyNowPrice">Buy Now Price ($)</Label>
        <Input id="buyNowPrice" type="number" placeholder="99.99" value={formData.buyNowPrice} onChange={(e) => setFormData({ ...formData, buyNowPrice: e.target.value })} required />
      </div>
    )}
  </div>

  {/*
  {(formData.saleType === 'auction' || formData.saleType === 'both') && (
    <div className="space-y-2">
      <Label htmlFor="duration">Auction Duration</Label>
      <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 day</SelectItem>
          <SelectItem value="3">3 days</SelectItem>
          <SelectItem value="5">5 days</SelectItem>
          <SelectItem value="7">7 days</SelectItem>
          <SelectItem value="10">10 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )}
  */}
</CardContent>

          </Card>

          {adminLoading ? null : !isAdminFlag && (
            <Card className="border-warning bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Listing Fee & Commission</h3>
                    <p className="text-sm text-muted-foreground mb-2">Listing fee for {formData.quantity} item{formData.quantity > 1 ? 's' : ''}: <strong>${currentListingFee.toFixed(2)}</strong></p>
                    <p className="text-sm text-muted-foreground mb-3">Plus 10% commission on successful sales.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">✓ Fraud protection</Badge>
                      <Badge variant="outline">✓ Featured placement</Badge>
                      <Badge variant="outline">✓ 24/7 support</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            {/* <Button type="button" variant="outline" className="flex-1">Save as Draft</Button> */}

            {adminLoading ? (
              <Button type="button" className="flex-1" disabled>Checking permissions...</Button>
            ) : isAdminFlag ? (
              <Button type="button" className="flex-1" onClick={handleConfirmPayment} disabled={isSubmitting || uploading}>{isSubmitting ? 'Uploading...' : 'Upload Listing'}</Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={isSubmitting || uploading}>{isSubmitting ? 'Processing...' : `Pay $${currentListingFee.toFixed(2)} & List Item`}</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPage;
