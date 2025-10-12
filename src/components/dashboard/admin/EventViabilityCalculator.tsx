import React, { useState, useEffect } from 'react';
import { Plus, Minus, Calculator, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiUrl } from '../../../config/api';

interface Cost {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
}

interface Revenue {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
}

interface Event {
  id: number;
  nome: string;
  data: string;
}

const COST_CATEGORIES = [
  'Locação',
  'Alimentação',
  'Decoração',
  'Som e Iluminação',
  'Segurança',
  'Marketing',
  'Transporte',
  'Outros'
];

const REVENUE_CATEGORIES = [
  'Ingressos',
  'Patrocínios',
  'Vendas',
  'Doações',
  'Outros'
];

export function EventViabilityCalculator() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [costForm, setCostForm] = useState({
    descricao: '',
    valor: '',
    categoria: ''
  });
  const [revenueForm, setRevenueForm] = useState({
    descricao: '',
    valor: '',
    categoria: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { user } = useAuth();

  // Buscar eventos
  useEffect(() => {
    fetchEvents();
  }, []);

  // Buscar custos e receitas quando evento for selecionado
  useEffect(() => {
    if (selectedEvent) {
      fetchCosts();
      fetchRevenues();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(apiUrl('/api/eventos'));
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const fetchCosts = async () => {
    if (!selectedEvent) return;
    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/custos`));
      const data = await response.json();
      setCosts(data);
    } catch (error) {
      console.error('Erro ao buscar custos:', error);
    }
  };

  const fetchRevenues = async () => {
    if (!selectedEvent) return;
    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/receitas`));
      const data = await response.json();
      setRevenues(data);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !costForm.descricao || !costForm.valor || !costForm.categoria) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/custos`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...costForm,
          valor: parseFloat(costForm.valor),
          usuario_id: user?.id,
          usuario_nome: user?.name
        })
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Custo adicionado com sucesso!' });
        setCostForm({ descricao: '', valor: '', categoria: '' });
        fetchCosts();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao adicionar custo.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao adicionar custo.' });
    }
    setLoading(false);
  };

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !revenueForm.descricao || !revenueForm.valor || !revenueForm.categoria) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/receitas`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...revenueForm,
          valor: parseFloat(revenueForm.valor),
          usuario_id: user?.id,
          usuario_nome: user?.name
        })
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Receita adicionada com sucesso!' });
        setRevenueForm({ descricao: '', valor: '', categoria: '' });
        fetchRevenues();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao adicionar receita.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao adicionar receita.' });
    }
    setLoading(false);
  };

  const handleDeleteCost = async (id: number) => {
    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/custos/${id}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Custo removido com sucesso!' });
        fetchCosts();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao remover custo.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao remover custo.' });
    }
  };

  const handleDeleteRevenue = async (id: number) => {
    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/receitas/${id}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Receita removida com sucesso!' });
        fetchRevenues();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao remover receita.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao remover receita.' });
    }
  };

  const totalCosts = costs.reduce((sum, cost) => sum + Number(cost.valor), 0);
  const totalRevenues = revenues.reduce((sum, revenue) => sum + Number(revenue.valor), 0);
  const finalBalance = totalRevenues - totalCosts;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-8 h-8 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-900">Calculadora de Viabilidade de Eventos</h1>
        </div>

        {/* Seleção de Evento */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Evento
          </label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(Number(e.target.value) || null)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um evento...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.nome} - {new Date(event.data).toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        </div>

        {!selectedEvent && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            Selecione um evento para começar a calcular a viabilidade.
          </div>
        )}

        {selectedEvent && (
          <>
            {/* Feedback */}
            {feedback && (
              <div className={`mb-6 p-4 rounded-lg ${
                feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {feedback.message}
              </div>
            )}

            {/* Formulários de Adição */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Adicionar Custo */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Custo</h2>
                <form onSubmit={handleAddCost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={costForm.categoria}
                      onChange={(e) => setCostForm({ ...costForm, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecionar categoria</option>
                      {COST_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Custo
                    </label>
                    <input
                      type="text"
                      value={costForm.descricao}
                      onChange={(e) => setCostForm({ ...costForm, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição do Custo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Custo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costForm.valor}
                      onChange={(e) => setCostForm({ ...costForm, valor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor do Custo (R$)"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-logo to-logo-light text-white px-4 py-2 rounded-md hover:brightness-110 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    {loading ? 'Adicionando...' : 'Adicionar Custo'}
                  </button>
                </form>
              </div>

              {/* Adicionar Receita */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Receita</h2>
                <form onSubmit={handleAddRevenue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={revenueForm.categoria}
                      onChange={(e) => setRevenueForm({ ...revenueForm, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecionar categoria</option>
                      {REVENUE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição da Receita
                    </label>
                    <input
                      type="text"
                      value={revenueForm.descricao}
                      onChange={(e) => setRevenueForm({ ...revenueForm, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição da Receita"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor da Receita (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={revenueForm.valor}
                      onChange={(e) => setRevenueForm({ ...revenueForm, valor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Valor da Receita (R$)"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-logo to-logo-light text-white px-4 py-2 rounded-md hover:brightness-110 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    {loading ? 'Adicionando...' : 'Adicionar Receita'}
                  </button>
                </form>
              </div>
            </div>

            {/* Tabelas de Custos e Receitas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Custos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Minus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Custos</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Descrição</th>
                        <th className="text-left py-2">Valor</th>
                        <th className="text-left py-2">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.map((cost) => (
                        <tr key={cost.id} className="border-b">
                          <td className="py-2">{cost.descricao}</td>
                          <td className="py-2">R$ {Number(cost.valor).toFixed(2)}</td>
                          <td className="py-2">
                            <button
                              onClick={() => handleDeleteCost(cost.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receitas */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Receitas</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Descrição</th>
                        <th className="text-left py-2">Valor</th>
                        <th className="text-left py-2">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenues.map((revenue) => (
                        <tr key={revenue.id} className="border-b">
                          <td className="py-2">{revenue.descricao}</td>
                          <td className="py-2">R$ {Number(revenue.valor).toFixed(2)}</td>
                          <td className="py-2">
                            <button
                              onClick={() => handleDeleteRevenue(revenue.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Dashboard Financeiro */}
            <div className="bg-gradient-to-r from-logo-light/20 to-logo/10 rounded-lg shadow-lg p-8 border border-logo-light/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total de Custos */}
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <DollarSign className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Total de Custos</h3>
                  <p className="text-2xl font-bold text-red-600">R$ {totalCosts.toFixed(2)}</p>
                </div>

                {/* Total de Receitas */}
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Total de Receitas</h3>
                  <p className="text-2xl font-bold text-green-600">R$ {totalRevenues.toFixed(2)}</p>
                </div>

                {/* Saldo Final */}
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className={`w-8 h-8 ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Saldo Final</h3>
                  <p className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {finalBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
