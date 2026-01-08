import React, { useState } from 'react';
import { Palette, CheckCircle, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

const questions = [
  {
    id: 'logo',
    question: 'Você possui logotipo profissional?',
    options: [
      { value: 0, label: 'Não tenho logotipo' },
      { value: 25, label: 'Tenho, mas não é profissional' },
      { value: 50, label: 'Tenho logotipo básico' },
      { value: 100, label: 'Tenho logotipo profissional e bem desenvolvido' }
    ]
  },
  {
    id: 'manual',
    question: 'Você possui manual de identidade visual (brandbook)?',
    options: [
      { value: 0, label: 'Não sei o que é isso' },
      { value: 25, label: 'Não tenho' },
      { value: 50, label: 'Tenho algo básico' },
      { value: 100, label: 'Tenho manual completo e detalhado' }
    ]
  },
  {
    id: 'consistencia',
    question: 'Como avalia a consistência da sua marca?',
    options: [
      { value: 0, label: 'Não tenho consistência, uso cores e fontes diferentes' },
      { value: 33, label: 'Tenho alguma consistência, mas não sigo sempre' },
      { value: 66, label: 'Sigo padrões na maioria das vezes' },
      { value: 100, label: 'Tenho total consistência em todas as aplicações' }
    ]
  },
  {
    id: 'aplicacoes',
    question: 'Onde sua marca é aplicada?',
    options: [
      { value: 0, label: 'Apenas em alguns lugares' },
      { value: 25, label: 'Site e redes sociais básicas' },
      { value: 50, label: 'Site, redes sociais e materiais impressos básicos' },
      { value: 100, label: 'Todas as aplicações: digital, impresso, embalagens, uniformes, etc.' }
    ]
  },
  {
    id: 'reconhecimento',
    question: 'As pessoas reconhecem sua marca facilmente?',
    options: [
      { value: 0, label: 'Não, minha marca não é reconhecida' },
      { value: 33, label: 'Parcialmente reconhecida' },
      { value: 66, label: 'Bem reconhecida no meu nicho' },
      { value: 100, label: 'Muito reconhecida e memorável' }
    ]
  },
  {
    id: 'variacoes',
    question: 'Você tem variações do seu logotipo?',
    options: [
      { value: 0, label: 'Não, tenho apenas uma versão' },
      { value: 33, label: 'Tenho algumas variações básicas' },
      { value: 66, label: 'Tenho variações para diferentes aplicações' },
      { value: 100, label: 'Tenho sistema completo de variações (horizontal, vertical, ícone, etc.)' }
    ]
  }
];

export function ScoreIdentidadeVisual() {
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
    if (score < 30) return { level: 'Fraca', color: '#EF4444', description: 'Sua identidade visual precisa de atenção. Há muito potencial para crescimento!' };
    if (score < 70) return { level: 'Boa', color: '#F59E0B', description: 'Você tem uma base, mas ainda há oportunidades de fortalecer sua marca.' };
    return { level: 'Excelente', color: '#10B981', description: 'Parabéns! Sua identidade visual está bem desenvolvida.' };
  };

  const getRecommendations = () => {
    const level = getScoreLevel().level;
    if (level === 'Fraca') {
      return [
        'Criar logotipo profissional',
        'Desenvolver manual de identidade visual',
        'Definir paleta de cores e tipografia',
        'Criar variações do logotipo'
      ];
    }
    if (level === 'Boa') {
      return [
        'Refinar manual de identidade visual',
        'Garantir consistência em todas as aplicações',
        'Criar mais variações e aplicações',
        'Fortalecer reconhecimento da marca'
      ];
    }
    return [
      'Manter consistência',
      'Explorar novas aplicações',
      'Atualizar conforme necessário',
      'Expandir presença da marca'
    ];
  };

  if (step === 'form') {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-logo to-logo-light rounded-full mb-4">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Score de Identidade Visual
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Avalie a força e consistência da identidade visual da sua marca
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="identidade-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="identidade-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="identidade-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="identidade-whatsapp"
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
                    id="identidade-lgpd"
                    required
                    checked={formData.lgpd}
                    onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                    className="mt-1 h-4 w-4 text-logo focus:ring-logo border-gray-300 rounded"
                  />
                  <label htmlFor="identidade-lgpd" className="ml-3 text-sm text-gray-600">
                    Concordo com a coleta e tratamento dos meus dados pessoais conforme a{' '}
                    <a href="#" className="text-logo hover:underline">LGPD</a> *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-logo to-logo-light text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Iniciar Avaliação</span>
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
              Seu Score: {score}% - {scoreLevel.level}
            </h2>
            <p className="text-lg text-gray-600 mb-6">{scoreLevel.description}</p>

            <div className="max-w-md mx-auto">
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
              Quer fortalecer sua identidade visual?
            </h3>
            <p className="text-white/90 mb-4">
              Nossa equipe pode ajudar você a criar ou melhorar a identidade visual da sua marca!
            </p>
            <a
              href={`https://wa.me/553196101939?text=Olá!%20Fiz%20o%20Score%20de%20Identidade%20Visual%20e%20obtive%20${score}%25%20(${scoreLevel.level}).%20Gostaria%20de%20saber%20mais!`}
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
              Fazer avaliação novamente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
