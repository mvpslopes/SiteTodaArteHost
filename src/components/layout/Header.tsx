import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: 'Início', anchor: '#inicio' },
    { label: 'Quem Somos', anchor: '#quem-somos' },
    { label: 'Serviços', anchor: '#servicos' },
    { label: 'Desenvolvimento', anchor: '#desenvolvimento-de-sites' },
    { label: 'Seja Digital', anchor: '#seja-digital' },
    { label: 'Contato', anchor: '#contato' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0A0A0C]/95 backdrop-blur-md shadow-2xl shadow-black/50 border-b border-[#AC8869]/10'
          : 'bg-[#0A0A0C]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <a href="#inicio" onClick={(e) => handleNavClick(e, '#inicio')} className="flex items-center">
            <img src={logo} alt="Toda Arte" className="h-10 sm:h-14 w-auto object-contain" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const sectionId = item.anchor.substring(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.anchor}
                  href={item.anchor}
                  onClick={(e) => handleNavClick(e, item.anchor)}
                  className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-logo bg-logo/10'
                      : 'text-gray-300 hover:text-logo hover:bg-logo/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#contato"
              onClick={(e) => handleNavClick(e, '#contato')}
              className="ml-3 bg-gradient-to-r from-logo to-logo-light text-white px-5 xl:px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-logo/30 hover:scale-105 whitespace-nowrap"
            >
              Solicitar Orçamento
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-logo transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-[#AC8869]/10 bg-[#0A0A0C]/98 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const sectionId = item.anchor.substring(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.anchor}
                  href={item.anchor}
                  onClick={(e) => handleNavClick(e, item.anchor)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-logo bg-logo/10'
                      : 'text-gray-300 hover:text-logo hover:bg-logo/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#contato"
              onClick={(e) => handleNavClick(e, '#contato')}
              className="block text-center mt-3 bg-gradient-to-r from-logo to-logo-light text-white px-6 py-3 rounded-lg font-semibold text-sm"
            >
              Solicitar Orçamento
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
