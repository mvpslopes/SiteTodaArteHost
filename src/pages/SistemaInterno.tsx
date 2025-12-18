import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { 
  LogIn, LogOut, DollarSign, FolderKanban, Users, 
  BarChart3, Settings, Menu, X, User as UserIcon, Bell, MessageSquare, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import Dashboard from '../components/sistema-interno/Dashboard';
import Financeiro from '../components/sistema-interno/Financeiro';
import Projetos from '../components/sistema-interno/Projetos';
import Clientes from '../components/sistema-interno/Clientes';
import Login from '../components/sistema-interno/Login';

export default function SistemaInterno() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há usuário salvo
    const savedUser = localStorage.getItem('todaarte_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowLogin(true);
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('todaarte_user', JSON.stringify(userData));
    setShowLogin(false);
    navigate('/sistema-interno/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('todaarte_user');
    setShowLogin(true);
    navigate('/sistema-interno');
  };

  if (showLogin || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className="min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100"
    >
      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-0 h-full z-10 hidden lg:block bg-white border-r border-gray-200 shadow-lg"
        style={{ width: '280px' }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}>
              V
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Sistema Interno
          </h1>
          <p className="text-sm mt-1 text-gray-500">Toda Arte</p>
        </div>
        
        <nav className="p-4 space-y-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar aqui"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              />
            </div>
          </div>
          <SidebarNavLink to="/sistema-interno/dashboard" icon={<BarChart3 size={18} />}>
            Dashboard
          </SidebarNavLink>
          <SidebarNavLink to="/sistema-interno/projetos" icon={<FolderKanban size={18} />}>
            Projetos
          </SidebarNavLink>
          <SidebarNavLink to="/sistema-interno/clientes" icon={<Users size={18} />}>
            Clientes
          </SidebarNavLink>
          <SidebarNavLink to="/sistema-interno/financeiro" icon={<DollarSign size={18} />}>
            Financeiro
          </SidebarNavLink>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">
                {user.name || user.email}
              </p>
              <p className="text-xs truncate text-gray-500">
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {}}
              className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 text-gray-700"
            >
              <Settings size={18} />
              <span>Configurações</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 text-gray-700"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-[280px] relative z-0">
        {/* Top Header */}
        <header 
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-all hover:bg-gray-100 text-gray-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-lg font-semibold hidden sm:block text-gray-900">
              {window.location.pathname.includes('dashboard') && 'Dashboard'}
              {window.location.pathname.includes('financeiro') && 'Financeiro'}
              {window.location.pathname.includes('projetos') && 'Projetos'}
              {window.location.pathname.includes('clientes') && 'Clientes'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
            <div className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 lg:hidden"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside 
              className="fixed left-0 top-0 h-full w-64"
              style={{ 
                backgroundColor: '#151515',
                borderRight: '1px solid #2A2A2A'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b" style={{ borderColor: '#2A2A2A' }}>
                <h1 className="text-xl font-bold" style={{ color: '#AC8869' }}>Sistema Interno</h1>
              </div>
              <nav className="p-4 space-y-1">
                <MobileNavLink to="/sistema-interno/dashboard" icon={<BarChart3 size={18} />} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink to="/sistema-interno/financeiro" icon={<DollarSign size={18} />} onClick={() => setMobileMenuOpen(false)}>
                  Financeiro
                </MobileNavLink>
                <MobileNavLink to="/sistema-interno/projetos" icon={<FolderKanban size={18} />} onClick={() => setMobileMenuOpen(false)}>
                  Projetos
                </MobileNavLink>
                <MobileNavLink to="/sistema-interno/clientes" icon={<Users size={18} />} onClick={() => setMobileMenuOpen(false)}>
                  Clientes
                </MobileNavLink>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function SidebarNavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isActive = location === to;

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all relative group"
      style={{
        background: isActive 
          ? 'rgba(172, 136, 105, 0.1)' 
          : 'transparent',
        color: isActive ? '#AC8869' : '#6B7280',
        borderLeft: isActive ? '3px solid #AC8869' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = '#F9FAFB';
          e.currentTarget.style.color = '#111827';
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#6B7280';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      <div style={{ 
        color: isActive ? '#F59E0B' : '#6B7280',
        transition: 'color 0.3s ease'
      }}>
        {icon}
      </div>
      <span>{children}</span>
    </button>
  );
}

function MobileNavLink({ to, icon, children, onClick }: { to: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isActive = location === to;

  const handleClick = () => {
    navigate(to);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all"
      style={{
        backgroundColor: isActive ? 'rgba(172, 136, 105, 0.15)' : 'transparent',
        color: isActive ? '#AC8869' : '#B0B0B0',
        borderLeft: isActive ? '3px solid #AC8869' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#1E1E1E';
          e.currentTarget.style.color = '#FFFFFF';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#B0B0B0';
        }
      }}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

