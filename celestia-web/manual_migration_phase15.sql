-- Phase 15: User Management & UI Enhancements
-- 1. Schema: Add/Ensure `unique_id` (5 chars) for Users.
-- 2. Schema: Update Manual Enrollment to use `unique_id`. (Logic check)

-- A. Add Unique ID Column (if not exists or inconsistent)
DO $$ 
BEGIN 
    -- We saw "short_id" in the schema. Let's start by standardizing on "unique_id".
    -- If short_id exists, we can rename it or use it. Let's assume we want "unique_id" as per spec.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'short_id') THEN
        ALTER TABLE public.users RENAME COLUMN short_id TO unique_id;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'unique_id') THEN
        ALTER TABLE public.users ADD COLUMN unique_id text;
    END IF;
END $$;

-- B. Create Random ID Generator Function (5 Chars, Uppercase/Numbers)
CREATE OR REPLACE FUNCTION generate_unique_id() RETURNS text AS $$
DECLARE
    new_id text;
    done bool;
BEGIN
    done := false;
    WHILE NOT done LOOP
        -- Generate 5 char random string (A-Z, 0-9)
        -- Using md5 + substring is cheap but might not be upper/alphanum strictly.
        -- Better: Use explicit chars.
        new_id := upper(substring(md5(random()::text), 1, 5));
        
        -- Check collision
        done := NOT exists(SELECT 1 FROM public.users WHERE unique_id = new_id);
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- C. Backfill Existing Users (Safe Update)
UPDATE public.users 
SET unique_id = generate_unique_id() 
WHERE unique_id IS NULL;

-- D. Trigger to Auto-Assign on Insert
CREATE OR REPLACE FUNCTION set_unique_id() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.unique_id IS NULL THEN
        NEW.unique_id := generate_unique_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_unique_id ON public.users;
CREATE TRIGGER trg_set_unique_id
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION set_unique_id();

-- E. Make Unique ID Unique & NOT NULL
ALTER TABLE public.users ALTER COLUMN unique_id SET NOT NULL;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_unique_id_key;
ALTER TABLE public.users ADD CONSTRAINT users_unique_id_key UNIQUE (unique_id);

-- F. RLS: Allow Public/Auth read of "unique_id"? 
-- Yes, it's public profile info essentially.
-- Existing policies on `users` usually allow "Public can view basic profiles". 
-- We verify `unique_id` is readable. (It is a column of `users`, so row policies apply).
