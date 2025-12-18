import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Calendar, X, Edit, Trash2, Eye, CheckCircle2, Circle, Clock, User, FileText } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  client: string;
  description?: string;
  leader: {
    name: string;
    role: 'Líder de Projeto' | 'Gerente';
    avatar: string;
    phone: string;
    email: string;
  };
  deadline: string;
  tasks: {
    completed: number;
    total: number;
  };
  status: 'active' | 'completed' | 'on-hold';
}

interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assignedTo: string;
  dueDate: string;
}

export default function Projetos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Dados de exemplo - Projetos
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'Site Institucional Empresa ABC',
      client: 'Empresa ABC',
      description: 'Desenvolvimento de site institucional completo com sistema de gestão de conteúdo.',
      leader: {
        name: 'Lara Silva',
        role: 'Líder de Projeto',
        avatar: 'https://ui-avatars.com/api/?name=Lara+Silva&background=AC8869&color=fff&size=128',
        phone: '(27) 99999-1111',
        email: 'lara@todaarte.com.br'
      },
      deadline: '09 Jan 2025',
      tasks: { completed: 6, total: 10 },
      status: 'active'
    },
    {
      id: 2,
      name: 'Campanha de Marketing Digital',
      client: 'Startup XYZ',
      description: 'Criação de campanha completa para lançamento de produto.',
      leader: {
        name: 'Ana Costa',
        role: 'Gerente',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=C9A882&color=fff&size=128',
        phone: '(27) 99999-2222',
        email: 'ana@todaarte.com.br'
      },
      deadline: '10 Jan 2025',
      tasks: { completed: 4, total: 10 },
      status: 'active'
    },
    {
      id: 3,
      name: 'Rebranding Consultoria Premium',
      client: 'Consultoria Premium',
      description: 'Redesign completo da identidade visual e materiais gráficos.',
      leader: {
        name: 'Lara Silva',
        role: 'Líder de Projeto',
        avatar: 'https://ui-avatars.com/api/?name=Lara+Silva&background=AC8869&color=fff&size=128',
        phone: '(27) 99999-1111',
        email: 'lara@todaarte.com.br'
      },
      deadline: '12 Jan 2025',
      tasks: { completed: 8, total: 10 },
      status: 'active'
    },
    {
      id: 4,
      name: 'E-commerce Fashion Store',
      client: 'Fashion Store',
      description: 'Desenvolvimento de loja virtual completa com integração de pagamento.',
      leader: {
        name: 'Ana Costa',
        role: 'Gerente',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=C9A882&color=fff&size=128',
        phone: '(27) 99999-2222',
        email: 'ana@todaarte.com.br'
      },
      deadline: '13 Jan 2025',
      tasks: { completed: 3, total: 10 },
      status: 'active'
    },
  ]);

  // Dados de exemplo - Tarefas
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, projectId: 1, title: 'Criar wireframes do site', description: 'Desenvolver wireframes de todas as páginas principais', status: 'done', assignedTo: 'Lara Silva', dueDate: '05 Jan 2025' },
    { id: 2, projectId: 1, title: 'Desenvolver página inicial', description: 'Implementar design responsivo da homepage', status: 'in_progress', assignedTo: 'Lara Silva', dueDate: '08 Jan 2025' },
    { id: 3, projectId: 1, title: 'Configurar formulário de contato', description: 'Integrar formulário com sistema de email', status: 'todo', assignedTo: 'Lara Silva', dueDate: '10 Jan 2025' },
    { id: 4, projectId: 1, title: 'Criar área administrativa', description: 'Sistema de gestão de conteúdo', status: 'todo', assignedTo: 'Lara Silva', dueDate: '12 Jan 2025' },
    { id: 5, projectId: 1, title: 'Testes de usabilidade', description: 'Realizar testes com usuários finais', status: 'todo', assignedTo: 'Ana Costa', dueDate: '15 Jan 2025' },
    { id: 6, projectId: 2, title: 'Criar calendário de posts', description: 'Planejamento de conteúdo para 3 meses', status: 'done', assignedTo: 'Ana Costa', dueDate: '03 Jan 2025' },
    { id: 7, projectId: 2, title: 'Produzir conteúdo visual', description: 'Criação de imagens e vídeos para campanha', status: 'in_progress', assignedTo: 'Lara Silva', dueDate: '08 Jan 2025' },
    { id: 8, projectId: 2, title: 'Configurar anúncios', description: 'Setup de campanhas no Google Ads e Facebook', status: 'todo', assignedTo: 'Ana Costa', dueDate: '12 Jan 2025' },
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.leader.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
    }
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  const progressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjects(projects.filter(p => p.id !== id));
      setTasks(tasks.filter(t => t.projectId !== id));
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('kanban');
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData } as Project : p));
    } else {
      const newProject: Project = {
        id: Math.max(...projects.map(p => p.id)) + 1,
        name: projectData.name || '',
        client: projectData.client || '',
        description: projectData.description || '',
        leader: projectData.leader || {
          name: 'Lara Silva',
          role: 'Líder de Projeto',
          avatar: 'https://ui-avatars.com/api/?name=Lara+Silva&background=AC8869&color=fff&size=128',
          phone: '(27) 99999-1111',
          email: 'lara@todaarte.com.br'
        },
        deadline: projectData.deadline || '',
        tasks: { completed: 0, total: 0 },
        status: projectData.status || 'active'
      };
      setProjects([...projects, newProject]);
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleCreateTask = (projectId: number) => {
    setEditingTask(null);
    setSelectedProject(projects.find(p => p.id === projectId) || null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const task = tasks.find(t => t.id === id);
      setTasks(tasks.filter(t => t.id !== id));
      if (task && selectedProject) {
        const projectTasks = tasks.filter(t => t.projectId === task.projectId);
        const completed = projectTasks.filter(t => t.status === 'done').length;
        const total = projectTasks.length - 1;
        setProjects(projects.map(p => 
          p.id === task.projectId 
            ? { ...p, tasks: { completed, total } }
            : p
        ));
      }
    }
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    const projectId = selectedProject?.id || taskData.projectId || editingTask?.projectId || 0;
    
    if (editingTask) {
      const updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t);
      setTasks(updatedTasks);
      
      // Atualizar contador de tarefas do projeto
      const projectTasks = updatedTasks.filter(t => t.projectId === projectId);
      const completed = projectTasks.filter(t => t.status === 'done').length;
      setProjects(projects.map(p => 
        p.id === projectId 
          ? { ...p, tasks: { completed, total: projectTasks.length } }
          : p
      ));
    } else {
      const newTask: Task = {
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
        projectId,
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'todo',
        assignedTo: taskData.assignedTo || 'Lara Silva',
        dueDate: taskData.dueDate || ''
      };
      setTasks([...tasks, newTask]);
      
      // Atualizar contador de tarefas do projeto
      const projectTasks = [...tasks, newTask].filter(t => t.projectId === projectId);
      const completed = projectTasks.filter(t => t.status === 'done').length;
      setProjects(projects.map(p => 
        p.id === projectId 
          ? { ...p, tasks: { completed, total: projectTasks.length } }
          : p
      ));
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleMoveTask = (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    // Atualizar contador de tarefas
    const task = updatedTasks.find(t => t.id === taskId);
    if (task) {
      const projectTasks = updatedTasks.filter(t => t.projectId === task.projectId);
      const completed = projectTasks.filter(t => t.status === 'done').length;
      setProjects(projects.map(p => 
        p.id === task.projectId 
          ? { ...p, tasks: { completed, total: projectTasks.length } }
          : p
      ));
    }
  };

  if (viewMode === 'kanban' && selectedProject) {
    const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
    const todoTasks = projectTasks.filter(t => t.status === 'todo');
    const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress');
    const doneTasks = projectTasks.filter(t => t.status === 'done');

    return (
      <KanbanView
        project={selectedProject}
        todoTasks={todoTasks}
        inProgressTasks={inProgressTasks}
        doneTasks={doneTasks}
        onBack={() => {
          setViewMode('grid');
          setSelectedProject(null);
        }}
        onCreateTask={() => handleCreateTask(selectedProject.id)}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onMoveTask={handleMoveTask}
        showTaskModal={showTaskModal}
        setShowTaskModal={setShowTaskModal}
        editingTask={editingTask}
        onSaveTask={handleSaveTask}
        selectedProject={selectedProject}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Título e Botão Adicionar Projeto */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Projetos</h1>
        <button 
          onClick={handleCreateProject}
          className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium" 
          style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }} 
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #9A7859 0%, #B99872 50%, #C4A886 100%)'} 
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)'}
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Projeto</span>
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
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
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none bg-white cursor-pointer"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            >
              <option value="all">Selecionar Status</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="on-hold">Em Pausa</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none bg-white cursor-pointer"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            >
              <option value="recent">Ordenar por Últimos 7 Dias</option>
              <option value="deadline">Ordenar por Prazo</option>
              <option value="name">Ordenar por Nome</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            progressPercentage={progressPercentage}
            onView={() => handleViewProject(project)}
            onEdit={() => handleEditProject(project)}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>

      {/* Modal de Projeto */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, progressPercentage, onView, onEdit, onDelete }: { 
  project: Project; 
  progressPercentage: (completed: number, total: number) => number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const progress = progressPercentage(project.tasks.completed, project.tasks.total);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden">
      {/* Gradiente de fundo sutil */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-50 rounded-tl-full transform translate-x-8 translate-y-8" style={{ background: 'linear-gradient(135deg, rgba(172, 136, 105, 0.1) 0%, rgba(201, 168, 130, 0.08) 50%, rgba(212, 184, 150, 0.06) 100%)' }}></div>
      
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={onView}>
          <img
            src={project.leader.avatar}
            alt={project.leader.name}
            className="w-12 h-12 rounded-full border-2 border-white shadow-md flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{project.leader.name}</p>
            <p className="text-xs text-gray-500">{project.leader.role}</p>
          </div>
        </div>
        <div className="relative">
          <button 
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Detalhes</span>
              </button>
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
        </div>
      </div>

      {/* Prazo */}
      <div className="mb-4 relative z-10" onClick={onView}>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Prazo</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-1">{project.deadline}</p>
      </div>

      {/* Contato */}
      <div className="space-y-2 mb-4 relative z-10" onClick={onView}>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Phone className="w-3.5 h-3.5" />
          <span>{project.leader.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate">{project.leader.email}</span>
        </div>
      </div>

      {/* Progresso de Tarefas */}
      <div className="relative z-10" onClick={onView}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tarefas</span>
          <span className="text-sm font-semibold text-gray-900">
            {project.tasks.completed}/{project.tasks.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function KanbanView({ 
  project, 
  todoTasks, 
  inProgressTasks, 
  doneTasks, 
  onBack,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  showTaskModal,
  setShowTaskModal,
  editingTask,
  onSaveTask,
  selectedProject
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.client}</p>
          </div>
        </div>
        <button
          onClick={onCreateTask}
          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium"
          style={{ background: 'linear-gradient(135deg, #AC8869 0%, #C9A882 50%, #D4B896 100%)' }}
        >
          <Plus className="w-5 h-5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* A Fazer */}
        <KanbanColumn
          title="A Fazer"
          icon={<Circle className="w-5 h-5" />}
          tasks={todoTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onMove={(taskId) => onMoveTask(taskId, 'in_progress')}
          moveLabel="Mover para Em Andamento"
          color="#7A5C3A"
        />

        {/* Em Andamento */}
        <KanbanColumn
          title="Em Andamento"
          icon={<Clock className="w-5 h-5" />}
          tasks={inProgressTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onMove={(taskId, direction) => {
            if (direction === 'left') onMoveTask(taskId, 'todo');
            else onMoveTask(taskId, 'done');
          }}
          moveLabel="Mover"
          color="#AC8869"
        />

        {/* Concluído */}
        <KanbanColumn
          title="Concluído"
          icon={<CheckCircle2 className="w-5 h-5" />}
          tasks={doneTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onMove={(taskId) => onMoveTask(taskId, 'in_progress')}
          moveLabel="Mover para Em Andamento"
          color="#C9A882"
        />
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          project={selectedProject}
          onClose={() => {
            setShowTaskModal(false);
          }}
          onSave={onSaveTask}
        />
      )}
    </div>
  );
}

function KanbanColumn({ title, icon, tasks, onEdit, onDelete, onMove, moveLabel, color }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div style={{ color }}>{icon}</div>
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task: Task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task.id)}
            onMove={onMove}
            moveLabel={moveLabel}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onMove, moveLabel }: any) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
              {onMove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>{moveLabel}</span>
                </button>
              )}
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
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3" />
          <span>{task.assignedTo}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    client: project?.client || '',
    description: project?.description || '',
    deadline: project?.deadline || '',
    status: project?.status || 'active',
    leaderName: project?.leader?.name || 'Lara Silva',
    leaderRole: project?.leader?.role || 'Líder de Projeto',
    leaderPhone: project?.leader?.phone || '(27) 99999-1111',
    leaderEmail: project?.leader?.email || 'lara@todaarte.com.br',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      leader: {
        name: formData.leaderName,
        role: formData.leaderRole as 'Líder de Projeto' | 'Gerente',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.leaderName)}&background=AC8869&color=fff&size=128`,
        phone: formData.leaderPhone,
        email: formData.leaderEmail,
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {project ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ '--tw-ring-color': '#AC8869' } as React.CSSProperties}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input
                type="text"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder="Ex: 15 Jan 2025"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              >
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="on-hold">Em Pausa</option>
              </select>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Líder do Projeto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <select
                  value={formData.leaderRole}
                  onChange={(e) => setFormData({ ...formData, leaderRole: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                    e.currentTarget.style.borderColor = '#AC8869';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  <option value="Líder de Projeto">Líder de Projeto</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.leaderPhone}
                  onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
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
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData({ ...formData, leaderEmail: e.target.value })}
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
            </div>
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
              {project ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskModal({ task, project, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    assignedTo: task?.assignedTo || 'Lara Silva',
    dueDate: task?.dueDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      projectId: project?.id,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                  e.currentTarget.style.borderColor = '#AC8869';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="done">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input
                type="text"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                placeholder="Ex: 15 Jan 2025"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(172, 136, 105, 0.2)';
                e.currentTarget.style.borderColor = '#AC8869';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            >
              <option value="Lara Silva">Lara Silva</option>
              <option value="Ana Costa">Ana Costa</option>
            </select>
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
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
