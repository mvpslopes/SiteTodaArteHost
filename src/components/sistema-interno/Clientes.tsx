import React from 'react';
import { Plus, Mail, Phone, Building } from 'lucide-react';

export default function Clientes() {
  const clients = [
    { id: 1, name: 'João Silva', email: 'joao@empresa.com.br', phone: '(27) 99999-1111', company: 'Empresa ABC Ltda', active: true },
    { id: 2, name: 'Maria Santos', email: 'maria@startup.com.br', phone: '(27) 99999-2222', company: 'Startup XYZ', active: true },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@consultoria.com.br', phone: '(27) 99999-3333', company: 'Consultoria Premium', active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus clientes e seus projetos</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                client.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {client.active ? 'Ativo' : 'Inativo'}
              </span>
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
              <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                Ver Projetos
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

