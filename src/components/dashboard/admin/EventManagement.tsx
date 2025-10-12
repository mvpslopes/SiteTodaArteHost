import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Download, Upload, FileText, Save } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiUrl } from '../../../config/api';

interface Event {
  id: number;
  nome: string;
  data: string;
  criado_em: string;
}

interface EventFormData {
  nome: string;
  data: string;
}

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    nome: '',
    data: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { user } = useAuth();

  // Buscar eventos
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(apiUrl('/api/eventos'));
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.data) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/eventos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          usuario_id: user?.id,
          usuario_nome: user?.name
        })
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Evento salvo com sucesso!' });
        setFormData({ nome: '', data: '' });
        fetchEvents();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao salvar evento.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao salvar evento.' });
    }
    setLoading(false);
  };

  const handleExportEvents = async () => {
    try {
      const response = await fetch(apiUrl('/api/eventos/export'));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eventos.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao exportar eventos.' });
    }
  };

  const handleExportPDF = async () => {
    if (!selectedEvent) {
      setFeedback({ type: 'error', message: 'Selecione um evento para exportar.' });
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/eventos/${selectedEvent}/pdf`));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evento_${selectedEvent}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao exportar PDF.' });
    }
  };

  const handleImportEvents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    fetch(apiUrl('/api/eventos/import'), {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setFeedback({ type: 'success', message: 'Eventos importados com sucesso!' });
        fetchEvents();
      } else {
        setFeedback({ type: 'error', message: 'Erro ao importar eventos.' });
      }
    })
    .catch(error => {
      setFeedback({ type: 'error', message: 'Erro ao importar eventos.' });
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestão de Eventos</h1>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg ${
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Formulário de Criação de Evento */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Criar Novo Evento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Evento
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do Evento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Evento
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-logo to-logo-light text-white px-6 py-2 rounded-md hover:brightness-110 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Evento'}
            </button>
          </form>
        </div>

        {/* Gestão de Eventos Salvos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Eventos Salvos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Evento
              </label>
              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(Number(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um evento...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nome} - {new Date(event.data).toLocaleDateString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportEvents}
              className="bg-gradient-to-r from-logo to-logo-light text-white px-4 py-2 rounded-md hover:brightness-110 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4" />
              Exportar Eventos
            </button>

            <button
              onClick={handleExportPDF}
              disabled={!selectedEvent}
              className="bg-gradient-to-r from-logo to-logo-light text-white px-4 py-2 rounded-md hover:brightness-110 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
            </button>

            <label className="bg-gradient-to-r from-logo to-logo-light text-white px-4 py-2 rounded-md hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
              <Upload className="w-4 h-4" />
              Importar Eventos
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportEvents}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

