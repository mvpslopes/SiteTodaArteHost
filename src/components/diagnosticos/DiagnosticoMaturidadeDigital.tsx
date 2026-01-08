import React, { useState } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

interface Question {
  id: string;
  question: string;
  options: { value: number; label: string }[];
}

const questions: Question[] = [
  {
    id: 'site',
    question: 'Você possui site institucional ou e-commerce?',
    options: [
      { value: 0, label: 'Não tenho site' },
      { value: 25, label: 'Tenho site, mas está desatualizado' },
      { value: 50, label: 'Tenho site atualizado' },
      { value: 100, label: 'Tenho site otimizado e responsivo' }
    ]
  },
  {
    id: 'redes-sociais',
    question: 'Como está sua presença em redes sociais?',
    options: [
      { value: 0, label: 'Não tenho redes sociais' },
      { value: 25, label: 'Tenho, mas não posto regularmente' },
      { value: 50, label: 'Posto regularmente, mas sem estratégia' },
      { value: 100, label: 'Tenho estratégia definida e executo consistentemente' }
    ]
  },
  {
    id: 'conteudo',
    question: 'Você tem uma estratégia de conteúdo definida?',
    options: [
      { value: 0, label: 'Não, posto quando lembro' },
      { value: 25, label: 'Tenho algumas ideias, mas não sigo um plano' },
      { value: 50, label: 'Tenho um calendário básico de conteúdo' },
      { value: 100, label: 'Tenho calendário editorial completo e estratégia definida' }
    ]
  },
  {
    id: 'trafego-pago',
    question: 'Você investe em tráfego pago (anúncios)?',
    options: [
      { value: 0, label: 'Nunca investi' },
      { value: 25, label: 'Já tentei, mas não deu resultado' },
      { value: 50, label: 'Investo esporadicamente' },
      { value: 100, label: 'Investo regularmente e acompanho resultados' }
    ]
  },
  {
    id: 'identidade-visual',
    question: 'Como está sua identidade visual?',
    options: [
      { value: 0, label: 'Não tenho logotipo profissional' },
      { value: 25, label: 'Tenho logotipo, mas não uso consistentemente' },
      { value: 50, label: 'Tenho identidade visual básica' },
      { value: 100, label: 'Tenho identidade visual completa e manual de marca' }
    ]
  },
  {
    id: 'metricas',
    question: 'Você acompanha métricas e resultados?',
    options: [
      { value: 0, label: 'Não acompanho nenhuma métrica' },
      { value: 25, label: 'Olho esporadicamente' },
      { value: 50, label: 'Acompanho algumas métricas básicas' },
      { value: 100, label: 'Tenho relatórios completos e análise regular' }
    ]
  },
  {
    id: 'vendas-online',
    question: 'Você vende produtos ou serviços online?',
    options: [
      { value: 0, label: 'Não vendo online' },
      { value: 25, label: 'Vendo apenas por WhatsApp' },
      { value: 50, label: 'Tenho e-commerce básico' },
      { value: 100, label: 'Tenho e-commerce completo com integração de pagamentos' }
    ]
  },
  {
    id: 'whatsapp',
    question: 'Como você usa o WhatsApp para negócios?',
    options: [
      { value: 0, label: 'Uso apenas WhatsApp pessoal' },
      { value: 25, label: 'Tenho WhatsApp Business, mas uso básico' },
      { value: 50, label: 'Uso WhatsApp Business com catálogo' },
      { value: 100, label: 'Tenho WhatsApp Business otimizado com automações' }
    ]
  }
];

export function DiagnosticoMaturidadeDigital() {
  const [step, setStep] = useState<'form' | 'questions' | 'result'>('form');
  const [formData, setFormData] = useState({ name: '', whatsapp: '', lgpd: false });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.whatsapp && formData.lgpd) {
      setStep('questions');
    }
  };

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore(newAnswers);
      setStep('result');
    }
  };

  const calculateScore = (finalAnswers: Record<string, number>) => {
    const total = Object.values(finalAnswers).reduce((sum, val) => sum + val, 0);
    const maxScore = questions.length * 100;
    const percentage = Math.round((total / maxScore) * 100);
    setScore(percentage);
  };

  const getScoreLevel = () => {
    if (score < 30) return { level: 'Iniciante', color: '#EF4444', description: 'Sua empresa está começando a jornada digital. Há muito potencial para crescimento!' };
    if (score < 70) return { level: 'Intermediário', color: '#F59E0B', description: 'Você já tem uma base sólida, mas ainda há oportunidades de melhoria.' };
    return { level: 'Avançado', color: '#10B981', description: 'Parabéns! Sua empresa tem uma presença digital bem desenvolvida.' };
  };

  const getRecommendations = () => {
    const level = getScoreLevel().level;
    if (level === 'Iniciante') {
      return [
        'Criar identidade visual profissional',
        'Desenvolver site institucional',
        'Criar perfis nas principais redes sociais',
        'Estabelecer calendário de conteúdo básico'
      ];
    }
    if (level === 'Intermediário') {
      return [
        'Otimizar site para SEO',
        'Desenvolver estratégia de conteúdo mais robusta',
        'Investir em tráfego pago direcionado',
        'Implementar análise de métricas'
      ];
    }
    return [
      'Otimização avançada de campanhas',
      'Automação de marketing',
      'Expansão para novas plataformas',
      'Análise avançada de dados e IA'
    ];
  };

  if (step === 'form') {
    return (
      <section id="diagnostico" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-logo to-logo-light rounded-full mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Diagnóstico de Maturidade Digital
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Descubra o nível de maturidade digital da sua empresa e receba recomendações personalizadas
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
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
                    id="lgpd"
                    required
                    checked={formData.lgpd}
                    onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                    className="mt-1 h-4 w-4 text-logo focus:ring-logo border-gray-300 rounded"
                  />
                  <label htmlFor="lgpd" className="ml-3 text-sm text-gray-600">
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

  const scoreLevel = getScoreLevel();
  const recommendations = getRecommendations();

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: `${scoreLevel.color}20` }}>
              {score < 30 ? (
                <AlertCircle className="h-10 w-10" style={{ color: scoreLevel.color }} />
              ) : (
                <CheckCircle className="h-10 w-10" style={{ color: scoreLevel.color }} />
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Seu Resultado: {scoreLevel.level}
            </h2>
            <p className="text-lg text-gray-600 mb-6">{scoreLevel.description}</p>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                    style={{
                      width: `${score}%`,
                      background: `linear-gradient(to right, ${scoreLevel.color}, ${scoreLevel.color}dd)`
                    }}
                  >
                    <span className="text-white font-bold text-sm">{score}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recomendações Personalizadas</h3>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-logo flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-logo to-logo-light rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Quer melhorar seu score?
            </h3>
            <p className="text-white/90 mb-4">
              Nossa equipe está pronta para ajudar você a alcançar o próximo nível!
            </p>
            <a
              href={`https://wa.me/553196101939?text=Olá!%20Fiz%20o%20Diagnóstico%20de%20Maturidade%20Digital%20e%20obtive%20${score}%25%20(${scoreLevel.level}).%20Gostaria%20de%20saber%20mais%20sobre%20como%20melhorar!`}
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
