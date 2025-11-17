-- Create storage policies for listing-images bucket
CREATE POLICY "Users can upload their own listing images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view listing images" 
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