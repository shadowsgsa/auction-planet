-- Fix the infinite recursion issue in user_roles RLS policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Only existing admins can manage roles" ON public.user_roles;

-- Create a better admin management policy using the is_admin function
CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Also ensure we have a simple policy for reading roles that doesn't cause recursion
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.user_roles;
CREATE POLICY "Anyone can read roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);