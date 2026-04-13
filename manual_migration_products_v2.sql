-- Phase 2 Database Upgrades

-- 1. Upgrade Products Table for Shop V2
-- Adding 'content' for rich descriptions (HTML/Markdown)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS content TEXT;

-- Adding 'price_inr' for precise INR pricing (India-centric)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_inr INTEGER DEFAULT 0;

-- Adding 'slug' for SEO-friendly Product Pages (e.g., /shop/cosmic-reading)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
-- Add constraint separately to avoid errors if column exists but constraint doesn't (though simple add column unique is usually fine)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
    END IF;
END $$;


-- 2. Upgrade Services Table (Ensure consistency with AdminServices.tsx)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_inr INTEGER DEFAULT 0;

-- 3. Create index for fast lookups by slug
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
