import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section 
      className="relative text-white min-h-[calc(100vh-5rem)] flex items-end justify-center pb-32 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 25%, #d4c4b0 50%, #c9b8a3 75%, #b8a690 100%)'
      }}
    >

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light uppercase tracking-wide" style={{ fontFamily: "'Montserrat Light', sans-serif", color: '#815d46' }}>
              <div>Seu Negócio</div>
              <div>Seu Sucesso</div>
            </h1>
            <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal italic" style={{ fontFamily: "'Andrea Bellarosa', cursive", color: '#4c2e13' }}>
              Conecte
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/portfolio"
              className="bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Conheça nosso trabalho</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center mt-12 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}