'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useState, useEffect } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/personalize';

  if (isAuthPage) {
    // To prevent a hydration mismatch, we can delay rendering the auth page content
    // until the component has mounted on the client.
    return isClient ? <>{children}</> : null;
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
