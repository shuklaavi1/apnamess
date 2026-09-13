import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DataProvider } from '@/lib/data-context';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastContainer } from '@/components/shared/ToastContainer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Mess Manager - Shared Household Money Tracker',
  description: 'Clean, light-theme utility app for managing shared mess contributions and expenses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <DataProvider>
          <Navbar />
          <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-12">
            {children}
          </main>
          <BottomNav />
          <ToastContainer />
        </DataProvider>
      </body>
    </html>
  );
}
