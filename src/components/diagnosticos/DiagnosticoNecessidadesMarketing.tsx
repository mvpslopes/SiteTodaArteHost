import React, { useState } from 'react';
import { Target, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const questions = [
  {
    id: 'desafio',
    question: 'Qual é o seu maior desafio atual?',
    options: [
      { value: 'vendas', label: 'Aumentar vendas' },
      { value: 'visibilidade', label: 'Aumentar visibilidade da marca' },
      { value: 'engajamento', label: 'Aumentar engajamento nas redes sociais' },
      { value: 'conversao', label: 'Melhorar taxa de conversão' },
      { value: 'identidade', label: 'Criar/fortalecer identidade visual' }
    ]
  },
  {
    id: 'objetivo',
    question: 'Qual é o seu objetivo principal?',
    options: [
      { value: 'curto', label: 'Resultados rápidos (1-3 meses)' },
      { value: 'medio', label: 'Crescimento sustentável (3-6 meses)' },
      { value: 'longo', label: 'Construção de marca (6+ meses)' }
    ]
  },
  {
    id: 'orcamento',
    question: 'Qual o orçamento disponível mensalmente?',
    options: [
      { value: 'baixo', label: 'Até R$ 2.000' },
      { value: 'medio', label: 'R$ 2.000 - R$ 5.000' },
      { value: 'alto', label: 'R$ 5.000 - R$ 10.000' },
      { value: 'premium', label: 'Acima de R$ 10.000' }
    ]
  },
  {
    id: 'prazo',
    question: 'Qual a urgência para ver resultados?',
    options: [
      { value: 'baixa', label: 'Posso esperar alguns meses' },
      { value: 'media', label: 'Preciso ver resultados em 2-3 meses' },
      { value: 'alta', label: 'Preciso de resultados imediatos' }
    ]
  },
  {
    id: 'recursos',
    question: 'Você tem recursos internos para marketing?',
    options: [
      { value: 'nenhum', label: 'Não tenho equipe de marketing' },
      { value: 'basico', label: 'Tenho alguém que cuida esporadicamente' },
      { value: 'completo', label: 'Tenho equipe, mas preciso de suporte especializado' }
    ]
  }
];

const serviceRecommendations: Record<string, string[]> = {
  vendas: ['Tráfego Pago', 'Marketing para Vendas & Performance', 'Estratégia e Planejamento'],
  visibilidade: ['Marketing Digital', 'Identidade Visual', 'Produção de Conteúdo Visual'],
  engajamento: ['Marketing Digital', 'Produção de Conteúdo Visual', 'Estratégia e Planejamento'],
  conversao: ['Estratégia e Planejamento', 'Tráfego Pago', 'Marketing para Vendas & Performance'],
  identidade: ['Identidade Visual', 'Produção de Conteúdo Visual', 'Estratégia e Planejamento']
};

export function DiagnosticoNecessidadesMarketing() {
  const [step, setStep] = useState<'form' | 'questions' | 'result'>('form');
  const [formData, setFormData] = useState({ name: '', whatsapp: '', lgpd: false });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.whatsapp && formData.lgpd) {
      setStep('questions');
    }
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateRecommendations(newAnswers);
      setStep('result');
    }
  };

  const generateRecommendations = (finalAnswers: Record<string, string>) => {
    const desafio = finalAnswers.desafio || '';
    const recs = serviceRecommendations[desafio] || ['Estratégia e Planejamento', 'Marketing Digital'];
    setRecommendations(recs);
  };

  if (step === 'form') {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-logo to-logo-light rounded-full mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Diagnóstico de Necessidades de Marketing
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Descubra quais serviços de marketing são ideais para o seu negócio
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="necessidades-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="necessidades-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="necessidades-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="necessidades-whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="(31) 99999-9999"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="necessidades-lgpd"
                    required
                    checked={formData.lgpd}
                    onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                    className="mt-1 h-4 w-4 text-logo focus:ring-logo border-gray-300 rounded"
                  />
                  <label htmlFor="necessidades-lgpd" className="ml-3 text-sm text-gray-600">
                    Concordo com a coleta e tratamento dos meus dados pessoais conforme a{' '}
                    <a href="#" className="text-logo hover:underline">LGPD</a> *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-logo to-logo-light text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Iniciar Diagnóstico</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>
    );
  }

  if (step === 'questions') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Pergunta {currentQuestion + 1} de {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-logo to-logo-light h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-logo hover:bg-logo/5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                      {option.label}
                    </span>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-logo transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-logo to-logo-light rounded-full mb-4">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Plano Personalizado para Você
            </h2>
            <p className="text-lg text-gray-600">
              Com base nas suas respostas, recomendamos estes serviços:
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {recommendations.map((service, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-logo/10 to-logo-light/10 rounded-xl border border-logo/20"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-logo to-logo-light rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{service}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-logo to-logo-light rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Pronto para começar?
            </h3>
            <p className="text-white/90 mb-4">
              Nossa equipe está pronta para criar uma estratégia personalizada para o seu negócio!
            </p>
            <a
              href={`https://wa.me/553196101939?text=Olá!%20Fiz%20o%20Diagnóstico%20de%20Necessidades%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20serviços%20recomendados!`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-logo px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Falar com Especialista</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setStep('form');
                setCurrentQuestion(0);
                setAnswers({});
                setFormData({ name: '', whatsapp: '', lgpd: false });
              }}
              className="text-logo hover:underline font-medium"
            >
              Fazer diagnóstico novamente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
