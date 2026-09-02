import { useMemo, useState, useCallback } from 'react';

export type SortDir = 'asc' | 'desc';

export type SortValue = string | number | boolean | null | undefined;

export function compareSortValues(a: SortValue, b: SortValue, dir: SortDir): number {
  const mul = dir === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null || a === '') return 1;
  if (b == null || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * mul;
  if (typeof a === 'boolean' && typeof b === 'boolean') return (Number(a) - Number(b)) * mul;
  return String(a).localeCompare(String(b), 'pt-BR', { sensitivity: 'base', numeric: true }) * mul;
}

export function sortRows<T>(
  rows: T[],
  sortKey: string | null,
  sortDir: SortDir,
  getValue: (row: T, key: string) => SortValue,
): T[] {
  if (!sortKey) return rows;
  return [...rows].sort((a, b) => compareSortValues(getValue(a, sortKey), getValue(b, sortKey), sortDir));
}

export function useTableSort(defaultKey: string | null = null, defaultDir: SortDir = 'asc') {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const toggleSort = useCallback((key: string) => {
    setSortKey((atual) => {
      if (atual === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return atual;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  return { sortKey, sortDir, toggleSort };
}

export function useSortedRows<T>(
  rows: T[],
  sortKey: string | null,
  sortDir: SortDir,
  getValue: (row: T, key: string) => SortValue,
) {
  return useMemo(() => sortRows(rows, sortKey, sortDir, getValue), [rows, sortKey, sortDir, getValue]);
}
