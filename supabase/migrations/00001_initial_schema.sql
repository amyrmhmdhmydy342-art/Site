-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.users(id),
    credits INTEGER DEFAULT 10,
    last_ip TEXT,
    device_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Logos Table
CREATE TABLE public.logos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Credit Transactions Table
CREATE TABLE public.credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('earned', 'spent', 'purchased', 'admin_grant')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Referrals Table
CREATE TABLE public.referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES public.users(id) NOT NULL,
    referred_id UUID REFERENCES public.users(id) NOT NULL UNIQUE,
    valid BOOLEAN DEFAULT FALSE,
    activity_confirmed BOOLEAN DEFAULT FALSE,
    ip_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Leaderboard Entries Table
CREATE TABLE public.leaderboard_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    referral_count INTEGER DEFAULT 0,
    month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
    rank INTEGER,
    rewards_claimed BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, month_year)
);

-- Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AI Models Table
CREATE TABLE public.ai_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    credit_cost INTEGER DEFAULT 1
);

-- Payment Transactions Table
CREATE TABLE public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    method TEXT CHECK (method IN ('fiat_ramp', 'crypto_coinremitter')),
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
    gateway_tx_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) Setup

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Logos
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logos" ON public.logos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logos" ON public.logos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logos" ON public.logos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own logos" ON public.logos FOR DELETE USING (auth.uid() = user_id);

-- Credit Transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

-- Leaderboard (Public read)
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is public" ON public.leaderboard_entries FOR SELECT USING (true);

-- Functions & Triggers

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  ref_code TEXT;
BEGIN
  -- Generate a random 8-character referral code
  ref_code := encode(gen_random_bytes(6), 'base64');
  ref_code := replace(replace(replace(ref_code, '/', ''), '+', ''), '=', '');
  
  INSERT INTO public.users (id, email, referral_code)
  VALUES (new.id, new.email, ref_code);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
