
'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useState, useEffect } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { ref, get } from 'firebase/database';
import { Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isProfileChecked, setIsProfileChecked] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isPersonalizePage = pathname === '/personalize';

  useEffect(() => {
    // If user state is still loading, we wait.
    if (userLoading) {
      return;
    }

    // If there is no user and they are not on an auth page, redirect to login.
    if (!user && !isAuthPage) {
      router.push('/login');
      return;
    }

    // If there is a user and they are on an auth page, redirect to home.
    if (user && isAuthPage) {
      router.push('/');
      return;
    }

    // If there is a user, check if their profile is personalized.
    if (user && database) {
      const checkUserProfile = async () => {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);

        if (!snapshot.exists() && !isPersonalizePage) {
          // If profile doesn't exist and they are not on personalize page, redirect them.
          router.push('/personalize');
        } else if (snapshot.exists() && isPersonalizePage) {
          // If profile exists and they are trying to access personalize page, redirect to home.
          router.push('/');
        } else {
            // Profile check is done and user is on the correct page.
            setIsProfileChecked(true);
        }
      };

      checkUserProfile();
    } else if (!user) {
        // Not a logged in user, on an auth page, so no profile check needed.
        setIsProfileChecked(true);
    }

  }, [user, userLoading, database, router, pathname, isAuthPage, isPersonalizePage]);

  // Show a loading screen while we check for user and profile status.
  if (userLoading || (user && !isProfileChecked)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If it's an auth page or the personalize page for a new user, show only the children.
  if (isAuthPage || (isPersonalizePage && user)) {
    return <>{children}</>;
  }
  
  // If no user and not an auth page, we are in a redirect state, show nothing.
  if (!user) {
    return null;
  }

  // If user is authenticated and personalized, show the full app shell.
  return (
    <div className="text-foreground transition-colors duration-300">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-x-hidden bg-background-light dark:bg-background-dark shadow-2xl pb-24">
        <main>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}

    