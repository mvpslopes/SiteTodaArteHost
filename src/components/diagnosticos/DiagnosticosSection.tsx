import React, { useState } from 'react';
import { TrendingUp, Calculator, Globe, Target, Palette, ArrowRight } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';
import { DiagnosticoMaturidadeDigital } from './DiagnosticoMaturidadeDigital';
import { CalculadoraROI } from './CalculadoraROI';
import { AvaliacaoPresencaOnline } from './AvaliacaoPresencaOnline';
import { DiagnosticoNecessidadesMarketing } from './DiagnosticoNecessidadesMarketing';
import { ScoreIdentidadeVisual } from './ScoreIdentidadeVisual';

type DiagnosticType = 'maturidade' | 'roi' | 'presenca' | 'necessidades' | 'identidade' | null;

const diagnosticos = [
  {
    id: 'maturidade' as DiagnosticType,
    icon: TrendingUp,
    title: 'Diagnóstico de Maturidade Digital',
    description: 'Descubra o nível de maturidade digital da sua empresa e receba recomendações personalizadas',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'roi' as DiagnosticType,
    icon: Calculator,
    title: 'Calculadora de ROI',
    description: 'Calcule o retorno sobre investimento do seu marketing digital',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'presenca' as DiagnosticType,
    icon: Globe,
    title: 'Avaliação de Presença Online',
    description: 'Avalie sua presença digital em redes sociais, site e SEO',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'necessidades' as DiagnosticType,
    icon: Target,
    title: 'Diagnóstico de Necessidades',
    description: 'Descubra quais serviços de marketing são ideais para o seu negócio',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'identidade' as DiagnosticType,
    icon: Palette,
    title: 'Score de Identidade Visual',
    description: 'Avalie a força e consistência da identidade visual da sua marca',
    color: 'from-pink-500 to-pink-600'
  }
];

export function DiagnosticosSection() {
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticType>(null);

  if (selectedDiagnostic === 'maturidade') {
    return <DiagnosticoMaturidadeDigital />;
  }
  if (selectedDiagnostic === 'roi') {
    return <CalculadoraROI />;
  }
  if (selectedDiagnostic === 'presenca') {
    return <AvaliacaoPresencaOnline />;
  }
  if (selectedDiagnostic === 'necessidades') {
    return <DiagnosticoNecessidadesMarketing />;
  }
  if (selectedDiagnostic === 'identidade') {
    return <ScoreIdentidadeVisual />;
  }

  return (
    <section id="diagnosticos" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn delay={0} duration={0.6}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ferramentas de Diagnóstico
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Utilize nossas ferramentas gratuitas para avaliar e melhorar sua presença digital
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {diagnosticos.map((diagnostico, index) => {
            const IconComponent = diagnostico.icon;
            return (
              <FadeIn key={diagnostico.id} delay={index * 100} duration={0.6}>
                <button
                  onClick={() => setSelectedDiagnostic(diagnostico.id)}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left group w-full"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${diagnostico.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-logo transition-colors">
                    {diagnostico.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {diagnostico.description}
                  </p>
                  <div className="flex items-center text-logo font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Começar agora</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                </button>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={500} duration={0.6}>
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Todas as ferramentas são gratuitas e não requerem cadastro prévio
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Seus dados estão protegidos pela LGPD</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
