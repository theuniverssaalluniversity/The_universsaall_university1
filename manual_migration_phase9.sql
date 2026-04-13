-- Phase 9 FINAL FIXES MIGRATION
-- Run this in Supabase SQL Editor to resolve all reported issues.

-- 1. FEATURED COURSES (Homepage)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. STUDENT PROGRESS FIX (RPC Function & RLS)
create table if not exists public.completed_lessons (
  user_id uuid references public.users(id),
  lesson_id uuid references public.lessons(id),
  course_id uuid references public.courses(id),
  completed_at timestamptz default now(),
  primary key (user_id, lesson_id),
  unique(user_id, lesson_id)
);

alter table public.completed_lessons enable row level security;

-- Policy: Users can insert their own completion
create policy "Users can mark lessons complete"
on public.completed_lessons for insert
with check (auth.uid() = user_id);

-- Policy: Users can view their own completion
create policy "Users can view own completion"
on public.completed_lessons for select
using (auth.uid() = user_id);

-- RPC Function for Progress Calculation
create or replace function public.mark_lesson_complete(p_lesson_id uuid, p_course_id uuid)
returns integer as $$
declare
  v_total_lessons integer;
  v_completed_lessons integer;
  v_new_progress integer;
begin
  -- Insert into completed_lessons (ignore if exists)
  insert into public.completed_lessons (user_id, lesson_id, course_id)
  values (auth.uid(), p_lesson_id, p_course_id)
  on conflict (user_id, lesson_id) do nothing;

  -- Count total lessons in course
  select count(*) into v_total_lessons
  from public.lessons
  join public.modules on modules.id = lessons.module_id
  where modules.course_id = p_course_id;

  -- Count completed lessons for user in course
  select count(*) into v_completed_lessons
  from public.completed_lessons
  where user_id = auth.uid() and course_id = p_course_id;

  -- Calculate Progress
  if v_total_lessons > 0 then
    v_new_progress := (v_completed_lessons::float / v_total_lessons::float * 100)::integer;
  else
    v_new_progress := 100;
  end if;

  -- Update Enrollment
  update public.enrollments
  set progress_percent = v_new_progress
  where user_id = auth.uid() and course_id = p_course_id;

  return v_new_progress;
end;
$$ language plpgsql security definer;

-- 3. INSTRUCTOR VISIBILITY (RLS)
-- Allow instructors to view enrollments for their own courses
create policy "Instructors can view enrollments for their courses"
on public.enrollments for select
using (
  exists (
    select 1 from public.courses
    where courses.id = enrollments.course_id
    and courses.instructor_id = auth.uid()
  )
);

-- Allow instructors to view order_items for their courses
-- Adjusted for 'item_id' and 'item_type' schema
alter table public.order_items enable row level security;

create policy "Instructors can view order_items for their courses"
on public.order_items for select
using (
  item_type = 'course' and
  exists (
    select 1 from public.courses
    where courses.id = order_items.item_id
    and courses.instructor_id = auth.uid()
  )
);

-- 4. SERVICES MANAGEMENT (Admin)
alter table public.services 
add column if not exists thumbnail_url text;

alter table public.services enable row level security;

create policy "Public can view services"
on public.services for select
using (true);

create policy "Admins can manage services"
on public.services for all
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  )
);

-- 5. SUPPORT TICKETS
-- (Same as before, ensuring existence)
drop type if exists ticket_status cascade;
drop type if exists ticket_priority cascade;

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
