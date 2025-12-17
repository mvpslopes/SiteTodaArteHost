import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { 
  LogIn, LogOut, DollarSign, FolderKanban, Users, 
  BarChart3, Settings, Menu, X, User as UserIcon
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
      className="min-h-screen relative"
      style={{ 
        backgroundColor: '#0A0A0A',
        backgroundImage: `
          radial-gradient(ellipse at top, rgba(172, 136, 105, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(201, 168, 130, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, rgba(172, 136, 105, 0.08) 0%, transparent 50%)
        `,
        color: '#FFFFFF'
      }}
    >
      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-0 h-full z-40 hidden lg:block backdrop-blur-xl"
        style={{ 
          width: '280px', 
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <h1 
            className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)'
            }}
          >
            Sistema Interno
          </h1>
          <p className="text-sm mt-1" style={{ color: '#808080' }}>Toda Arte</p>
        </div>
        
        <nav className="p-4 space-y-1">
          <SidebarNavLink to="/sistema-interno/dashboard" icon={<BarChart3 size={18} />}>
            Dashboard
          </SidebarNavLink>
          <SidebarNavLink to="/sistema-interno/financeiro" icon={<DollarSign size={18} />}>
            Financeiro
          </SidebarNavLink>
          <SidebarNavLink to="/sistema-interno/projetos" icon={<FolderKanban size={18} />}>
            Projetos
          </SidebarNavLink>
          <SidebarNavLink to="/sistema-interno/clientes" icon={<Users size={18} />}>
            Clientes
          </SidebarNavLink>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
              style={{ 
                background: 'linear-gradient(135deg, rgba(172, 136, 105, 0.3) 0%, rgba(201, 168, 130, 0.2) 100%)',
                border: '1px solid rgba(172, 136, 105, 0.3)',
                boxShadow: '0 4px 12px rgba(172, 136, 105, 0.2)'
              }}
            >
              <UserIcon size={20} style={{ color: '#AC8869' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>
                {user.name || user.email}
              </p>
              <p className="text-xs truncate" style={{ color: '#808080' }}>
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
            style={{ 
              background: 'rgba(30, 30, 30, 0.6)',
              color: '#B0B0B0',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(40, 40, 40, 0.8)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(172, 136, 105, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 30, 30, 0.6)';
              e.currentTarget.style.color = '#B0B0B0';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ marginLeft: '0', paddingLeft: '0' }} className="lg:ml-[280px]">
        {/* Top Header */}
        <header 
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 backdrop-blur-xl"
          style={{ 
            backgroundColor: 'rgba(17, 17, 17, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-all"
              style={{ 
                color: '#B0B0B0',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1E1E1E';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#B0B0B0';
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-lg font-semibold hidden sm:block" style={{ color: '#FFFFFF' }}>
              {window.location.pathname.includes('dashboard') && 'Dashboard'}
              {window.location.pathname.includes('financeiro') && 'Financeiro'}
              {window.location.pathname.includes('projetos') && 'Projetos'}
              {window.location.pathname.includes('clientes') && 'Clientes'}
            </h2>
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
        <main className="p-4 sm:p-6 lg:p-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
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
          ? 'linear-gradient(135deg, rgba(172, 136, 105, 0.2) 0%, rgba(201, 168, 130, 0.15) 100%)' 
          : 'transparent',
        color: isActive ? '#AC8869' : '#B0B0B0',
        borderLeft: isActive ? '3px solid #AC8869' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#B0B0B0';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      <div style={{ 
        filter: isActive ? 'drop-shadow(0 0 8px rgba(172, 136, 105, 0.4))' : 'none',
        transition: 'filter 0.3s ease'
      }}>
        {icon}
      </div>
      <span>{children}</span>
      {isActive && (
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full"
          style={{
            background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 100%)',
            boxShadow: '0 0 12px rgba(172, 136, 105, 0.5)'
          }}
        />
      )}
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

