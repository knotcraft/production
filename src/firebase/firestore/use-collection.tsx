'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore';

/**
 * A React hook to listen to a Firestore collection in real-time.
 * @param query The Firestore query or collection reference to listen to.
 * @returns An object containing the collection data, loading state, and any errors.
 *
 * IMPORTANT: Make sure to memoize the `query` object with `useMemo` to prevent
 * re-running the hook on every render, which can lead to infinite loops.
 */
export function useCollection<T>(
  query: Query<DocumentData> | CollectionReference<DocumentData> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (query === null) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setData(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
