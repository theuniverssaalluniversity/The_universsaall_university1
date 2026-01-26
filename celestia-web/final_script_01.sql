-- FINAL SCRIPT 01: Fix RLS Errors & Function Warning
-- Objective: Safely Enable RLS on 9 tables to fix 18+ errors.
-- Pre-requisite: policies verified to ensure data remains accessible.

-- 1. Add Missing Policies (Safety Net) --------------------------------
-- Ensure Organizations are visible (needed for Logo/Theme)
CREATE POLICY "Public can view organizations" 
ON public.organizations FOR SELECT 
TO public 
USING (true);

-- Ensure Instructors/Users can request deletion
CREATE POLICY "Instructors can create deletion requests" 
ON public.deletion_requests FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) = instructor_id);

-- 2. Security: Enable RLS (Fixes 18 Errors) ---------------------------
-- These tables were flagged as "Policy Exists RLS Disabled" OR "RLS Disabled in Public"
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Security: Fix Function Search Path (Fixes 1 Warning) -------------
-- Prevents malicious search path hijacking
ALTER FUNCTION public.check_user_role(uuid, text) SET search_path = public;

-- Verification -------------------------------------------------------
-- - Public pages (Shop, Landing) rely on 'products' and 'services' policies (Verified).
-- - Dashboard relies on 'courses', 'enrollments', 'users' policies (Verified).
-- - Auth relies on 'users' policies (Verified).
