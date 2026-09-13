'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { PaymentSource } from '@/lib/types';
import { X, Check } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { members, currentMember, addExpense, selectedMonth } = useData();

  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [paidByMemberId, setPaidByMemberId] = useState(currentMember.id);
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('common_fund');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!itemName.trim()) {
      alert('Please enter item name');
      return;
    }

    addExpense({
      item_name: itemName.trim(),
      amount: Number(amount),
      paid_by_member_id: paidByMemberId,
      payment_source: paymentSource,
      expense_date: expenseDate,
      month_id: selectedMonth.id,
    });

    setAmount('');
    setItemName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Record Expense</h2>
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
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg py-2.5 pl-9 pr-3 text-2xl font-black text-slate-900 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vegetables, Milk, Rice"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Paid By Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid by</label>
            <select
              value={paidByMemberId}
              onChange={(e) => setPaidByMemberId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid from</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentSource('common_fund')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                  paymentSource === 'common_fund'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Main Fund
              </button>
              <button
                type="button"
                onClick={() => setPaymentSource('personal')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                  paymentSource === 'personal'
                    ? 'bg-amber-50 border-amber-600 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Personal Pocket
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" /> Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
