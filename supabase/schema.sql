-- ====================================================================
-- MESS MANAGER - COMPLETE DATABASE SCHEMA & RLS POLICIES
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mess Groups Table
CREATE TABLE IF NOT EXISTS public.mess_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'INR',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    default_monthly_contribution NUMERIC(12, 2) DEFAULT 3000.00,
    low_balance_threshold NUMERIC(12, 2) DEFAULT 1000.00,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mess Members Table
CREATE TABLE IF NOT EXISTS public.mess_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    monthly_contribution NUMERIC(12, 2) DEFAULT 3000.00,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Months Table (Accounting Months)
CREATE TABLE IF NOT EXISTS public.months (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    year INT NOT NULL,
    month_number INT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
    name TEXT NOT NULL,
    expected_contribution NUMERIC(12, 2) DEFAULT 3000.00,
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (mess_id, year, month_number)
);

-- 6. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'ShoppingCart',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Contributions Table
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    month_id UUID NOT NULL REFERENCES public.months(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.mess_members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank', 'Other')) DEFAULT 'UPI',
    note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    month_id UUID NOT NULL REFERENCES public.months(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paid_by_member_id UUID NOT NULL REFERENCES public.mess_members(id) ON DELETE CASCADE,
    payment_source TEXT NOT NULL CHECK (payment_source IN ('common_fund', 'personal')) DEFAULT 'common_fund',
    note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Settlements Table (Reimbursements & Repayments)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    month_id UUID NOT NULL REFERENCES public.months(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.mess_members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    settlement_type TEXT NOT NULL CHECK (settlement_type IN ('reimbursement', 'repayment', 'adjustment')) DEFAULT 'reimbursement',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Bank', 'Other')) DEFAULT 'UPI',
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Cash Adjustments Table (Cash Audit Reconciliation)
CREATE TABLE IF NOT EXISTS public.cash_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    month_id UUID NOT NULL REFERENCES public.months(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease')),
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Recurring Expenses Table
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    frequency TEXT NOT NULL DEFAULT 'Monthly',
    next_due_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mess_id UUID NOT NULL REFERENCES public.mess_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR FAST QUERYING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_mess_members_mess_user ON public.mess_members(mess_id, user_id);
CREATE INDEX IF NOT EXISTS idx_months_mess_year_month ON public.months(mess_id, year, month_number);
CREATE INDEX IF NOT EXISTS idx_expenses_mess_month ON public.expenses(mess_id, month_id);
CREATE INDEX IF NOT EXISTS idx_contributions_mess_month ON public.contributions(mess_id, month_id);
CREATE INDEX IF NOT EXISTS idx_settlements_mess_month ON public.settlements(mess_id, month_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_mess ON public.activity_logs(mess_id, created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check mess membership
CREATE OR REPLACE FUNCTION public.is_mess_member(target_mess_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.mess_members
        WHERE mess_id = target_mess_id
        AND user_id = auth.uid()
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check mess admin role
CREATE OR REPLACE FUNCTION public.is_mess_admin(target_mess_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.mess_members
        WHERE mess_id = target_mess_id
        AND user_id = auth.uid()
        AND role = 'admin'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view all profiles, edit own profile
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Mess Groups: Members can view their mess group, Admins can update
CREATE POLICY "Members can view mess group" ON public.mess_groups FOR SELECT USING (public.is_mess_member(id));
CREATE POLICY "Admins can update mess group" ON public.mess_groups FOR UPDATE USING (public.is_mess_admin(id));

-- Mess Members: Members can view all members in their mess group, Admins can insert/update
CREATE POLICY "Members can view mess members" ON public.mess_members FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Admins can insert mess members" ON public.mess_members FOR INSERT WITH CHECK (public.is_mess_admin(mess_id));
CREATE POLICY "Admins can update mess members" ON public.mess_members FOR UPDATE USING (public.is_mess_admin(mess_id));

-- Data Access Policies (Months, Categories, Expenses, Contributions, Settlements, Adjustments, Recurring, Logs)
-- Select allowed for members of mess
CREATE POLICY "Members can view months" ON public.months FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT USING (mess_id IS NULL OR public.is_mess_member(mess_id));
CREATE POLICY "Members can view contributions" ON public.contributions FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Members can view expenses" ON public.expenses FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Members can view settlements" ON public.settlements FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Members can view cash_adjustments" ON public.cash_adjustments FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Members can view recurring_expenses" ON public.recurring_expenses FOR SELECT USING (public.is_mess_member(mess_id));
CREATE POLICY "Members can view activity_logs" ON public.activity_logs FOR SELECT USING (public.is_mess_member(mess_id));

-- Insert/Update allowed for members
CREATE POLICY "Members can insert contributions" ON public.contributions FOR INSERT WITH CHECK (public.is_mess_member(mess_id));
CREATE POLICY "Members can insert expenses" ON public.expenses FOR INSERT WITH CHECK (public.is_mess_member(mess_id));
CREATE POLICY "Members can insert settlements" ON public.settlements FOR INSERT WITH CHECK (public.is_mess_member(mess_id));

-- Admins can manage/edit/delete all financial entries
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE USING (public.is_mess_admin(mess_id));
CREATE POLICY "Admins can delete contributions" ON public.contributions FOR DELETE USING (public.is_mess_admin(mess_id));
CREATE POLICY "Admins can manage months" ON public.months FOR ALL USING (public.is_mess_admin(mess_id));

-- Trigger to create profile automatically on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
