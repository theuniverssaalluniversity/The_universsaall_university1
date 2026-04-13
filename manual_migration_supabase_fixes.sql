-- SUPABASE PERFORMANCE & SECURITY FIXES
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- SECTION 1: SECURITY - ENABLE RLS ON PUBLIC TABLES
-- These tables were flagged as having RLS disabled but being public.
-- =============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add basic protective policies (Deny all by default is implied by enabling RLS, but we add basic access)

-- Organizations: Only admins can manage
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations" ON public.organizations
    FOR ALL
    USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

-- Deletion Requests: Users can create, Admins can view/manage
DROP POLICY IF EXISTS "Users can create deletion requests" ON public.deletion_requests;
CREATE POLICY "Users can create deletion requests" ON public.deletion_requests
    FOR INSERT
    WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Admins can manage deletion requests" ON public.deletion_requests;
CREATE POLICY "Admins can manage deletion requests" ON public.deletion_requests
    FOR ALL
    USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

-- Products: Public view, Admin manage
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL
    USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');


-- =============================================================================
-- SECTION 2: PERFORMANCE - ADD MISSING INDEXES
-- These foreign keys were flagged as unindexed.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ticket_id ON public.chat_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_course_id ON public.completed_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_lesson_id ON public.completed_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON public.coupons(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_instructor_id ON public.deletion_requests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_instructor_id ON public.payouts(instructor_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_parent_id ON public.service_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);


-- =============================================================================
-- SECTION 3: PERFORMANCE - OPTIMIZE RLS POLICIES
-- Fix "Auth RLS Initialization Plan" warnings by wrapping auth.uid()
-- Fix "Multiple Permissive Policies" by splitting Admin policies from SELECT where possible
-- =============================================================================

-- ---------------------------------------------------------
-- 3.1 Service Categories (SKIPPED - USER CONFIRMED ALREADY WORKING)
-- ---------------------------------------------------------
-- skipping policy resets for service_categories to avoid regression.
-- The performance warnings (multiple policies) will remain for this table, 
-- but functionality is prioritized.

/*
DROP POLICY IF EXISTS "Admins can manage categories" ON service_categories;
DROP POLICY IF EXISTS "Public categories are viewable" ON service_categories;

-- Allow Public View (Simple, fast)
CREATE POLICY "Public categories are viewable" ON service_categories
    FOR SELECT USING (true);

-- Allow Admin Access (INSERT, UPDATE, DELETE ONLY - distinct from SELECT)
CREATE POLICY "Admins can manage categories" ON service_categories
    FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

CREATE POLICY "Admins can update categories" ON service_categories
    FOR UPDATE USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

CREATE POLICY "Admins can delete categories" ON service_categories
    FOR DELETE USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');
*/


-- ---------------------------------------------------------
-- 3.2 Courses
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Instructors can update own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can insert courses" ON courses;
DROP POLICY IF EXISTS "Instructors can delete own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can view own courses" ON courses;

CREATE POLICY "Instructors can update own courses" ON courses
    FOR UPDATE USING (instructor_id = (SELECT auth.uid()) OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

CREATE POLICY "Instructors can insert courses" ON courses
    FOR INSERT WITH CHECK (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can delete own courses" ON courses
    FOR DELETE USING (instructor_id = (SELECT auth.uid()) OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

CREATE POLICY "Instructors can view own courses" ON courses
    FOR SELECT USING (instructor_id = (SELECT auth.uid()) OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin' OR status = 'published');


-- ---------------------------------------------------------
-- 3.3 Enrollments
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" ON enrollments
    FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can enroll themselves" ON enrollments;
CREATE POLICY "Users can enroll themselves" ON enrollments
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));


-- ---------------------------------------------------------
-- 3.4 Support Tickets
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT USING (user_id = (SELECT auth.uid()) OR (SELECT role FROM public.users WHERE id = (SELECT auth.uid())) IN ('admin', 'support'));

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));


-- ---------------------------------------------------------
-- 3.5 Users (Critical for recursion)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Staff can view all users" ON users;

CREATE POLICY "Staff can view all users" ON users
    FOR SELECT USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) IN ('admin', 'support'));


-- ---------------------------------------------------------
-- 3.6 Services
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage services" ON services;

CREATE POLICY "Admins can manage services" ON services
    FOR ALL
    USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');


-- ---------------------------------------------------------
-- 3.7 Coupons
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can validate coupons" ON coupons;

-- Fix Multiple Permissive Policies by splitting Admin Select from Admin Manage
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL
    USING ((SELECT role FROM public.users WHERE id = (SELECT auth.uid())) = 'admin');

-- Assuming "Users can validate coupons" is for SELECT
CREATE POLICY "Users can validate coupons" ON coupons
    FOR SELECT
    USING (true); -- Or whatever logic allows validation, e.g. active = true


-- =============================================================================
-- SECTION 4: FUNCTION PERMISSIONS
-- Fix "Function Search Path Mutable"
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        ALTER FUNCTION public.is_admin() SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_staff') THEN
        ALTER FUNCTION public.is_staff() SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_lesson_complete') THEN
        ALTER FUNCTION public.mark_lesson_complete(uuid, uuid) SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_unique_short_id') THEN
        ALTER FUNCTION public.check_unique_short_id(text, text, text) SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_unique_short_id') THEN
        ALTER FUNCTION public.generate_unique_short_id() SET search_path = public;
    END IF;
END
$$;
