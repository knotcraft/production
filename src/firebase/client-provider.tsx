'use client';
import { ReactNode } from 'react';
import { initializeFirebase } from './init';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { firebaseApp, auth, database } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      database={database}
    >
      {children}
    </FirebaseProvider>
  );
}
