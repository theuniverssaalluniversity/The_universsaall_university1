-- Phase 9 Manual Migration File
-- Run this in Supabase SQL Editor to fix DB schema issues found during Phase 9.

-- 1. Add 'is_featured' to Courses (for Homepage)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. Repair Progress Tracking Function
-- (Re-run this to ensure logic is correct and exists)
create or replace function public.mark_lesson_complete(p_lesson_id uuid, p_course_id uuid)
returns integer as $$
declare
  v_total_lessons integer;
  v_completed_lessons integer;
  v_new_progress integer;
begin
  -- 1. Insert into completed_lessons (ignore if exists)
  insert into public.completed_lessons (user_id, lesson_id, course_id)
  values (auth.uid(), p_lesson_id, p_course_id)
  on conflict (user_id, lesson_id) do nothing;

  -- 2. Count total lessons in course
  select count(*) into v_total_lessons
  from public.lessons
  join public.modules on modules.id = lessons.module_id
  where modules.course_id = p_course_id;

  -- 3. Count completed lessons for user in course
  select count(*) into v_completed_lessons
  from public.completed_lessons
  where user_id = auth.uid() and course_id = p_course_id;

  -- 4. Calculate Progress
  if v_total_lessons > 0 then
    v_new_progress := (v_completed_lessons::float / v_total_lessons::float * 100)::integer;
  else
    v_new_progress := 100;
  end if;

  -- 5. Update Enrollment
  update public.enrollments
  set progress_percent = v_new_progress
  where user_id = auth.uid() and course_id = p_course_id;

  return v_new_progress;
end;
$$ language plpgsql security definer;

-- 3. Ensure RLS allows students to view their own enrollments/progress
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own enrollments') THEN
    CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Ticket Support System Tables (For Item 5)
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');

create table if not exists public.support_tickets (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id),
    subject text not null,
    message text not null,
    status ticket_status default 'open',
    priority ticket_priority default 'medium',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.support_tickets enable row level security;

create policy "Users can view own tickets" on public.support_tickets
    for select using (auth.uid() = user_id);

create policy "Users can create tickets" on public.support_tickets
    for insert with check (auth.uid() = user_id);

create policy "Support/Admin can view all tickets" on public.support_tickets
    for select using (
        exists (
            select 1 from public.users 
            where id = auth.uid() 
            and role in ('support', 'admin')
        )
    );

create policy "Support/Admin can update tickets" on public.support_tickets
    for update using (
        exists (
            select 1 from public.users 
            where id = auth.uid() 
            and role in ('support', 'admin')
        )
    );
