-- REVERT SCRIPT: Undo Security Enforcement
-- User reported site breakage. Disabling RLS to restore original "Open" state.
-- This effectively reverts the "Enable RLS" action from Phase 1.

ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;

-- Note: We are leaving the Performance Indexes and Function Security fixes 
-- as they are invisible to the frontend and do not cause "Permission Denied" errors.
-- The critical issue was RLS blocking data access. This restores it.
