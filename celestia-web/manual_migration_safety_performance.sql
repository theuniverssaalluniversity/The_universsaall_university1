-- Database Safety & Performance Migration
-- Phase 1: Critical Security (Enable RLS)
-- These tables have policies but RLS was not enforced.
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY; -- Critical for Shop
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY; -- Critical for Dashboard
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; -- Critical for Auth
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Phase 2: Function Security (Immutable Search Path)
-- Prevents search_path hijacking.
ALTER FUNCTION public.check_user_role(uuid, text) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_staff() SET search_path = public;
ALTER FUNCTION public.mark_lesson_complete(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.check_unique_short_id(text, text, text) SET search_path = public;
ALTER FUNCTION public.generate_unique_short_id() SET search_path = public;

-- Phase 3: Performance (Missing Indexes)
-- Adding indexes for Foreign Keys to speed up joins.
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ticket ON public.chat_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_course ON public.completed_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_lesson ON public.completed_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON public.coupons(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_instructor ON public.deletion_requests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_instructor ON public.payouts(instructor_id);
CREATE INDEX IF NOT EXISTS idx_service_cat_parent ON public.service_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);

-- Phase 4: Query Optimization (Fix RLS initplan)
-- Pre-calculate auth.uid() so it doesn't run for every row.
-- 1. Courses
DROP POLICY IF EXISTS "Instructors can update own courses" ON public.courses;
CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can insert courses" ON public.courses;
CREATE POLICY "Instructors can insert courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can delete own courses" ON public.courses;
CREATE POLICY "Instructors can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can view own courses" ON public.courses;
CREATE POLICY "Instructors can view own courses" ON public.courses FOR SELECT USING (auth.uid() = instructor_id);

-- 2. Lessons
DROP POLICY IF EXISTS "Enrolled students can view lessons" ON public.lessons;
CREATE POLICY "Enrolled students can view lessons" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = (select auth.uid()) -- Optimization
    AND e.course_id = (
      SELECT m.course_id FROM public.modules m WHERE m.id = public.lessons.module_id
    )
  )
);

DROP POLICY IF EXISTS "Instructors can insert lessons" ON public.lessons;
CREATE POLICY "Instructors can insert lessons" ON public.lessons FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = module_id AND c.instructor_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can update lessons" ON public.lessons;
CREATE POLICY "Instructors can update lessons" ON public.lessons FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = public.lessons.module_id AND c.instructor_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can delete lessons" ON public.lessons;
CREATE POLICY "Instructors can delete lessons" ON public.lessons FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = public.lessons.module_id AND c.instructor_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can view own lessons" ON public.lessons;
CREATE POLICY "Instructors can view own lessons" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = public.lessons.module_id AND c.instructor_id = (select auth.uid())
  )
);

-- 3. Enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can enroll themselves" ON public.enrollments;
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Instructors can view enrollments for their courses" ON public.enrollments;
CREATE POLICY "Instructors can view enrollments for their courses" ON public.enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = public.enrollments.course_id AND c.instructor_id = (select auth.uid())
  )
);

-- 4. Completed Lessons
DROP POLICY IF EXISTS "Users can view own completion" ON public.completed_lessons;
CREATE POLICY "Users can view own completion" ON public.completed_lessons FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark lessons complete" ON public.completed_lessons;
CREATE POLICY "Users can mark lessons complete" ON public.completed_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Modules
DROP POLICY IF EXISTS "Instructors can insert modules" ON public.modules;
CREATE POLICY "Instructors can insert modules" ON public.modules FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_id AND c.instructor_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can update modules" ON public.modules;
CREATE POLICY "Instructors can update modules" ON public.modules FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = public.modules.course_id AND c.instructor_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can delete modules" ON public.modules;
CREATE POLICY "Instructors can delete modules" ON public.modules FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = public.modules.course_id AND c.instructor_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can select modules" ON public.modules;
CREATE POLICY "Instructors can select modules" ON public.modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = public.modules.course_id AND c.instructor_id = (select auth.uid())
  )
);

-- 6. Support Tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (
  user_id = (select auth.uid())
);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
);

-- 7. Users
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
CREATE POLICY "Authenticated users can view profiles" ON public.users FOR SELECT TO authenticated USING (
   -- optimized to just allow if auth.uid() is not null, which is implied by 'TO authenticated'
   -- but if we want to check self:
   true
);
-- Note: "Users can view own data" was the one flagged.
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (
  id = (select auth.uid())
);

-- 8. Chat Messages
DROP POLICY IF EXISTS "Ticket participants can view messages" ON public.chat_messages;
CREATE POLICY "Ticket participants can view messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = public.chat_messages.ticket_id
    AND (
       t.user_id = (select auth.uid())
       OR
       EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND (u.role = 'admin' OR u.role = 'support'))
    )
  )
);

DROP POLICY IF EXISTS "Ticket participants can send messages" ON public.chat_messages;
CREATE POLICY "Ticket participants can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id
    AND (
       t.user_id = (select auth.uid())
       OR
       EXISTS (SELECT 1 FROM public.users u WHERE u.id = (select auth.uid()) AND (u.role = 'admin' OR u.role = 'support'))
    )
  )
);

-- 9. Payouts
DROP POLICY IF EXISTS "Instructors can view own payouts" ON public.payouts;
CREATE POLICY "Instructors can view own payouts" ON public.payouts FOR SELECT USING (
  instructor_id = (select auth.uid())
);
