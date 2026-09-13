'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MessGroup,
  MessMember,
  AccountingMonth,
  Contribution,
  Expense,
  FinancialSummary,
  MemberRole,
} from './types';
import { calculateMonthFinancials } from './calculations/financials';
import { createClient } from './supabase/client';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';

const DEFAULT_HOUSEHOLD_NAMES = ['Avi', 'Sanjeev', 'Tapas', 'Om', 'Rahul', 'Abhay', 'Manish', 'Shahzada'];

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface DataContextType {
  user: User | null;
  session: Session | null;
  messGroup: MessGroup | null;
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

  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addContribution: (contribution: Omit<Contribution, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;

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

  const [messGroup, setMessGroup] = useState<MessGroup | null>(null);
  const [members, setMembers] = useState<MessMember[]>([]);
  const [months, setMonths] = useState<AccountingMonth[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<string>('');

  const [toasts, setToasts] = useState<ToastState[]>([]);

  const supabase = createClient();
  const router = useRouter();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth & Session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    }).catch((err) => {
      console.error('Session check error:', err);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Fetch Live Data from Supabase & Bootstrap Mess / Members
  const loadLiveBackendData = useCallback(async () => {
    try {
      // 1. Get or create primary Mess Group
      let { data: dbGroups, error: gErr } = await supabase
        .from('mess_groups')
        .select('*')
        .order('created_at', { ascending: true });

      let group = dbGroups && dbGroups.length > 0 ? dbGroups[0] : null;

      if (!group) {
        const { data: newGroup, error: createErr } = await supabase
          .from('mess_groups')
          .insert([
            {
              name: 'ApnaMess',
              currency: 'INR',
              timezone: 'Asia/Kolkata',
              default_monthly_contribution: 3000,
              low_balance_threshold: 1000,
            },
          ])
          .select('*')
          .single();

        if (newGroup) {
          group = newGroup;
        } else {
          // Fallback refetch if select single failed
          const { data: retryGroups } = await supabase.from('mess_groups').select('*').order('created_at', { ascending: true });
          group = retryGroups && retryGroups.length > 0 ? retryGroups[0] : null;
        }
      }

      if (!group) {
        if (gErr) console.error('Error fetching mess_groups:', gErr);
        return;
      }

      setMessGroup({
        id: group.id,
        name: group.name || 'ApnaMess',
        currency: group.currency || 'INR',
        timezone: group.timezone || 'Asia/Kolkata',
        default_monthly_contribution: Number(group.default_monthly_contribution || 3000),
        low_balance_threshold: Number(group.low_balance_threshold || 1000),
        created_at: group.created_at,
        updated_at: group.updated_at,
      });

      // 2. Fetch or create Months for this mess
      let { data: dbMonths } = await supabase.from('months').select('*').eq('mess_id', group.id);

      if (!dbMonths || dbMonths.length === 0) {
        await supabase.from('months').insert([
          {
            mess_id: group.id,
            year: 2026,
            month_number: 9,
            name: 'September',
            expected_contribution: 3000,
            opening_balance: 0,
            status: 'open',
          },
        ]);

        const { data: refetchedMonths } = await supabase.from('months').select('*').eq('mess_id', group.id);
        dbMonths = refetchedMonths || [];
      }

      const parsedMonths: AccountingMonth[] = (dbMonths || []).map((m: any) => ({
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
      }));

      setMonths(parsedMonths);
      if (parsedMonths.length > 0 && (!selectedMonthId || !parsedMonths.some((m) => m.id === selectedMonthId))) {
        setSelectedMonthId(parsedMonths[0].id);
      }

      // 3. Fetch & Bootstrap Mess Members
      let { data: dbMembers } = await supabase.from('mess_members').select('*').eq('mess_id', group.id);

      // Ensure all 8 default household members exist in DB
      const existingNames = new Set((dbMembers || []).map((m: any) => (m.display_name || '').toLowerCase()));
      const missingNames = DEFAULT_HOUSEHOLD_NAMES.filter((name) => !existingNames.has(name.toLowerCase()));

      if (missingNames.length > 0) {
        const toInsert = missingNames.map((name) => ({
          mess_id: group.id,
          display_name: name,
          role: name.toLowerCase() === 'avi' ? 'admin' : 'member',
          monthly_contribution: 3000,
          is_active: true,
        }));

        await supabase.from('mess_members').insert(toInsert);
        const { data: refetchedMembers } = await supabase.from('mess_members').select('*').eq('mess_id', group.id);
        dbMembers = refetchedMembers || dbMembers || [];
      }

      // 4. Link authenticated user to matching mess member if not linked yet
      if (user && dbMembers) {
        const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0];
        const linkedMember = dbMembers.find((m: any) => m.user_id === user.id);

        if (!linkedMember && userDisplayName) {
          const matchByName = dbMembers.find((m: any) => (m.display_name || '').toLowerCase() === userDisplayName.toLowerCase());
          if (matchByName) {
            await supabase.from('mess_members').update({ user_id: user.id }).eq('id', matchByName.id);
            matchByName.user_id = user.id;
          } else {
            const { data: newMem } = await supabase
              .from('mess_members')
              .insert([
                {
                  mess_id: group.id,
                  user_id: user.id,
                  display_name: userDisplayName,
                  role: 'member',
                  monthly_contribution: 3000,
                  is_active: true,
                },
              ])
              .select('*')
              .single();
            if (newMem) {
              dbMembers.push(newMem);
            }
          }
        }
      }

      const parsedMembers: MessMember[] = (dbMembers || []).map((m: any) => ({
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
      }));

      setMembers(parsedMembers);

      // 5. Fetch Contributions
      const { data: dbContribs, error: cErr } = await supabase.from('contributions').select('*').eq('mess_id', group.id);
      if (cErr) {
        console.error('Error fetching contributions:', cErr);
      }

      const parsedContribs: Contribution[] = (dbContribs || []).map((c: any) => {
        const payer = parsedMembers.find((m) => m.id === c.member_id);
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
          member_name: payer?.display_name || 'Member',
        };
      });

      setContributions(parsedContribs);

      // 6. Fetch Expenses
      const { data: dbExpenses, error: eErr } = await supabase.from('expenses').select('*').eq('mess_id', group.id);
      if (eErr) {
        console.error('Error fetching expenses:', eErr);
      }

      const parsedExpenses: Expense[] = (dbExpenses || []).map((e: any) => {
        const payer = parsedMembers.find((m) => m.id === e.paid_by_member_id);
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
          member_name: payer?.display_name || 'Member',
        };
      });

      setExpenses(parsedExpenses);
    } catch (err: any) {
      console.error('Data loading error:', err);
    }
  }, [supabase, user, selectedMonthId]);

  useEffect(() => {
    loadLiveBackendData();

    const handleFocus = () => {
      loadLiveBackendData();
    };

    const interval = setInterval(() => {
      loadLiveBackendData();
    }, 4000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [loadLiveBackendData]);

  // Sync currentMemberId when user or members change
  useEffect(() => {
    if (members.length > 0) {
      if (user) {
        const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0];
        const match = members.find(
          (m) => m.user_id === user.id || (userDisplayName && m.display_name.toLowerCase() === userDisplayName.toLowerCase())
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
  }, [user, members, currentMemberId]);

  const activeMembers = members.filter((m) => m.is_active);

  const fallbackGroup: MessGroup = messGroup || {
    id: 'placeholder',
    name: 'ApnaMess',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    default_monthly_contribution: 3000,
    low_balance_threshold: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const currentMember = activeMembers.find((m) => m.id === currentMemberId) || activeMembers[0] || {
    id: user?.id ? `mem-${user.id.substring(0, 8)}` : 'guest',
    mess_id: fallbackGroup.id,
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
    mess_id: fallbackGroup.id,
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
    if (!messGroup?.id) {
      showToast('Mess group not initialized', 'error');
      return;
    }

    const targetMonthId = data.month_id || selectedMonth.id;
    const payer = members.find((m) => m.id === data.paid_by_member_id);

    const { error } = await supabase.from('expenses').insert([
      {
        mess_id: messGroup.id,
        month_id: targetMonthId,
        item_name: data.item_name,
        amount: Number(data.amount),
        expense_date: data.expense_date,
        paid_by_member_id: data.paid_by_member_id,
        payment_source: data.payment_source || 'common_fund',
        note: data.note || null,
      },
    ]);

    if (error) {
      console.error('Failed to add expense:', error);
      showToast(`Failed to save expense: ${error.message}`, 'error');
      return;
    }

    showToast(`Added purchase ₹${data.amount} for ${data.item_name}`);
    await loadLiveBackendData();
  };

  const deleteExpense = async (id: string) => {
    const existing = expenses.find((e) => e.id === id);
    if (!existing) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete expense:', error);
      showToast(`Failed to delete expense: ${error.message}`, 'error');
      return;
    }

    showToast(`Deleted expense "${existing.item_name}"`, 'info');
    await loadLiveBackendData();
  };

  const addContribution = async (data: Omit<Contribution, 'id' | 'created_at' | 'mess_id' | 'month_id'> & { month_id?: string }) => {
    if (!messGroup?.id) {
      showToast('Mess group not initialized', 'error');
      return;
    }

    const targetMonthId = data.month_id || selectedMonth.id;
    const payer = members.find((m) => m.id === data.member_id);

    const { error } = await supabase.from('contributions').insert([
      {
        mess_id: messGroup.id,
        month_id: targetMonthId,
        member_id: data.member_id,
        amount: Number(data.amount),
        payment_date: data.payment_date,
        payment_method: data.payment_method || 'UPI',
        note: data.note || null,
      },
    ]);

    if (error) {
      console.error('Failed to add contribution:', error);
      showToast(`Failed to save contribution: ${error.message}`, 'error');
      return;
    }

    showToast(`Recorded contribution ₹${data.amount} from ${payer?.display_name || 'Member'}`);
    await loadLiveBackendData();
  };

  const deleteContribution = async (id: string) => {
    const existing = contributions.find((c) => c.id === id);
    if (!existing) return;

    const { error } = await supabase.from('contributions').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete contribution:', error);
      showToast(`Failed to delete contribution: ${error.message}`, 'error');
      return;
    }

    showToast(`Deleted contribution from ${existing.member_name}`, 'info');
    await loadLiveBackendData();
  };

  const addMember = async (displayName: string, role: MemberRole = 'member', monthlyContribution = 3000) => {
    if (!messGroup?.id) {
      showToast('Mess group not initialized', 'error');
      return;
    }

    const { error } = await supabase.from('mess_members').insert([
      {
        mess_id: messGroup.id,
        display_name: displayName,
        role,
        monthly_contribution: Number(monthlyContribution),
        is_active: true,
      },
    ]);

    if (error) {
      console.error('Failed to add member:', error);
      showToast(`Failed to add member: ${error.message}`, 'error');
      return;
    }

    showToast(`Added ${displayName} to ApnaMess`);
    await loadLiveBackendData();
  };

  const removeMember = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const { error } = await supabase.from('mess_members').update({ is_active: false }).eq('id', memberId);

    if (error) {
      console.error('Failed to remove member:', error);
      showToast(`Failed to remove member: ${error.message}`, 'error');
      return;
    }

    showToast(`Removed ${target.display_name}`, 'info');
    await loadLiveBackendData();
  };

  const toggleAdminRole = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const newRole: MemberRole = target.role === 'admin' ? 'member' : 'admin';

    const { error } = await supabase.from('mess_members').update({ role: newRole }).eq('id', memberId);

    if (error) {
      console.error('Failed to update role:', error);
      showToast(`Failed to update role: ${error.message}`, 'error');
      return;
    }

    showToast(`Updated ${target.display_name} role to ${newRole.toUpperCase()}`);
    await loadLiveBackendData();
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setUser(null);
    setSession(null);
    showToast('Signed out successfully', 'info');
    router.push('/login');
  };

  const resetToDemoData = async () => {
    if (messGroup?.id) {
      await supabase.from('contributions').delete().eq('mess_id', messGroup.id);
      await supabase.from('expenses').delete().eq('mess_id', messGroup.id);
      await loadLiveBackendData();
    }
    showToast('Reset data to clean state', 'info');
  };

  return (
    <DataContext.Provider
      value={{
        user,
        session,
        messGroup: fallbackGroup,
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
