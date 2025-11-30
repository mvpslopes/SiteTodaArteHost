import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { PortfolioPage } from './pages/Portfolio';
import { ServicesPage } from './pages/Services';
import { WebDevelopment } from './pages/WebDevelopment';
import { TeamPage } from './pages/Team';
import { ContactPage } from './pages/Contact';
import { Footer } from './components/layout/Footer';
import { GoogleAnalytics } from './components/analytics/GoogleAnalytics';
import { ScrollToTop } from './components/common/ScrollToTop';

function App() {
  return (
    <Router>
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
