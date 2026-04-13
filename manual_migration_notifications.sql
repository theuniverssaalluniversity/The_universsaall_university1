-- Create notifications table for email queue
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- e.g., 'admin_new_order'
    payload JSONB NOT NULL, -- Order details, User email
    status TEXT DEFAULT 'pending', -- pending, processed, failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Index for faster queue polling
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- Grant permissions (if needed, assuming public role has access for now or service role)
GRANT ALL ON public.notifications TO postgres;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notifications TO authenticated; -- authenticated users (admins) can read/write
