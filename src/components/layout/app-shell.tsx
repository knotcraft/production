import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="text-foreground transition-colors duration-300">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-x-hidden bg-background shadow-2xl pb-24">
        <main>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
