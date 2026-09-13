'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { MemberRole } from '@/lib/types';
import Link from 'next/link';
import { Plus, UserX, ShieldCheck, X, Check } from 'lucide-react';

export default function PeoplePage() {
  const { members, financials, selectedMonth, addMember, removeMember, toggleAdminRole } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [monthlyContribution, setMonthlyContribution] = useState('3000');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addMember(name.trim(), role, Number(monthlyContribution));
    setName('');
    setShowAddModal(false);
  };

  const handleRemove = async (e: React.MouseEvent, id: string, displayName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm(`Remove ${displayName} from ApnaMess?`)) {
      await removeMember(id);
    }
  };

  const handleToggleAdmin = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    await toggleAdminRole(id);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">People</h1>
          <p className="text-xs text-slate-500">ApnaMess household members</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Person
        </button>
      </div>

      <div className="divide-y divide-slate-100 border-t border-b border-slate-200 bg-white">
        {members.map((member) => {
          const summary = financials.member_summaries.find((s) => s.member_id === member.id);
          const isPaid = summary?.is_fully_paid;

          return (
            <div
              key={member.id}
              className="py-3 px-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
            >
              <Link href={`/people/${member.id}`} className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{member.display_name}</span>
                  {member.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 font-semibold rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" /> Admin
                    </span>
                  )}
                </div>
                <div className="text-slate-500 mt-0.5">
                  {selectedMonth.name} {isPaid ? '✓' : 'pending'}
                </div>
              </Link>

              {/* Actions: Admin Role & Remove Person */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleToggleAdmin(e, member.id)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                  title="Toggle Admin role"
                >
                  {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                </button>

                <button
                  onClick={(e) => handleRemove(e, member.id, member.display_name)}
                  className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
                  title="Remove Person"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl p-5 animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Person</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyansh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Contribution (₹)</label>
                <input
                  type="number"
                  required
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-xs flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
