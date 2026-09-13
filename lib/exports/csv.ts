import { Expense, Contribution, FinancialSummary, MemberFinancialSummary } from '../types';

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSVCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportExpensesCSV(expenses: Expense[], monthName: string) {
  const headers = ['Date', 'Item Name', 'Paid By', 'Payment Source', 'Amount (INR)'];
  const rows = expenses.map((e) => [
    e.expense_date,
    e.item_name,
    e.member_name || 'Member',
    e.payment_source === 'personal' ? 'Personal' : 'Main Fund',
    e.amount,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map(escapeCSVCell).join(',')).join('\n');
  const filename = `expenses_${monthName.toLowerCase().replace(/\s+/g, '_')}.csv`;
  downloadCSV(filename, csvContent);
}

export function exportContributionsCSV(contributions: Contribution[], monthName: string) {
  const headers = ['Date', 'Member Name', 'Amount (INR)'];
  const rows = contributions.map((c) => [
    c.payment_date,
    c.member_name || 'Member',
    c.amount,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map(escapeCSVCell).join(',')).join('\n');
  const filename = `contributions_${monthName.toLowerCase().replace(/\s+/g, '_')}.csv`;
  downloadCSV(filename, csvContent);
}

export function exportMonthlySummaryCSV(summary: FinancialSummary) {
  const metaRows = [
    ['Mess Financial Summary Report', summary.month_name],
    ['Total Contributions', summary.total_contributions],
    ['Main Fund Expenses', summary.common_fund_expenses],
    ['Personal Expenses', summary.personal_expenses],
    ['Main Fund Balance', summary.common_cash_balance],
    [],
  ];

  const memberHeaders = [
    'Member Name',
    'Role',
    'Monthly Target',
    'Contributed',
    'Fully Paid Status',
    'Personal Expenses Paid',
  ];

  const memberRows = summary.member_summaries.map((m: MemberFinancialSummary) => [
    m.display_name,
    m.role,
    m.expected_contribution,
    m.total_contributed,
    m.is_fully_paid ? 'Yes' : 'No',
    m.personal_expenses_paid,
  ]);

  const allRows = [
    ...metaRows,
    memberHeaders,
    ...memberRows,
  ];

  const csvContent = allRows.map((row) => row.map(escapeCSVCell).join(',')).join('\n');
  const filename = `monthly_summary_${summary.month_name.toLowerCase().replace(/\s+/g, '_')}.csv`;
  downloadCSV(filename, csvContent);
}
