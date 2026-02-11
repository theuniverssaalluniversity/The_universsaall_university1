-- Phase 17: Payment Transactions Logging
-- Tracks all payment attempts (Razorpay, Stripe, Manual)

CREATE TYPE payment_provider AS ENUM ('razorpay', 'stripe', 'manual', 'free');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    provider payment_provider NOT NULL,
    provider_transaction_id TEXT, -- razorpay_payment_id or stripe_payment_intent
    provider_order_id TEXT, -- razorpay_order_id
    status payment_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb, -- Store items, user region info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
ON transactions FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT USING (
    auth.uid() = user_id
);

-- Allow authenticated users to insert (for now, backend usually handles this)
-- We'll allow insert for the checkout flow validation
CREATE POLICY "Users can create transactions" 
ON transactions FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
