import React, { useState } from 'react';
import { Globe, CheckCircle, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { FadeIn } from '../common/FadeIn';

interface Category {
  id: string;
  name: string;
  questions: { id: string; question: string; options: { value: number; label: string }[] }[];
}

const categories: Category[] = [
  {
    id: 'redes-sociais',
    name: 'Redes Sociais',
    questions: [
      {
        id: 'presenca',
        question: 'Em quantas redes sociais sua empresa está presente?',
        options: [
          { value: 0, label: 'Nenhuma' },
          { value: 25, label: '1-2 redes' },
          { value: 50, label: '3-4 redes' },
          { value: 100, label: '5 ou mais redes' }
        ]
      },
      {
        id: 'frequencia',
        question: 'Com que frequência você posta conteúdo?',
        options: [
          { value: 0, label: 'Raramente ou nunca' },
          { value: 25, label: '1-2 vezes por semana' },
          { value: 50, label: '3-5 vezes por semana' },
          { value: 100, label: 'Diariamente ou mais' }
        ]
      },
      {
        id: 'engajamento',
        question: 'Qual o nível de engajamento nas suas redes?',
        options: [
          { value: 0, label: 'Muito baixo, quase nenhuma interação' },
          { value: 33, label: 'Baixo, poucas interações' },
          { value: 66, label: 'Médio, interações regulares' },
          { value: 100, label: 'Alto, muita interação e engajamento' }
        ]
      }
    ]
  },
  {
    id: 'site',
    name: 'Site',
    questions: [
      {
        id: 'existe',
        question: 'Você possui site?',
        options: [
          { value: 0, label: 'Não tenho site' },
          { value: 50, label: 'Tenho site básico' },
          { value: 100, label: 'Tenho site profissional e otimizado' }
        ]
      },
      {
        id: 'responsivo',
        question: 'Seu site é responsivo (funciona bem no celular)?',
        options: [
          { value: 0, label: 'Não sei / Não tenho site' },
          { value: 50, label: 'Parcialmente responsivo' },
          { value: 100, label: 'Totalmente responsivo' }
        ]
      },
      {
        id: 'velocidade',
        question: 'Como avalia a velocidade do seu site?',
        options: [
          { value: 0, label: 'Muito lento' },
          { value: 33, label: 'Lento' },
          { value: 66, label: 'Razoável' },
          { value: 100, label: 'Rápido' }
        ]
      }
    ]
  },
  {
    id: 'seo',
    name: 'SEO',
    questions: [
      {
        id: 'otimizacao',
        question: 'Seu site está otimizado para busca no Google?',
        options: [
          { value: 0, label: 'Não sei o que é SEO' },
          { value: 33, label: 'Parcialmente otimizado' },
          { value: 66, label: 'Bem otimizado' },
          { value: 100, label: 'Totalmente otimizado com estratégia SEO' }
        ]
      },
      {
        id: 'conteudo',
        question: 'Você produz conteúdo para melhorar seu posicionamento?',
        options: [
          { value: 0, label: 'Não produzo conteúdo' },
          { value: 50, label: 'Produzo esporadicamente' },
          { value: 100, label: 'Produzo conteúdo regularmente com estratégia' }
        ]
      }
    ]
  }
];

export function AvaliacaoPresencaOnline() {
  const [step, setStep] = useState<'form' | 'questions' | 'result'>('form');
  const [formData, setFormData] = useState({ name: '', whatsapp: '', lgpd: false });
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.whatsapp && formData.lgpd) {
      setStep('questions');
    }
  };

  const handleAnswer = (value: number) => {
    const category = categories[currentCategory];
    const question = category.questions[currentQuestion];
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < category.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
      setCurrentQuestion(0);
    } else {
      calculateScores(newAnswers);
      setStep('result');
    }
  };

  const calculateScores = (finalAnswers: Record<string, number>) => {
    const newScores: Record<string, number> = {};
    categories.forEach(category => {
      const categoryAnswers = category.questions
        .map(q => finalAnswers[q.id] || 0)
        .filter(v => v !== undefined);
      const avg = categoryAnswers.length > 0
        ? categoryAnswers.reduce((sum, val) => sum + val, 0) / categoryAnswers.length
        : 0;
      newScores[category.id] = Math.round(avg);
    });
    setScores(newScores);
  };

  const getScoreLevel = (score: number) => {
    if (score < 30) return { level: 'Baixo', color: '#EF4444' };
    if (score < 70) return { level: 'Médio', color: '#F59E0B' };
    return { level: 'Alto', color: '#10B981' };
  };

  const getTotalScore = () => {
    const values = Object.values(scores);
    return values.length > 0 ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length) : 0;
  };

  if (step === 'form') {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0} duration={0.6}>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-logo to-logo-light rounded-full mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Avaliação de Presença Online
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Avalie sua presença digital em redes sociais, site e SEO
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="presenca-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="presenca-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-logo focus:border-logo transition-all"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="presenca-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="presenca-whatsapp"
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
                    id="presenca-lgpd"
                    required
                    checked={formData.lgpd}
                    onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                    className="mt-1 h-4 w-4 text-logo focus:ring-logo border-gray-300 rounded"
                  />
                  <label htmlFor="presenca-lgpd" className="ml-3 text-sm text-gray-600">
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
    const category = categories[currentCategory];
    const question = category.questions[currentQuestion];
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = categories.slice(0, currentCategory).reduce((sum, cat) => sum + cat.questions.length, 0) + currentQuestion;
    const progress = ((answeredQuestions + 1) / totalQuestions) * 100;

    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {category.name} - Pergunta {currentQuestion + 1} de {category.questions.length}
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

  const totalScore = getTotalScore();
  const totalLevel = getScoreLevel(totalScore);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: `${totalLevel.color}20` }}>
              {totalScore < 50 ? (
                <AlertCircle className="h-10 w-10" style={{ color: totalLevel.color }} />
              ) : (
                <CheckCircle className="h-10 w-10" style={{ color: totalLevel.color }} />
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Score Geral: {totalScore}%
            </h2>
            <p className="text-lg text-gray-600">Nível: {totalLevel.level}</p>
          </div>

          <div className="space-y-6 mb-8">
            {categories.map((category) => {
              const score = scores[category.id] || 0;
              const level = getScoreLevel(score);
              return (
                <div key={category.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <span className="text-2xl font-bold" style={{ color: level.color }}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, backgroundColor: level.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-logo to-logo-light rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Quer melhorar sua presença online?
            </h3>
            <p className="text-white/90 mb-4">
              Nossa equipe pode ajudar você a fortalecer sua presença digital!
            </p>
            <a
              href={`https://wa.me/553196101939?text=Olá!%20Fiz%20a%20Avaliação%20de%20Presença%20Online%20e%20obtive%20${totalScore}%25.%20Gostaria%20de%20saber%20como%20melhorar!`}
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
                setCurrentCategory(0);
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
