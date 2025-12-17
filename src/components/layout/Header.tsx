import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Quem Somos', path: '/quem-somos' },
    { label: 'Nossos Serviços', path: '/servicos' },
    { label: 'Desenvolvimento de Sites', path: '/desenvolvimento-de-sites' },
    { label: 'Contato', path: '/contato' },
    { label: 'Seja Digital', path: '/seja-digital' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-3">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo Toda Arte" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            <div className="flex-1 flex justify-center items-center space-x-3 xl:space-x-6">
              {navItems.map((item) => {
                // Seja Digital como botão de ação
                if (item.path === '/seja-digital') {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="bg-gradient-to-r from-logo to-logo-light text-white px-4 xl:px-6 py-2 rounded-lg font-semibold text-sm xl:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
                      style={{ fontFamily: 'inherit' }}
                    >
                      {item.label}
                    </Link>
                  );
                }
                // Outros itens do menu
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`header-nav-link hover:opacity-80 transition-colors font-medium text-sm xl:text-base ${
                      isActive(item.path) ? 'font-semibold' : ''
                    }`}
                    style={{ 
                      color: isActive(item.path) ? '#AC8869' : '#070709',
                      fontFamily: 'inherit'
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Botão de acesso ao sistema interno */}
            <Link
              to="/sistema-interno"
              className="ml-4 flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 text-sm font-medium hover:shadow-md"
              title="Acesso ao Sistema Interno"
            >
              <Lock size={16} />
              <span className="hidden xl:inline">Sistema</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2"
            style={{ color: '#070709' }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-3 border-t border-gray-200 mt-3 pt-3">
            {navItems.map((item) => {
              // Seja Digital como botão de ação no mobile
              if (item.path === '/seja-digital') {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-gradient-to-r from-logo to-logo-light text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-center block w-full mb-3 text-sm"
                    style={{ fontFamily: 'inherit' }}
                  >
                    {item.label}
                  </Link>
                );
              }
              // Outros itens do menu
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`header-nav-link block w-full text-left py-3 px-2 transition-colors text-sm ${
                    isActive(item.path)
                      ? 'font-semibold'
                      : 'hover:opacity-80'
                  }`}
                  style={{ 
                    color: isActive(item.path) ? '#AC8869' : '#070709',
                    fontFamily: 'inherit'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Botão de acesso ao sistema interno no mobile */}
            <Link
              to="/sistema-interno"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 text-sm font-medium mt-3"
            >
              <Lock size={18} />
              <span>Acesso ao Sistema Interno</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
