import React from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/landing/Hero';
import { QuemSomos } from '../components/landing/QuemSomos';
import { Services } from '../components/landing/Services';
import { SejaDigital } from '../components/landing/SejaDigital';
import { Contact } from '../components/landing/Contact';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { Loader } from '../components/common/Loader';
import { usePageLoader } from '../hooks/usePageLoader';
import { Code, Globe, Smartphone, Zap, Shield, Search, ArrowRight, Wrench } from 'lucide-react';
import { FadeIn } from '../components/common/FadeIn';

function DesenvolvimentoSites() {
  const partners = [
    { name: 'Real Driver', logo: '/partners/LogoRealDriver.png', bgColor: '#cfd7d5' },
    { name: 'Ariane Andrade', logo: '/partners/LogoArianeAndrade.png', bgColor: '#f9f9f9' },
    { name: 'Enxovais Maciel', logo: '/partners/LogoEnxovais_Maciel.png', bgColor: '#124234' },
    { name: 'Jato Minas', logo: '/partners/LogoJatoMinas.png', bgColor: '#f5f5f5' },
    { name: 'JM Soluções', logo: '/partners/LogoJM.png', bgColor: '#0a6899' },
  ];

  const webServices = [
    {
      icon: Globe,
      title: 'Sites Institucionais',
      description: 'Sites modernos e responsivos que representam sua marca de forma profissional.',
      features: ['Design Responsivo', 'SEO Otimizado', 'Performance Rápida'],
      color: 'from-blue-500/20 to-cyan-500/10',
      iconBg: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Smartphone,
      title: 'Aplicativos Web',
      description: 'Aplicações web interativas e funcionais para suas necessidades específicas.',
      features: ['Interface Intuitiva', 'Multiplataforma', 'Integração de APIs'],
      color: 'from-purple-500/20 to-pink-500/10',
      iconBg: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'E-commerce',
      description: 'Lojas virtuais completas com sistema de pagamento e painel administrativo.',
      features: ['Carrinho de Compras', 'Gateway de Pagamento', 'Painel Admin'],
      color: 'from-logo/20 to-logo-light/10',
      iconBg: 'from-logo to-logo-light',
    },
    {
      icon: Code,
      title: 'Sistemas Personalizados',
      description: 'Sistemas sob medida para otimizar processos e aumentar produtividade.',
      features: ['Solução Customizada', 'Banco de Dados', 'Relatórios'],
      color: 'from-orange-500/20 to-amber-500/10',
      iconBg: 'from-orange-500 to-amber-500',
    },
    {
      icon: Shield,
      title: 'Segurança e SSL',
      description: 'Certificados SSL e medidas de segurança para proteger seus dados.',
      features: ['HTTPS', 'Backup Automático', 'Monitoramento'],
      color: 'from-green-500/20 to-emerald-500/10',
      iconBg: 'from-green-500 to-emerald-500',
    },
    {
      icon: Search,
      title: 'Otimização SEO',
      description: 'Otimização para mecanismos de busca, aumentando sua visibilidade online.',
      features: ['Meta Tags', 'Sitemap', 'Google Analytics'],
      color: 'from-rose-500/20 to-red-500/10',
      iconBg: 'from-rose-500 to-red-500',
    },
  ];

  const technologies = ['React', 'TypeScript', 'Node.js', 'PHP', 'WordPress', 'MySQL', 'Git'];

  const processSteps = [
    {
      step: '01',
      title: 'Análise e Planejamento',
      description: 'Entendemos suas necessidades e definimos a melhor estratégia',
    },
    {
      step: '02',
      title: 'Design e Prototipagem',
      description: 'Criamos o design visual e protótipos interativos para aprovação',
    },
    {
      step: '03',
      title: 'Desenvolvimento',
      description: 'Programamos seu site com as melhores práticas e tecnologias',
    },
    {
      step: '04',
      title: 'Lançamento e Suporte',
      description: 'Publicamos seu site e oferecemos suporte contínuo',
    },
  ];

  return (
    <>
      {/* Hero da seção */}
      <section
        id="desenvolvimento-de-sites"
        className="relative bg-[#0D0D10] py-20 sm:py-24 lg:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-logo/6 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.8}>
            <div className="text-center mb-14 sm:mb-16 lg:mb-20">
              <div className="inline-flex items-center space-x-2 bg-logo/10 border border-logo/20 text-logo-light px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5 sm:mb-6">
                <Wrench className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Web Development</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 sm:mb-6">
                Desenvolvimento{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-logo to-logo-light">
                  de Sites
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Criamos sites modernos, rápidos e otimizados que impulsionam seu negócio na internet.
                Do design à programação, entregamos soluções completas e profissionais.
              </p>
            </div>
          </FadeIn>

          {/* Web Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-16 sm:mb-20">
            {webServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <FadeIn key={index} delay={index * 80} duration={0.6}>
                  <div
                    className={`group relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 sm:p-7 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden hover:border-logo/20`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                    />
                    <div className="relative z-10">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${service.iconBg} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{service.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4">{service.description}</p>
                      <ul className="space-y-2">
                        {service.features.map((f, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-gray-400">
                            <span className="text-logo text-sm flex-shrink-0">✓</span>
                            <span className="text-xs sm:text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Process Steps */}
          <FadeIn delay={0} duration={0.8}>
            <div className="text-center mb-10 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">
                Nosso Processo
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Trabalhamos de forma organizada e transparente para entregar o melhor resultado
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20">
            {processSteps.map((item, index) => (
              <FadeIn key={index} delay={index * 80} duration={0.6}>
                <div className="text-center group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-logo to-logo-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl sm:text-2xl font-black">{item.step}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Technologies */}
          <FadeIn delay={0} duration={0.8}>
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Tecnologias que Utilizamos</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                As melhores tecnologias do mercado para garantir qualidade e performance
              </p>
            </div>
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-16 sm:mb-20">
            {technologies.map((tech, index) => (
              <FadeIn key={index} delay={index * 60} duration={0.4}>
                <div className="bg-white/5 border border-logo/15 rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-300 font-medium hover:bg-logo/10 hover:text-white hover:border-logo/30 transition-all duration-300 cursor-default">
                  {tech}
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Partners */}
          <FadeIn delay={0} duration={0.8}>
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Nossos Parceiros</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Trabalhamos com empresas de diferentes segmentos para oferecer as melhores soluções
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-12">
            {partners.map((partner, index) => (
              <FadeIn key={index} delay={index * 60} duration={0.5}>
                <div
                  className="flex items-center justify-center p-4 sm:p-5 rounded-2xl border border-logo/10 hover:border-logo/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-logo/10"
                  style={{ backgroundColor: partner.bgColor, minHeight: '80px' }}
                >
                  {partner.logo && (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-12 sm:max-h-16 max-w-full object-contain"
                    />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          {/* CTA */}
          <FadeIn delay={0} duration={0.8}>
            <div className="bg-gradient-to-br from-logo/10 to-logo-dark/5 border border-logo/20 rounded-3xl p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
                Pronto para ter seu site profissional?
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-xl mx-auto">
                Entre em contato e vamos transformar sua ideia em realidade
              </p>
              <a
                href="#contato"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-logo to-logo-light text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-logo/30"
              >
                <span>Solicitar Orçamento</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export function Home() {
  const isLoading = usePageLoader();

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      {isLoading && <Loader />}
      <Header />
      <main>
        <Hero />
        <QuemSomos />
        <Services />
        <DesenvolvimentoSites />
        <SejaDigital />
        <Contact />
      </main>
      <WhatsAppButton />
    </div>
  );
}
