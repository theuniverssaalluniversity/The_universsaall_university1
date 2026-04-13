-- Phase 23: Fix Orders Table Schema
-- 1. Add payment_status if missing (it seems it was missed in previous migrations)

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN 
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_provider') THEN 
        ALTER TABLE orders ADD COLUMN payment_provider TEXT DEFAULT 'stripe'; 
    END IF;
END $$;
