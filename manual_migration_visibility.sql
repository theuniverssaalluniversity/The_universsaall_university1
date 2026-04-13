-- Add Visibility Control Columns

-- 1. For Services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- 2. For Service Categories
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- 3. Update RLS policies (if any hard strictness exists, usually public read is fine for these, but good to note)
-- Ensure the public can still read them (visibility logic will be handled in frontend/API query)
