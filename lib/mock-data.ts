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

export const MOCK_MESS_GROUP: MessGroup = {
  id: 'mess-apna-001',
  name: 'ApnaMess',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  default_monthly_contribution: 3000,
  low_balance_threshold: 1000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_MEMBERS: MessMember[] = [];

export const MOCK_MONTHS: AccountingMonth[] = [
  {
    id: 'month-2026-09',
    mess_id: 'mess-apna-001',
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
