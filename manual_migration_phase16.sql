-- Phase 16: Checkout & Order Enhancements
-- 1. Orders: Add shipping_address column (JSONB for flexibility).
-- 2. Mock Email Logs: Table to track sent emails (since we simulate SMTP).

-- A. Add Shipping Address to Orders
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_address jsonb;
    END IF;
END $$;

-- B. Create Email Logs Table (for debugging/verification)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_email text NOT NULL,
    subject text NOT NULL,
    body text,
    status text DEFAULT 'sent',
    created_at timestamptz DEFAULT now()
);

-- RLS for Email Logs (Admin only usually)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs" 
ON public.email_logs FOR SELECT 
TO authenticated 
USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

-- C. Add Permissions for public insert if needed (e.g. contact form) -> SKIP for now. authenticated only.
