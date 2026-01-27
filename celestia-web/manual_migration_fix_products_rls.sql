-- Fix RLS for Products and Coupons
-- Problem: 'products' table only had SELECT policy. Admins could not Insert/Update.

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. Products Policies
-- Allow Public Read (Already exists usually, but ensuring)
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

-- Allow Admins Full Control
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
TO authenticated 
USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );


-- 3. Coupons Policies
-- Allow Public Read (for checking validity in helper functions? Or strictly via RPC? Let's allow read for now)
DROP POLICY IF EXISTS "Everyone can read coupons" ON public.coupons;
CREATE POLICY "Everyone can read coupons" ON public.coupons FOR SELECT USING (true);

-- Allow Admins Full Control
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" 
ON public.coupons 
FOR ALL 
TO authenticated 
USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );
