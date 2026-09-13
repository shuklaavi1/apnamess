'use client';

import React from 'react';
import { useData } from '@/lib/data-context';
import { formatINR } from '@/lib/calculations/financials';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const { expenses, contributions, selectedMonth, deleteExpense, deleteContribution } = useData();

  // Combine expenses and contributions into chronological items for selected month
  const monthExpenses = expenses
    .filter((e) => e.month_id === selectedMonth.id)
    .map((e) => ({
      id: e.id,
      date: e.expense_date,
      person: e.member_name || 'Member',
      item: e.item_name,
      amount: e.amount,
      type: 'expense' as const,
      isPersonal: e.payment_source === 'personal',
    }));

  const monthContribs = contributions
    .filter((c) => c.month_id === selectedMonth.id)
    .map((c) => ({
      id: c.id,
      date: c.payment_date,
      person: c.member_name || 'Member',
      item: 'Monthly contribution',
      amount: c.amount,
      type: 'contribution' as const,
      isPersonal: false,
    }));

  const allItems = [...monthExpenses, ...monthContribs];

  // Group by date
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const grouped: { [groupKey: string]: typeof allItems } = {};

  allItems.forEach((item) => {
    let groupKey = item.date;
    if (item.date === todayStr) groupKey = 'Today';
    else if (item.date === yesterdayStr) groupKey = 'Yesterday';

    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(item);
  });

  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleDelete = (id: string, type: 'expense' | 'contribution', name: string) => {
    if (confirm(`Delete entry "${name}"?`)) {
      if (type === 'expense') deleteExpense(id);
      else deleteContribution(id);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">History</h1>
        <p className="text-xs text-slate-500">{selectedMonth.name} chronological feed</p>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="text-xs text-slate-400 py-8 text-center">No history recorded for this month yet.</div>
      ) : (
        <div className="space-y-5">
          {sortedGroups.map((groupName) => (
            <div key={groupName} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {groupName}
              </h2>

              <div className="divide-y divide-slate-100 border-t border-b border-slate-200 bg-white">
                {grouped[groupName].map((item) => (
                  <div key={item.id} className="py-3 px-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-slate-900">{item.person}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 truncate">{item.item}</span>
                      {item.isPersonal && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                          Personal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.type === 'contribution' ? (
                        <span className="font-bold text-emerald-600">+{formatINR(item.amount)}</span>
                      ) : (
                        <span className="font-bold text-slate-900">{formatINR(item.amount)}</span>
                      )}

                      <button
                        onClick={() => handleDelete(item.id, item.type, item.item)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
