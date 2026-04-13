-- RLS FIX SCRIPT
-- Run this to resolve "new row violates row-level security policy" errors

-- 1. Reset Policies on service_categories
DROP POLICY IF EXISTS "Public categories are viewable" ON service_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can update categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON service_categories;

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Read Access
CREATE POLICY "Public categories are viewable" 
ON service_categories FOR SELECT USING (true);

-- 3. Allow Admin Full Access (Insert, Update, Delete)
-- We use a direct lookup to check if the current user is an admin
CREATE POLICY "Admins can manage categories" 
ON service_categories FOR ALL 
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- 4. Verify Users Table Policies (Ensure Admins can read themselves)
-- This is usually already set, but adding a safe policy just in case
-- DO NOT FAIL if policy already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own data'
    ) THEN
        CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
    END IF;
END
$$;
