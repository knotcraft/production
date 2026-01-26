import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// This check prevents re-initializing the app on hot reloads.
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);

export function initializeFirebase() {
  // Now this function just returns the already initialized instances.
  return { firebaseApp, auth, firestore };
}
