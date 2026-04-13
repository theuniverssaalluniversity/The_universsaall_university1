-- Phase 13: Enhanced Service Categories (Dynamic Navbar)

ALTER TABLE service_categories
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'page', -- 'page' or 'link'
ADD COLUMN IF NOT EXISTS redirect_url TEXT;

-- Policy Update (Idempotent)
DROP POLICY IF EXISTS "Admins can update categories" ON service_categories;
CREATE POLICY "Admins can update categories" 
ON service_categories FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
