import {
  MessGroup,
  MessMember,
  AccountingMonth,
  Category,
  Contribution,
  Expense,
  Settlement,
  CashAdjustment,
  RecurringExpense,
  ActivityLog,
} from './types';

export const SHARED_MESS_ID = '00000000-0000-0000-0000-000000000001';

export const MOCK_MESS_GROUP: MessGroup = {
  id: SHARED_MESS_ID,
  name: 'ApnaMess',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  default_monthly_contribution: 3000,
  low_balance_threshold: 1000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_MEMBERS: MessMember[] = [
  { id: 'mem-avi', mess_id: SHARED_MESS_ID, display_name: 'Avi', role: 'admin', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-sanjeev', mess_id: SHARED_MESS_ID, display_name: 'Sanjeev', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-tapas', mess_id: SHARED_MESS_ID, display_name: 'Tapas', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-om', mess_id: SHARED_MESS_ID, display_name: 'Om', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-rahul', mess_id: SHARED_MESS_ID, display_name: 'Rahul', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-abhay', mess_id: SHARED_MESS_ID, display_name: 'Abhay', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-manish', mess_id: SHARED_MESS_ID, display_name: 'Manish', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-shahzada', mess_id: SHARED_MESS_ID, display_name: 'Shahzada', role: 'member', monthly_contribution: 3000, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const MOCK_MONTHS: AccountingMonth[] = [
  {
    id: 'month-2026-09',
    mess_id: SHARED_MESS_ID,
    year: 2026,
    month_number: 9,
    name: 'September',
    expected_contribution: 3000,
    opening_balance: 0,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_CONTRIBUTIONS: Contribution[] = [];
export const MOCK_EXPENSES: Expense[] = [];
export const MOCK_SETTLEMENTS: Settlement[] = [];
export const MOCK_CASH_ADJUSTMENTS: CashAdjustment[] = [];
export const MOCK_RECURRING_EXPENSES: RecurringExpense[] = [];
export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [];
