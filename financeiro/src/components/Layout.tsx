import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['root', 'administrador', 'usuario'] },
  { to: '/transacoes', label: 'Transações', Icon: ArrowLeftRight, roles: ['root', 'administrador', 'usuario'] },
  { to: '/destinos', label: 'Destinos', Icon: MapPin, roles: ['root', 'administrador', 'usuario'] },
  { to: '/clientes', label: 'Clientes', Icon: UserPlus, roles: ['root', 'administrador', 'usuario'] },
  { to: '/usuarios', label: 'Usuários', Icon: ShieldCheck, roles: ['root', 'administrador'] },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings, roles: ['root', 'administrador', 'usuario'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const visibleNav = nav.filter((item) => user && item.roles.includes(user.perfil));
  const perfilLabel = user?.perfil === 'root' ? 'Root' : user?.perfil === 'administrador' ? 'Admin' : 'Usuário';

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar esquerda - Menu */}
      <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-gray-200 shadow-card">
        <div className="p-4 border-b border-gray-100">
          <img
            src="/logo-todaarte.png"
            alt="TodaArte"
            className="h-14 w-auto object-contain object-left"
          />
          <p className="text-xs text-gray-500 mt-2">Sistema Financeiro</p>
        </div>
        <div className="px-3 py-4">
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
        <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-card">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="search"
                placeholder="Pesquisar..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex items-center gap-4">
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
