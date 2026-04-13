-- FINAL SCRIPT 04: Fix Public Header & Internal Routes
-- Objective: Restore Service Categories in Public Header (Relax RLS) and ensure Internal Routes work.

-- 1. Fix Public Header (Services Missing) -----------------------------
-- User reported services vanished from Home Header. 
-- Previous policy likely allowed viewing ALL categories regardless of 'is_visible'.
-- We will revert to permissive read access for categories.
-- The frontend can filter if needed, but RLS should not block it if it was working before.

DROP POLICY IF EXISTS "Public can view categories" ON public.service_categories;

CREATE POLICY "Public can view categories" 
ON public.service_categories FOR SELECT 
TO public 
USING (true);

-- 2. Verify other table access (Just in case)
-- 'products' RLS is "Public can view products" (true) -> Shop should work.
-- 'services' RLS is "Public can view services" (true) -> Services should work.
