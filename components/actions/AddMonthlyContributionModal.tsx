'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { X, Check } from 'lucide-react';

interface AddMonthlyContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMonthlyContributionModal({ isOpen, onClose }: AddMonthlyContributionModalProps) {
  const { members, currentMember, addContribution, months, selectedMonth } = useData();

  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('3000');
  const [monthId, setMonthId] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (!memberId || !members.some((m) => m.id === memberId)) {
        setMemberId(currentMember?.id || members[0]?.id || '');
      }
      if (!monthId) {
        setMonthId(selectedMonth?.id || '');
      }
    }
  }, [isOpen, members, currentMember, selectedMonth, memberId, monthId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const selectedPayerId = memberId || currentMember?.id || members[0]?.id || '';
    const selectedTargetMonthId = monthId || selectedMonth?.id || '';

    addContribution({
      member_id: selectedPayerId,
      amount: Number(amount),
      payment_date: new Date().toISOString().split('T')[0],
      month_id: selectedTargetMonthId,
    });

    onClose();
  };

  const currentPayerValue = memberId || currentMember?.id || members[0]?.id || '';
  const currentMonthValue = monthId || selectedMonth?.id || '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Add Monthly Contribution</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Who?</label>
            <select
              value={currentPayerValue}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
            >
              {members.length === 0 ? (
                <option value={currentMember?.id || ''}>{currentMember?.display_name || 'Member'}</option>
              ) : (
                members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg py-2.5 pl-8 pr-3 text-xl font-bold text-slate-900 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Month</label>
            <select
              value={monthId}
              onChange={(e) => setMonthId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-xs flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Monthly Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
