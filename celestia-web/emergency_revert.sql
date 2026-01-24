-- EMERGENCY REVERT SCRIPT
-- Run this if the previous migration caused issues.
-- This will DISABLE Row Level Security on the affected tables to restore access.
-- WARNING: This makes these tables publicly accessible (or reliant on application logic) temporarily.

-- 1. Revert functionality for "RLS Disabled" tables (Restoring previous state)
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Unblock access for other tables by Disabling RLS (Temporary measure to "Reverse")
-- We disable RLS so that any "Access Denied" errors disappear immediately.
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;

-- 3. Cleanup the policies we created (Optional, but good for cleanliness)
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create deletion requests" ON public.deletion_requests;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Note: We do not drop indexes or revert function performance fixes as they are safe and beneficial.
