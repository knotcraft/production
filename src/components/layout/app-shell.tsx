'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/bottom-nav';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="text-foreground transition-colors duration-300">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-x-hidden bg-background shadow-2xl pb-28">
        <main>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
