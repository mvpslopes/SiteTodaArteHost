import React from 'react';
import { Palette, Target, Smartphone, Camera, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

export function Services() {
  const services = [
    {
      icon: Palette,
      title: 'Identidade Visual',
      description: 'Criação de marca completa',
      color: 'from-purple-500/20 to-pink-500/10',
      borderColor: 'hover:border-purple-500/30',
      iconBg: 'from-purple-500 to-pink-500',
      features: [
        'Logotipo e variações',
        'Manual de identidade visual (brandbook)',
        'Aplicações da marca (cartão de visita, assinatura de e-mail, capas para redes sociais)',
      ],
    },
    {
      icon: Target,
      title: 'Estratégia e Planejamento',
      description: 'Planejamento estratégico personalizado',
      color: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'hover:border-blue-500/30',
      iconBg: 'from-blue-500 to-cyan-500',
      features: [
        'Diagnóstico de marca e mercado',
        'Planejamento de marketing estratégico',
        'Definição de persona e jornada do cliente',
        'Posicionamento e branding',
        'Plano de marketing de conteúdo',
        'Criação de funil de vendas',
      ],
    },
    {
      icon: Smartphone,
      title: 'Marketing Digital',
      description: 'Gestão completa de redes sociais',
      color: 'from-logo/20 to-logo-light/10',
      borderColor: 'hover:border-logo/30',
      iconBg: 'from-logo to-logo-light',
      features: [
        'Gestão de redes sociais (Instagram, Facebook, TikTok, etc.)',
        'Criação de conteúdo (posts, stories, reels, vídeos, carrosséis)',
        'Planejamento de calendário editorial',
        'Análise de métricas e relatórios',
      ],
    },
    {
      icon: Camera,
      title: 'Produção de Conteúdo Visual',
      description: 'Produção de fotos e vídeos profissionais',
      color: 'from-orange-500/20 to-amber-500/10',
      borderColor: 'hover:border-orange-500/30',
      iconBg: 'from-orange-500 to-amber-500',
      features: [
        'Vídeos para anúncios, institucionais e reels',
        'Captação e edição de conteúdo para campanhas',
        'Motion design e edições profissionais',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Marketing para Vendas & Performance',
      description: 'Criação e gestão de campanhas promocionais',
      color: 'from-green-500/20 to-emerald-500/10',
      borderColor: 'hover:border-green-500/30',
      iconBg: 'from-green-500 to-emerald-500',
      features: [
        'Estratégias para lançamentos de produtos e/ou serviços',
        'Consultoria para vendas online (WhatsApp, e-commerce, etc)',
        'Gestão de eventos comerciais',
      ],
    },
    {
      icon: DollarSign,
      title: 'Tráfego Pago | Mídia Paga',
      description: 'Gestão de anúncios e campanhas pagas',
      color: 'from-rose-500/20 to-red-500/10',
      borderColor: 'hover:border-rose-500/30',
      iconBg: 'from-rose-500 to-red-500',
      features: [
        'Gestão de anúncios no Meta Ads e Google Ads',
        'Segmentação e otimização de campanhas',
        'Remarketing e funil de conversão',
        'Relatórios e performance de ROI',
      ],
    },
  ];

  return (
    <section id="servicos" className="relative bg-[#0A0A0C] py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-logo/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn delay={0} duration={0.8}>
          <div className="text-center mb-14 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-logo/10 border border-logo/20 text-logo-light px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5 sm:mb-6">
              <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>O que fazemos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 sm:mb-6">
              Nossos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                Serviços
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Nosso objetivo é oferecer uma visão especializada para posicionar sua empresa onde ela merece estar.
              Soluções completas para cada etapa do seu crescimento digital.
            </p>
          </div>
        </FadeIn>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <FadeIn key={index} delay={index * 80} duration={0.6}>
                <div
                  className={`group relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 sm:p-7 transition-all duration-500 hover:-translate-y-1.5 ${service.borderColor} overflow-hidden`}
                >
                  {/* Card gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">{service.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5">{service.description}</p>

                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-gray-400">
                          <span className="text-logo mt-0.5 flex-shrink-0 text-sm">✓</span>
                          <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
