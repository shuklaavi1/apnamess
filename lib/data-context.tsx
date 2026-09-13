'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MessGroup,
  MessMember,
  AccountingMonth,
  Contribution,
  Expense,
  FinancialSummary,
  MemberRole,
} from './types';
import {
  MOCK_MESS_GROUP,
  MOCK_MEMBERS,
  MOCK_MONTHS,
  MOCK_CONTRIBUTIONS,
  MOCK_EXPENSES,
} from './mock-data';
import { calculateMonthFinancials } from './calculations/financials';
import { createClient } from './supabase/client';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface DataContextType {
  user: User | null;
  session: Session | null;
  messGroup: MessGroup;
  members: MessMember[];
  months: AccountingMonth[];
  selectedMonth: AccountingMonth;
  contributions: Contribution[];
  expenses: Expense[];
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

  addMember: (displayName: string, role?: MemberRole, monthlyContribution?: number) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  toggleAdminRole: (memberId: string) => Promise<void>;

  signOut: () => Promise<void>;
  resetToDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [messGroup, setMessGroup] = useState<MessGroup>(MOCK_MESS_GROUP);
  const [members, setMembers] = useState<MessMember[]>(MOCK_MEMBERS);
  const [months, setMonths] = useState<AccountingMonth[]>(MOCK_MONTHS);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('month-2026-09');
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [currentMemberId, setCurrentMemberId] = useState<string>('');

  const [toasts, setToasts] = useState<ToastState[]>([]);

  const supabase = createClient();
  const router = useRouter();

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

  // Auth & Session listener with safe try-catch
  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      }).catch(() => {
        // Safe catch
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => subscription?.unsubscribe();
    } catch (e) {
      // Safe catch
    }
  }, []);

  // Fetch Live Data from Supabase with safe try-catch & local cache persistence
  useEffect(() => {
    async function loadLiveBackendData() {
      try {
        const { data: dbGroup } = await supabase.from('mess_groups').select('*').limit(1).single();
        if (dbGroup) {
          setMessGroup({
            id: dbGroup.id,
            name: dbGroup.name || 'ApnaMess',
            currency: dbGroup.currency || 'INR',
            timezone: dbGroup.timezone || 'Asia/Kolkata',
            default_monthly_contribution: Number(dbGroup.default_monthly_contribution || 3000),
            low_balance_threshold: Number(dbGroup.low_balance_threshold || 1000),
            created_at: dbGroup.created_at,
            updated_at: dbGroup.updated_at,
          });
        }

        const { data: dbMembers } = await supabase.from('mess_members').select('*');
        let fetchedMembers: MessMember[] = dbMembers && dbMembers.length > 0
          ? dbMembers.map((m: any) => ({
              id: m.id,
              mess_id: m.mess_id,
              display_name: m.display_name,
              role: m.role || 'member',
              monthly_contribution: Number(m.monthly_contribution || 3000),
              is_active: m.is_active ?? true,
              joined_at: m.joined_at || m.created_at,
              created_at: m.created_at,
              updated_at: m.updated_at,
              user_id: m.user_id,
            }))
          : [];

        // Ensure all default household test members exist in fetchedMembers
        MOCK_MEMBERS.forEach((mockM) => {
          if (!fetchedMembers.some((fm) => fm.display_name.toLowerCase() === mockM.display_name.toLowerCase())) {
            fetchedMembers.push(mockM);
          }
        });

        setMembers(fetchedMembers);

        const { data: dbMonths } = await supabase.from('months').select('*');
        if (dbMonths && dbMonths.length > 0) {
          setMonths(
            dbMonths.map((m: any) => ({
              id: m.id,
              mess_id: m.mess_id,
              year: m.year,
              month_number: m.month_number,
              name: m.name,
              expected_contribution: Number(m.expected_contribution || 3000),
              opening_balance: Number(m.opening_balance || 0),
              status: m.status || 'open',
              closed_at: m.closed_at,
              created_at: m.created_at,
              updated_at: m.updated_at,
            }))
          );
          setSelectedMonthId(dbMonths[0].id);
        }

        // Load local cache persistence for shared contributions
        let cachedContribs: Contribution[] = [];
        try {
          const raw = localStorage.getItem('apnamess_shared_contributions');
          if (raw) cachedContribs = JSON.parse(raw);
        } catch (e) {}

        const { data: dbContribs } = await supabase.from('contributions').select('*');
        let loadedContribs: Contribution[] = [];

        if (dbContribs && dbContribs.length > 0) {
          loadedContribs = dbContribs.map((c: any) => {
            const payer = fetchedMembers.find((m) => m.id === c.member_id);
            return {
              id: c.id,
              mess_id: c.mess_id,
              month_id: c.month_id,
              member_id: c.member_id,
              amount: Number(c.amount),
              payment_date: c.payment_date,
              payment_method: c.payment_method,
              note: c.note,
              created_at: c.created_at,
              member_name: payer?.display_name || c.member_name || 'Member',
            };
          });
        }

        // Merge DB contribs & cached contribs
        cachedContribs.forEach((cc) => {
          if (!loadedContribs.some((lc) => lc.id === cc.id)) {
            loadedContribs.push(cc);
          }
        });

        setContributions(loadedContribs);

        // Load local cache persistence for shared expenses
        let cachedExpenses: Expense[] = [];
        try {
          const raw = localStorage.getItem('apnamess_shared_expenses');
          if (raw) cachedExpenses = JSON.parse(raw);
        } catch (e) {}

        const { data: dbExpenses } = await supabase.from('expenses').select('*');
        let loadedExpenses: Expense[] = [];

        if (dbExpenses && dbExpenses.length > 0) {
          loadedExpenses = dbExpenses.map((e: any) => {
            const payer = fetchedMembers.find((m) => m.id === e.paid_by_member_id);
            return {
              id: e.id,
              mess_id: e.mess_id,
              month_id: e.month_id,
              item_name: e.item_name,
              amount: Number(e.amount),
              expense_date: e.expense_date,
              paid_by_member_id: e.paid_by_member_id,
              payment_source: e.payment_source || 'common_fund',
              created_at: e.created_at,
              member_name: payer?.display_name || e.member_name || 'Member',
            };
          });
        }

        cachedExpenses.forEach((ce) => {
          if (!loadedExpenses.some((le) => le.id === ce.id)) {
            loadedExpenses.push(ce);
          }
        });

        setExpenses(loadedExpenses);
      } catch (err) {
        // Fallback gracefully
      }
    }

    loadLiveBackendData();
  }, [user]);

  // Sync currentMemberId when user or members change
  useEffect(() => {
    if (members.length > 0) {
      if (user) {
        const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0];
        const match = members.find(
          (m: any) => m.user_id === user.id || m.display_name.toLowerCase() === userDisplayName?.toLowerCase()
        );
        if (match) {
          setCurrentMemberId(match.id);
        } else if (!currentMemberId) {
          setCurrentMemberId(members[0].id);
        }
      } else if (!currentMemberId) {
        setCurrentMemberId(members[0].id);
      }
    }
  }, [user, members]);

  const activeMembers = members.filter((m) => m.is_active);
  const currentMember = activeMembers.find((m) => m.id === currentMemberId) || activeMembers[0] || {
    id: user?.id ? `mem-${user.id.substring(0, 8)}` : 'guest',
    mess_id: messGroup.id,
    display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member',
    role: 'member',
    monthly_contribution: 3000,
    is_active: true,
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const currentRole = currentMember?.role || 'member';

  const selectedMonth = months.find((m) => m.id === selectedMonthId) || months[0] || {
    id: 'month-2026-09',
    mess_id: messGroup.id,
    year: 2026,
    month_number: 9,
    name: 'September',
    expected_contribution: 3000,
    opening_balance: 0,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const financials = calculateMonthFinancials(
    selectedMonth,
    activeMembers,
    contributions,
    expenses
  );

  const addExpense = async (data: Omit<Expense, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => {
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

    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      try {
        localStorage.setItem('apnamess_shared_expenses', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await supabase.from('expenses').insert([{
        mess_id: messGroup.id,
        month_id: targetMonthId,
        item_name: data.item_name,
        amount: Number(data.amount),
        expense_date: data.expense_date,
        paid_by_member_id: data.paid_by_member_id,
        payment_source: data.payment_source,
        note: data.note,
      }]);
    } catch (e) {
      // Ignored
    }

    showToast(`Added purchase ₹${newExpense.amount} for ${newExpense.item_name}`);
  };

  const deleteExpense = async (id: string) => {
    const existing = expenses.find((e) => e.id === id);
    if (!existing) return;

    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem('apnamess_shared_expenses', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch (e) {
      // Ignored
    }

    showToast(`Deleted expense "${existing.item_name}"`, 'info');
  };

  const addContribution = async (data: Omit<Contribution, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => {
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

    setContributions((prev) => {
      const updated = [newContrib, ...prev];
      try {
        localStorage.setItem('apnamess_shared_contributions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await supabase.from('contributions').insert([{
        mess_id: messGroup.id,
        month_id: targetMonthId,
        member_id: data.member_id,
        amount: Number(data.amount),
        payment_date: data.payment_date,
        payment_method: data.payment_method || 'UPI',
        note: data.note,
      }]);
    } catch (e) {
      // Ignored
    }

    showToast(`Recorded contribution ₹${newContrib.amount} from ${newContrib.member_name}`);
  };

  const deleteContribution = async (id: string) => {
    const existing = contributions.find((c) => c.id === id);
    if (!existing) return;

    setContributions((prev) => prev.filter((c) => c.id !== id));

    try {
      await supabase.from('contributions').delete().eq('id', id);
    } catch (e) {
      // Ignored
    }

    showToast(`Deleted contribution from ${existing.member_name}`, 'info');
  };

  const addMember = async (displayName: string, role: MemberRole = 'member', monthlyContribution = 3000) => {
    const newMember: MessMember = {
      id: `mem-${Date.now()}`,
      mess_id: messGroup.id,
      display_name: displayName,
      role,
      monthly_contribution: Number(monthlyContribution),
      is_active: true,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);

    try {
      await supabase.from('mess_members').insert([{
        mess_id: messGroup.id,
        display_name: displayName,
        role,
        monthly_contribution: Number(monthlyContribution),
        is_active: true,
      }]);
    } catch (e) {
      // Local fallback
    }

    showToast(`Added ${displayName} to ApnaMess`);
  };

  const removeMember = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, is_active: false } : m))
    );

    try {
      await supabase.from('mess_members').update({ is_active: false }).eq('id', memberId);
    } catch (e) {
      // Local fallback
    }

    showToast(`Removed ${target.display_name}`, 'info');
  };

  const toggleAdminRole = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const newRole: MemberRole = target.role === 'admin' ? 'member' : 'admin';

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    try {
      await supabase.from('mess_members').update({ role: newRole }).eq('id', memberId);
    } catch (e) {
      // Local fallback
    }

    showToast(`Updated ${target.display_name} role to ${newRole.toUpperCase()}`);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignored
    }
    setUser(null);
    setSession(null);
    showToast('Signed out successfully', 'info');
    router.push('/login');
  };

  const resetToDemoData = () => {
    setMembers([]);
    setContributions([]);
    setExpenses([]);
    showToast('Reset data to clean state', 'info');
  };

  return (
    <DataContext.Provider
      value={{
        user,
        session,
        messGroup,
        members: activeMembers,
        months,
        selectedMonth,
        contributions,
        expenses,
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
        addMember,
        removeMember,
        toggleAdminRole,
        signOut,
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
