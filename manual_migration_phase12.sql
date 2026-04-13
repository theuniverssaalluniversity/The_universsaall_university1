-- Phase 12 Migration: Dynamic Services & Currency

-- 1. Create Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT DEFAULT 'Sparkles', -- For Lucide icons
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Services Table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS display_mode TEXT DEFAULT 'content'; -- 'content' or 'redirect'

-- 3. Currency Support
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'INR';

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR'; -- Store which currency was used

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS price_inr NUMERIC DEFAULT 0; -- Optional: Dual pricing

ALTER TABLE services
ADD COLUMN IF NOT EXISTS price_inr NUMERIC DEFAULT 0;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS price_inr NUMERIC DEFAULT 0;

-- 4. Insert Default Categories (Migration for existing types)
INSERT INTO service_categories (title, slug, description, icon_name, sort_order)
VALUES 
('Readings', 'reading', 'Insightful readings for your journey', 'Sparkles', 1),
('Healings', 'healing', 'Restorative energy healing sessions', 'Heart', 2)
ON CONFLICT (slug) DO NOTHING;

-- 5. Migrate existing services (Optional, if 'type' column exists)
-- Assuming 'type' was 'reading' or 'healing'
UPDATE services SET category_id = (SELECT id FROM service_categories WHERE slug = 'reading') WHERE type = 'reading';
UPDATE services SET category_id = (SELECT id FROM service_categories WHERE slug = 'healing') WHERE type = 'healing';

-- 6. RLS Policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public categories are viewable" ON service_categories;
CREATE POLICY "Public categories are viewable" 
ON service_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON service_categories;
CREATE POLICY "Admins can manage categories" 
ON service_categories FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
