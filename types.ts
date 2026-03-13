import { ReactNode } from 'react';

export type PipelineStage = 'Novo Lead' | 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechado';

export interface Lead {
  id: number | string;
  name: string;
  company: string;
  status: PipelineStage;
  value: string;
  phone?: string;
  email?: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  // Mocked details for the view
  history?: { id: number, type: string, text: string, date: string }[];
  tasks?: { id: number, text: string, done: boolean }[];
  // Manual Entry Fields
  niche?: string;
  revenue?: string;
  growthGoal?: string;
  bottleneck?: string;
  estimatedBudget?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  // Detailed fields
  fullDescription?: string;
  painPoints?: string[];
  deliverables?: string[];
  ctaText?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum SectionId {
  HERO = 'home',
  ABOUT = 'about',
  SERVICES = 'services',
  PROCESS = 'process',
  WORK = 'work',
  RESULTS = 'results',
  TESTIMONIALS = 'testimonials',
  AI_CONSULTANT = 'ai-consultant',
  CONTACT = 'contact'
}

export type ProjectStatus = 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Pausado';

export interface Task {
  id: number | string;
  text: string;
  completed: boolean;
  assignee: string;
  dueDate?: string;
}

export interface Project {
  id: number | string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  tasksCompleted: number;
  tasksTotal: number;
  team: string[];
  budget: string;
  tasks: Task[];
  funnel_data?: any;
}

export interface Proposal {
  id: number | string;
  title: string;
  client: string;
  value: string;
  status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Rejeitada';
  date: string;
  validUntil: string;
  items: { description: string; price: number }[];
  // New Fields for Structured Proposal
  context?: {
    diagnosis: string;
    bottlenecks: string[];
    impact: string;
    opportunity: string;
  };
  solution?: {
    name: string;
    strategicDescription: string;
    whatWillBeBuilt: string[];
    howItSolves: string;
    expectedImpact: string;
  };
  scope?: string[];
  schedule?: { week: string; task: string }[];
  paymentTerms?: string;
  nextSteps?: string;
  shareToken?: string; // New field for public link 
}

export interface CalendarEvent {
  id: number | string;
  title: string;
  date: string; // ISO date string or YYYY-MM-DD
  type: string;
  color: string;
  time?: string;
  client_name?: string;
  client_phone?: string;
  notes?: string;
}