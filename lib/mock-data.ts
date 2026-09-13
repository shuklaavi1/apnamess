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
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
};

export const MOCK_MEMBERS: MessMember[] = [
  {
    id: 'mem-001',
    mess_id: 'mess-apna-001',
    display_name: 'Rahul',
    role: 'admin',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'mem-002',
    mess_id: 'mess-apna-001',
    display_name: 'Aman',
    role: 'member',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'mem-003',
    mess_id: 'mess-apna-001',
    display_name: 'Priya',
    role: 'member',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'mem-004',
    mess_id: 'mess-apna-001',
    display_name: 'Yash',
    role: 'member',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'mem-005',
    mess_id: 'mess-apna-001',
    display_name: 'Rohit',
    role: 'member',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'mem-006',
    mess_id: 'mess-apna-001',
    display_name: 'Kunal',
    role: 'member',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: '2026-09-01T00:00:00Z',
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
];

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
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'month-2026-08',
    mess_id: 'mess-apna-001',
    year: 2026,
    month_number: 8,
    name: 'August',
    expected_contribution: 3000,
    opening_balance: 0,
    status: 'closed',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-31T23:59:59Z',
  },
];

export const MOCK_CATEGORIES: Category[] = [];

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'contrib-01',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    member_id: 'mem-001', // Rahul
    member_name: 'Rahul',
    amount: 3000,
    payment_date: '2026-09-02',
    payment_method: 'UPI',
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'contrib-02',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    member_id: 'mem-002', // Aman
    member_name: 'Aman',
    amount: 3000,
    payment_date: '2026-09-03',
    payment_method: 'UPI',
    created_at: '2026-09-03T11:30:00Z',
  },
  {
    id: 'contrib-03',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    member_id: 'mem-004', // Yash
    member_name: 'Yash',
    amount: 3000,
    payment_date: '2026-09-05',
    payment_method: 'UPI',
    created_at: '2026-09-05T14:00:00Z',
  },
  {
    id: 'contrib-04',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    member_id: 'mem-005', // Rohit
    member_name: 'Rohit',
    amount: 3000,
    payment_date: '2026-09-06',
    payment_method: 'UPI',
    created_at: '2026-09-06T16:00:00Z',
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    item_name: 'Vegetables',
    amount: 420,
    expense_date: '2026-09-13',
    paid_by_member_id: 'mem-001', // Rahul
    member_name: 'Rahul',
    payment_source: 'common_fund',
    created_at: '2026-09-13T12:00:00Z',
  },
  {
    id: 'exp-002',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    item_name: 'Groceries',
    amount: 860,
    expense_date: '2026-09-12',
    paid_by_member_id: 'mem-003', // Priya
    member_name: 'Priya',
    payment_source: 'common_fund',
    created_at: '2026-09-12T18:00:00Z',
  },
  {
    id: 'exp-003',
    mess_id: 'mess-apna-001',
    month_id: 'month-2026-09',
    item_name: 'Milk',
    amount: 180,
    expense_date: '2026-09-11',
    paid_by_member_id: 'mem-002', // Aman
    member_name: 'Aman',
    payment_source: 'common_fund',
    created_at: '2026-09-11T08:30:00Z',
  },
];

export const MOCK_SETTLEMENTS: Settlement[] = [];
export const MOCK_CASH_ADJUSTMENTS: CashAdjustment[] = [];
export const MOCK_RECURRING_EXPENSES: RecurringExpense[] = [];
export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [];
