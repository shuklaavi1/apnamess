'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { X, Check, Loader2 } from 'lucide-react';

interface AddOtherMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddOtherMoneyModal({ isOpen, onClose }: AddOtherMoneyModalProps) {
  const { addContribution, addExpense, currentMember, selectedMonth, isInitializing, messGroup } = useData();

  const [type, setType] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isFormLoading = isInitializing || !messGroup?.id || messGroup.id === 'placeholder';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormLoading || isSubmitting) return;

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === 'add') {
        await addContribution({
          member_id: currentMember.id,
          amount: Number(amount),
          payment_date: new Date().toISOString().split('T')[0],
          note: note.trim() || 'Other Money Addition',
          month_id: selectedMonth.id,
        });
      } else {
        await addExpense({
          item_name: note.trim() || 'Other Money Deduction',
          amount: Number(amount),
          paid_by_member_id: currentMember.id,
          payment_source: 'common_fund',
          expense_date: new Date().toISOString().split('T')[0],
          month_id: selectedMonth.id,
        });
      }

      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Add Other Money</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('add')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                  type === 'add'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                + Add Money
              </button>
              <button
                type="button"
                onClick={() => setType('deduct')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                  type === 'deduct'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                - Deduct Money
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                disabled={isFormLoading || isSubmitting}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg py-2.5 pl-8 pr-3 text-xl font-bold text-slate-900 focus:outline-none disabled:opacity-50"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Note / Reason</label>
            <input
              type="text"
              disabled={isFormLoading || isSubmitting}
              placeholder="e.g. Previous balance adjustment / Guest contribution"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isFormLoading || isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Initializing Mess...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Entry...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
