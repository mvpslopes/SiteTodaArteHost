import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export function NavIconWrap({
  active,
  size = 'md',
  children,
}: {
  active?: boolean;
  size?: 'sm' | 'md';
  children: ReactNode;
}) {
  const box = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${box} ${
        active
          ? 'bg-brand-gold/20 text-brand-gold'
          : 'text-brand-beige/75 group-hover:scale-110 group-hover:bg-brand-gold/10 group-hover:text-brand-gold'
      }`}
    >
      {children}
    </span>
  );
}

interface NavLinkItemProps {
  to: string;
  end?: boolean;
  icon: LucideIcon;
  label: string;
  compact: boolean;
  badge?: number;
}

export function NavTopLink({ to, end, icon: Icon, label, compact, badge }: NavLinkItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        `group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
          isActive ? 'bg-brand-gold/10 text-white' : 'text-brand-beige/70 hover:bg-white/5 hover:text-white'
        } ${compact ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold" />
          )}
          <NavIconWrap active={isActive} size="md">
            <Icon
              className={`h-[17px] w-[17px] transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-3'
              }`}
              strokeWidth={isActive ? 2.25 : 2}
            />
          </NavIconWrap>
          {!compact && <span className="flex-1">{label}</span>}
          {!compact && badge != null && badge > 0 && (
            <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-brand-gold text-brand-dark-brown text-[10px] font-semibold flex items-center justify-center">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function NavSectionLabel({ children, compact }: { children: ReactNode; compact?: boolean }) {
  if (compact) return null;
  return (
    <p className="mb-1 mt-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold/45 first:mt-0">
      {children}
    </p>
  );
}
