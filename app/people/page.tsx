'use client';

import React from 'react';
import { useData } from '@/lib/data-context';
import Link from 'next/link';

export default function PeoplePage() {
  const { members, financials, selectedMonth } = useData();

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900">People</h1>
      </div>

      <div className="divide-y divide-slate-100 border-t border-b border-slate-200 bg-white">
        {members.map((member) => {
          const summary = financials.member_summaries.find((s) => s.member_id === member.id);
          const isPaid = summary?.is_fully_paid;

          return (
            <Link
              key={member.id}
              href={`/people/${member.id}`}
              className="py-3.5 px-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
            >
              <div className="font-bold text-slate-900 text-sm">{member.display_name}</div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">
                  {selectedMonth.name} {isPaid ? '✓' : 'pending'}
                </span>
                <span className="text-slate-300 font-semibold text-xs ml-1">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
