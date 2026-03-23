import React from 'react';
import { ArrowRight, Award, Target, Zap, CheckCircle2 } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function SejaDigital() {
  const benefits = [
    {
      icon: Award,
      title: 'Resultados que Falam por Si',
      description:
        'Mais do que promessas, entregamos performance. Nossa trajetória é marcada por cases de sucesso em diferentes segmentos, com estratégias que geram visibilidade, autoridade e, principalmente, vendas.',
    },
    {
      icon: Target,
      title: 'Estratégia Sob Medida',
      description:
        'Aqui, cada cliente é único. Por isso, nossas soluções são 100% personalizadas, desenhadas com base nos objetivos, na realidade do seu negócio e no comportamento do seu público.',
    },
    {
      icon: Zap,
      title: 'Inovação Como Padrão',
      description:
        'Estamos sempre atualizados com as principais tendências, plataformas e ferramentas do mercado digital. Unimos criatividade e tecnologia para posicionar sua marca à frente da concorrência.',
    },
  ];

  const checkItems = [
    'Gestão completa das suas redes sociais',
    'Estratégias personalizadas para o seu negócio',
    'Conteúdo visual de alta qualidade',
    'Relatórios de desempenho mensais',
    'Suporte dedicado e atendimento personalizado',
    'Equipe especializada em marketing digital',
  ];

  return (
    <section id="seja-digital" className="relative bg-[#0D0D10] py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-logo/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 sm:w-80 sm:h-80 bg-logo-light/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn delay={0} duration={0.8}>
          <div className="text-center mb-14 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-logo/10 border border-logo/20 text-logo-light px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5 sm:mb-6">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Por que nos escolher</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 sm:mb-6">
              Seja{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                Digital
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transforme sua presença digital com estratégias que geram resultados reais e mensuráveis.
              Mais do que uma agência, somos seu parceiro estratégico no mundo digital.
            </p>
          </div>
        </FadeIn>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-14 sm:mb-16 lg:mb-20">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <FadeIn key={index} delay={index * 100} duration={0.6}>
                <div className="group bg-white/[0.03] border border-logo/10 rounded-2xl p-6 sm:p-8 hover:border-logo/30 transition-all duration-500 hover:bg-logo/[0.04] hover:-translate-y-1 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-logo to-logo-light rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Checklist + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          <FadeIn delay={100} duration={0.8} direction="left">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
                O que você recebe ao{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                  trabalhar conosco
                </span>
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                {checkItems.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-logo/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-logo-light" />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={200} duration={0.8} direction="right">
            <div className="bg-gradient-to-br from-logo/10 to-logo-dark/5 border border-logo/20 rounded-3xl p-8 sm:p-10 text-center">
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light mb-3">
                Pronto?
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Vamos transformar seu negócio digital
              </h4>
              <p className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
                Entre em contato e vamos criar estratégias personalizadas para o seu sucesso.
                Primeira conversa sem compromisso!
              </p>
              <a
                href="#contato"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-logo/25 hover:shadow-xl hover:shadow-logo/40 hover:scale-105 w-full sm:w-auto"
              >
                <span>Falar com Especialista</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
