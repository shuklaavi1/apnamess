'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { X, Check, Loader2 } from 'lucide-react';

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddContributionModal({ isOpen, onClose }: AddContributionModalProps) {
  const { members, currentMember, addContribution, selectedMonth, isInitializing, messGroup } = useData();

  const [amount, setAmount] = useState('');
  const [memberId, setMemberId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (!memberId || !members.some((m) => m.id === memberId)) {
        setMemberId(currentMember?.id || members[0]?.id || '');
      }
    }
  }, [isOpen, members, currentMember, memberId]);

  if (!isOpen) return null;

  const isFormLoading = isInitializing || !messGroup?.id || messGroup.id === 'placeholder';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormLoading || isSubmitting) return;

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const selectedPayerId = memberId || currentMember?.id || members[0]?.id || '';

    setIsSubmitting(true);
    try {
      await addContribution({
        member_id: selectedPayerId,
        amount: Number(amount),
        payment_date: paymentDate,
        month_id: selectedMonth.id,
      });
      setAmount('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPayerValue = memberId || currentMember?.id || members[0]?.id || '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Record Contribution</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                disabled={isFormLoading || isSubmitting}
                placeholder="3000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg py-2.5 pl-9 pr-3 text-2xl font-black text-slate-900 focus:outline-none disabled:opacity-50"
                autoFocus
              />
            </div>
          </div>

          {/* Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Member *</label>
            <select
              value={currentPayerValue}
              onChange={(e) => setMemberId(e.target.value)}
              disabled={isFormLoading || isSubmitting}
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none disabled:opacity-50"
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

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              disabled={isFormLoading || isSubmitting}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isFormLoading || isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Initializing Mess...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Contribution...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Contribution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
