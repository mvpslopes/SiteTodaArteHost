import React from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/landing/Hero';
import { Portfolio } from '../components/landing/Portfolio';
import { Services } from '../components/landing/Services';
import { Team } from '../components/landing/Team';
import { Contact } from '../components/landing/Contact';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';

export function LandingPage() {
  const handleNavClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header onNavClick={handleNavClick} isLandingPage={true} />
      
      <main>
        <Hero />
        <Portfolio />
        <Services />
        <Team />
        <Contact />
      </main>

      <WhatsAppButton />
    </div>
  );
}
