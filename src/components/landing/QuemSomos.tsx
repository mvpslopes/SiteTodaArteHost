import React from 'react';
import { Users, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn } from '../common/FadeIn';

export function QuemSomos() {
  const values = [
    {
      icon: Users,
      title: 'Equipe Qualificada',
      description: 'Somos uma agência digital altamente qualificada para trabalhar na concepção, design, tecnologia e na fabricação de projetos específicos.'
    },
    {
      icon: Target,
      title: 'Resultados Comprovados',
      description: 'Nosso trabalho é fazer com que empresas se conectem com pessoas e alcancem maiores resultados através do marketing digital e suas redes sociais transformando presença online com criatividade e comprometimento.'
    },
    {
      icon: Lightbulb,
      title: 'Inovação Constante',
      description: 'Estamos sempre atualizados com as principais tendências, plataformas e ferramentas do mercado digital.'
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
                <span className="text-white">Quem</span>
                <br />
                <span className="text-logo">Somos</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Somos uma agência digital altamente qualificada para trabalhar na concepção, design, tecnologia e na fabricação de projetos específicos.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Nossa Missão
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transformar presença online com criatividade e comprometimento
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <FadeIn key={index} delay={index * 100} duration={0.6}>
                  <div
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 card-hover"
                  >
                  <div className="bg-gradient-to-br from-logo to-logo-light p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Marketing Section */}
      <section className="py-20 bg-gradient-to-b from-black to-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                O Marketing
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Estratégias que convertem presença online em resultados reais
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn delay={100} duration={0.6}>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <p className="text-lg text-gray-200 leading-relaxed">
                  As redes sociais são vitais para qualquer negócio, mas navegar por algoritmos, conteúdo visual e interações, exige estratégia.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={200} duration={0.6}>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <p className="text-lg text-gray-200 leading-relaxed">
                  Em um mercado cada vez mais competitivo, ter uma estratégia de marketing bem definida é essencial para alavancar suas vendas e destacar-se. Nossa empresa é especializada em criar estratégias personalizadas que não apenas atraem clientes, mas os convertem em vendas e resultados!
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-logo to-logo-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0} duration={0.6}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Pronto para transformar seu negócio?
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
