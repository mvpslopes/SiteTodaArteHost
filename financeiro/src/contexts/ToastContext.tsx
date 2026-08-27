import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let nextId = 1;

const STYLES: Record<ToastType, { wrap: string; icon: string; bar: string }> = {
  success: {
    wrap: 'border-brand-beige bg-white',
    icon: 'text-emerald-600',
    bar: 'bg-brand-gold',
  },
  error: {
    wrap: 'border-rose-200 bg-white',
    icon: 'text-rose-600',
    bar: 'bg-rose-500',
  },
  info: {
    wrap: 'border-brand-beige bg-white',
    icon: 'text-brand-gold',
    bar: 'bg-brand-brown',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((cur) => [...cur.slice(-4), { id, type, message }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => {
          const style = STYLES[t.type];
          const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto overflow-hidden rounded-xl border shadow-lg ${style.wrap} toast-enter`}
              role={t.type === 'error' ? 'alert' : 'status'}
            >
              <div className="flex items-start gap-3 px-3.5 py-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} strokeWidth={2} />
                <p className="flex-1 text-sm leading-snug text-brand-dark-brown">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded p-0.5 text-brand-olive/60 hover:bg-brand-off-white hover:text-brand-dark-brown"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className={`h-0.5 ${style.bar} toast-bar`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
