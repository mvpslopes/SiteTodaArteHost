import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  MapPin,
  UserPlus,
  ShieldCheck,
  Settings,
  Search,
  Menu,
  X,
  Clock3,
  BarChart2,
  CalendarDays,
  Palette,
  Users,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api';
import { useIsMobile } from '../hooks/useIsMobile';
import { resolvePageMeta } from '../constants/pageMeta';
import { NavSectionLabel, NavTopLink } from './SidebarNav';
import AppBrandMark from './AppBrandMark';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderDateTime from './HeaderDateTime';
import ThemeIconButton from './ThemeIconButton';
import PageTransition from './PageTransition';
import AppBottomNav from './AppBottomNav';
import MobileMoreSheet from './MobileMoreSheet';
import NotificationBell from './NotificationBell';

type NavItem = {
  to: string;
  label: string;
  Icon: LucideIcon;
  roles: string[];
  end?: boolean;
  badgeKey?: 'gastos';
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Produção',
    items: [
      { to: '/producao', label: 'Produção', Icon: Palette, roles: ['root', 'administrador', 'usuario', 'freelancer'] },
      { to: '/cronograma', label: 'Cronograma', Icon: CalendarDays, roles: ['root', 'administrador'] },
      { to: '/executantes', label: 'Executantes', Icon: Users, roles: ['root', 'administrador'] },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { to: '/dashboard', label: 'Início', Icon: LayoutDashboard, roles: ['root', 'administrador', 'cliente'], end: true },
      { to: '/transacoes', label: 'Transações', Icon: ArrowLeftRight, roles: ['root', 'administrador', 'cliente'] },
      { to: '/destinos', label: 'Destinos', Icon: MapPin, roles: ['root', 'administrador', 'cliente'] },
      { to: '/gastos-fixos', label: 'Gastos fixos', Icon: CalendarDays, roles: ['root', 'administrador'], badgeKey: 'gastos' },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { to: '/clientes', label: 'Clientes', Icon: UserPlus, roles: ['root', 'administrador', 'usuario', 'cliente'] },
      { to: '/logins', label: 'Logins', Icon: KeyRound, roles: ['root', 'administrador', 'usuario'] },
      { to: '/relatorios-cliente', label: 'Relatórios', Icon: BarChart2, roles: ['root', 'administrador'] },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/auditoria', label: 'Auditoria', Icon: Clock3, roles: ['root'] },
      { to: '/usuarios', label: 'Usuários', Icon: ShieldCheck, roles: ['root', 'administrador'] },
      { to: '/configuracoes', label: 'Configurações', Icon: Settings, roles: ['root', 'administrador', 'usuario', 'cliente', 'freelancer'] },
    ],
  },
];

function isPortalProducao(perfil?: string) {
  return perfil === 'usuario' || perfil === 'freelancer';
}

