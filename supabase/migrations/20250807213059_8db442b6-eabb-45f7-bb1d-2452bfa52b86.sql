-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Create policies for listing images
CREATE POLICY "Users can upload their own listing images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own listing images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Listing images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'listing-images');