'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/lib/data-context';
import { LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { selectedMonth, months, setSelectedMonthId, user, signOut } = useData();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'People', href: '/people' },
    { label: 'History', href: '/history' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand Text Wordmark */}
        <Link href="/" className="font-extrabold text-lg text-slate-900 tracking-tight hover:opacity-90">
          ApnaMess
        </Link>

        {/* Desktop Links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Month Selector & Sign Out */}
        <div className="flex items-center gap-2">
          {months.length > 0 && (
            <select
              value={selectedMonth.id}
              onChange={(e) => setSelectedMonthId(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs rounded-md px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          {user && (
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
