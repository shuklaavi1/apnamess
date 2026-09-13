'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Users,
  HandCoins,
  BarChart3,
  History,
  Repeat,
  Scale,
  Settings,
  Download,
} from 'lucide-react';
import { useData } from '@/lib/data-context';
import { exportExpensesCSV, exportContributionsCSV, exportMonthlySummaryCSV } from '@/lib/exports/csv';

export function Sidebar() {
  const pathname = usePathname();
  const { expenses, contributions, financials, selectedMonth } = useData();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Expenses', href: '/expenses', icon: Receipt },
    { label: 'Contributions', href: '/contributions', icon: Wallet },
    { label: 'Members', href: '/members', icon: Users },
    { label: 'Settle Up', href: '/settlements', icon: HandCoins },
    { label: 'Reports & Charts', href: '/reports', icon: BarChart3 },
    { label: 'Recurring Expenses', href: '/recurring', icon: Repeat },
    { label: 'Cash Reconciliation', href: '/reconciliation', icon: Scale },
    { label: 'Activity Audit Log', href: '/activity', icon: History },
    { label: 'Mess & Month Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 p-4 min-h-[calc(100vh-61px)]">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300 font-bold border border-teal-500/30'
                  : 'hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick CSV Export Widget */}
      <div className="mt-6 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-teal-400 font-semibold">
            <Download className="w-3.5 h-3.5" /> CSV Exports
          </span>
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            onClick={() => exportExpensesCSV(expenses, selectedMonth.name)}
            className="text-left text-slate-300 hover:text-white hover:underline text-[11px]"
          >
            • Download Expenses CSV
          </button>
          <button
            onClick={() => exportContributionsCSV(contributions, selectedMonth.name)}
            className="text-left text-slate-300 hover:text-white hover:underline text-[11px]"
          >
            • Download Contributions CSV
          </button>
          <button
            onClick={() => exportMonthlySummaryCSV(financials)}
            className="text-left text-slate-300 hover:text-white hover:underline text-[11px]"
          >
            • Download Summary CSV
          </button>
        </div>
      </div>
    </aside>
  );
}
