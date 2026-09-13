'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { formatINR } from '@/lib/calculations/financials';
import { Plus } from 'lucide-react';
import { AddMonthlyContributionModal } from '@/components/actions/AddMonthlyContributionModal';
import { AddPurchaseModal } from '@/components/actions/AddPurchaseModal';
import { AddOtherMoneyModal } from '@/components/actions/AddOtherMoneyModal';

export default function HomePage() {
  const { selectedMonth, financials, expenses, contributions } = useData();

  const [showContribModal, setShowContribModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);

  // Recent activity chronological feed
  const recentExpenses = expenses
    .filter((e) => e.month_id === selectedMonth.id)
    .map((e) => ({
      id: e.id,
      name: e.member_name || 'Member',
      detail: e.item_name,
      amount: e.amount,
      date: e.expense_date,
      type: 'expense' as const,
      isPersonal: e.payment_source === 'personal',
    }));

  const recentContribs = contributions
    .filter((c) => c.month_id === selectedMonth.id)
    .map((c) => ({
      id: c.id,
      name: c.member_name || 'Member',
      detail: c.note || 'Monthly contribution',
      amount: c.amount,
      date: c.payment_date,
      type: 'contribution' as const,
      isPersonal: false,
    }));

  const recentActivity = [...recentExpenses, ...recentContribs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* App Header Title */}
      <div className="pt-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">ApnaMess</h1>
      </div>

      {/* Main Fund Hero Display */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Fund</div>
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mt-1">
          {formatINR(financials.common_cash_balance)}
        </div>
        <div className="text-xs text-slate-500 font-medium mt-1">Available now</div>
      </div>

      {/* Three Prominent Actions */}
      <div className="space-y-2">
        <button
          onClick={() => setShowContribModal(true)}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-between shadow-xs transition-all active:scale-[0.99]"
        >
          <span>+ Add Monthly Contribution</span>
          <span className="text-xs text-slate-400 font-normal">Regular dues</span>
        </button>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-between shadow-xs transition-all active:scale-[0.99]"
        >
          <span>+ Add Purchase</span>
          <span className="text-xs text-blue-200 font-normal">Everyday expense</span>
        </button>

        <button
          onClick={() => setShowOtherModal(true)}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
        >
          <span>+ Add Other Money</span>
          <span className="text-[11px] text-slate-500 font-normal">Fallback entry</span>
        </button>
      </div>

      {/* Recent Activity List */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Recent Activity</h2>

        {recentActivity.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No recent activity.</div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-b border-slate-200 bg-white">
            {recentActivity.map((item) => (
              <div key={item.id} className="py-3 px-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-slate-900 w-16 truncate">{item.name}</span>
                  <span className="text-slate-600 truncate">{item.detail}</span>
                  {item.isPersonal && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      Personal
                    </span>
                  )}
                </div>

                <div className="font-bold text-right">
                  {item.type === 'contribution' ? (
                    <span className="text-emerald-600">+{formatINR(item.amount)}</span>
                  ) : (
                    <span className="text-slate-900">{formatINR(item.amount)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modals */}
      <AddMonthlyContributionModal isOpen={showContribModal} onClose={() => setShowContribModal(false)} />
      <AddPurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <AddOtherMoneyModal isOpen={showOtherModal} onClose={() => setShowOtherModal(false)} />
    </div>
  );
}
