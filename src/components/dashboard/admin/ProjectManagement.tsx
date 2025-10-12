import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, MessageSquare } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Project } from '../../../types';

export function ProjectManagement() {
  const { projects, addProject, updateProject, addComment } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    addProject({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      images: [],
      status: 'pending',
      clientId: '2', // Mock client ID
      clientName: formData.get('clientName') as string,
      budget: Number(formData.get('budget')) || undefined,
      deadline: formData.get('deadline') as string || undefined
    });

    setShowAddForm(false);
  };

  const handleStatusChange = (projectId: string, newStatus: Project['status']) => {
    updateProject(projectId, { status: newStatus });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newComment.trim() || !user) return;

    addComment(selectedProject.id, {
      projectId: selectedProject.id,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      message: newComment.trim()
    });

    setNewComment('');
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Projetos</h1>
          <p className="text-gray-600">Gerencie todos os seus projetos em um só lugar</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="review">Em Revisão</option>
              <option value="approved">Aprovado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'approved' ? 'bg-green-100 text-green-800' :
                  project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                  project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'completed' ? 'bg-black/10 text-black' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'approved' ? 'Aprovado' :
                   project.status === 'review' ? 'Em Revisão' :
                   project.status === 'in_progress' ? 'Em Andamento' :
                   project.status === 'completed' ? 'Concluído' :
                   'Pendente'
                  }
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-medium">{project.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Categoria:</span>
                  <span className="font-medium">{project.category}</span>
                </div>
                {project.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Orçamento:</span>
                    <span className="font-medium">R$ {project.budget.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver</span>
                </button>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value as Project['status'])}
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="review">Em Revisão</option>
                  <option value="approved">Aprovado</option>
                  <option value="completed">Concluído</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Novo Projeto</h2>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Projeto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">Selecione...</option>
                    <option value="Branding">Branding</option>
                    <option value="Web Design">Web Design</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Design Gráfico">Design Gráfico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento (R$)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Criar Projeto
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                  <p className="text-gray-600">{selectedProject.clientName}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProject.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    selectedProject.status === 'completed' ? 'bg-black/10 text-black' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProject.status === 'approved' ? 'Aprovado' :
                     selectedProject.status === 'review' ? 'Em Revisão' :
                     selectedProject.status === 'in_progress' ? 'Em Andamento' :
                     selectedProject.status === 'completed' ? 'Concluído' :
                     'Pendente'
                    }
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Categoria</h4>
                  <p className="text-gray-600">{selectedProject.category}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentários</h3>
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {selectedProject.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{comment.userName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comment.userRole === 'admin' ? 'bg-black/10 text-black' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {comment.userRole === 'admin' ? 'Admin' : 'Cliente'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.message}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}