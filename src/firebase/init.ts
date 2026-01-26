'use client';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let database: Database;

// This check prevents re-initializing the app on hot reloads.
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

auth = getAuth(firebaseApp);
database = getDatabase(firebaseApp);

export function initializeFirebase() {
  // Now this function just returns the already initialized instances.
  return { firebaseApp, auth, database };
}
