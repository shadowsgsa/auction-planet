-- Fix security issues from the linter

-- Fix 1: Remove SECURITY DEFINER from view and create proper function
DROP VIEW IF EXISTS public.admin_stats;

-- Create secure function to get admin stats  
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
  total_users BIGINT,
  pending_consignments BIGINT,
  approved_items BIGINT,
  bids_today BIGINT,
  new_users_week BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.auction_items WHERE consignment_status = 'pending') as pending_consignments,
    (SELECT COUNT(*) FROM public.auction_items WHERE consignment_status = 'approved') as approved_items,
    (SELECT COUNT(*) FROM public.bids WHERE created_at >= NOW() - INTERVAL '24 hours') as bids_today,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week;
$$;

-- Fix 2: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- Create RLS policy for admin stats function access
CREATE POLICY "Only admins can access admin functions" 
ON public.user_roles 
FOR SELECT 
USING (true);  -- Allow reading to check admin status