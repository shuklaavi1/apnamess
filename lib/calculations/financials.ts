import {
  AccountingMonth,
  MessMember,
  Contribution,
  Expense,
  MemberFinancialSummary,
  FinancialSummary,
} from '../types';

/**
 * Formats a numeric value into INR (Indian Rupee) format.
 * Example: 18450 -> "₹18,450"
 */
export function formatINR(amount: number, includeDecimals = false): string {
  const rounded = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rounded);
}

/**
 * Calculates core V1 financials for selected month:
 * Main Fund = Total Contributions - Main Fund Expenses
 */
export function calculateMonthFinancials(
  month: AccountingMonth,
  members: MessMember[],
  contributions: Contribution[],
  expenses: Expense[]
): FinancialSummary {
  const monthContributions = contributions.filter((c) => c.month_id === month.id);
  const monthExpenses = expenses.filter((e) => e.month_id === month.id);

  // 1. Total Contributed
  const total_contributions = monthContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  // 2. Main Fund Expenses (payment_source = 'common_fund' or 'main_fund')
  const common_fund_expenses = monthExpenses
    .filter((e) => e.payment_source === 'common_fund' || e.payment_source === 'main_fund')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // 3. Personal Expenses
  const personal_expenses = monthExpenses
    .filter((e) => e.payment_source === 'personal')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // 4. Main Fund Balance = Total Contributions - Main Fund Expenses
  const main_fund_balance = total_contributions - common_fund_expenses;

  // 5. Per-member summaries
  const member_summaries: MemberFinancialSummary[] = members.map((member) => {
    const expected_contribution = Number(member.monthly_contribution || month.expected_contribution || 3000);

    const memberContributions = monthContributions
      .filter((c) => c.member_id === member.id)
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const isFullyPaid = memberContributions >= expected_contribution;

    const personal_expenses_paid = monthExpenses
      .filter((e) => e.paid_by_member_id === member.id && e.payment_source === 'personal')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      member_id: member.id,
      display_name: member.display_name,
      role: member.role,
      is_active: member.is_active,
      expected_contribution,
      total_contributed: memberContributions,
      is_fully_paid: isFullyPaid,
      personal_expenses_paid,
    };
  });

  return {
    month_id: month.id,
    month_name: month.name,
    opening_balance: Number(month.opening_balance || 0),
    total_contributions,
    common_fund_expenses,
    personal_expenses,
    total_reimbursements: 0,
    cash_increases: 0,
    cash_decreases: 0,
    common_cash_balance: main_fund_balance,
    total_pending_contributions: 0,
    total_pending_reimbursements: 0,
    member_summaries,
  };
}
