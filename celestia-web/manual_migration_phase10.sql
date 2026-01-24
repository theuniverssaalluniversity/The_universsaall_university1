-- Phase 10 MIGRATION: Payments, Chat & Hardening

-- 1. FIX INSTRUCTOR STUDENT VISIBILITY (RLS)
-- Currently, instructors cannot see student profiles because "Users can view own profile" is too strict.
-- We need to allow authenticated users to view basic profile info of others (needed for community, chat, instructor lists).
-- Alternatively, strict: Allow if part of an enrollment.
-- For simplicity and community features, we'll allow Authenticated Basic Read.
drop policy if exists "Users can view own profile" on public.users;
create policy "Authenticated users can view profiles"
on public.users for select
using (auth.role() = 'authenticated');

-- 2. PAYOUTS SYSTEM
create table if not exists public.payouts (
    id uuid primary key default uuid_generate_v4(),
    instructor_id uuid references public.users(id),
    amount numeric(10, 2) not null,
    status text check (status in ('pending', 'processing', 'paid', 'failed')) default 'pending',
    reference_id text, -- transaction ID
    remarks text,
    processed_at timestamptz,
    created_at timestamptz default now()
);

alter table public.payouts enable row level security;

-- Instructors can view their own payouts
create policy "Instructors can view own payouts"
on public.payouts for select
using (auth.uid() = instructor_id);

-- Admins can manage all payouts
create policy "Admins can manage payouts"
on public.payouts for all
using (
    exists (
        select 1 from public.users
        where id = auth.uid()
        and role = 'admin'
    )
);

-- 3. REVENUE SHARE PERCENTAGE
-- Add a column to users to store their custom split (default 70%)
alter table public.users 
add column if not exists revenue_share_percent integer default 70;

-- 4. CHAT MESSAGES FIX (If needed)
-- Ensure chat_messages table has correct RLS
create table if not exists public.chat_messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references public.support_tickets(id) on delete cascade,
    sender_id uuid references public.users(id),
    message text not null,
    created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Ticket participants can view messages"
on public.chat_messages for select
using (
    exists (
        select 1 from public.support_tickets
        where id = chat_messages.ticket_id
        and (user_id = auth.uid() or exists (
            select 1 from public.users where id = auth.uid() and role in ('admin', 'support')
        ))
    )
);

create policy "Ticket participants can send messages"
on public.chat_messages for insert
with check (
    auth.uid() = sender_id
);

-- 5. FUNCTION TO CALCULATE INSTRUCTOR EARNINGS (Ledger)
-- We need a robust way to calculate earnings.
-- Total Earnings = Sum(Course Price) where course.instructor = user
-- This is heavy. Real systems use a ledger.
-- For now, we will compute on the fly using `order_items` + `revenue_share_percent`.
-- No Schema change needed, just Frontend/Backend Query logic.

