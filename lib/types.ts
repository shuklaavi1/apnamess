export type MemberRole = 'admin' | 'member';
export type PaymentSource = 'common_fund' | 'personal' | 'main_fund';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank' | 'Other';
export type SettlementType = 'reimbursement' | 'repayment' | 'adjustment';
export type AdjustmentType = 'increase' | 'decrease';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessGroup {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  default_monthly_contribution: number;
  low_balance_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface MessMember {
  id: string;
  mess_id: string;
  user_id?: string | null;
  display_name: string;
  role: MemberRole;
  monthly_contribution: number;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingMonth {
  id: string;
  mess_id: string;
  year: number;
  month_number: number;
  name: string;
  expected_contribution: number;
  opening_balance: number;
  status: 'open' | 'closed';
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  mess_id?: string | null;
  name: string;
  icon?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Contribution {
  id: string;
  mess_id: string;
  month_id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  payment_method?: PaymentMethod;
  note?: string | null;
  created_at: string;
  member_name?: string;
}

export interface Expense {
  id: string;
  mess_id: string;
  month_id: string;
  item_name: string;
  amount: number;
  expense_date: string;
  paid_by_member_id: string;
  payment_source: PaymentSource;
  category_id?: string | null;
  category_name?: string;
  category_icon?: string;
  note?: string | null;
  created_at: string;
  member_name?: string;
}

export interface Settlement {
  id: string;
  mess_id: string;
  month_id: string;
  member_id: string;
  amount: number;
  settlement_type: SettlementType;
  payment_method: PaymentMethod;
  settlement_date: string;
  note?: string | null;
  created_at: string;
  member_name?: string;
}

export interface CashAdjustment {
  id: string;
  mess_id: string;
  month_id: string;
  amount: number;
  adjustment_type: AdjustmentType;
  adjustment_date: string;
  reason: string;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  mess_id: string;
  name: string;
  amount: number;
  category_id?: string | null;
  frequency: string;
  next_due_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface ActivityLog {
  id: string;
  mess_id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: any;
  new_data?: any;
  created_at: string;
  user_name?: string;
}

export interface MemberFinancialSummary {
  member_id: string;
  display_name: string;
  role: MemberRole;
  is_active: boolean;
  expected_contribution: number;
  total_contributed: number;
  is_fully_paid: boolean;
  personal_expenses_paid: number;
}

export interface FinancialSummary {
  month_id: string;
  month_name: string;
  opening_balance: number;
  total_contributions: number;
  common_fund_expenses: number;
  personal_expenses: number;
  total_reimbursements: number;
  cash_increases: number;
  cash_decreases: number;
  common_cash_balance: number;
  total_pending_contributions: number;
  total_pending_reimbursements: number;
  member_summaries: MemberFinancialSummary[];
}
