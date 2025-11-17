-- Create the listing-images bucket for storing uploaded photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the listing-images bucket
CREATE POLICY "Users can upload their own listing images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all listing images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-images');

CREATE POLICY "Users can update their own listing images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);