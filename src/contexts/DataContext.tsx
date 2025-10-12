import React, { createContext, useContext, useState } from 'react';
import { Project, PortfolioItem, Service, Financial, Comment } from '../types';

interface DataContextType {
  projects: Project[];
  portfolio: PortfolioItem[];
  services: Service[];
  financials: Financial[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addComment: (projectId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  addFinancial: (financial: Omit<Financial, 'id'>) => void;
  updateFinancial: (id: string, updates: Partial<Financial>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockPortfolio: PortfolioItem[] = [];
const mockServices: Service[] = [];
const mockProjects: Project[] = [];
const mockFinancials: Financial[] = [];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [portfolio] = useState<PortfolioItem[]>(mockPortfolio);
  const [services] = useState<Service[]>(mockServices);
  const [financials, setFinancials] = useState<Financial[]>(mockFinancials);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const addComment = (projectId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project =>
      project.id === projectId
        ? { ...project, comments: [...project.comments, newComment] }
        : project
    ));
  };

  const addFinancial = (financialData: Omit<Financial, 'id'>) => {
    const newFinancial: Financial = {
      ...financialData,
      id: Date.now().toString()
    };
    setFinancials(prev => [...prev, newFinancial]);
  };

  const updateFinancial = (id: string, updates: Partial<Financial>) => {
    setFinancials(prev => prev.map(financial =>
      financial.id === id ? { ...financial, ...updates } : financial
    ));
  };

  return (
    <DataContext.Provider value={{
      projects,
      portfolio,
      services,
      financials,
      addProject,
      updateProject,
      addComment,
      addFinancial,
      updateFinancial
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}