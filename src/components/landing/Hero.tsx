import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function Hero() {

  return (
    <section 
      className="relative text-white min-h-[calc(100vh-5rem)] hero-container animate-fade-in"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 'calc(100vh - 5rem)',
        maxHeight: 'calc(100vh - 5rem)'
      }}
    >
      {/* Botão - elemento separado para ser clicável */}
      <FadeIn delay={300} duration={0.8} direction="none">
        <div 
          className="absolute z-20"
          style={{
            top: '65%',
            left: '30%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto'
          }}
        >
          <Link 
            to="/servicos"
            className="bg-gradient-to-r from-logo to-logo-light text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2 animate-float"
            style={{ fontSize: '0.95rem' }}
          >
            <span>Conheça nosso trabalho</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </FadeIn>

    </section>
  );
}
