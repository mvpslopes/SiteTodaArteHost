import React, { useState } from 'react';
import { Eye, MessageSquare, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Project } from '../../../types';

export function ClientProjects() {
  const { projects, updateProject, addComment } = useData();
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newComment, setNewComment] = useState('');

  const clientProjects = projects.filter(p => p.clientId === user?.id);

  const handleProjectAction = (projectId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'approved' : 'pending';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Projetos</h1>
        <p className="text-gray-600">Acompanhe e aprove o progresso dos seus projetos</p>
      </div>

      {clientProjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum projeto ainda</h3>
          <p className="text-gray-600 mb-6">Entre em contato conosco para iniciar seu primeiro projeto!</p>
          <button className="bg-gradient-to-r from-logo to-logo-light hover:brightness-110 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Solicitar Orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientProjects.map((project) => (
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
                     project.status === 'review' ? 'Aguardando Aprovação' :
                     project.status === 'in_progress' ? 'Em Andamento' :
                     project.status === 'completed' ? 'Concluído' :
                     'Pendente'
                    }
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Categoria:</span>
                    <span className="font-medium">{project.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Última atualização:</span>
                    <span className="font-medium">
                      {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {project.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Prazo:</span>
                      <span className="font-medium">
                        {new Date(project.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 bg-gradient-to-r from-logo to-logo-light hover:brightness-110 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Ver Detalhes</span>
                  </button>

                  {project.status === 'review' && (
                    <>
                      <button
                        onClick={() => handleProjectAction(project.id, 'approve')}
                        className="bg-gradient-to-r from-logo to-logo-light hover:brightness-110 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Aprovar</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction(project.id, 'reject')}
                        className="bg-gradient-to-r from-logo to-logo-light hover:brightness-110 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>Rejeitar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  <p className="text-gray-600">{selectedProject.category}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição do Projeto</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Status Atual</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProject.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    selectedProject.status === 'completed' ? 'bg-black/10 text-black' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProject.status === 'approved' ? 'Aprovado por você' :
                     selectedProject.status === 'review' ? 'Aguardando sua aprovação' :
                     selectedProject.status === 'in_progress' ? 'Em desenvolvimento' :
                     selectedProject.status === 'completed' ? 'Projeto concluído' :
                     'Aguardando início'
                    }
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Última Atualização</h4>
                  <p className="text-gray-600">
                    {new Date(selectedProject.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {selectedProject.status === 'review' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Ação Necessária</h4>
                  <p className="text-yellow-700 mb-4">
                    Este projeto está pronto para sua revisão. Por favor, analise o trabalho e nos informe se está aprovado.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        handleProjectAction(selectedProject.id, 'approve');
                        setSelectedProject(null);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Aprovar Projeto</span>
                    </button>
                    <button
                      onClick={() => {
                        handleProjectAction(selectedProject.id, 'reject');
                        setSelectedProject(null);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>Solicitar Ajustes</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversas do Projeto</h3>
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {selectedProject.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
                  ) : (
                    selectedProject.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{comment.userName}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              comment.userRole === 'admin' ? 'bg-black/10 text-black' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {comment.userRole === 'admin' ? 'Toda Arte' : 'Você'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar um comentário..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-logo to-logo-light hover:brightness-110 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 shadow-lg hover:shadow-xl"
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