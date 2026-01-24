-- Phase 14: Subcategories Support

ALTER TABLE service_categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

-- Policy Update (Idempotent) to be safe
DROP POLICY IF EXISTS "Admins can update categories" ON service_categories;
CREATE POLICY "Admins can update categories" 
ON service_categories FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
