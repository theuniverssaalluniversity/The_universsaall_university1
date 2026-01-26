-- FINAL SCRIPT 02: Fix Infinite Recursion & Access Issues
-- Objective: Fix infinite recursion in 'users' policies and ensure public access for Courses/Services.

-- 1. Fix Infinite Recursion in 'users' table --------------------------
-- The issue: "Staff can view all users" queries 'users' table to check role, causing infinite loop.
-- The fix: Use `auth.jwt() ->> 'user_role'` (metadata) OR `is_admin()` helper if optimized. 
-- For safety, we will drop the recursive policy and replacing it with a non-recursive approach (using is_admin function which we suspect might be recursive, so refactoring that too if needed, but first let's fix the policy).

DROP POLICY IF EXISTS "Staff can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;

-- Re-create safe Admin/Staff policies using a specialized function or Avoiding self-join if possible.
-- Assuming `is_admin()` checks `auth.users` or `public.users`. If `public.users`, it loops.
-- SAFE FIX: Use a lookup that does NOT trigger RLS on 'users'. 
-- However, since we can't easily change `is_admin` logic without seeing it, we'll temporarily GRANT valid access via a simpler policy or use `security definer` function for role checks.

-- Better approach: "Admins/Support" can be identified via app_metadata in JWT (if set) OR we use specific ID checks.
-- For now, let's strictly limit "View All" to avoiding the self-select recursion.

-- OPTION A: Drop the complex "Staff" policy and rely on "Users can view own data" + specific Admin override.
-- Let's Replace with a non-recursive version if roles are synced to auth.users metadata.
-- If not, we fix the recursion by using a SECURITY DEFINER function for the check.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Remake policies using the security definer function (searches users table avoiding RLS loop)
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (get_my_role() = 'admin');

CREATE POLICY "Staff can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (get_my_role() IN ('admin', 'support'));

CREATE POLICY "Admins can update user roles"
ON public.users FOR UPDATE
TO authenticated
USING (get_my_role() = 'admin');


-- 2. Fix "Course Not Found" (Public Access) ---------------------------
-- The existing policy "Public can view published courses" looks correct ((status = 'published') AND (is_deleted = false)).
-- IF users see "Course Not Found", it might be that they are ANON and RLS is enabled, but the policy isn't applying correctly or the course isn't published.
-- We will DOUBLE CHECK by adding a simple "True" policy for select if the above is too restrictive for the 'landing page' use case.
-- Actually, the landing page shows courses. Let's ensure the policy covers anon.
-- It says roles: {public}, so it should work. 
-- However, we will explicit grant USAGE on schema if missing (unlikely).
-- Let's just ensure the policy is definitely PERMISSIVE.

DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses" 
ON public.courses FOR SELECT 
TO public 
USING (status = 'published' AND is_deleted = false);


-- 3. Fix "Services Missing in Header" ---------------------------------
-- service_categories table likely has RLS enabled but might be missing policies or they are conflicting.
-- We saw "Admins can manage categories" checking users table (Recursion Risk!).
DROP POLICY IF EXISTS "Admins can manage categories" ON public.service_categories;

-- Fix recursion in service_categories too
CREATE POLICY "Admins can manage categories" 
ON public.service_categories FOR ALL 
TO authenticated 
USING (get_my_role() = 'admin');

-- Ensure public access is clean (Drop duplicates/versions)
DROP POLICY IF EXISTS "Public can view categories_v2" ON public.service_categories;
DROP POLICY IF EXISTS "Public categories are viewable" ON public.service_categories;

CREATE POLICY "Public can view categories" 
ON public.service_categories FOR SELECT 
TO public 
USING (is_visible = true);

-- 4. Enable RLS on service_categories (it wasn't in previous list but we fixed policies now)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
