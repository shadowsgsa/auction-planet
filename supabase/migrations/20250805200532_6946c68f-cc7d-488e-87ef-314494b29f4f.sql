-- Add admin role and consignment approval functionality

-- Create app roles enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for admin management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add consignment_status to auction_items for approval workflow
ALTER TABLE public.auction_items 
ADD COLUMN IF NOT EXISTS consignment_status TEXT DEFAULT 'pending';

-- Update existing items to be approved (so they continue showing)
UPDATE public.auction_items 
SET consignment_status = 'approved' 
WHERE consignment_status IS NULL OR consignment_status = 'pending';

-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- Create updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create an admin user (first user in the system gets admin privileges automatically)
-- This trigger will run when the first user signs up
CREATE OR REPLACE FUNCTION public.maybe_set_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If this is the first user, make them admin
  IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to set first user as admin
DROP TRIGGER IF EXISTS on_first_user_admin ON public.profiles;
CREATE TRIGGER on_first_user_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.maybe_set_first_admin();

-- Update auction_items RLS policies to only show approved items to regular users
DROP POLICY IF EXISTS "Anyone can view auction items" ON public.auction_items;

CREATE POLICY "Anyone can view approved auction items" 
ON public.auction_items 
FOR SELECT 
USING (
  consignment_status = 'approved' OR 
  public.is_admin(auth.uid()) OR 
  auth.uid() = seller_id
);

-- Admins can update consignment status
CREATE POLICY "Admins can update auction items" 
ON public.auction_items 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Create admin stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.auction_items WHERE consignment_status = 'pending') as pending_consignments,
  (SELECT COUNT(*) FROM public.auction_items WHERE consignment_status = 'approved') as approved_items,
  (SELECT COUNT(*) FROM public.bids WHERE created_at >= NOW() - INTERVAL '24 hours') as bids_today,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week;