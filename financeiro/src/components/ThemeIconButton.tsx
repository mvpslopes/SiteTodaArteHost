import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeIconButtonProps {
  className?: string;
}

export default function ThemeIconButton({ className = '' }: ThemeIconButtonProps) {
  const { resolved, setPreference } = useTheme();

  const toggle = () => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  };

  const isDark = resolved === 'dark';
  const label = isDark ? 'Ativar modo claro' : 'Ativar modo escuro';

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-olive/55 transition hover:bg-brand-off-white hover:text-brand-dark-brown active:scale-95 ${className}`}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
    </button>
  );
}
