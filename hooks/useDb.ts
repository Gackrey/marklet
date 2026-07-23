'use client';

import { useCallback, useState } from 'react';
import { getDocs, deleteDoc, type DocEntry } from '@/lib/db';

export function useDb() {
  const [entries, setEntries] = useState<DocEntry[]>([]);

  const refresh = useCallback(async () => {
    const docs = await getDocs();
    setEntries(docs);
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteDoc(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return { entries, refresh, remove };
}
