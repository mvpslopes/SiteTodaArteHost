import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { images } from '../../assets/images/imageConfig';

export function Hero() {
  return (
    <section 
      className="relative bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white py-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${images.hero.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-center mb-6">
              <span className="text-white">Criamos</span>
              <br />
              <span className="text-logo">Identidades Visuais Únicas</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Transformamos ideias em designs impactantes. Da identidade visual ao material gráfico, 
              cada projeto é desenvolvido com criatividade e excelência técnica.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Ver Portfólio</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button className="group flex items-center space-x-2 text-white hover:text-logo transition-colors">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/30 transition-colors">
                <Play className="h-6 w-6" />
              </div>
              <span className="font-medium">Assistir Showreel</span>
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { number: '500+', label: 'Projetos Realizados' }, 
              { number: '15+', label: 'Anos de Experiência' }, 
              { number: '100%', label: 'Clientes Satisfeitos' }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-white">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
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