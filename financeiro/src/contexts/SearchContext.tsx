import { createContext, useContext, useState, type ReactNode } from 'react';

type SearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) return { query: '', setQuery: () => {} };
  return ctx;
}

/** Filtra texto por termo (case-insensitive) */
export function matchSearch(text: string | null | undefined, searchQuery: string): boolean {
  if (!searchQuery.trim()) return true;
  const q = searchQuery.trim().toLowerCase();
  const t = (text ?? '').toString().toLowerCase();
  return t.includes(q);
}
