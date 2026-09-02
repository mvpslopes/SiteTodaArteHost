import type { ReactNode } from 'react';

const controlClass =
  'mt-1 block w-full min-w-[9rem] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

export function filterControlClass(extra = '') {
  return `${controlClass} ${extra}`.trim();
}

type FilterBarProps = {
  children: ReactNode;
  actions?: ReactNode;
};

/** Barra de filtros sempre visível no topo das listas. */
export default function FilterBar({ children, actions }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-card">
      <div className="flex flex-wrap items-end gap-3">{children}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

type FilterFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function FilterField({ label, children, className = '' }: FilterFieldProps) {
  return (
    <label className={`block text-xs text-gray-600 ${className}`}>
      {label}
      {children}
    </label>
  );
}
