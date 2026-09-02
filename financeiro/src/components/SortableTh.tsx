import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortDir } from '../hooks/useTableSort';

type SortableThProps = {
  label: string;
  column: string;
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (column: string) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
};

export default function SortableTh({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  className = '',
  align = 'left',
}: SortableThProps) {
  const active = sortKey === column;
  const alignClass = align === 'right' ? 'justify-end text-right' : align === 'center' ? 'justify-center text-center' : 'justify-start text-left';

  return (
    <th className={`px-4 py-3 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex w-full items-center gap-1 text-xs uppercase tracking-wide transition hover:text-brand-dark-brown ${alignClass} ${
          active ? 'text-brand-dark-brown' : 'text-gray-500'
        }`}
        title={`Ordenar por ${label}`}
      >
        <span>{label}</span>
        {active ? (
          sortDir === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0 text-brand-gold" strokeWidth={2.5} />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0 text-brand-gold" strokeWidth={2.5} />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-35" strokeWidth={2} />
        )}
      </button>
    </th>
  );
}
