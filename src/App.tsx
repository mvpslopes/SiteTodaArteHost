import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { PortfolioPage } from './pages/Portfolio';
import { ServicesPage } from './pages/Services';
import { WebDevelopment } from './pages/WebDevelopment';
import { TeamPage } from './pages/Team';
import { ContactPage } from './pages/Contact';
import { GrupoRacaPage } from './pages/GrupoRaca';
import { Footer } from './components/layout/Footer';
import { GoogleAnalytics } from './components/analytics/GoogleAnalytics';
import { ScrollToTop } from './components/common/ScrollToTop';

function AppContent() {
  const location = useLocation();
  const isGrupoRaca = location.pathname === '/gruporaca';

  return (
    <>
      <GoogleAnalytics />
      <ScrollToTop />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quem-somos" element={<PortfolioPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/desenvolvimento-de-sites" element={<WebDevelopment />} />
          <Route path="/seja-digital" element={<TeamPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/gruporaca" element={<GrupoRacaPage />} />
        </Routes>
        {/* Footer só aparece nas páginas do site principal, não no Grupo Raça */}
        {!isGrupoRaca && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;
