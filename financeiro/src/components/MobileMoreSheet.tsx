import { NavLink } from 'react-router-dom';
import { LogOut, X, type LucideIcon } from 'lucide-react';

interface MoreItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  items: MoreItem[];
}

export default function MobileMoreSheet({ open, onClose, onLogout, items }: MobileMoreSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button type="button" className="absolute inset-0 bg-brand-dark-brown/50 backdrop-blur-[2px]" aria-label="Fechar" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-brand-beige bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-beige px-5 py-4">
          <p className="text-sm font-semibold text-brand-dark-brown">Mais opções</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-brand-olive hover:bg-brand-off-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="grid grid-cols-2 gap-2 p-4">
          {items.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-dark-brown'
                    : 'border-brand-beige text-brand-brown hover:bg-brand-off-white'
                }`
              }
            >
              <Icon className="h-4 w-4 text-brand-gold" strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
