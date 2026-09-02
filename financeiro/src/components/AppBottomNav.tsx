import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  MoreHorizontal,
  CalendarDays,
  UserPlus,
  Settings,
  Palette,
  KeyRound,
} from 'lucide-react';

interface NavItem {
  to: string;
  end?: boolean;
  icon: LucideIcon;
  label: string;
}

interface AppBottomNavProps {
  perfil?: string;
  onMore?: () => void;
  gastosPendentes?: number;
}

function itemsForPerfil(perfil?: string): NavItem[] {
  if (perfil === 'freelancer') {
    return [
      { to: '/producao', icon: Palette, label: 'Produção' },
      { to: '/configuracoes', icon: Settings, label: 'Conta' },
    ];
  }
  if (perfil === 'usuario') {
    return [
      { to: '/producao', icon: Palette, label: 'Produção' },
      { to: '/logins', icon: KeyRound, label: 'Logins' },
      { to: '/configuracoes', icon: Settings, label: 'Conta' },
    ];
  }
  if (perfil === 'cliente') {
    return [
      { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Início' },
      { to: '/transacoes', icon: ArrowLeftRight, label: 'Movimento' },
      { to: '/clientes', icon: UserPlus, label: 'Clientes' },
    ];
  }
  return [
    { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Início' },
    { to: '/producao', icon: Palette, label: 'Produção' },
    { to: '/transacoes', icon: ArrowLeftRight, label: 'Movimento' },
    { to: '/gastos-fixos', icon: CalendarDays, label: 'Fixos' },
  ];
}

export default function AppBottomNav({ perfil, onMore, gastosPendentes = 0 }: AppBottomNavProps) {
  const items = itemsForPerfil(perfil);

  return (
    <nav
      className="theme-fixed fixed inset-x-0 bottom-0 z-30 border-t-2 border-brand-gold/40 bg-gradient-to-t from-[#3d2f26] to-brand-dark-brown pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(79,62,50,0.35)] md:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5 px-2 pt-2">
        {items.map(({ to, end, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={end} className="block rounded-2xl px-1 pb-2.5 pt-1 transition">
              {({ isActive }) => (
                <span
                  className={`relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition-all ${
                    isActive
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-brand-beige/55 active:bg-white/5 active:text-brand-beige'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand-gold" aria-hidden />
                  )}
                  <span
                    className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      isActive ? 'bg-brand-gold text-brand-dark-brown shadow-md' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    {to === '/gastos-fixos' && gastosPendentes > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-400" />
                    )}
                  </span>
                  <span className={`max-w-full truncate text-[11px] leading-none ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
                    {label}
                  </span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
        {onMore && (
          <li className="flex-1">
            <button
              type="button"
              onClick={onMore}
              className="block w-full rounded-2xl px-1 pb-2.5 pt-1 transition"
              title="Mais opções"
              aria-label="Mais opções"
            >
              <span className="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-brand-beige/55 active:bg-white/5 active:text-brand-beige">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="max-w-full truncate text-[11px] font-medium leading-none">Mais</span>
              </span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
