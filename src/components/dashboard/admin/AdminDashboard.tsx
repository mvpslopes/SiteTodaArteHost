import React from 'react';
import { TrendingUp, Users, FolderOpen, DollarSign } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';

export function AdminDashboard() {
  const { projects, financials } = useData();

  const stats = [
    {
      title: 'Projetos Ativos',
      value: projects.filter(p => p.status !== 'completed').length,
      icon: FolderOpen,
      color: 'from-logo to-logo-light',
      change: '+12%'
    },
    {
      title: 'Receita do Mês',
      value: `R$ ${financials
        .filter(f => f.type === 'income' && new Date(f.date).getMonth() === new Date().getMonth())
        .reduce((sum, f) => sum + f.amount, 0)
        .toLocaleString()}`,
      icon: DollarSign,
      color: 'from-logo to-logo-light',
      change: '+8%'
    },
    {
      title: 'Clientes Ativos',
      value: new Set(projects.map(p => p.clientId)).size,
      icon: Users,
      color: 'from-logo to-logo-light',
      change: '+3%'
    },
    {
      title: 'Taxa de Aprovação',
      value: '94%',
      icon: TrendingUp,
      color: 'from-logo to-logo-light',
      change: '+2%'
    }
  ];

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral do desempenho da sua agência</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Projetos Recentes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-logo to-logo-light rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.clientName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'approved' ? 'bg-green-100 text-green-800' :
                    project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'approved' ? 'Aprovado' :
                     project.status === 'review' ? 'Em Revisão' :
                     project.status === 'in_progress' ? 'Em Andamento' :
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
        </div>
      </div>
    </div>
  );
}