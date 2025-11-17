-- Assign admin role to the first user for testing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'reporting@inventel.net'
ON CONFLICT (user_id, role) DO NOTHING;

-- If that user doesn't exist, assign to any first user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;