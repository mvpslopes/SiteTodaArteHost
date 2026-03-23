import React from 'react';
import { Users, Target, Lightbulb, Star } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function QuemSomos() {
  const values = [
    {
      icon: Users,
      title: 'Equipe Qualificada',
      description: 'Somos uma agência digital altamente qualificada para trabalhar na concepção, design, tecnologia e na fabricação de projetos específicos.',
    },
    {
      icon: Target,
      title: 'Resultados Comprovados',
      description: 'Nosso trabalho é fazer com que empresas se conectem com pessoas e alcancem maiores resultados através do marketing digital e suas redes sociais.',
    },
    {
      icon: Lightbulb,
      title: 'Inovação Constante',
      description: 'Estamos sempre atualizados com as principais tendências, plataformas e ferramentas do mercado digital para posicionar sua marca à frente.',
    },
  ];

  const stats = [
    { value: '50+', label: 'Clientes Satisfeitos' },
    { value: '200+', label: 'Projetos Entregues' },
    { value: '5+', label: 'Anos de Mercado' },
    { value: '100%', label: 'Comprometimento' },
  ];

  return (
    <section id="quem-somos" className="relative bg-[#0D0D10] py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-logo/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 sm:w-80 sm:h-80 bg-logo/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn delay={0} duration={0.8}>
          <div className="text-center mb-14 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-logo/10 border border-logo/20 text-logo-light px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5 sm:mb-6">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Sobre Nós</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 sm:mb-6">
              Quem{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                Somos
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Somos uma agência digital altamente qualificada para trabalhar na concepção, design,
              tecnologia e na fabricação de projetos específicos. Transformamos presença online com
              criatividade e comprometimento.
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={100} duration={0.8}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-14 sm:mb-16 lg:mb-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/[0.03] backdrop-blur-sm border border-logo/10 rounded-2xl p-4 sm:p-6 text-center hover:border-logo/30 transition-all duration-300 hover:bg-logo/5 group"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-14 sm:mb-16">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <FadeIn key={index} delay={index * 100} duration={0.6}>
                <div className="group bg-white/[0.03] border border-logo/10 rounded-2xl p-6 sm:p-8 hover:border-logo/30 transition-all duration-500 hover:bg-logo/[0.04] hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-logo to-logo-light rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{value.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{value.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Marketing paragraphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
          <FadeIn delay={100} duration={0.6}>
            <div className="bg-gradient-to-br from-logo/8 to-logo-dark/5 border border-logo/15 rounded-2xl p-6 sm:p-8">
              <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
                As redes sociais são vitais para qualquer negócio, mas navegar por algoritmos,
                conteúdo visual e interações, exige estratégia especializada e consistência.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200} duration={0.6}>
            <div className="bg-gradient-to-br from-logo/8 to-logo-dark/5 border border-logo/15 rounded-2xl p-6 sm:p-8">
              <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
                Em um mercado cada vez mais competitivo, ter uma estratégia de marketing bem
                definida é essencial para alavancar suas vendas, atrair clientes e se destacar.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
