import React, { useState } from 'react';
import { Plus, Mail, Phone, Building, Edit, Trash2, X, MoreVertical } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  active: boolean;
}

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: 'João Silva', email: 'joao@empresa.com.br', phone: '(27) 99999-1111', company: 'Empresa ABC Ltda', active: true },
    { id: 2, name: 'Maria Santos', email: 'maria@startup.com.br', phone: '(27) 99999-2222', company: 'Startup XYZ', active: true },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@consultoria.com.br', phone: '(27) 99999-3333', company: 'Consultoria Premium', active: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleCreate = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleSave = (clientData: Partial<Client>) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...clientData } as Client : c));
    } else {
      const newClient: Client = {
        id: Math.max(0, ...clients.map(c => c.id)) + 1,
        name: clientData.name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        company: clientData.company || '',
        active: clientData.active !== undefined ? clientData.active : true,
      };
      setClients([...clients, newClient]);
    }
    setShowModal(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus clientes e seus projetos</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
          style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #9A7859 0%, #B99872 50%, #C4A886 100%)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)'}
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <ClientCard 
            key={client.id} 
            client={client}
            onEdit={() => handleEdit(client)}
            onDelete={() => handleDelete(client.id)}
          />
        ))}
      </div>

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => {
            setShowModal(false);
            setEditingClient(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ClientCard({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
          {client.company && (
            <p className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
              <Building size={14} />
              <span>{client.company}</span>
            </p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          )}
          <span 
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              client.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {client.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail size={16} />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone size={16} />
          <span>{client.phone}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        <button 
          onClick={onEdit}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ 
            background: 'rgba(172, 136, 105, 0.1)',
            color: '#AC8869'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(172, 136, 105, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(172, 136, 105, 0.1)';
          }}
        >
          Editar
        </button>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    active: client?.active !== undefined ? client.active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
                style={{ accentColor: '#AC8869' }}
              />
              <span className="text-sm text-gray-700">Cliente ativo</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
            >
              {client ? 'Salvar Alterações' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
