import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Home } from './pages/Home';
import { Footer } from './components/layout/Footer';
import { GoogleAnalytics } from './components/analytics/GoogleAnalytics';
import { ScrollToTop } from './components/common/ScrollToTop';

function AppContent() {
  return (
    <>
      <GoogleAnalytics />
      <ScrollToTop />
      <div className="min-h-screen">
        <Home />
        <Footer />
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
