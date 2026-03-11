'use client';

import { useState, useMemo, useCallback } from 'react';

export function useSearch<T>(
  items: T[],
  searchFn: (items: T[], query: string) => T[]
) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(
    () => (query.trim() ? searchFn(items, query) : items),
    [items, query, searchFn]
  );

  const clearSearch = useCallback(() => setQuery(''), []);

  return { query, setQuery, filteredItems, clearSearch } as const;
}
