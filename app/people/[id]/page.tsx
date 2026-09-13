'use client';

import React, { use } from 'react';
import { useData } from '@/lib/data-context';
import { formatINR } from '@/lib/calculations/financials';
import Link from 'next/link';

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { members, selectedMonth, financials, contributions, expenses } = useData();

  const member = members.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="py-8 text-center space-y-3 text-xs">
        <div className="font-semibold text-slate-800">Person Not Found</div>
        <Link href="/people" className="text-blue-600 hover:underline">
          ← Back to People
        </Link>
      </div>
    );
  }

  const summary = financials.member_summaries.find((s) => s.member_id === member.id);

  // Person history
  const memberContribs = contributions
    .filter((c) => c.member_id === member.id && c.month_id === selectedMonth.id)
    .map((c) => ({
      id: c.id,
      date: c.payment_date,
      type: 'Contribution',
      amount: c.amount,
      isPositive: true,
      isPersonal: false,
    }));

  const memberExpenses = expenses
    .filter((e) => e.paid_by_member_id === member.id && e.month_id === selectedMonth.id)
    .map((e) => ({
      id: e.id,
      date: e.expense_date,
      type: e.item_name,
      amount: e.amount,
      isPositive: false,
      isPersonal: e.payment_source === 'personal',
    }));

  const history = [...memberContribs, ...memberExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Link href="/people" className="text-xs text-blue-600 font-semibold hover:underline">
        ← Back to People
      </Link>

      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-bold text-slate-900">{member.display_name}</h1>
      </div>

      {/* This month */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
        <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">This month</div>
        <div className="flex justify-between py-1 border-t border-slate-100">
          <span className="text-slate-600">Contributed</span>
          <span className="font-bold text-slate-900">{formatINR(summary?.total_contributed || 0)}</span>
        </div>
        {summary && summary.personal_expenses_paid > 0 && (
          <div className="flex justify-between py-1 border-t border-slate-100">
            <span className="text-slate-600">Personally Paid</span>
            <span className="font-bold text-amber-800">{formatINR(summary.personal_expenses_paid)}</span>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">History</h2>

        {history.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No history for this month.</div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-b border-slate-200 bg-white">
            {history.map((item) => (
              <div key={item.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 w-16 font-mono text-[11px]">{item.date}</span>
                  <span className="font-semibold text-slate-900">{item.type}</span>
                  {item.isPersonal && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      Personal
                    </span>
                  )}
                </div>

                <div className="font-bold text-right">
                  {item.isPositive ? (
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
    </div>
  );
}
