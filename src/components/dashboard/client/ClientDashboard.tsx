import React from 'react';
import { FolderOpen, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';

export function ClientDashboard() {
  const { projects } = useData();
  const { user } = useAuth();

  const clientProjects = projects.filter(p => p.clientId === user?.id);

  const stats = [
    {
      title: 'Projetos Ativos',
      value: clientProjects.filter(p => p.status !== 'completed').length,
      icon: FolderOpen,
      color: 'from-logo to-logo-light'
    },
    {
      title: 'Em Andamento',
      value: clientProjects.filter(p => p.status === 'in_progress').length,
      icon: Clock,
      color: 'from-logo to-logo-light'
    },
    {
      title: 'Concluídos',
      value: clientProjects.filter(p => p.status === 'completed').length,
      icon: CheckCircle,
      color: 'from-logo to-logo-light'
    },
    {
      title: 'Mensagens',
      value: clientProjects.reduce((sum, p) => sum + p.comments.length, 0),
      icon: MessageSquare,
      color: 'from-logo to-logo-light'
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-gray-600">Acompanhe o progresso dos seus projetos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Seus Projetos</h2>
        </div>
        <div className="p-6">
          {clientProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto ainda</h3>
              <p className="text-gray-600">Entre em contato conosco para iniciar seu primeiro projeto!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-logo to-logo-light rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'approved' ? 'bg-green-100 text-green-800' :
                      project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'completed' ? 'bg-black/10 text-black' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'approved' ? 'Aprovado' :
                       project.status === 'review' ? 'Aguardando Aprovação' :
                       project.status === 'in_progress' ? 'Em Andamento' :
                       project.status === 'completed' ? 'Concluído' :
                       'Pendente'
                      }
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}