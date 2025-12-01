import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';
import { heroConfig } from '../../config/hero.config';

export function Hero() {
  const config = heroConfig;

  return (
    <section 
      className="relative text-white min-h-[calc(100vh-5rem)] hero-container animate-fade-in"
      style={{
        background: config.background.gradient,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 'calc(100vh - 5rem)',
        maxHeight: 'calc(100vh - 5rem)'
      }}
    >
      {/* Container principal */}
      <div className="relative z-10 w-full" style={{ height: 'calc(100vh - 5rem)', minHeight: 'calc(100vh - 5rem)', overflow: 'visible' }}>
        <div className="relative w-full" style={{ height: '100%', overflow: 'visible' }}>
          
          {/* Texto "Seu Negócio Seu Sucesso" */}
          <h1 
            className="absolute font-light uppercase tracking-wide leading-tight"
            style={{
              fontFamily: config.textoNegocio.fontFamily,
              color: config.textoNegocio.color,
              fontSize: config.textoNegocio.fontSize,
              top: config.textoNegocio.top,
              left: config.textoNegocio.left,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              userSelect: 'none',
              zIndex: config.textoNegocio.zIndex,
              pointerEvents: 'none'
            }}
          >
            <div className="text-shine" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Seu Negócio</div>
            <div className="text-shine" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Seu Sucesso</div>
          </h1>

          {/* Texto "Conecte" */}
          <div
            className="absolute"
            style={{
              top: config.textoConecte.top,
              left: config.textoConecte.left,
              transform: 'translate(-50%, -50%)',
              zIndex: config.textoConecte.zIndex,
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <span
              className="text-shine-safe font-normal italic"
              style={{
                fontFamily: config.textoConecte.fontFamily,
                color: config.textoConecte.color,
                fontSize: config.textoConecte.fontSize,
                display: 'inline-block',
                whiteSpace: 'nowrap',
                userSelect: 'none'
              }}
            >
              Conecte
            </span>
          </div>

          {/* Botão "Conheça nosso trabalho" */}
          <FadeIn delay={300} duration={0.8} direction="none">
            <div 
              className="absolute z-20"
              style={{
                top: config.botao.top,
                left: config.botao.left,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: config.botao.zIndex
              }}
            >
              <Link 
                to="/servicos"
                className="bg-gradient-to-r from-logo to-logo-light text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2 animate-float text-sm sm:text-base whitespace-nowrap"
                style={{ fontSize: config.botao.fontSize }}
              >
                <span className="hidden sm:inline">Conheça nosso trabalho</span>
                <span className="sm:hidden">Conheça</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
              </Link>
            </div>
          </FadeIn>

          {/* Imagem das meninas (Thaty_Lara.png) */}
          <div
            className="absolute"
            style={{
              top: config.imagemMeninas.top,
              left: config.imagemMeninas.left,
              transform: 'translate(-50%, -50%)',
              zIndex: config.imagemMeninas.zIndex,
              pointerEvents: 'none'
            }}
          >
            <img
              src="/Thaty_Lara.png"
              alt="Thaty Lara"
              style={{
                width: config.imagemMeninas.width,
                height: config.imagemMeninas.height,
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
            />
          </div>
        </div>
      </div>

    </section>
  );
}
