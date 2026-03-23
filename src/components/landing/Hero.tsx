import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen bg-[#0A0A0C] overflow-hidden flex items-center"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0C] via-[#111115] to-[#0A0A0C]" />
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-logo/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-logo-light/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-logo/5 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(172,136,105,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(172,136,105,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-0 lg:min-h-screen lg:flex lg:items-center">
        <div className={`w-full grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-10 lg:gap-16 items-center`}>
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <FadeIn delay={0} duration={0.8}>
              <div className="inline-flex items-center space-x-2 bg-logo/10 border border-logo/20 text-logo-light px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Agência de Marketing Digital</span>
              </div>
            </FadeIn>

            <FadeIn delay={100} duration={0.9}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-5 sm:mb-6">
                <span className="block">Seu Negócio</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                  Seu Sucesso
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={200} duration={0.8}>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 leading-relaxed mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0">
                Transformamos presença online com criatividade e comprometimento.
                Estratégias personalizadas que conectam sua marca ao público certo e geram resultados reais.
              </p>
            </FadeIn>

            <FadeIn delay={300} duration={0.8}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <a
                  href="#servicos"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-logo to-logo-light text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-logo/25 hover:shadow-xl hover:shadow-logo/40 hover:scale-105"
                >
                  <span>Conheça Nossos Serviços</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a
                  href="#contato"
                  className="inline-flex items-center justify-center space-x-2 border border-logo/30 text-logo-light px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-logo/10 hover:border-logo"
                >
                  <span>Falar Conosco</span>
                </a>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={400} duration={0.8}>
              <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 mt-10 sm:mt-12 pt-8 border-t border-logo/10">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">50+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">Clientes Ativos</div>
                </div>
                <div className="w-px h-10 bg-logo/20" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">200+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">Projetos Entregues</div>
                </div>
                <div className="w-px h-10 bg-logo/20" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">5+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">Anos de Experiência</div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: Image (desktop only) */}
          {!isMobile && (
            <div className="relative hidden lg:flex items-center justify-end">
              <FadeIn delay={200} duration={1.0} direction="right">
                {/* Decorative rings */}
                <div className="absolute inset-0 m-auto w-[440px] h-[440px] rounded-full border border-logo/10 animate-pulse-soft" />
                <div className="absolute inset-0 m-auto w-[350px] h-[350px] rounded-full border border-logo/8" />

                <div className="relative z-10">
                  <div className="relative w-[380px] xl:w-[440px] mx-auto">
                    {/* Gold glow backdrop */}
                    <div className="absolute -inset-6 bg-gradient-to-b from-logo/15 via-logo/5 to-transparent rounded-3xl blur-2xl" />
                    <img
                      src="/Thaty_Lara.png"
                      alt="Equipe Toda Arte"
                      className="relative z-10 w-full h-auto object-contain"
                      style={{ filter: 'drop-shadow(0 20px 60px rgba(172,136,105,0.25))' }}
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 animate-bounce opacity-60">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-logo/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-logo/60" />
      </div>
    </section>
  );
}