function equipePodeAcessar(perfil: string | undefined, pathname: string) {
  if (pathname === '/configuracoes' || pathname === '/producao' || pathname.startsWith('/producao/')) return true;
  if (perfil === 'usuario' && (pathname === '/clientes' || pathname === '/logins')) return true;
  return false;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { query, setQuery } = useSearch();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [gastosPendentes, setGastosPendentes] = useState(0);

  const compact = !isMobile && collapsed;
  const metaBase = resolvePageMeta(location.pathname);
  const meta =
    isPortalProducao(user?.perfil) && location.pathname.startsWith('/producao')
      ? { ...metaBase, subtitle: 'Jobs atribuídos a você para executar' }
      : metaBase;

  useEffect(() => {
    if (!user || !['root', 'administrador', 'cliente'].includes(user.perfil)) return;
    api.gastosFixos
      .alertas()
      .then((res) => setGastosPendentes(res.pendentes ?? res.alertas.length))
      .catch(() => {});
  }, [user, location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
    setMoreOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = moreOpen || sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [moreOpen, sidebarOpen]);

  if (isPortalProducao(user?.perfil) && !equipePodeAcessar(user?.perfil, location.pathname)) {
    return <Navigate to="/producao" replace />;
  }

  const handleLogout = async () => {
    await logout();
    toast.info('Sessão encerrada.');
    navigate('/login', { replace: true });
  };

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => user && item.roles.includes(user.perfil)),
    }))
    .filter((group) => group.items.length > 0);

  const allItems = visibleGroups.flatMap((g) => g.items);
  const bottomPrimary =
    user?.perfil === 'freelancer'
      ? ['/producao', '/configuracoes']
      : user?.perfil === 'usuario'
        ? ['/producao', '/logins', '/configuracoes']
        : user?.perfil === 'cliente'
        ? ['/dashboard', '/transacoes', '/clientes']
        : ['/dashboard', '/producao', '/transacoes', '/gastos-fixos'];
  const moreItems = allItems.filter((item) => !bottomPrimary.includes(item.to));

  const portalLabel =
    user?.perfil === 'cliente'
      ? 'Portal cliente'
      : user?.perfil === 'usuario'
        ? 'Portal da equipe'
        : user?.perfil === 'freelancer'
          ? 'Portal freelancer'
          : 'Gestão TodaArte';

  const sidebarNav = (
    <nav className="scrollbar-sidebar flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 pb-2 pt-2">
      {visibleGroups.map((group) => (
        <div key={group.title}>
          <NavSectionLabel compact={compact}>{group.title}</NavSectionLabel>
          {group.items.map((item) => (
            <NavTopLink
              key={item.to}
              to={item.to}
              end={item.end}
              icon={item.Icon}
              label={item.label}
              compact={compact}
              badge={item.badgeKey === 'gastos' ? gastosPendentes : undefined}
            />
          ))}
        </div>
      ))}
    </nav>
  );

  if (isMobile) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-brand-off-white text-brand-dark-brown">
        <header className="sticky top-0 z-20 shrink-0 border-b border-brand-beige/70 bg-white/95 px-4 py-3 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-brand-gold">
                {portalLabel}
              </p>
              <h1 className="truncate text-base font-semibold text-brand-dark-brown">{meta.title}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {user?.perfil !== 'cliente' && <NotificationBell />}
              <ThemeIconButton />
              <HeaderUserMenu name={user?.nome || user?.email} role={user?.perfil} onLogout={handleLogout} compact />
            </div>
          </div>
          <div className="relative mt-3">
            <input
              type="search"
              placeholder="Pesquisar na tela atual..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-brand-beige bg-brand-off-white py-2 pl-10 pr-4 text-sm text-brand-dark-brown placeholder-brand-olive/60 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-beige"
              aria-label="Pesquisar"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive/70" strokeWidth={1.8} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 pb-36">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <AppBottomNav perfil={user?.perfil} gastosPendentes={gastosPendentes} onMore={() => setMoreOpen(true)} />
        <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} onLogout={handleLogout} items={moreItems} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-off-white text-brand-dark-brown">
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className={`theme-fixed fixed inset-y-0 left-0 z-50 flex h-full w-[min(18rem,86vw)] flex-col bg-gradient-to-b from-brand-dark-brown to-[#3d2f26] text-white shadow-2xl transition-transform duration-300 ease-out md:static md:z-auto md:shadow-none md:transition-[width] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${compact ? 'md:w-[76px]' : 'md:w-64'} md:shrink-0`}
      >
        <div className={`border-b border-white/10 pb-3 ${compact ? 'px-2 pt-3' : 'px-3 pt-3'}`}>
          <div className={`relative flex items-start gap-2 ${compact ? 'md:flex-col md:items-center' : ''}`}>
            <AppBrandMark compact={compact} />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-0 top-0 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand-beige/80 hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {sidebarNav}

        <div className="hidden border-t border-white/10 p-2 md:block">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-brand-beige/60 transition hover:bg-white/5 hover:text-white ${
              compact ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
            {!compact && <span>{collapsed ? 'Expandir' : 'Recolher'}</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex shrink-0 items-center justify-between gap-2 border-b border-brand-beige/70 bg-white/90 px-3 py-3 backdrop-blur-md sm:gap-4 sm:px-4 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-beige bg-white text-brand-brown hover:bg-brand-off-white md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-brand-dark-brown sm:text-lg">{meta.title}</h1>
              <p className="hidden truncate text-xs text-brand-olive sm:block">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
            <div className="relative hidden max-w-xs flex-1 md:block lg:max-w-sm">
              <input
                type="search"
                placeholder="Pesquisar na tela atual..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-brand-beige bg-brand-off-white py-2 pl-10 pr-4 text-sm text-brand-dark-brown placeholder-brand-olive/60 outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-beige"
                aria-label="Pesquisar"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-olive/70" strokeWidth={1.8} />
            </div>
            <HeaderDateTime className="hidden xl:block" />
            {user?.perfil !== 'cliente' && <NotificationBell />}
            <ThemeIconButton className="hidden md:inline-flex" />
            <span className="mx-0.5 hidden h-6 w-px bg-brand-beige md:block" aria-hidden />
            <HeaderUserMenu name={user?.nome || user?.email} role={user?.perfil} onLogout={handleLogout} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
          <div className={`mx-auto pb-8 ${location.pathname === '/producao' ? 'max-w-[92rem]' : 'max-w-6xl'}`}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
