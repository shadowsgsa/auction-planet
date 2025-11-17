-- Add user_type column to profiles table to store buyer/seller/both preference
ALTER TABLE public.profiles 
ADD COLUMN user_type text DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'seller', 'both'));

-- Update the handle_new_user function to include user_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, user_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'buyer')
  );
  RETURN NEW;
END;
$function$;