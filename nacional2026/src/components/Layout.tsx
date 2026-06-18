import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  ShoppingBag,
  CalendarClock,
  ArrowLeftRight,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LOGO } from '../constants/branding';

const navMain = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/espacos', label: 'Espaços', Icon: Grid3X3 },
  { to: '/vendas', label: 'Vendas', Icon: ShoppingBag },
  { to: '/clientes', label: 'Clientes', Icon: Users },
  { to: '/parcelas', label: 'Parcelas', Icon: CalendarClock },
  { to: '/transacoes', label: 'Transações', Icon: ArrowLeftRight },
];

const navSecondary = [
  { to: '/usuarios', label: 'Usuários', Icon: ShieldCheck, rootOnly: true },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings },
];

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/espacos': 'Espaços',
  '/vendas': 'Vendas',
  '/clientes': 'Clientes',
  '/parcelas': 'Parcelas',
  '/transacoes': 'Transações',
  '/usuarios': 'Usuários',
  '/configuracoes': 'Configurações',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const pageTitle = titles[location.pathname] ?? 'Nacional 2026';
  const isRoot = user?.perfil === 'root';

  return (
    <div className="flex min-h-screen bg-nacional-linear">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white shadow-sm transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="border-b border-nacional-100 px-4 py-4">
          <div className="overflow-hidden rounded-xl bg-nacional-900 p-3 shadow-nacional">
            <img
              src={LOGO}
              alt="43ª Exposição Nacional Mangalarga Marchador"
              className="mx-auto h-auto w-full max-h-14 object-contain"
            />
          </div>
          <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wider text-nacional-600">
            Gestão Financeira
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>
          <nav className="space-y-0.5">
            {navMain.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-nacional-800 font-medium text-nacional-gold shadow-sm'
                      : 'text-nacional-700 hover:bg-nacional-50 hover:text-nacional-900'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>

          <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Sistema</p>
          <nav className="space-y-0.5">
            {navSecondary
              .filter((item) => !item.rootOnly || isRoot)
              .map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? 'bg-nacional-800 font-medium text-nacional-gold shadow-sm'
                        : 'text-nacional-700 hover:bg-nacional-50 hover:text-nacional-900'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}
          </nav>

          <div className="mt-6 space-y-0.5">
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50">
              <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
              Ajuda
            </button>
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50">
              <MessageSquare className="h-[18px] w-[18px]" strokeWidth={1.8} />
              Feedback
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-nacional-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nacional-800 text-xs font-bold text-nacional-gold">
              {user?.nome?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{user?.nome}</p>
              <p className="truncate text-xs text-gray-400">{user?.login}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-red-500"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Perfil {isRoot ? 'Root' : 'Admin'}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-52 rounded-xl border border-nacional-100 bg-nacional-50 py-2 pl-9 pr-3 text-sm focus:border-nacional-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nacional-100 lg:w-64"
                />
              </div>
              <button type="button" className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-nacional-gold" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-thin p-4 md:p-8">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}
