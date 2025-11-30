import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Target, Zap } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function SejaDigital() {
  const benefits = [
    {
      icon: Award,
      title: 'Resultados que Falam por Si',
      description: 'Mais do que promessas, entregamos performance. Nossa trajetória é marcada por cases de sucesso em diferentes segmentos, com estratégias que geram visibilidade, autoridade e, principalmente, vendas.'
    },
    {
      icon: Target,
      title: 'Estratégia Sob Medida',
      description: 'Aqui, cada cliente é único. Por isso, nossas soluções são 100% personalizadas, desenhadas com base nos objetivos, na realidade do seu negócio e no comportamento do seu público.'
    },
    {
      icon: Zap,
      title: 'Inovação Como Padrão',
      description: 'Estamos sempre atualizados com as principais tendências, plataformas e ferramentas do mercado digital. Unimos criatividade e tecnologia para posicionar sua marca à frente da concorrência.'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0} duration={0.8}>
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold">
                <span className="text-white">Seja</span>
                <br />
                <span className="text-logo">Digital</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Transforme sua presença digital com estratégias que geram resultados reais e mensuráveis.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Por Que Escolher a Toda Arte?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mais do que uma agência, somos seu parceiro estratégico no mundo digital
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <FadeIn key={index} delay={index * 100} duration={0.6}>
                  <div
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 card-hover"
                  >
                  <div className="bg-gradient-to-br from-logo to-logo-light p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-logo to-logo-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0} duration={0.6}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Pronto(a) para iniciar a transformação digital do seu negócio?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Entre em contato e vamos criar estratégias personalizadas para o seu sucesso
            </p>
            <Link
              to="/contato"
              className="inline-flex items-center space-x-2 bg-white text-logo px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Entre em Contato</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
