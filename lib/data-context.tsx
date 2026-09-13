'use client';

import React, { createContext, useContext, useState } from 'react';
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
  FinancialSummary,
  MemberRole,
} from './types';
import {
  MOCK_MESS_GROUP,
  MOCK_MEMBERS,
  MOCK_MONTHS,
  MOCK_CATEGORIES,
  MOCK_CONTRIBUTIONS,
  MOCK_EXPENSES,
  MOCK_SETTLEMENTS,
  MOCK_CASH_ADJUSTMENTS,
  MOCK_RECURRING_EXPENSES,
  MOCK_ACTIVITY_LOGS,
} from './mock-data';
import { calculateMonthFinancials } from './calculations/financials';

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface DataContextType {
  messGroup: MessGroup;
  members: MessMember[];
  months: AccountingMonth[];
  selectedMonth: AccountingMonth;
  categories: Category[];
  contributions: Contribution[];
  expenses: Expense[];
  settlements: Settlement[];
  cashAdjustments: CashAdjustment[];
  recurringExpenses: RecurringExpense[];
  activityLogs: ActivityLog[];
  currentMember: MessMember;
  currentRole: MemberRole;

  financials: FinancialSummary;

  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  setSelectedMonthId: (monthId: string) => void;
  setCurrentMemberId: (memberId: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => void;
  deleteExpense: (id: string) => void;

  addContribution: (contribution: Omit<Contribution, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => void;
  deleteContribution: (id: string) => void;

  resetToDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [messGroup] = useState<MessGroup>(MOCK_MESS_GROUP);
  const [members, setMembers] = useState<MessMember[]>(MOCK_MEMBERS);
  const [months] = useState<AccountingMonth[]>(MOCK_MONTHS);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('month-2026-09');
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [settlements] = useState<Settlement[]>(MOCK_SETTLEMENTS);
  const [cashAdjustments] = useState<CashAdjustment[]>(MOCK_CASH_ADJUSTMENTS);
  const [recurringExpenses] = useState<RecurringExpense[]>(MOCK_RECURRING_EXPENSES);
  const [activityLogs] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOGS);
  const [currentMemberId, setCurrentMemberId] = useState<string>('mem-001');

  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];
  const currentRole = currentMember?.role || 'member';

  const selectedMonth = months.find((m) => m.id === selectedMonthId) || months[0];

  // Financials formula calculation
  const financials = calculateMonthFinancials(
    selectedMonth,
    members,
    contributions,
    expenses
  );

  const addExpense = (data: Omit<Expense, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => {
    const targetMonthId = data.month_id || selectedMonth.id;
    const payer = members.find((m) => m.id === data.paid_by_member_id);

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      mess_id: messGroup.id,
      month_id: targetMonthId,
      item_name: data.item_name,
      amount: Number(data.amount),
      expense_date: data.expense_date,
      paid_by_member_id: data.paid_by_member_id,
      payment_source: data.payment_source,
      note: data.note,
      created_at: new Date().toISOString(),
      member_name: payer?.display_name || 'Member',
    };

    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Added expense ₹${newExpense.amount} for ${newExpense.item_name}`);
  };

  const deleteExpense = (id: string) => {
    const existing = expenses.find((e) => e.id === id);
    if (!existing) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(`Deleted expense "${existing.item_name}"`, 'info');
  };

  const addContribution = (data: Omit<Contribution, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => {
    const targetMonthId = data.month_id || selectedMonth.id;
    const payer = members.find((m) => m.id === data.member_id);

    const newContrib: Contribution = {
      id: `contrib-${Date.now()}`,
      mess_id: messGroup.id,
      month_id: targetMonthId,
      member_id: data.member_id,
      amount: Number(data.amount),
      payment_date: data.payment_date,
      payment_method: data.payment_method || 'UPI',
      note: data.note,
      created_at: new Date().toISOString(),
      member_name: payer?.display_name || 'Member',
    };

    setContributions((prev) => [newContrib, ...prev]);
    showToast(`Recorded contribution ₹${newContrib.amount} from ${newContrib.member_name}`);
  };

  const deleteContribution = (id: string) => {
    const existing = contributions.find((c) => c.id === id);
    if (!existing) return;

    setContributions((prev) => prev.filter((c) => c.id !== id));
    showToast(`Deleted contribution from ${existing.member_name}`, 'info');
  };

  const resetToDemoData = () => {
    setMembers(MOCK_MEMBERS);
    setContributions(MOCK_CONTRIBUTIONS);
    setExpenses(MOCK_EXPENSES);
    setCurrentMemberId('mem-001');
    showToast('Reset data to initial state', 'info');
  };

  return (
    <DataContext.Provider
      value={{
        messGroup,
        members,
        months,
        selectedMonth,
        categories,
        contributions,
        expenses,
        settlements,
        cashAdjustments,
        recurringExpenses,
        activityLogs,
        currentMember,
        currentRole,
        financials,
        toasts,
        showToast,
        removeToast,
        setSelectedMonthId,
        setCurrentMemberId,
        addExpense,
        deleteExpense,
        addContribution,
        deleteContribution,
        resetToDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
