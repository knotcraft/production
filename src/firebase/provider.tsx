'use client';

import { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Database } from 'firebase/database';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  database: Database | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  auth: null,
  database: null,
});

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  database,
}: {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  database: Database;
}) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, database }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function useFirebaseApp() {
  return useContext(FirebaseContext)?.firebaseApp;
}

export function useAuth() {
  return useContext(FirebaseContext)?.auth;
}

export function useDatabase() {
  return useContext(FirebaseContext)?.database;
}
