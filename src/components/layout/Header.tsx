import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  const navItems = [
    { label: 'Início', anchor: '#inicio' },
    { label: 'Quem Somos', anchor: '#quem-somos' },
    { label: 'Nossos Serviços', anchor: '#servicos' },
    { label: 'Desenvolvimento de Sites', anchor: '#desenvolvimento-de-sites' },
    { label: 'Diagnósticos', anchor: '#diagnosticos' },
    { label: 'Contato', anchor: '#contato' },
    { label: 'Seja Digital', anchor: '#seja-digital' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.anchor.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    const targetId = anchor.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-3">
          <a href="#inicio" onClick={(e) => handleNavClick(e, '#inicio')} className="flex items-center space-x-2">
            <img src={logo} alt="Logo Toda Arte" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            <div className="flex-1 flex justify-center items-center space-x-3 xl:space-x-6">
              {navItems.map((item) => {
                const sectionId = item.anchor.substring(1);
                const isActive = activeSection === sectionId;
                
                // Seja Digital como botão de ação
                if (item.anchor === '#seja-digital') {
                  return (
                    <a
                      key={item.anchor}
                      href={item.anchor}
                      onClick={(e) => handleNavClick(e, item.anchor)}
                      className="bg-gradient-to-r from-logo to-logo-light text-white px-4 xl:px-6 py-2 rounded-lg font-semibold text-sm xl:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
                      style={{ fontFamily: 'inherit' }}
                    >
                      {item.label}
                    </a>
                  );
                }
                // Outros itens do menu
                return (
                  <a
                    key={item.anchor}
                    href={item.anchor}
                    onClick={(e) => handleNavClick(e, item.anchor)}
                    className={`header-nav-link hover:opacity-80 transition-colors font-medium text-sm xl:text-base ${
                      isActive ? 'font-semibold' : ''
                    }`}
                    style={{ 
                      color: isActive ? '#AC8869' : '#070709',
                      fontFamily: 'inherit'
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
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
              const sectionId = item.anchor.substring(1);
              const isActive = activeSection === sectionId;
              
              // Seja Digital como botão de ação no mobile
              if (item.anchor === '#seja-digital') {
                return (
                  <a
                    key={item.anchor}
                    href={item.anchor}
                    onClick={(e) => handleNavClick(e, item.anchor)}
                    className="bg-gradient-to-r from-logo to-logo-light text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-center block w-full mb-3 text-sm"
                    style={{ fontFamily: 'inherit' }}
                  >
                    {item.label}
                  </a>
                );
              }
              // Outros itens do menu
              return (
                <a
                  key={item.anchor}
                  href={item.anchor}
                  onClick={(e) => handleNavClick(e, item.anchor)}
                  className={`header-nav-link block w-full text-left py-3 px-2 transition-colors text-sm ${
                    isActive
                      ? 'font-semibold'
                      : 'hover:opacity-80'
                  }`}
                  style={{ 
                    color: isActive ? '#AC8869' : '#070709',
                    fontFamily: 'inherit'
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
