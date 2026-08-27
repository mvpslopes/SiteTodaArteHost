import { Link } from 'react-router-dom';

interface AppBrandMarkProps {
  compact?: boolean;
  className?: string;
}

export default function AppBrandMark({ compact = false, className = '' }: AppBrandMarkProps) {
  if (compact) {
    return (
      <Link to="/dashboard" className={`group flex justify-center ${className}`} title="TodaArte · Gestão">
        <img src="/logo-todaarte-branco.png" alt="TodaArte" className="h-10 w-auto max-w-[56px] object-contain" />
      </Link>
    );
  }

  return (
    <Link to="/dashboard" className={`group block min-w-0 flex-1 ${className}`}>
      <div className="relative overflow-hidden rounded-xl px-2.5 py-3 transition">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center space-y-2.5 text-center">
          <img
            src="/logo-todaarte-branco.png"
            alt="TodaArte"
            className="h-16 w-auto max-w-full object-contain"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              const fb = el.nextElementSibling as HTMLElement | null;
              if (fb) fb.classList.remove('hidden');
            }}
          />
          <span className="hidden text-base font-semibold text-white">TodaArte</span>
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-px w-5 shrink bg-gradient-to-r from-transparent via-brand-gold to-brand-gold/20" />
            <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-gold/95">
              Produção e financeiro
            </span>
            <span className="h-px w-5 shrink bg-gradient-to-l from-transparent via-brand-gold to-brand-gold/20" />
          </div>
        </div>
      </div>
    </Link>
  );
}
