import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  MapPin,
  UserPlus,
  ShieldCheck,
  Settings,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  ClipboardList,
  Clock3,
  BarChart2,
  CheckSquare,
  CalendarDays,
  PieChart,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';

const nav = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['root', 'administrador', 'cliente'] },
  { to: '/transacoes', label: 'Transações', Icon: ArrowLeftRight, roles: ['root', 'administrador', 'cliente'] },
  { to: '/destinos', label: 'Destinos', Icon: MapPin, roles: ['root', 'administrador', 'cliente'] },
  { to: '/clientes', label: 'Clientes', Icon: UserPlus, roles: ['root', 'administrador', 'cliente'] },
  { to: '/gastos-fixos', label: 'Gastos fixos', Icon: CalendarDays, roles: ['root', 'administrador'] },
  { to: '/demandas', label: 'Demandas', Icon: ClipboardList, roles: ['root', 'administrador', 'usuario'] },
  { to: '/checklist', label: 'Checklist', Icon: CheckSquare, roles: ['root', 'administrador', 'usuario'] },
  { to: '/checklist-admin', label: 'Checklist Gestão', Icon: PieChart, roles: ['root', 'administrador'] },
  { to: '/relatorios-cliente', label: 'Relatórios Cliente', Icon: BarChart2, roles: ['root', 'administrador'] },
  { to: '/auditoria', label: 'Sessões/Auditoria', Icon: Clock3, roles: ['root'] },
  { to: '/usuarios', label: 'Usuários', Icon: ShieldCheck, roles: ['root', 'administrador'] },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings, roles: ['root', 'administrador', 'usuario', 'cliente'] },
];

const ROTAS_PERMITIDAS_USUARIO = ['/demandas', '/checklist', '/configuracoes'];

export default function Layout() {
  const { user, logout } = useAuth();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user?.perfil === 'usuario' && !ROTAS_PERMITIDAS_USUARIO.includes(location.pathname)) {
    return <Navigate to="/demandas" replace />;
  }

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const visibleNav = nav.filter((item) => user && item.roles.includes(user.perfil));
  const perfilLabel =
    user?.perfil === 'root'
      ? 'Root'
      : user?.perfil === 'administrador'
      ? 'Administrador'
      : user?.perfil === 'usuario'
      ? 'Usuário'
      : 'Cliente';

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar esquerda - Menu */}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex flex-col bg-white border-r border-gray-200 shadow-card transform transition-transform duration-200 ease-out md:static md:w-60 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <img
              src="/logo-todaarte.png"
              alt="TodaArte"
              className="h-14 w-auto object-contain object-left"
            />
            <p className="text-xs text-gray-500 mt-2">Sistema Financeiro</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>
        <div className="px-3 py-4 overflow-y-auto scroll-thin">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          <nav className="space-y-0.5">
            {visibleNav.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors border-l-4 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium border-primary-500'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo central + header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header top */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 shadow-card">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.8} />
            </button>
            <div className="relative flex-1 max-w-md">
              <input
                type="search"
                placeholder="Pesquisar na tela atual..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
                aria-label="Pesquisar"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <img
              src="/logo-todaarte.png"
              alt="TodaArte"
              className="h-9 w-auto object-contain hidden sm:block"
            />
            <NavLink
              to="/configuracoes"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Configurações"
            >
              <Settings className="w-5 h-5" strokeWidth={1.8} />
            </NavLink>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                  {(user?.nome || user?.email || '?').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:block max-w-[120px] truncate">{user?.nome || user?.email}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-white border border-gray-200 shadow-lg py-1 z-20">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.nome || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <p className="text-xs text-primary-600 mt-0.5">{perfilLabel}</p>
                    </div>
                    <NavLink
                      to="/configuracoes"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" strokeWidth={1.8} />
                      Configurações
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.8} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto scroll-thin">
          <div className="max-w-6xl mx-auto p-6 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
