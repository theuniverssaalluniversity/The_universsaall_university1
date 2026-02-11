-- Phase 21: Critical Admin & Course Fixes (CORRECTED)
-- This migration ensures Admins have full control over Courses and Enrollments

-- 1. Fix Courses RLS for Admins
DROP POLICY IF EXISTS "Enable all access for admins" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;

CREATE POLICY "Enable all access for admins" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 2. Fix Modules RLS
DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
CREATE POLICY "Admins can manage modules" ON modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 3. Fix Lessons RLS
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
CREATE POLICY "Admins can manage lessons" ON lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 4. Fix Enrollments RLS (Allow Admin to delete/add enrollments manualy)
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
CREATE POLICY "Admins can manage enrollments" ON enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Ensure Payment/Transaction Updates
DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
CREATE POLICY "Admins can manage transactions" ON transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
