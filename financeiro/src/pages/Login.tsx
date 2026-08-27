import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Palette,
  ArrowLeftRight,
  CalendarDays,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ThemeIconButton from '../components/ThemeIconButton';

const FEATURES = [
  { icon: Palette, text: 'Produção de artes, logo e conteúdo com briefing e aprovação', short: 'Produção' },
  { icon: ArrowLeftRight, text: 'Controle de entradas, saídas e quem ainda precisa receber', short: 'Financeiro' },
  { icon: CalendarDays, text: 'Gastos fixos e rotina mensal da agência no mesmo lugar', short: 'Contas' },
  { icon: Users, text: 'Clientes, quem pagou e quem ainda precisa receber', short: 'Clientes' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso.');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no login';
      toast.error(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-off-white">
      <div className="theme-fixed relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-dark-brown via-[#3d2f26] to-brand-brown lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl animate-float" />
          <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-brand-olive/10 blur-3xl animate-float-delayed" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        <div className="relative z-10">
          <img src="/logo-todaarte-branco.png" alt="TodaArte" className="h-20 w-auto object-contain" />
        </div>

        <div className="relative z-10 max-w-md">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold-light">
            Sistema de gestão
          </span>
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Produção e financeiro da agência, em um só lugar.
          </h2>
          <p className="mt-4 text-sm text-brand-beige/60">
            Do briefing à entrega, com quem fez o serviço já na fila para receber — pensado para o ritmo da TodaArte.
          </p>

          <div className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-gold-light">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-brand-beige/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-brand-beige/30">© {new Date().getFullYear()} TodaArte</p>
      </div>

      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden p-4 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-brown/10 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-96 w-96 rounded-full bg-brand-olive/10 blur-3xl" />
        </div>

        <ThemeIconButton className="absolute right-4 top-4 z-20 bg-white/70 backdrop-blur-sm lg:right-6 lg:top-6" />

        <div className="relative z-10 w-full max-w-md animate-scale-in">
          <div className="rounded-2xl border border-brand-olive/20 bg-white/90 p-8 shadow-soft-xl backdrop-blur-sm md:p-10">
            <div className="mb-8 text-center">
              <img src="/logo-todaarte.png" alt="Logo TodaArte" className="mx-auto mb-6 h-16 object-contain md:h-20 lg:hidden" />
              <h1 className="bg-gradient-to-r from-brand-brown to-brand-olive bg-clip-text text-3xl font-bold text-transparent">
                Bem-vindo de volta
              </h1>
              <p className="mt-2 text-sm text-brand-olive/70">Entre para acessar o painel</p>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-brand-brown to-brand-olive" />
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-1.5 lg:hidden">
              {FEATURES.map(({ icon: Icon, text, short }) => (
                <span
                  key={text}
                  title={text}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-beige/50 px-2.5 py-1 text-[11px] font-medium text-brand-brown"
                >
                  <Icon className="h-3 w-3" />
                  {short}
                </span>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-brand-brown">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive/50" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-brand-olive/20 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-beige"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-brand-brown">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-olive/50" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full rounded-xl border border-brand-olive/20 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-brand-olive focus:ring-2 focus:ring-brand-beige"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-olive/50 transition hover:text-brand-brown"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-brown py-3 text-sm font-semibold text-white shadow-lg shadow-brand-brown/25 transition hover:bg-brand-olive disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
