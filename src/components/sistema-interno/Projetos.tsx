import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function Projetos() {
  const [selectedProject, setSelectedProject] = useState<number | null>(1);

  const projects = [
    { id: 1, name: 'Site Institucional Empresa ABC', client: 'Empresa ABC', status: 'active' },
    { id: 2, name: 'Campanha de Marketing Digital', client: 'Startup XYZ', status: 'active' },
    { id: 3, name: 'Rebranding Consultoria Premium', client: 'Consultoria Premium', status: 'active' },
  ];

  const tasks = [
    { id: 1, projectId: 1, title: 'Criar wireframes do site', status: 'done', assignedTo: 'Lara' },
    { id: 2, projectId: 1, title: 'Desenvolver página inicial', status: 'in_progress', assignedTo: 'Lara' },
    { id: 3, projectId: 1, title: 'Configurar formulário de contato', status: 'todo', assignedTo: 'Lara' },
    { id: 4, projectId: 2, title: 'Criar calendário de posts', status: 'done', assignedTo: 'Lara' },
    { id: 5, projectId: 2, title: 'Produzir conteúdo visual', status: 'in_progress', assignedTo: 'Lara' },
  ];

  const projectTasks = tasks.filter(t => t.projectId === selectedProject);

  const todoTasks = projectTasks.filter(t => t.status === 'todo');
  const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress');
  const doneTasks = projectTasks.filter(t => t.status === 'done');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projetos e Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie projetos e acompanhe o progresso</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} />
          <span>Novo Projeto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lista de Projetos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-bold text-gray-900 mb-4">Projetos</h2>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedProject === project.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{project.client}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-3 gap-4">
            {/* A Fazer */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                  <Circle size={18} />
                  <span>A Fazer</span>
                </h3>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {todoTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={18} className="mx-auto" />
                </button>
              </div>
            </div>

            {/* Em Andamento */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                  <Clock size={18} />
                  <span>Em Andamento</span>
                </h3>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {inProgressTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={18} className="mx-auto" />
                </button>
              </div>
            </div>

            {/* Concluído */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>Concluído</span>
                </h3>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  {doneTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <p className="font-medium text-gray-900">{task.title}</p>
      <p className="text-sm text-gray-600 mt-2">Responsável: {task.assignedTo}</p>
    </div>
  );
}

