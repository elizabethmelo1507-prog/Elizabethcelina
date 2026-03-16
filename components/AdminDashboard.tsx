import React, { useState, useMemo, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    LogOut,
    TrendingUp,
    DollarSign,
    Bell,
    Search,
    MoreVertical,
    Calendar,
    Plus,
    Link,
    LayoutGrid,
    List,
    Filter,
    Phone,
    Mail,
    CheckSquare,
    Clock,
    AlertCircle,
    ChevronRight,
    MoreHorizontal,
    ChevronLeft,
    ChevronDown,
    CheckCircle2,
    Circle,
    Paperclip,
    ClipboardList,
    MessageSquare,
    FileText,
    CreditCard,
    FileCheck,
    Wallet,
    Download,
    Link as LinkIcon,
    PieChart as PieChartIcon,
    Heart,
    Smile,
    Meh,
    Frown,
    Video,
    History,
    AlertTriangle,
    ThumbsUp,
    UserCheck,
    ArrowLeft,
    Send,
    XCircle,
    Check,
    Bot,
    Sparkles,
    X,
    Loader2,
    RefreshCw,
    Info,
    Trash2,
    FileSignature,
    UserPlus,
    Eye,
    Share2,
    PenTool,
    Printer,
    Feather,
    Box,
    Layers,
    ShieldCheck,
    MapPin,
    Smartphone,
    User,
    Cake,
    Save,
    Target,
    Rocket,
    PlayCircle,
    CheckCircle,
    Zap
} from 'lucide-react';
import { sendMessageToOpenAI } from '../services/openaiService';
import { supabase } from '../services/supabase';
import { ChatMessage, Lead, PipelineStage, Project, Task, ProjectStatus, Proposal } from '../types';

export interface Briefing {
    id: string;
    client_name: string;
    client_email?: string;
    status: 'pending' | 'completed';
    maturity_score?: number;
    responses: Record<string, any>;
    created_at: string;
}

import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { FunnelVisualizer } from './FunnelVisualizer';

interface AdminDashboardProps {
    onLogout: () => void;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

// Types - Projects
// types are now imported from ../types

// Types - Finance
interface Invoice {
    id: number;
    client: string;
    description: string;
    amount: string;
    dueDate: string;
    status: 'Paga' | 'Enviada' | 'Atrasada' | 'Aguardando';
    type: 'Recorrente' | 'Pontual';
    paymentMethod?: 'PIX' | 'Cartão' | string;
    contractId?: number | string;
    source?: 'contract'; // marks auto-created from public contract viewer
    isSplitPayment?: boolean;        // true if 50/50 format
    secondHalfAmount?: string;       // the second 50% amount (formatted)
    clientPhone?: string;            // client WhatsApp for second charge
    secondHalfCharged?: boolean;     // true once second half charge was sent
}

// Types - Contracts
type ContractStatus = 'Ativo' | 'Rascunho' | 'Assinado' | 'Expirado';

interface ContractItem {
    id: number;
    description: string;
    price: number;
}

interface Contract {
    id: number;
    title: string;
    client: string;
    // Detailed Client Data
    clientFullName?: string;
    clientCPF?: string;
    clientAddress?: string;
    clientDob?: string;
    // New fields
    clientCompany?: string;       // empresa do cliente
    clientResponsible?: string;   // responsável legal
    clientPhone?: string;
    clientEmail?: string;
    deliveryDeadline?: string;    // prazo estimado de entrega
    excludedScope?: string;       // o que NÃO está incluso
    paymentTerms?: string;        // condições de pagamento
    lateFine?: string;            // multa por atraso
    acceptanceDays?: string;      // dias para aceite final

    value: string;
    items: ContractItem[];
    startDate: string;
    endDate: string;
    status: ContractStatus;
    type: 'Recorrente' | 'Projeto Único';
    signedDate?: string;
}

// Types - CS
interface ClientHistory {
    id: number;
    date: string;
    type: 'Reunião' | 'Email' | 'Nota' | 'Call';
    title: string;
    description: string;
}

interface Client {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
    healthScore: 1 | 2 | 3; // 1 = Low (Red), 2 = Medium (Yellow), 3 = High (Green)
    ltv: string;
    since: string;
    contractEnd: string;
    status: 'Ativo' | 'Risco';
    nextAction: 'Nenhuma' | 'Renovar' | 'Upsell' | 'Recuperar';
    history: ClientHistory[];
}

// Types - Onboarding
interface OnboardingStep {
    id: number;
    title: string;
    completed: boolean;
}

interface OnboardingProcess {
    id: number;
    client: string;
    clientEmail?: string;
    clientPhone?: string;
    stage: 'Kickoff' | 'Configuração' | 'Treinamento' | 'Go-Live';
    progress: number;
    startDate: string;
    steps: OnboardingStep[];
}

// Helper to generate dates relative to today for demo purposes
const getDynamicDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Check if contract is expiring in next 30 days
const checkContractStatus = (dateStr: string): boolean => {
    const months: { [key: string]: number } = { 'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5, 'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11 };
    const [monthName, yearStr] = dateStr.split(' ');

    if (!monthName || !yearStr) return false;

    const month = months[monthName];
    const year = parseInt(yearStr);

    const expiryDate = new Date(year, month + 1, 0); // End of that month
    const today = new Date();
    const warningWindow = new Date();
    warningWindow.setDate(today.getDate() + 30); // 30 days from now

    // Returns true if expiry date is within the next 30 days or already passed (but not ancient)
    return expiryDate <= warningWindow && expiryDate >= new Date(today.getFullYear(), today.getMonth() - 1, 1);
};

// Initial Data - Projects
const initialProjects: Project[] = [
    {
        id: 1,
        name: 'Funil Imobiliária Luxo',
        client: 'Luxe Estate',
        description: 'Implementação de funil de vendas high-ticket para captação de leads qualificados.',
        status: 'Em Andamento',
        progress: 60,
        deadline: '15/06',
        tasksCompleted: 3,
        tasksTotal: 5,
        team: ['EC', 'JD'],
        budget: '12k',
        tasks: [
            { id: 101, text: 'Definição de Persona', completed: true, assignee: 'EC', dueDate: '2024-05-20' },
            { id: 102, text: 'Design da Landing Page', completed: true, assignee: 'JD', dueDate: '2024-05-25' },
            { id: 103, text: 'Configuração do CRM', completed: true, assignee: 'EC', dueDate: '2024-06-01' },
            { id: 104, text: 'Automação de E-mails', completed: false, assignee: 'EC', dueDate: '2024-06-10' },
            { id: 105, text: 'Integração com WhatsApp', completed: false, assignee: 'JD', dueDate: '2024-06-15' },
        ]
    },
    {
        id: 2,
        name: 'CRM Fintech Personalizado',
        client: 'Nexus',
        description: 'Desenvolvimento de CRM SPA com React e Node.js para gestão de pipeline.',
        status: 'Atrasado',
        progress: 66,
        deadline: '10/06',
        tasksCompleted: 2,
        tasksTotal: 3,
        team: ['EC'],
        budget: '25k',
        tasks: [
            { id: 201, text: 'Modelagem do Banco de Dados', completed: true, assignee: 'EC' },
            { id: 202, text: 'API Backend', completed: true, assignee: 'EC' },
            { id: 203, text: 'Frontend Dashboard', completed: false, assignee: 'EC' },
        ]
    },
];

// Initial Data - Finance
const initialInvoices: Invoice[] = [
    { id: 1, client: 'Luxe Estate', description: 'Parcela 1/3 - Funil', amount: '4.000', dueDate: '15/06', status: 'Enviada', type: 'Pontual' },
    { id: 2, client: 'Nexus', description: 'Manutenção Mensal', amount: '2.500', dueDate: '10/06', status: 'Atrasada', type: 'Recorrente' },
];

// Initial Data - Contracts
const initialContracts: Contract[] = [
    {
        id: 1,
        title: 'Prestação de Serviços de Marketing',
        client: 'Luxe Estate',
        value: '12.000',
        items: [
            { id: 1, description: 'Gestão de Tráfego', price: 5000 },
            { id: 2, description: 'Social Media (12 posts/mês)', price: 4000 },
            { id: 3, description: 'Consultoria Estratégica', price: 3000 }
        ],
        startDate: '01/05/2024',
        endDate: '01/05/2025',
        status: 'Ativo',
        type: 'Recorrente',
        clientFullName: 'Luxe Estate Holdings Ltda',
        clientCPF: '12.345.678/0001-90',
        clientAddress: 'Av. Paulista, 1000 - SP',
        clientDob: '1985-05-15'
    },
    {
        id: 2,
        title: 'Desenvolvimento de Software (CRM)',
        client: 'Nexus',
        value: '25.000',
        items: [
            { id: 1, description: 'Desenvolvimento Backend', price: 15000 },
            { id: 2, description: 'Desenvolvimento Frontend', price: 10000 }
        ],
        startDate: '10/04/2024',
        endDate: '10/07/2024',
        status: 'Ativo',
        type: 'Projeto Único',
        clientFullName: 'Nexus Tecnologia S.A.',
        clientCPF: '98.765.432/0001-10',
        clientAddress: 'Rua da Inovação, 500 - SC',
        clientDob: '1990-10-20'
    },
    {
        id: 3,
        title: 'Automação WhatsApp',
        client: 'Clínica Sorrir',
        value: '8.000',
        items: [
            { id: 1, description: 'Setup da API', price: 2000 },
            { id: 2, description: 'Construção do Fluxo de Conversa', price: 6000 }
        ],
        startDate: '01/06/2024',
        endDate: '30/06/2024',
        status: 'Rascunho',
        type: 'Projeto Único',
        clientFullName: 'Dr. Fernando Sorrir',
        clientCPF: '111.222.333-44',
        clientAddress: 'Av. Saúde, 123 - Centro',
        clientDob: '1978-03-12'
    },
];

// Initial Data - CS
const initialClients: Client[] = [
    {
        id: 1,
        name: 'Roberto Almeida',
        company: 'TechFinance',
        email: 'rob@tech.com',
        phone: '(11) 9999-9999',
        healthScore: 3,
        ltv: '45.000',
        since: 'Jan 2023',
        contractEnd: getDynamicDate(180), // 6 months from now
        status: 'Ativo',
        nextAction: 'Upsell',
        history: [
            { id: 1, date: '10/05', type: 'Reunião', title: 'Review Trimestral', description: 'Cliente muito satisfeito com os resultados do CRM. Sugerir módulo de automação.' }
        ]
    },
    {
        id: 2,
        name: 'Juliana Paes',
        company: 'Beleza Natural',
        email: 'ju@beleza.com',
        phone: '(11) 9888-8888',
        healthScore: 2,
        ltv: '12.500',
        since: 'Mar 2024',
        contractEnd: getDynamicDate(15), // EXPIRES IN 15 DAYS (Triggers Bell)
        status: 'Ativo',
        nextAction: 'Renovar',
        history: [
            { id: 3, date: '15/05', type: 'Call', title: 'Alinhamento de Expectativa', description: 'Cliente sentiu falta de mais posts nos stories. Ajustado cronograma.' }
        ]
    }
];

// --- Chat Formatting Helpers ---
const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const formatAiResponse = (text: string) => {
    return text.split('\n').map((line, index) => {
        // Headers (###)
        if (line.startsWith('### ')) {
            const content = line.replace('### ', '');
            return (
                <h3 key={index} className="text-brand-lime font-bold mt-4 mb-2 text-sm uppercase tracking-wide border-b border-white/10 pb-1">
                    {parseBold(content)}
                </h3>
            );
        }

        // List items (* or -)
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            return (
                <div key={index} className="flex items-start gap-2 ml-1 mb-1">
                    <span className="text-brand-lime mt-1.5 w-1 h-1 rounded-full bg-brand-lime shrink-0 block"></span>
                    <span className="text-gray-300 leading-relaxed">{parseBold(content)}</span>
                </div>
            );
        }

        // Numbered lists (1. )
        if (/^\d+\.\s/.test(line.trim())) {
            const match = line.trim().match(/^(\d+\.)\s(.*)/);
            if (match) {
                const number = match[1];
                const content = match[2];
                return (
                    <div key={index} className="flex items-start gap-2 ml-1 mb-1">
                        <span className="text-brand-lime font-bold text-xs mt-0.5">{number}</span>
                        <span className="text-gray-300 leading-relaxed">{parseBold(content)}</span>
                    </div>
                );
            }
        }

        // Empty lines
        if (line.trim() === '') {
            return <div key={index} className="h-2"></div>;
        }

        // Normal text
        return <p key={index} className="mb-2 text-gray-200 leading-relaxed">{parseBold(line)}</p>;
    });
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, leads, setLeads }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'projects' | 'finance' | 'clients' | 'contracts' | 'onboarding' | 'proposals' | 'calendar' | 'briefings' | 'automations'>('overview');
    const [automationLeadId, setAutomationLeadId] = useState<string>('');
    const [automationClientId, setAutomationClientId] = useState<string>('');
    const [publicContactLinkCopied, setPublicContactLinkCopied] = useState(false);

    // Calendar State
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Briefing State
    const [briefings, setBriefings] = useState<Briefing[]>([]);
    const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
    const [isAnalyzingBriefing, setIsAnalyzingBriefing] = useState(false);
    const [isBriefingLinkModalOpen, setIsBriefingLinkModalOpen] = useState(false);
    const [selectedLeadForBriefingLink, setSelectedLeadForBriefingLink] = useState<Lead | null>(null);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Leads State
    const [crmView, setCrmView] = useState<'kanban' | 'list'>('kanban');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', company: '', value: '', status: 'Novo Lead' as PipelineStage });
    const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);
    const [noteInput, setNoteInput] = useState('');
    const [taskInput, setTaskInput] = useState('');
    const [isTaskInputVisible, setIsTaskInputVisible] = useState(false);

    // Projects State
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', client: '', deadline: '', budget: '', description: '', team: '' });

    // Project Task Management State
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // Finance State
    const [invoices, setInvoices] = useState<Invoice[]>(() => {
        try {
            // Merge initial invoices with any pending ones saved by PublicContractViewer
            const saved = localStorage.getItem('ec_pending_invoices');
            const pending: Invoice[] = saved ? JSON.parse(saved) : [];
            // Avoid duplicates by id
            const allIds = new Set(initialInvoices.map(i => i.id));
            const newOnes = pending.filter(p => !allIds.has(p.id));
            return [...newOnes, ...initialInvoices];
        } catch {
            return initialInvoices;
        }
    });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', description: '', type: 'Pontual' });
    const financialGoal = 100000;

    // Contracts State
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
    const [newContract, setNewContract] = useState({
        title: '',
        client: '',
        clientFullName: '',
        clientCPF: '',
        clientAddress: '',
        clientDob: '',
        clientPhone: '',
        clientEmail: '',
        clientCep: '',
        clientCity: '',
        clientState: '',
        clientCompany: '',
        clientResponsible: '',
        deliveryDeadline: '',
        excludedScope: 'Gestão comercial diária, produção de conteúdo, gestão de tráfego pago, alterações estruturais após aprovação final, suporte ilimitado e treinamento contínuo.',
        paymentTerms: '50% no início e 50% na entrega final.',
        lateFine: '2% ao mês sobre o valor em aberto.',
        acceptanceDays: '5',
        startDate: '',
        endDate: '',
        type: 'Projeto Único'
    });
    const [contractItems, setContractItems] = useState<{ description: string, price: string }[]>([{ description: '', price: '' }]);

    // Contract Action & View State
    const [selectedContractForAction, setSelectedContractForAction] = useState<Contract | null>(null);

    // Calendar Custom Events State
    const [customCalendarEvents, setCustomCalendarEvents] = useState<any[]>([]);
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        meetingMode: 'privada',
        client_name: '',
        client_phone: '',
        notes: '',
        type: 'Reunião',
        color: 'bg-brand-lime/20 text-brand-lime border-brand-lime/30'
    });
    const [viewDigitalContract, setViewDigitalContract] = useState<Contract | null>(null);

    // Onboarding State
    const [onboardingProcesses, setOnboardingProcesses] = useState<OnboardingProcess[]>(() => {
        try {
            const stored = localStorage.getItem('ec_onboarding_processes');
            if (stored) return JSON.parse(stored);
        } catch { }
        return [
            {
                id: 1,
                client: 'Luxe Estate',
                stage: 'Configuração',
                progress: 45,
                startDate: '10/06/2024',
                steps: [
                    { id: 1, title: 'Reunião de Kickoff', completed: true },
                    { id: 2, title: 'Acesso às Contas', completed: true },
                    { id: 3, title: 'Configuração do CRM', completed: false },
                    { id: 4, title: 'Treinamento da Equipe', completed: false },
                    { id: 5, title: 'Lançamento Oficial', completed: false }
                ]
            },
            {
                id: 2,
                client: 'TechNova',
                stage: 'Kickoff',
                progress: 10,
                startDate: '18/06/2024',
                steps: [
                    { id: 1, title: 'Reunião de Kickoff', completed: true },
                    { id: 2, title: 'Acesso às Contas', completed: false },
                    { id: 3, title: 'Configuração do CRM', completed: false },
                    { id: 4, title: 'Treinamento da Equipe', completed: false },
                    { id: 5, title: 'Lançamento Oficial', completed: false }
                ]
            }
        ]
    });

    useEffect(() => {
        localStorage.setItem('ec_onboarding_processes', JSON.stringify(onboardingProcesses));
    }, [onboardingProcesses]);

    const handleDeleteOnboarding = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este processo de onboarding? Essa ação não pode ser desfeita.')) {
            setOnboardingProcesses(prev => prev.filter(p => p.id !== id));
            if (selectedOnboardingProcess?.id === id) {
                setSelectedOnboardingProcess(null);
            }
        }
    };

    // Onboarding New Process State
    const [isNewOnboardingModalOpen, setIsNewOnboardingModalOpen] = useState(false);
    const [selectedOnboardingProcess, setSelectedOnboardingProcess] = useState<OnboardingProcess | null>(null);
    const [newOnboardingClient, setNewOnboardingClient] = useState('');
    const [isSigning, setIsSigning] = useState(false);

    // Proposals State
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);

    // Initial load: Fetch from Supabase
    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching proposals:', error);
        } else {
            // Map Supabase data (which might be in full_data) back to Proposal[]
            const mapped: Proposal[] = data.map(dbProp => {
                if (dbProp.full_data) {
                    return { ...dbProp.full_data, id: dbProp.id };
                }
                // Fallback for legacy rows or partial data
                return {
                    id: dbProp.id,
                    title: dbProp.title || 'Sem título',
                    client: dbProp.company_name || 'N/A',
                    value: dbProp.price?.toString() || '0',
                    status: dbProp.status === 'approved' ? 'Aprovada' : 
                            dbProp.status === 'rejected' ? 'Rejeitada' : 
                            dbProp.status === 'sent' ? 'Enviada' : 'Rascunho',
                    date: new Date(dbProp.created_at).toLocaleDateString('pt-BR'),
                    validUntil: '', 
                    items: []
                };
            });
            setProposals(mapped);
        }
    };

    const syncProposal = async (proposal: Proposal): Promise<Proposal> => {
        const dbData = {
            title: proposal.title,
            company_name: proposal.client,
            price: Number(proposal.value?.toString().replace(/\./g, '').replace(',', '.')) || 0,
            status: proposal.status === 'Aprovada' ? 'approved' : 
                    proposal.status === 'Rejeitada' ? 'rejected' : 
                    proposal.status === 'Enviada' ? 'sent' : 'draft',
            full_data: proposal
        };

        const isUUID = (id: any) => typeof id === 'string' && id.length > 20;

        if (isUUID(proposal.id)) {
            const { error } = await supabase
                .from('proposals')
                .update(dbData)
                .eq('id', proposal.id);
            if (error) console.error('Error updating proposal:', error);
            return proposal;
        } else {
            const { data, error } = await supabase
                .from('proposals')
                .insert([dbData])
                .select();
            
            if (error) {
                console.error('Error inserting proposal:', error);
                return proposal;
            } else if (data && data[0]) {
                const updated = { ...proposal, id: data[0].id };
                setProposals(prev => prev.map(p => p.id === proposal.id ? updated : p));
                return updated;
            }
            return proposal;
        }
    };

    const deleteProposalFromDb = async (proposalId: string | number) => {
        const isUUID = (id: any) => typeof id === 'string' && id.length > 20;
        
        if (isUUID(proposalId)) {
            const { error } = await supabase
                .from('proposals')
                .delete()
                .eq('id', proposalId);
            if (error) console.error('Error deleting proposal:', error);
        }
        setProposals(prev => prev.filter(p => p.id !== proposalId));
    };


    // Initial empty state for a new proposal
    const initialProposalState: Partial<Proposal> = {
        title: '',
        client: '',
        value: '',
        setupPrice: 0,
        monthlyPrice: 0,
        items: [],
        context: { diagnosis: '', bottlenecks: [], impact: '', opportunity: '' },
        solution: { name: '', strategicDescription: '', whatWillBeBuilt: [], howItSolves: '', expectedImpact: '' },
        scope: [],
        // schedule: [], // Removed to avoid type issues with schedule being optional in Proposal
        paymentTerms: '',
        nextSteps: ''
    };

    const [newProposal, setNewProposal] = useState<Partial<Proposal>>(initialProposalState);
    const [viewProposal, setViewProposal] = useState<Proposal | null>(null);

    const generateShareLink = (proposal: Proposal) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/proposta.html?proposal_id=${proposal.id}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Link copiado para a área de transferência!');
    };

    // Helper state for adding items to arrays in the form
    const [tempBottleneck, setTempBottleneck] = useState('');
    const [tempBuiltItem, setTempBuiltItem] = useState('');
    const [tempScopeItem, setTempScopeItem] = useState('');
    const [tempScheduleWeek, setTempScheduleWeek] = useState('');
    const [tempScheduleTask, setTempScheduleTask] = useState('');

    // Contract Modal Logic Extensions
    const [contractMode, setContractMode] = useState<'renewal' | 'new_lead'>('renewal');
    const [selectedLeadForContract, setSelectedLeadForContract] = useState<Lead | null>(null);

    // CS State
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // AI Copilot State
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const aiChatRef = useRef<HTMLDivElement>(null);

    // Notifications State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'alert', text: 'Renovação de Juliana Paes em 15 dias', time: '10 min atrás', read: false, contractId: null as string | null, proposalId: null as string | null | number },
        { id: 2, type: 'lead', text: 'Novo Lead: Carlos Edu (Start Law)', time: '1 hora atrás', read: false, contractId: null as string | null, proposalId: null as string | null | number },
        { id: 3, type: 'money', text: 'Pagamento recebido: R$ 5.000 (Expert Alpha)', time: '2 horas atrás', read: true, contractId: null as string | null, proposalId: null as string | null | number },
        { id: 4, type: 'task', text: 'Deadline: Projeto Nexus CRM amanhã', time: '5 horas atrás', read: true, contractId: null as string | null, proposalId: null as string | null | number },
    ]);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Poll localStorage every 5s for new notifications AND proposal status updates
    useEffect(() => {
        const checkUpdates = () => {
            // Sync new notifications from localStorage
            const stored = localStorage.getItem('admin_notifications');
            if (stored) {
                const storedNotifs = JSON.parse(stored);
                setNotifications(prev => {
                    const prevIds = new Set(prev.map(n => n.id));
                    const newOnes = storedNotifs.filter((n: any) => !prevIds.has(n.id));
                    if (newOnes.length > 0) return [...newOnes, ...prev];
                    return prev;
                });
            }


            // Sync clients from localStorage
            const storedClients = localStorage.getItem('ec_clients_db');
            if (storedClients) {
                const parsedClients: Client[] = JSON.parse(storedClients);
                setClients(prev => {
                    let hasChanges = false;
                    const merged = [...prev];
                    parsedClients.forEach(nc => {
                        const idx = merged.findIndex(c => c.name === nc.name);
                        if (idx >= 0) {
                             if (JSON.stringify(merged[idx]) !== JSON.stringify(nc)) {
                                 merged[idx] = nc;
                                 hasChanges = true;
                             }
                        } else {
                            merged.unshift(nc);
                            hasChanges = true;
                        }
                    });
                    return hasChanges ? merged : prev;
                });
            }
        };
        checkUpdates();
        const interval = setInterval(checkUpdates, 5000);
        return () => clearInterval(interval);
    }, []);

    // Filtered Leads based on search
    const filteredLeads = useMemo(() => {
        return leads.filter(lead =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [leads, searchTerm]);

    useEffect(() => {
        // Fetch Projects
        const fetchProjects = async () => {
            const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
            if (data) {
                const mappedProjects: Project[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    client: p.client,
                    description: p.description || '',
                    status: p.status as any,
                    progress: p.progress || 0,
                    deadline: p.deadline || '',
                    tasksCompleted: p.tasks_completed || 0,
                    tasksTotal: p.tasks_total || 0,
                    team: p.team || [],
                    budget: p.budget || '',
                    tasks: p.tasks || [],
                    funnel_data: p.funnel_data
                }));
                setProjects(mappedProjects);
            }
        };

        const fetchBriefings = async () => {
            const { data, error } = await supabase.from('briefings').select('*').order('created_at', { ascending: false });
            if (!error && data) setBriefings(data);
        };

        if (activeTab === 'projects' || activeTab === 'overview') {
            fetchProjects();
        }
        if (activeTab === 'briefings' || activeTab === 'overview') {
            fetchBriefings();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'calendar') {
            fetchCalendarEvents();
        }
    }, [activeTab]);

    const fetchCalendarEvents = async () => {
        const { data, error } = await supabase.from('custom_events').select('*');
        if (!error && data) {
            setCustomCalendarEvents(data.map(e => {
                const parts = e.date.split('-'); // Expected format YYYY-MM-DD
                return {
                    id: `custom-${e.id}`,
                    title: e.title,
                    date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
                    type: e.type,
                    color: `${e.color} text-[10px]`,
                    time: e.time || '',
                    client_name: e.client_name || '',
                    client_phone: e.client_phone || '',
                    notes: e.notes || ''
                };
            }));
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('custom_events').insert({
            title: newEvent.title,
            date: newEvent.date,
            type: newEvent.type,
            color: newEvent.color,
            time: newEvent.time,
            client_name: newEvent.client_name,
            client_phone: newEvent.client_phone,
            notes: newEvent.notes
        });
        if (!error) {
            setIsNewEventModalOpen(false);
            setNewEvent({ title: '', date: '', time: '', meetingMode: 'privada', client_name: '', client_phone: '', notes: '', type: 'Reunião', color: 'bg-brand-lime/20 text-brand-lime border-brand-lime/30' });
            fetchCalendarEvents();
            alert('Evento adicionado ao calendário!');
        } else {
            alert('Erro ao criar evento: ' + error.message);
        }
    };

    const handleDeleteEvent = async (dbId: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
        const { error } = await supabase.from('custom_events').delete().eq('id', dbId);
        if (!error) {
            fetchCalendarEvents();
        }
    };

    // Handlers
    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const leadData = {
                name: newLead.name,
                company_name: newLead.company,
                estimated_value: parseFloat(newLead.value.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0,
                status: 'Novo Lead',
                phone: '', // Can be added to form if needed
                email: ''  // Can be added to form if needed
            };

            const { data, error } = await supabase.from('leads').insert(leadData).select();

            if (error) throw error;

            if (data) {
                const createdLead: Lead = {
                    id: data[0].id,
                    name: data[0].name,
                    company: data[0].company_name,
                    value: data[0].estimated_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    status: data[0].status,
                    date: new Date().toLocaleDateString('pt-BR'),
                    priority: 'Medium',
                    phone: data[0].phone,
                    email: data[0].email,
                    tasks: [],
                    history: [{ id: Date.now(), date: new Date().toLocaleDateString('pt-BR'), text: 'Lead criado manualmente', type: 'system' }]
                };

                setLeads([createdLead, ...leads]);
                setIsNewLeadModalOpen(false);
                setNewLead({ name: '', company: '', value: '', status: 'Novo Lead' });
                alert('Lead criado com sucesso!');
            }
        } catch (error) {
            console.error('Error creating lead:', error);
            alert('Erro ao criar lead. Tente novamente.');
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        const projectData = {
            name: newProject.name,
            client: newProject.client,
            description: newProject.description || 'Novo projeto em fase de planejamento.',
            status: 'Em Andamento',
            progress: 0,
            deadline: newProject.deadline,
            tasks_completed: 0,
            tasks_total: 0,
            team: newProject.team ? newProject.team.split(',').map(Initials => Initials.trim().toUpperCase()) : ['EC'],
            budget: newProject.budget,
            funnel_data: null // Start empty
        };

        const { data, error } = await supabase.from('projects').insert(projectData).select();

        if (error) {
            console.error('Error creating project:', error);
            alert('Erro ao criar projeto.');
            return;
        }

        if (data) {
            const p = data[0];
            const newProj: Project = {
                id: p.id,
                name: p.name,
                client: p.client,
                description: p.description,
                status: p.status,
                progress: p.progress,
                deadline: p.deadline,
                tasksCompleted: p.tasks_completed,
                tasksTotal: p.tasks_total,
                team: p.team || [],
                budget: p.budget,
                tasks: [],
                funnel_data: null
            };
            setProjects([newProj, ...projects]);
            setIsNewProjectModalOpen(false);
            setNewProject({ name: '', client: '', deadline: '', budget: '', description: '', team: '' });
            alert('Projeto criado com sucesso!');
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

        const { error } = await supabase.from('projects').delete().eq('id', projectId);

        if (error) {
            console.error('Error deleting project:', error);
            alert('Erro ao excluir projeto.');
            return;
        }

        setProjects(projects.filter(p => p.id !== projectId));
    };

    const handleAddProjectTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !newTaskText.trim()) return;

        const newTask: Task = {
            id: Date.now(),
            text: newTaskText,
            completed: false,
            assignee: 'EC', // Default assignee for now
            dueDate: new Date().toLocaleDateString('pt-BR')
        };

        const updatedTasks = [...(selectedProject.tasks || []), newTask];
        const tasksTotal = updatedTasks.length;
        const tasksCompleted = updatedTasks.filter(t => t.completed).length;
        const progress = Math.round((tasksCompleted / tasksTotal) * 100) || 0;

        const { error } = await supabase
            .from('projects')
            .update({
                tasks: updatedTasks,
                tasks_total: tasksTotal,
                tasks_completed: tasksCompleted,
                progress: progress
            })
            .eq('id', selectedProject.id);

        if (error) {
            console.error('Error adding task:', error);
            alert('Erro ao adicionar tarefa.');
            return;
        }

        const updatedProject = {
            ...selectedProject,
            tasks: updatedTasks,
            tasksTotal,
            tasksCompleted,
            progress
        };
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setNewTaskText('');
    };

    const handleToggleProjectTask = async (taskId: number | string) => {
        if (!selectedProject) return;

        const updatedTasks = selectedProject.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );

        const tasksTotal = updatedTasks.length;
        const tasksCompleted = updatedTasks.filter(t => t.completed).length;
        const progress = Math.round((tasksCompleted / tasksTotal) * 100) || 0;

        const { error } = await supabase
            .from('projects')
            .update({
                tasks: updatedTasks,
                tasks_completed: tasksCompleted,
                progress: progress
            })
            .eq('id', selectedProject.id);

        if (error) {
            console.error('Error toggling task:', error);
            return;
        }

        const updatedProject = {
            ...selectedProject,
            tasks: updatedTasks,
            tasksCompleted,
            progress
        };
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    };

    const handleDeleteProjectTask = async (taskId: number | string) => {
        if (!selectedProject) return;

        const updatedTasks = selectedProject.tasks.filter(t => t.id !== taskId);

        const tasksTotal = updatedTasks.length;
        const tasksCompleted = updatedTasks.filter(t => t.completed).length;
        const progress = Math.round((tasksCompleted / tasksTotal) * 100) || 0;

        const { error } = await supabase
            .from('projects')
            .update({
                tasks: updatedTasks,
                tasks_total: tasksTotal,
                tasks_completed: tasksCompleted,
                progress: progress
            })
            .eq('id', selectedProject.id);

        if (error) {
            console.error('Error deleting task:', error);
            return;
        }

        const updatedProject = {
            ...selectedProject,
            tasks: updatedTasks,
            tasksTotal,
            tasksCompleted,
            progress
        };
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    };

    const handleSaveFunnel = async (data: any) => {
        if (!selectedProject) return;

        const { error } = await supabase
            .from('projects')
            .update({ funnel_data: data })
            .eq('id', selectedProject.id);

        if (error) {
            console.error('Error saving funnel:', error);
            alert('Erro ao salvar funil.');
            return;
        }

        const updatedProject = { ...selectedProject, funnel_data: data };
        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        alert('Funil salvo com sucesso!');
    };

    const handleCreatePaymentLink = (e: React.FormEvent) => {
        e.preventDefault();
        const invoice: Invoice = {
            id: Date.now(),
            client: newInvoice.client,
            description: newInvoice.description,
            amount: newInvoice.amount,
            dueDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            status: 'Enviada',
            type: newInvoice.type as 'Pontual' | 'Recorrente'
        };
        const newInvoices = [invoice, ...invoices];
        setInvoices(newInvoices);
        try {
            const dynamic = newInvoices.filter(i => i.id > 1000);
            localStorage.setItem('ec_pending_invoices', JSON.stringify(dynamic));
        } catch { }
        setIsPaymentModalOpen(false);
        setNewInvoice({ client: '', amount: '', description: '', type: 'Pontual' });

        // Encode payload and copy link
        const payloadStr = btoa(JSON.stringify({
            client: invoice.client,
            description: invoice.description,
            amount: invoice.amount,
            type: invoice.type
        }));
        const link = `${window.location.origin}/?pay_data=${payloadStr}`;
        navigator.clipboard.writeText(link);

        alert("Link de pagamento gerado e copiado para a área de transferência!");
    };

    const handleAddContractItem = () => {
        setContractItems([...contractItems, { description: '', price: '' }]);
    };

    const handleRemoveContractItem = (index: number) => {
        const newItems = [...contractItems];
        newItems.splice(index, 1);
        setContractItems(newItems);
    };

    const handleContractItemChange = (index: number, field: 'description' | 'price', value: string) => {
        const newItems = [...contractItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setContractItems(newItems);
    };

    const calculateContractTotal = () => {
        return contractItems.reduce((acc, item) => acc + (parseFloat(item.price.replace(',', '.')) || 0), 0);
    };

    const handleAddContract = (e: React.FormEvent) => {
        e.preventDefault();
        const totalValue = calculateContractTotal();

        const contract: Contract = {
            id: Date.now(),
            title: newContract.title,
            client: newContract.client,
            clientFullName: newContract.clientFullName || newContract.client,
            clientCPF: newContract.clientCPF,
            clientAddress: newContract.clientAddress,
            clientDob: newContract.clientDob,
            clientCompany: newContract.clientCompany,
            clientResponsible: newContract.clientResponsible,
            clientPhone: newContract.clientPhone,
            clientEmail: newContract.clientEmail,
            deliveryDeadline: newContract.deliveryDeadline,
            excludedScope: newContract.excludedScope,
            paymentTerms: newContract.paymentTerms,
            lateFine: newContract.lateFine,
            acceptanceDays: newContract.acceptanceDays,
            value: totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            items: contractItems.map((item, idx) => ({
                id: idx,
                description: item.description,
                price: parseFloat(item.price.replace(',', '.')) || 0
            })),
            startDate: new Date(newContract.startDate).toLocaleDateString('pt-BR'),
            endDate: new Date(newContract.endDate).toLocaleDateString('pt-BR'),
            status: 'Rascunho',
            type: newContract.type as 'Recorrente' | 'Projeto Único'
        };
        setContracts([contract, ...contracts]);
        setIsNewContractModalOpen(false);
        setNewContract({
            title: '', client: '', clientFullName: '', clientCPF: '', clientAddress: '', clientDob: '',
            clientPhone: '', clientEmail: '', clientCep: '', clientCity: '', clientState: '',
            clientCompany: '', clientResponsible: '',
            deliveryDeadline: '', excludedScope: 'Gestão comercial diária, produção de conteúdo, gestão de tráfego pago, alterações estruturais após aprovação final, suporte ilimitado e treinamento contínuo.',
            paymentTerms: '50% no início e 50% na entrega final.', lateFine: '2% ao mês sobre o valor em aberto.', acceptanceDays: '5',
            startDate: '', endDate: '', type: 'Projeto Único'
        });
        setContractItems([{ description: '', price: '' }]);
        setSelectedLeadForContract(null);
    };

    const handleGenerateContractFromProposal = (proposal: Proposal) => {
        // Build contract items: prefer scope items, fallback to proposal.items, then generic
        let contractItemsMapped: { description: string; price: string }[] = [];

        if (proposal.setupPrice || proposal.monthlyPrice) {
            if (proposal.setupPrice) {
                contractItemsMapped.push({
                    description: `Investimento Inicial (Setup) - ${proposal.title}`,
                    price: proposal.setupPrice.toFixed(2).replace('.', ',')
                });
            }
            if (proposal.monthlyPrice) {
                contractItemsMapped.push({
                    description: `Investimento Mensal (Recorrente) - ${proposal.title}`,
                    price: proposal.monthlyPrice.toFixed(2).replace('.', ',')
                });
            }
        } else if (proposal.scope && proposal.scope.length > 0) {
            // Distribute total value across scope items
            const totalVal = parseFloat(proposal.value.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
            const hasExplicitItems = proposal.items && proposal.items.length > 0;
            if (hasExplicitItems) {
                // Use explicit items as-is
                contractItemsMapped = proposal.items.map(i => ({
                    description: i.description,
                    price: i.price.toString().replace('.', ',')
                }));
            } else {
                // Use scope items with value split equally
                const perItem = proposal.scope.length > 0 ? (totalVal / proposal.scope.length) : totalVal;
                contractItemsMapped = proposal.scope.map(s => ({
                    description: s,
                    price: perItem > 0 ? perItem.toFixed(2).replace('.', ',') : ''
                }));
            }
        } else if (proposal.items && proposal.items.length > 0) {
            contractItemsMapped = proposal.items.map(i => ({
                description: i.description,
                price: i.price.toString().replace('.', ',')
            }));
        } else {
            contractItemsMapped = [{ description: proposal.title || 'Serviços da Proposta', price: proposal.value }];
        }

        setNewContract(prev => ({
            ...prev,
            title: proposal.title,
            client: proposal.client,
            clientFullName: '',
            clientCPF: '',
            clientAddress: '',
            clientDob: '',
            clientPhone: '',
            clientEmail: '',
            clientCep: '',
            clientCity: '',
            clientState: '',
            clientCompany: '',
            clientResponsible: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: proposal.validUntil
                ? (() => { try { return new Date(proposal.validUntil.split('/').reverse().join('-')).toISOString().split('T')[0]; } catch { return ''; } })()
                : '',
            type: proposal.monthlyPrice ? 'Recorrente' : 'Projeto Único',
            // Map proposal financial/conditions fields
            paymentTerms: proposal.paymentTerms || prev.paymentTerms,
            // Keep defaults for fields not present in proposal
            lateFine: prev.lateFine,
            acceptanceDays: prev.acceptanceDays,
            // Build excluded scope from solution if available
            excludedScope: prev.excludedScope,
        }));

        setContractItems(contractItemsMapped);
        setContractMode('new_lead');
        setViewProposal(null);
        setActiveTab('contracts');
        setIsNewContractModalOpen(true);
    };

    // Opens the new contract modal pre-filled with client personal data + approved proposal data
    const handleOpenContractFromNotification = (contractId: string) => {
        const stored = localStorage.getItem(`contract_client_data_${contractId}`);
        if (!stored) return;
        const { data, clientName } = JSON.parse(stored);

        // Find an approved proposal matching this client (case-insensitive partial match)
        const clientNameLower = (clientName || data.fullName || '').toLowerCase();
        const matchedProposal = proposals.find(p =>
            p.status === 'Aprovada' &&
            (p.client.toLowerCase().includes(clientNameLower) ||
                clientNameLower.includes(p.client.toLowerCase().split(' ')[0]))
        );

        // Build address string from form data
        const addressStr = data.address
            ? `${data.address}${data.city ? ', ' + data.city : ''}${data.state ? ' - ' + data.state : ''}`
            : '';

        // Merge personal data + proposal data
        setNewContract(prev => ({
            ...prev,
            // Identity from client data form
            client: clientName || data.fullName,
            clientFullName: data.fullName || '',
            clientCPF: data.cpf || '',
            clientDob: data.dob || '',
            clientPhone: data.phone || '',
            clientEmail: data.email || '',
            clientCep: data.cep || '',
            clientAddress: addressStr,
            clientCity: data.city || '',
            clientState: data.state || '',
            // From the approved proposal (if found)
            title: matchedProposal ? matchedProposal.title : prev.title,
            type: 'Projeto Único',
            startDate: new Date().toISOString().split('T')[0],
            endDate: matchedProposal?.validUntil
                ? (() => { try { return new Date(matchedProposal.validUntil.split('/').reverse().join('-')).toISOString().split('T')[0]; } catch { return prev.endDate; } })()
                : prev.endDate,
            // Map payment conditions from proposal
            paymentTerms: matchedProposal?.paymentTerms || prev.paymentTerms,
            lateFine: prev.lateFine,
            acceptanceDays: prev.acceptanceDays,
            excludedScope: prev.excludedScope,
        }));

        // Set contract items from proposal — prefer items[], fallback to scope[]
        if (matchedProposal) {
            let itemsMapped: { description: string; price: string }[] = [];
            const totalVal = parseFloat((matchedProposal.value || '0').replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

            if (matchedProposal.items?.length > 0) {
                itemsMapped = matchedProposal.items.map(i => ({
                    description: i.description,
                    price: i.price.toString().replace('.', ',')
                }));
            } else if (matchedProposal.scope?.length) {
                const perItem = totalVal / matchedProposal.scope.length;
                itemsMapped = matchedProposal.scope.map(s => ({
                    description: s,
                    price: perItem > 0 ? perItem.toFixed(2).replace('.', ',') : ''
                }));
            } else {
                itemsMapped = [{ description: matchedProposal.title || 'Serviços da Proposta', price: matchedProposal.value }];
            }
            setContractItems(itemsMapped);
        }

        setContractMode('new_lead');
        setActiveTab('contracts');
        setIsNewContractModalOpen(true);
        setIsNotificationsOpen(false);

        // Mark notification as read
        setNotifications(prev => prev.map(n =>
            n.contractId === contractId ? { ...n, read: true } : n
        ));
    };

    const handleAddProposal = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = proposals.length > 0 ? Math.max(...proposals.map(p => p.id)) + 1 : 1;
        const totalValue = newProposal.items?.reduce((acc, item) => acc + (parseFloat(item.price.toString().replace(',', '.')) || 0), 0) || 0;

        const proposal: Proposal = {
            id: newId,
            title: newProposal.title || 'Nova Proposta',
            client: newProposal.client || 'Cliente Desconhecido',
            value: totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            status: 'Rascunho',
            date: new Date().toLocaleDateString('pt-BR'),
            validUntil: newProposal.validUntil || '',
            items: newProposal.items || [],
            context: newProposal.context,
            solution: newProposal.solution,
            scope: newProposal.scope,
            schedule: newProposal.schedule,
            paymentTerms: newProposal.paymentTerms,
            nextSteps: newProposal.nextSteps,
            shareToken: Math.random().toString(36).substring(2, 15) // Generate a unique token
        };
        setProposals(prev => [proposal, ...prev]);
        setIsNewProposalModalOpen(false);
        setNewProposal(initialProposalState); // Reset form
        setTempBottleneck('');
        setTempBuiltItem('');
        setTempScopeItem('');
        setTempScheduleWeek('');
        setTempScheduleTask('');
    };

    const handleSignContract = () => {
        if (!viewDigitalContract) return;
        setIsSigning(true);

        // Simulate signing delay
        setTimeout(() => {
            const updatedContracts = contracts.map(c =>
                c.id === viewDigitalContract.id
                    ? { ...c, status: 'Assinado' as ContractStatus, signedDate: new Date().toLocaleDateString('pt-BR') }
                    : c
            );
            setContracts(updatedContracts);
            setIsSigning(false);
            setViewDigitalContract(prev => prev ? { ...prev, status: 'Assinado', signedDate: new Date().toLocaleDateString('pt-BR') } : null);

            // Persist locally for PublicContractViewer logic to see status
            // Although public viewer handles it, admin should update the db if possible
            localStorage.setItem('contracts_db', JSON.stringify(updatedContracts));

            // Generate an Invoice dynamically (like public viewer does)
            const contract = viewDigitalContract;
            const isSplitPayment = contract.paymentTerms?.includes('50%');
            const totalVal = parseFloat(contract.value.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
            const amountStr = isSplitPayment
                ? (totalVal / 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                : totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            const now = new Date();
            const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

            const existingInvoices: any[] = JSON.parse(localStorage.getItem('ec_pending_invoices') || '[]');
            const filteredExistingInvoices = existingInvoices.filter((inv: any) => inv.contractId !== contract.id);
            const newInv = {
                id: Date.now(),
                client: contract.clientFullName || contract.client,
                description: `${contract.title} · Contrato #${contract.id}${isSplitPayment ? ' (50% entrada)' : ''}`,
                amount: amountStr,
                dueDate: dateStr,
                status: 'Aguardando',
                type: 'Pontual',
                paymentMethod: 'PIX', // default fallback from admin mock, usually client selects PIX or CARD in public
                contractId: contract.id,
                source: 'contract',
                isSplitPayment,
                secondHalfAmount: isSplitPayment ? (totalVal / 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : undefined,
                clientPhone: contract.clientPhone,
            };
            localStorage.setItem('ec_pending_invoices', JSON.stringify([newInv, ...filteredExistingInvoices]));

            // Confetti Animation
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.7 },
                colors: ['#0035C5', '#ccff00', '#ffffff', '#000000']
            });
        }, 1500);
    };

    const handleShareContract = (contract: Contract) => {
        // Persist contract to localStorage so the public viewer can access it
        const storedContracts: Contract[] = JSON.parse(localStorage.getItem('contracts_db') || '[]');
        const existsIdx = storedContracts.findIndex(c => c.id.toString() === contract.id.toString());
        if (existsIdx >= 0) {
            storedContracts[existsIdx] = contract;
        } else {
            storedContracts.push(contract);
        }
        localStorage.setItem('contracts_db', JSON.stringify(storedContracts));

        // Build real share link
        const baseUrl = window.location.origin + window.location.pathname;
        const shareLink = `${baseUrl}?contract_id=${contract.id}`;

        // Find client info for WhatsApp
        const client = clients.find(c => c.name === contract.client) || leads.find(l => l.name === contract.client);
        const phone = client?.phone?.replace(/\D/g, '') || '';
        const firstName = contract.client.split(' ')[0];

        const message = encodeURIComponent(
            `Olá ${firstName}! 👋\n\n` +
            `Seu contrato digital de *${contract.title}* está pronto para assinatura!\n\n` +
            `📄 Acesse aqui:\n${shareLink}\n\n` +
            `Leia com atenção e assine digitalmente com 1 clique. Qualquer dúvida estou à disposição! 🚀`
        );

        if (phone) {
            window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
        } else {
            navigator.clipboard.writeText(shareLink);
            alert(`Link copiado!\n${shareLink}\n\n(Cliente sem WhatsApp cadastrado — link copiado para área de transferência)`);
        }
        setSelectedContractForAction(null);
    };

    const handleDeleteContract = (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.")) {
            const updatedContracts = contracts.filter(c => c.id !== id);
            setContracts(updatedContracts);
            setSelectedContractForAction(null);
        }
    };

    const handleContractModeChange = (mode: 'renewal' | 'new_lead') => {
        setContractMode(mode);
        setNewContract(prev => ({ ...prev, client: '', clientFullName: '', clientCPF: '', clientAddress: '', clientDob: '' }));
        setSelectedLeadForContract(null);
    };

    const handleContractClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        if (contractMode === 'renewal') {
            setNewContract(prev => ({ ...prev, client: selectedValue, clientFullName: selectedValue }));
        } else {
            // It's a new lead, find the lead object to get phone/email
            const lead = leads.find(l => l.name === selectedValue);
            if (lead) {
                setNewContract(prev => ({ ...prev, client: selectedValue, clientFullName: selectedValue }));
                setSelectedLeadForContract(lead);
            }
        }
    };

    const getWhatsAppLink = (lead: Lead) => {
        // Generate a unique ID for this contract form session
        const contractId = `${Date.now()}_${String(lead.id || '').replace(/[^a-z0-9]/gi, '')}`;
        const formUrl = `${window.location.origin}?contract_form=${contractId}&client=${encodeURIComponent(lead.name)}`;

        const firstName = lead.name.split(' ')[0];
        const message = `Olá ${firstName}, tudo bem? 👋\n\nEstamos animados para trabalhar juntos! 🚀\n\nPara elaborarmos seu contrato de forma rápida e segura, preencha o formulário abaixo (leva menos de 1 minuto!):\n\n🔗 ${formUrl}\n\nAssim que você preencher, já preparo a minuta para assinatura digital!`;

        const phone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
        return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    };

    // ... (Other handlers like handleAddTaskToProject, toggleTask, etc. remain unchanged) ...
    const handleAddTaskToProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !newTaskText.trim()) return;

        const newTask: Task = {
            id: Date.now(),
            text: newTaskText,
            completed: false,
            assignee: newTaskAssignee || selectedProject.team[0] || 'EC',
            dueDate: newTaskDueDate
        };

        const updatedTasks = [...selectedProject.tasks, newTask];
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const updatedProject = {
            ...selectedProject,
            tasks: updatedTasks,
            tasksCompleted: completedCount,
            tasksTotal: totalCount,
            progress: newProgress
        };

        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));

        setIsAddingTask(false);
        setNewTaskText('');
        setNewTaskAssignee('');
        setNewTaskDueDate('');
    };

    const toggleTask = (taskId: number) => {
        if (!selectedProject) return;

        const updatedTasks = selectedProject.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );

        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const updatedProject = {
            ...selectedProject,
            tasks: updatedTasks,
            tasksCompleted: completedCount,
            tasksTotal: totalCount,
            progress: newProgress
        };

        setSelectedProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    };

    // Lead Detail View Helpers
    const updateSelectedLead = async (updates: Partial<Lead>) => {
        if (!selectedLead) return;

        // Optimistic update
        const updatedLead = { ...selectedLead, ...updates };
        setSelectedLead(updatedLead);
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));

        try {
            // Prepare update object with correct column names
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.company !== undefined) dbUpdates.company_name = updates.company;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.priority !== undefined) dbUpdates.tag = updates.priority === 'High' ? 'quente' : updates.priority === 'Medium' ? 'morno' : 'frio';

            // New fields
            if (updates.niche !== undefined) dbUpdates.niche = updates.niche;
            if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue;
            if (updates.growthGoal !== undefined) dbUpdates.growth_goal = updates.growthGoal;
            if (updates.bottleneck !== undefined) dbUpdates.bottleneck = updates.bottleneck;
            if (updates.estimatedBudget !== undefined) dbUpdates.estimated_budget = updates.estimatedBudget;
            if (updates.history !== undefined) dbUpdates.history = updates.history;

            // Handle value (numeric conversion attempt)
            if (updates.value !== undefined) {
                // Remove non-numeric chars except dot/comma
                const numericValue = parseFloat(updates.value.replace(/[^0-9,.-]/g, '').replace(',', '.'));
                if (!isNaN(numericValue)) dbUpdates.estimated_value = numericValue;
            }

            const { error } = await supabase.from('leads').update(dbUpdates).eq('id', selectedLead.id);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating lead:', err);
            // Revert optimistic update on error would be ideal, but keeping simple for now
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;
        if (!confirm('Tem certeza que deseja excluir este lead?')) return;

        try {
            const { error } = await supabase.from('leads').delete().eq('id', selectedLead.id);
            if (error) throw error;

            setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
            setSelectedLead(null);
        } catch (err) {
            console.error('Error deleting lead:', err);
            alert('Erro ao excluir lead');
        }
    };

    const handleDeleteBriefing = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta análise comercial? Esta ação não pode ser desfeita.')) return;

        try {
            const { error } = await supabase.from('briefings').delete().eq('id', id);
            if (error) throw error;

            setBriefings(prev => prev.filter(b => b.id !== id));
            if (selectedBriefing?.id === id) {
                setSelectedBriefing(null);
            }
        } catch (err) {
            console.error('Error deleting briefing:', err);
            alert('Erro ao excluir análise comercial');
        }
    };

    const handleDeleteClient = (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) return;
        setClients(prev => {
            const updated = prev.filter(c => c.id !== id);
            localStorage.setItem('ec_clients_db', JSON.stringify(updated));
            return updated;
        });
        if (selectedClient?.id === id) {
            setSelectedClient(null);
        }
    };

    const handleAnalyzeBriefing = async (briefing: Briefing) => {
        setIsAnalyzingBriefing(true);
        try {
            const promptContext = JSON.stringify(briefing.responses, null, 2);
            const sysInstruction = `Você é um estrategista comercial sênior e copywriter persuasivo da agência "Soluções Digitais & CX" liderada por "Elizabeth Celina".
Analise detalhadamente a análise comercial a seguir preenchida pelo cliente. Se não tiver cliente definido coloque "Fulano".
Seu papel é conectar os gargalos do cliente com as soluções da agência (Websites, Branding, Social Media de alta performance sob narrativas, CRM e Tráfego) e gerar uma "Proposta Comercial Estratégica" arrasadora.
Retorne EXCLUSIVAMENTE um objeto JSON válido. Respeite esta estrutura e atributos:
{
  "title": "Ecossistema Comercial - [Nome da Empresa da Análise]",
  "value": "10.000",
  "setupPrice": 3000,
  "monthlyPrice": 1000,
  "validUntil": "[Data em 15 dias]",
  "items": [{"description": "Serviço 1", "price": 4000}, {"description": "Serviço 2", "price": 6000}],
  "context": {
    "diagnosis": "Diagnóstico contundente e claro do cenário do negócio baseado no que ele respondeu.",
    "bottlenecks": ["Gargalo 1", "Gargalo 2", "Gargalo 3"],
    "impact": "Descreva o impacto negativo severo gerado por essa falta de estrutura.",
    "opportunity": "Aponte a grande oportunidade para dominar o nicho dele."
  },
  "solution": {
    "name": "Estratégia Soluções Digitais & CX",
    "strategicDescription": "Visão geral focada em atrair leads super qualificados e fechar no automático.",
    "whatWillBeBuilt": ["Entrega estrutural 1", "Entrega 2", "Entrega 3"],
    "howItSolves": "Exatamente como a agência resolve o gargalo que ele apontou.",
    "expectedImpact": "Aumento estimado em credibilidade e aumento de conversões em Vendas."
  },
  "scope": ["Escopo detalhado de cada serviço", "Setup de CRM de Vendas e processos"],
  "schedule": [{"week": "Semana 1", "task": "Kick-off e Setup Técnico de Integrações"}],
  "paymentTerms": "50% de entrada (Aceite), 50% na aprovação final do projeto.",
  "nextSteps": "Assinatura digital do contrato para iniciarmos."
} `;

            const aiResponse = await sendMessageToOpenAI([], promptContext, sysInstruction);

            let parsedProposal;
            try {
                const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedProposal = JSON.parse(cleanJson);
            } catch (e) {
                alert("A IA gerou um formato inválido para a proposta. Tente novamente.");
                setIsAnalyzingBriefing(false);
                return;
            }

            const newProp: Proposal = {
                id: Date.now(),
                title: parsedProposal.title || ('Proposta Estratégica - ' + briefing.client_name),
                client: briefing.client_name,
                value: parsedProposal.value || '10.000',
                setupPrice: Number(parsedProposal.setupPrice) || 0,
                monthlyPrice: Number(parsedProposal.monthlyPrice) || 0,
                status: 'Rascunho',
                date: new Date().toLocaleDateString('pt-BR'),
                validUntil: parsedProposal.validUntil || '',
                items: parsedProposal.items || [],
                context: parsedProposal.context,
                solution: parsedProposal.solution,
                scope: parsedProposal.scope,
                schedule: parsedProposal.schedule,
                paymentTerms: parsedProposal.paymentTerms,
                nextSteps: parsedProposal.nextSteps
            };

            setProposals(prev => [newProp, ...prev]);
            await syncProposal(newProp);

            alert("Proposta Estratégica gerada com base na análise comercial e enviada para a aba Propostas (como Rascunho)!");
            setActiveTab('proposals');

        } catch (err) {
            console.error(err);
            alert("Erro ao conectar com a inteligência artificial.");
        } finally {
            setIsAnalyzingBriefing(false);
        }
    };

    const handleAddNote = () => {
        if (!noteInput.trim()) return;
        const newNote = {
            id: Date.now(),
            type: 'Nota',
            text: noteInput,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        };
        updateSelectedLead({ history: [newNote, ...(selectedLead?.history || [])] });
        setNoteInput('');
    };

    const handleAddTask = () => {
        if (!taskInput.trim()) return;
        const newTask = {
            id: Date.now(),
            text: taskInput,
            done: false
        };
        updateSelectedLead({ tasks: [newTask, ...(selectedLead?.tasks || [])] });
        setTaskInput('');
        setIsTaskInputVisible(false);
    };

    const toggleLeadTask = (taskId: number) => {
        const updatedTasks = selectedLead?.tasks?.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
        ) || [];
        updateSelectedLead({ tasks: updatedTasks });
    };

    const handleLostLead = async () => {
        if (window.confirm('Marcar este lead como PERDIDO e arquivar?')) {
            const leadId = selectedLead?.id;
            setLeads(prev => prev.filter(l => l.id !== leadId));
            setSelectedLead(null);

            if (leadId) {
                const { error } = await supabase.from('leads').delete().eq('id', leadId);
                if (error) console.error('Error deleting lead:', error);
            }
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (id: number) => {
        setDraggedLeadId(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
        e.preventDefault();
        if (draggedLeadId === null) return;

        const updatedLeads = leads.map(lead => {
            if (lead.id === draggedLeadId) {
                // Update Supabase
                supabase.from('leads').update({ status: targetStage }).eq('id', lead.id).then(({ error }) => {
                    if (error) console.error('Error updating status:', error);
                });
                return { ...lead, status: targetStage };
            }
            return lead;
        });

        setLeads(updatedLeads);
        setDraggedLeadId(null);
    };

    // AI Copilot Logic
    const getContextData = () => {
        let context = `Tela Atual: ${activeTab}. `;

        if (activeTab === 'crm' && selectedLead) {
            context += `Lead Selecionado: ${JSON.stringify(selectedLead)}`;
        } else if (activeTab === 'crm') {
            context += `Visão Geral do CRM. Leads em Pipeline: ${leads.length}. Valor total: ${totalPipeline}`;
        } else if (activeTab === 'projects' && selectedProject) {
            context += `Projeto Selecionado: ${JSON.stringify(selectedProject)}`;
        } else if (activeTab === 'finance') {
            context += `Financeiro. Receita Mensal: R$ ${totalRevenue}. Meta: ${goalProgress.toFixed(0)}%`;
        } else if (activeTab === 'clients' && selectedClient) {
            context += `Cliente Selecionado: ${JSON.stringify(selectedClient)}`;
        } else if (activeTab === 'contracts') {
            context += `Contratos Ativos: ${contracts.filter(c => c.status === 'Ativo').length}. Valor Total: ${contracts.reduce((acc, c) => acc + parseFloat(c.value.replace('.', '')), 0)}`;
        }

        return context;
    };

    const handleAiSend = async (messageText: string = aiInput) => {
        if (!messageText.trim() || aiLoading) return;

        const context = getContextData();
        const userMsg: ChatMessage = { role: 'user', text: messageText, timestamp: new Date() };
        setAiMessages(prev => [...prev, userMsg]);
        setAiInput('');
        setAiLoading(true);

        const systemInstruction = `
        Você é o Copiloto Administrativo da Elizabeth Celina. Sua função é ajudar a gerenciar a agência.
        Você tem acesso ao contexto da tela que ela está vendo.
        
        CONTEXTO ATUAL:
        ${context}

        Regras:
        1. Seja direto, executivo e prático.
        2. Se for pedido para escrever um email, escreva apenas o corpo e assunto.
        3. Se for pedido ideias, dê em bullet points.
        4. Use formatação Markdown (negrito, listas).
      `;

        try {
            const history = aiMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            const response = await sendMessageToOpenAI(history, userMsg.text, systemInstruction);

            const botMsg: ChatMessage = { role: 'model', text: response, timestamp: new Date() };
            setAiMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setAiMessages(prev => [...prev, { role: 'model', text: 'Erro ao conectar com o Copilot.', timestamp: new Date() }]);
        } finally {
            setAiLoading(false);
        }
    };

    const getQuickActions = () => {
        if (activeTab === 'crm' && selectedLead) {
            return [
                "Escrever email de apresentação",
                "Gerar roteiro de qualificação",
                "Sugerir próximos passos"
            ];
        }
        if (activeTab === 'projects' && selectedProject) {
            return [
                "Resumir status do projeto",
                "Criar email de cobrança suave",
                "Listar pendências críticas"
            ];
        }
        if (activeTab === 'finance') {
            return [
                "Analisar saúde financeira",
                "Ideias para aumentar MRR",
                "Email para clientes inadimplentes"
            ];
        }
        if (activeTab === 'contracts') {
            return [
                "Resumir contratos vencendo",
                "Criar cláusula de rescisão",
                "Email de renovação de contrato"
            ];
        }
        return [
            "Resumo do dia",
            "Prioridades para hoje",
            "Ideias de Post para LinkedIn"
        ];
    };

    useEffect(() => {
        if (aiChatRef.current) {
            aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
        }
    }, [aiMessages]);


    const stages: PipelineStage[] = ['Novo Lead', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Novo Lead': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Qualificação': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Proposta': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Negociação': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Fechado': return 'bg-brand-lime/10 text-brand-lime border-brand-lime/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    const getProjectStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case 'Em Andamento': return 'text-brand-blue bg-brand-blue/10 border-brand-blue/20';
            case 'Atrasado': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Concluído': return 'text-brand-lime bg-brand-lime/10 border-brand-lime/20';
            case 'Pausado': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        }
    };

    const getContractStatusColor = (status: ContractStatus) => {
        switch (status) {
            case 'Ativo': return 'text-brand-lime bg-brand-lime/10 border-brand-lime/20';
            case 'Rascunho': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Assinado': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Expirado': return 'text-red-500 bg-red-500/10 border-red-500/20';
        }
    };

    const getInvoiceStatusColor = (status: string) => {
        switch (status) {
            case 'Paga': return 'text-brand-lime bg-brand-lime/10 border-brand-lime/20';
            case 'Atrasada': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Enviada': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Aguardando': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
            default: return 'text-gray-400';
        }
    };

    const persistInvoices = (newInvoices: Invoice[]) => {
        try {
            // Persist all dynamically created invoices (manual and contract)
            // Initial hardcoded invoices have small IDs (1, 2, etc.)
            const dynamicInvoices = newInvoices.filter(i => i.id > 1000);
            localStorage.setItem('ec_pending_invoices', JSON.stringify(dynamicInvoices));
        } catch { /* ignore */ }
    };

    const confirmReceipt = (invoiceId: number) => {
        setInvoices(prev => {
            const updated = prev.map(inv =>
                inv.id === invoiceId ? { ...inv, status: 'Paga' as const } : inv
            );
            persistInvoices(updated);

            // Fetch the just-paid invoice to initiate Onboarding/Client data if it's from a contract
            const paidInv = updated.find(i => i.id === invoiceId);
            if (paidInv && paidInv.contractId) {
                // Determine if there already is an onboarding process for this client
                const existingOnboardings = JSON.parse(localStorage.getItem('ec_onboarding_processes') || '[]');
                if (!existingOnboardings.find((o: any) => o.client === paidInv.client)) {
                    const now = new Date();
                    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                    
                    const newProcess = {
                        id: Date.now() + 1, // ensure unique ID
                        client: paidInv.client,
                        clientEmail: '',
                        clientPhone: paidInv.clientPhone || '',
                        stage: 'Kickoff',
                        progress: 0,
                        startDate: dateStr,
                        steps: [
                            { id: 1, title: 'Reunião de Kickoff', completed: false },
                            { id: 2, title: 'Acesso às Contas', completed: false },
                            { id: 3, title: 'Configuração do CRM', completed: false },
                            { id: 4, title: 'Treinamento da Equipe', completed: false },
                            { id: 5, title: 'Lançamento Oficial', completed: false }
                        ]
                    };
                    localStorage.setItem('ec_onboarding_processes', JSON.stringify([newProcess, ...existingOnboardings]));
                }

                // Add to CRM Clients if not exists
                const existingClients = JSON.parse(localStorage.getItem('ec_clients_db') || '[]');
                if (!existingClients.find((c: any) => c.name === paidInv.client)) {
                    const now = new Date();
                    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                    
                    const newClient = {
                        id: Date.now() + 2,
                        name: paidInv.client,
                        company: 'Sem Empresa',
                        email: '',
                        phone: paidInv.clientPhone || '',
                        healthScore: 3,
                        ltv: paidInv.amount,
                        since: dateStr,
                        contractEnd: '', // Not easily available here without full contract object
                        status: 'Ativo',
                        nextAction: 'Onboarding',
                        history: [
                            { id: 1, date: dateStr, type: 'Sistema', title: 'Pagamento Confirmado', description: `Primeiro pagamento (${paidInv.paymentMethod || 'PIX'}) efetuado. Iniciando onboarding.` }
                        ]
                    };
                    localStorage.setItem('ec_clients_db', JSON.stringify([newClient, ...existingClients]));
                }
                
                // Add to projects if not exists
                const existingProjects = JSON.parse(localStorage.getItem('projects_db') || '[]');
                if (!existingProjects.find((p: any) => p.client === paidInv.client)) {
                    const newProject = {
                        id: Date.now() + 3,
                        name: paidInv.description?.split('·')[0].trim() || 'Projeto',
                        client: paidInv.client,
                        status: 'Em Andamento',
                        progress: 0,
                        deadline: '',
                        team: ['EC'],
                        tasks: [],
                        tasksCompleted: 0,
                        tasksTotal: 0
                    };
                    
                    localStorage.setItem('projects_db', JSON.stringify([newProject, ...existingProjects]));
                    
                    // Trigger a re-render of projects by reading from local storage directly in useEffect?
                    // Actually, modifying `setProjects` here is safer if we have access to it.
                    // Instead of full logic, reloading page might be required since AdminDashboard state won't instantly refresh.
                    alert(`O pagamento foi confirmado! Cliente movido para a aba Clientes, Onboarding e Projetos criados automaticamente.`);
                }
            }
            
            return updated;
        });
    };

    const chargeSecondHalf = (invoice: Invoice) => {
        const amount = invoice.secondHalfAmount || invoice.amount;
        const clientName = invoice.client;
        const clientPhoneRaw = (invoice.clientPhone || '').replace(/\D/g, '');
        const phone = clientPhoneRaw ? `55${clientPhoneRaw}` : '5592982031507';

        // Build payment page URL using existing ?pay_data= route in App.tsx
        const invoiceId = Date.now();
        const payData = btoa(JSON.stringify({
            client: clientName,
            description: `${invoice.description?.replace(' (50% entrada)', '')} · 2ª parcela (50%)`,
            amount,
            contractId: invoice.contractId,
            clientPhone: invoice.clientPhone,
            invoiceId,
        }));
        const payUrl = `${window.location.origin}/?pay_data=${payData}`;

        const msg = encodeURIComponent(
            `Olá, ${clientName}! 👋 O projeto está avançando muito bem e chegou o momento da 2ª parcela (50%) no valor de R$ ${amount}.\n\n` +
            `Acesse o link abaixo para escolher sua forma de pagamento (PIX ou Cartão) de forma segura:\n\n` +
            `${payUrl}\n\n` +
            `Qualquer dúvida estou à disposição! 😊`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');

        // Mark this invoice as second-half charged (button disappears)
        setInvoices(prev => {
            const updated = prev.map(inv =>
                inv.id === invoice.id ? { ...inv, secondHalfCharged: true } : inv
            );
            persistInvoices(updated);
            return updated;
        });
    };

    const deleteInvoice = (invoiceId: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
        setInvoices(prev => {
            const updated = prev.filter(inv => inv.id !== invoiceId);
            persistInvoices(updated);
            return updated;
        });
    };

    const getHealthScoreColor = (score: number) => {
        switch (score) {
            case 3: return 'text-brand-lime';
            case 2: return 'text-yellow-400';
            case 1: return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getHealthScoreIcon = (score: number) => {
        switch (score) {
            case 3: return <Smile size={20} className={getHealthScoreColor(score)} />;
            case 2: return <Meh size={20} className={getHealthScoreColor(score)} />;
            case 1: return <Frown size={20} className={getHealthScoreColor(score)} />;
            default: return <Meh size={20} className="text-gray-500" />;
        }
    };

    // Calculando stats dinâmicos - Helper robusto para extrair números
    const parseValue = (val: any) => {
        if (!val) return 0;
        const s = String(val);
        const numeric = s.replace(/[^0-9,-]+/g, "").replace(",", ".");
        const n = parseFloat(numeric);
        return isNaN(n) ? 0 : n;
    };

    const totalPipeline = leads.reduce((acc, curr) => acc + parseValue(curr.value), 0);
    const totalLeads = leads.length;

    // Finance Stats
    const totalRevenue = invoices.filter(i => i.status === 'Paga').reduce((acc, curr) => acc + parseValue(curr.amount), 0);
    const totalPending = invoices.filter(i => i.status !== 'Paga').reduce((acc, curr) => acc + parseValue(curr.amount), 0);
    const mrr = invoices.filter(i => i.type === 'Recorrente').reduce((acc, curr) => acc + parseValue(curr.amount), 0);
    const goalProgress = Math.min((totalRevenue / 10000) * 100, 100); // Usando 10k como meta padrão se financialGoal não existir

    // CS Stats
    const activeClients = clients.filter(c => c.status === 'Ativo').length;
    const churnRisk = clients.filter(c => c.status === 'Risco').length;
    const renewalOpps = clients.filter(c => c.nextAction === 'Renovar').length;

    // Contracts Stats
    const activeContractsValue = contracts.filter(c => c.status === 'Ativo').reduce((acc, curr) => acc + parseFloat(curr.value.replace(/\./g, '').replace(',', '.')), 0);
    const contractsPendingSign = contracts.filter(c => c.status === 'Rascunho').length;

    // Calendar Helpers & Events
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const calendarMonthDays = Array.from({ length: getDaysInMonth(calendarDate) }, (_, i) => i + 1);
    const calendarFirstDay = getFirstDayOfMonth(calendarDate);

    const calendarEvents = useMemo(() => {
        const events: any[] = [];

        projects.forEach(p => {
            if (p.deadline) {
                const parts = p.deadline.split('/');
                if (parts.length === 3) {
                    events.push({
                        id: `proj-${p.id}`,
                        title: `${p.name}`,
                        date: new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])),
                        type: 'project',
                        color: 'bg-brand-blue/20 text-brand-blue border-brand-blue/30 text-[10px]'
                    });
                }
            }
        });

        contracts.forEach(c => {
            if (c.deliveryDeadline) {
                const parts = c.deliveryDeadline.split('/');
                if (parts.length === 3) {
                    events.push({
                        id: `cont-${c.id}`,
                        title: `Contrato: ${c.client}`,
                        date: new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])),
                        type: 'contract',
                        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]'
                    });
                }
            }
        });

        invoices.forEach(i => {
            if (i.date) {
                const parts = i.date.split('/');
                if (parts.length === 3) {
                    events.push({
                        id: `inv-${i.id}`,
                        title: `Fatura: ${i.client}`,
                        date: new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])),
                        type: 'invoice',
                        color: i.status === 'Paga' ? 'bg-brand-lime/20 text-brand-lime border-brand-lime/30 text-[10px]' : 'bg-amber-400/20 text-amber-400 border-amber-400/30 text-[10px]'
                    });
                }
            }
        });

        return [...events, ...customCalendarEvents];
    }, [projects, contracts, invoices, customCalendarEvents]);

    // --- CHART DATA PREPARATION ---
    const revenueData = [
        { name: 'Jan', revenue: 12000, expenses: 4000 },
        { name: 'Fev', revenue: 15000, expenses: 5500 },
        { name: 'Mar', revenue: 18000, expenses: 6000 },
        { name: 'Abr', revenue: 14000, expenses: 7000 },
        { name: 'Mai', revenue: 22000, expenses: 8000 },
        { name: 'Jun', revenue: totalRevenue, expenses: 9500 },
    ];

    const leadSourceData = [
        { name: 'Instagram', value: 45, color: '#E1306C' }, // Brand colors would be better but using standard for now
        { name: 'LinkedIn', value: 30, color: '#0077b5' },
        { name: 'Indicação', value: 15, color: '#CCFF00' }, // Brand Lime
        { name: 'Google', value: 10, color: '#4285F4' },
    ];

    const leadStatusData = stages.map(stage => ({
        name: stage,
        value: leads.filter(l => l.status === stage).length
    }));

    return (
        <div className="min-h-screen bg-brand-black text-white flex font-sans overflow-hidden">

            {/* Sidebar - SAME AS BEFORE */}
            <aside className="w-20 md:w-64 border-r border-white/10 flex flex-col fixed h-full bg-brand-black z-20">
                <div className="h-20 flex items-center justify-center md:justify-start md:px-8 border-b border-white/10">
                    <span className="text-2xl font-bold tracking-tighter text-white cursor-pointer" onClick={() => setActiveTab('overview')}>
                        E<span className="text-brand-lime">.</span><span className="hidden md:inline">Celina</span>
                    </span>
                </div>
                <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={() => { setActiveTab('overview'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="hidden md:block">Visão Geral</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('crm'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'crm' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Users size={20} />
                        <span className="hidden md:block">CRM & Leads</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('briefings'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'briefings' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ClipboardList size={20} />
                        <span className="hidden md:block">Análise Comercial</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('proposals'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'proposals' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileText size={20} />
                        <span className="hidden md:block">Propostas</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('contracts'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'contracts' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileSignature size={20} />
                        <span className="hidden md:block">Contratos</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('finance'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'finance' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <CreditCard size={20} />
                        <span className="hidden md:block">Financeiro</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('onboarding'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'onboarding' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Rocket size={20} />
                        <span className="hidden md:block">Onboarding</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('clients'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'clients' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Heart size={20} />
                        <span className="hidden md:block">Clientes & CS</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('projects'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'projects' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Briefcase size={20} />
                        <span className="hidden md:block">Projetos</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('automations'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'automations' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Zap size={20} />
                        <span className="hidden md:block">Automações</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('calendar'); setSelectedProject(null); setSelectedClient(null); setSelectedLead(null); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-brand-lime text-brand-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar size={20} />
                        <span className="hidden md:block">Calendário</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="hidden md:block">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ml-20 md:ml-64 p-8 overflow-x-hidden transition-all duration-300 ${isAiOpen ? 'mr-96' : ''}`}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-fadeIn space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Visão Geral</h2>
                                <p className="text-gray-500 text-sm">Bem-vinda de volta, Elizabeth.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="relative p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <Bell size={20} className="text-gray-400" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-lime rounded-full animate-pulse"></span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsAiOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-lime rounded-xl text-brand-black font-bold hover:bg-white transition-colors"
                                >
                                    <Sparkles size={18} />
                                    <span className="hidden md:inline">Copilot</span>
                                </button>
                            </div>
                        </div>

                        {/* AÇÕES RÁPIDAS */}
                        <div className="mb-0">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Sparkles size={14} className="text-brand-lime" /> Ações Rápidas
                            </h3>
                            <div className="overflow-x-auto pb-2">
                                <div className="flex gap-4 min-w-max pb-4">
                                {/* Novo Lead Manual */}
                                <button
                                    onClick={() => setIsNewLeadModalOpen(true)}
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-brand-lime/30 hover:bg-white/[0.08] transition-all group text-left"
                                >
                                    <div className="p-3 bg-brand-lime/10 rounded-xl text-brand-lime group-hover:scale-110 transition-transform">
                                        <UserPlus size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Novo Lead</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Entrada Manual</p>
                                    </div>
                                </button>

                                {/* Copiar Link de Contato */}
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/contato.html`;
                                        navigator.clipboard.writeText(link);
                                        setPublicContactLinkCopied(true);
                                        setTimeout(() => setPublicContactLinkCopied(false), 2000);
                                    }}
                                    className={`bg-white/5 border p-4 rounded-2xl flex items-center gap-4 transition-all group text-left ${publicContactLinkCopied ? 'border-brand-lime bg-brand-lime/5' : 'border-white/10 hover:border-brand-blue/30 hover:bg-white/[0.08]'}`}
                                >
                                    <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${publicContactLinkCopied ? 'bg-brand-lime/20 text-brand-lime' : 'bg-brand-blue/10 text-brand-blue'}`}>
                                        {publicContactLinkCopied ? <Check size={20} /> : <Share2 size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{publicContactLinkCopied ? 'Copiado!' : 'Link de Contato'}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{publicContactLinkCopied ? 'Pronto para enviar' : 'Copiar para Enviar'}</p>
                                    </div>
                                </button>

                                {/* Nova Proposta */}
                                <button
                                    onClick={() => {
                                        setNewProposal(initialProposalState);
                                        setIsNewProposalModalOpen(true);
                                    }}
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all group text-left"
                                >
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                                        <FileSignature size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Proposta</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Gerar Documento</p>
                                    </div>
                                </button>

                                {/* Novo Contrato */}
                                <button
                                    onClick={() => {
                                        setContractMode('new_lead');
                                        setIsNewContractModalOpen(true);
                                    }}
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 hover:bg-white/[0.08] transition-all group text-left"
                                >
                                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
                                        <FileCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Contrato</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Rascunho Rápido</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                        {/* Notifications Panel */}
                        {isNotificationsOpen && (
                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl p-4 absolute right-8 top-24 z-30 w-80 shadow-2xl animate-fadeIn">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Bell size={14} className="text-brand-lime" /> Notificações
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-black bg-brand-lime text-brand-blue px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                            className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
                                        >
                                            Marcar lido
                                        </button>
                                        <button
                                            onClick={() => {
                                                setNotifications([]);
                                                try { localStorage.removeItem('admin_notifications'); } catch { /* ignore */ }
                                            }}
                                            title="Limpar todas as notificações"
                                            className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={11} />
                                            Limpar
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {notifications.length === 0 && (
                                        <div className="py-8 text-center">
                                            <p className="text-3xl mb-2">🔔</p>
                                            <p className="text-xs text-white/30 font-medium">Nenhuma notificação</p>
                                        </div>
                                    )}
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-3 rounded-xl border ${n.type === 'contract_data'
                                                ? 'bg-brand-lime/10 border-brand-lime/30'
                                                : n.type === 'proposal_approved'
                                                    ? 'bg-amber-500/10 border-amber-500/30'
                                                    : n.read
                                                        ? 'bg-white/5 border-transparent'
                                                        : 'bg-brand-blue/10 border-brand-blue/20'
                                                }`}
                                        >
                                            <p className={`text-xs font-medium mb-1 ${n.type === 'contract_data' ? 'text-brand-lime'
                                                : n.type === 'proposal_approved' ? 'text-amber-400'
                                                    : 'text-gray-300'
                                                }`}>
                                                {n.text}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-gray-500">{n.time}</p>
                                                <div className="flex items-center gap-2">
                                                    {n.type === 'contract_data' && (
                                                        <button
                                                            onClick={() => handleOpenContractFromNotification(n.contractId as string)}
                                                            className="text-[10px] bg-brand-lime text-black font-bold px-2 py-0.5 rounded-full hover:bg-white transition-colors"
                                                        >
                                                            Abrir Contrato →
                                                        </button>
                                                    )}
                                                    {n.type === 'proposal_approved' && (
                                                        <button
                                                            onClick={() => {
                                                                const proposalId = n.proposalId;
                                                                const found = proposals.find(p => p.id.toString() === proposalId?.toString());
                                                                if (found) setViewProposal(found);
                                                                setActiveTab('proposals');
                                                                setIsNotificationsOpen(false);
                                                                setNotifications(prev => prev.map(notif =>
                                                                    notif.id === n.id ? { ...notif, read: true } : notif
                                                                ));
                                                            }}
                                                            className="text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full hover:bg-white transition-colors"
                                                        >
                                                            Ver Proposta →
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                                                        title="Remover esta notificação"
                                                        className="text-white/15 hover:text-red-400 transition-colors"
                                                    >
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* KPIS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-lime/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-brand-lime/10 rounded-lg text-brand-lime"><TrendingUp size={20} /></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Pipeline</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">R$ {totalPipeline.toLocaleString('pt-BR')}</h3>
                                <p className="text-xs text-gray-500">{leads.length} leads ativos</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-lime/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><DollarSign size={20} /></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Receita (Mês)</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">R$ {totalRevenue.toLocaleString('pt-BR')}</h3>
                                <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${goalProgress}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-lime/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Briefcase size={20} /></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Projetos Ativos</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{projects.filter(p => p.status === 'Em Andamento').length}</h3>
                                <p className="text-xs text-gray-500">De {projects.length} totais</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-lime/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Users size={20} /></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Clientes Ativos</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{activeClients}</h3>
                                <p className="text-xs text-gray-500">{renewalOpps} renovações pendentes</p>
                            </div>
                        </div>

                        {/* CHARTS SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold mb-6">Tendência de Receita</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#CCFF00" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold mb-6">Origem dos Leads</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={leadSourceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {leadSourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CRM TAB */}
                {activeTab === 'crm' && (
                    <div className="animate-fadeIn h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">CRM & Funil de Vendas</h2>
                                <p className="text-gray-500 text-sm">Gerencie seus leads e oportunidades.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar lead..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-lime"
                                    />
                                </div>
                                <button
                                    onClick={() => setCrmView(crmView === 'kanban' ? 'list' : 'kanban')}
                                    className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                >
                                    {crmView === 'kanban' ? <List size={20} /> : <LayoutGrid size={20} />}
                                </button>
                                <button
                                    onClick={() => setIsNewLeadModalOpen(true)}
                                    className="bg-brand-lime text-brand-black hover:bg-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm"
                                >
                                    <Plus size={18} /> Novo Lead
                                </button>
                            </div>
                        </div>

                        {/* CRM Charts */}
                        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold mb-4">Funil de Vendas</h3>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={leadStatusData} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" stroke="#999" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                            <Bar dataKey="value" fill="#CCFF00" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                                <div className="w-32 h-32 rounded-full border-8 border-brand-lime/20 flex items-center justify-center mb-4 relative">
                                    <span className="text-3xl font-bold text-white">{leads.length}</span>
                                    <div className="absolute inset-0 border-8 border-brand-lime rounded-full border-l-transparent border-b-transparent transform -rotate-45"></div>
                                </div>
                                <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest">Taxa de Conversão</h3>
                                <p className="text-2xl font-bold text-brand-lime mt-1">12.5%</p>
                                <p className="text-xs text-gray-500 mt-2">Desta semana</p>
                            </div>
                        </div>

                        {/* Kanban Board */}
                        {crmView === 'kanban' ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                                {stages.map(stage => (
                                    <div
                                        key={stage}
                                        className="min-w-[300px] bg-white/5 rounded-2xl p-4 flex flex-col h-full border border-white/5"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, stage)}
                                    >
                                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                            <h3 className="font-bold text-sm text-gray-300 flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${stage === 'Fechado' ? 'bg-brand-lime' : 'bg-gray-500'}`}></div>
                                                {stage}
                                            </h3>
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                                                {filteredLeads.filter(l => l.status === stage).length}
                                            </span>
                                        </div>

                                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                            {filteredLeads.filter(l => l.status === stage).map(lead => (
                                                <div
                                                    key={lead.id}
                                                    draggable
                                                    onDragStart={() => handleDragStart(lead.id)}
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="bg-[#1a1a1c] p-4 rounded-xl border border-white/5 hover:border-brand-lime/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg group relative"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lead.priority === 'High' ? 'text-red-400 border-red-400/20 bg-red-400/10' : lead.priority === 'Medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' : 'text-blue-400 border-blue-400/20 bg-blue-400/10'}`}>
                                                            {lead.priority}
                                                        </span>
                                                        <MoreHorizontal size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <h4 className="font-bold text-white mb-0.5">{lead.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-3">{lead.company}</p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                        <span className="text-xs font-mono text-gray-400">{lead.value}</span>
                                                        <span className="text-[10px] text-gray-600">{lead.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                                <table className="w-full text-left">
                                    <thead className="bg-black/20 text-xs uppercase text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-4">Nome</th>
                                            <th className="p-4">Empresa</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Valor</th>
                                            <th className="p-4">Prioridade</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {filteredLeads.map(lead => (
                                            <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-white/5 cursor-pointer transition-colors">
                                                <td className="p-4 font-bold">{lead.name}</td>
                                                <td className="p-4 text-gray-400">{lead.company}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs border ${getStageColor(lead.status)}`}>{lead.status}</span></td>
                                                <td className="p-4 text-gray-300 font-mono">{lead.value}</td>
                                                <td className="p-4">{lead.priority}</td>
                                                <td className="p-4 text-right"><MoreHorizontal size={16} className="text-gray-500" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Meus Projetos</h2>
                                <p className="text-gray-500 text-sm">Acompanhe o status e entregas.</p>
                            </div>
                            <button
                                onClick={() => setIsNewProjectModalOpen(true)}
                                className="bg-brand-lime text-brand-black hover:bg-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                            >
                                <Plus size={18} /> Novo Projeto
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-lime/30 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs border font-bold ${getProjectStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                        <div className="text-gray-500 text-xs flex items-center gap-1">
                                            <Clock size={12} /> Prazo: {project.deadline}
                                            <button
                                                onClick={(e) => handleDeleteProject(e, project.id as string)}
                                                className="ml-2 text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-white/10 transition-colors"
                                                title="Excluir Projeto"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-brand-lime transition-colors">{project.name}</h3>
                                    <p className="text-sm text-gray-400 mb-6">{project.client}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Progresso</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${project.progress === 100 ? 'bg-brand-lime' : 'bg-brand-blue'}`}
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                        <div className="flex -space-x-2">
                                            {project.team.map((member, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0f0f11] flex items-center justify-center text-xs font-bold text-gray-300">
                                                    {member}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                            <CheckSquare size={16} className="text-brand-lime" />
                                            {project.tasksCompleted}/{project.tasksTotal} Tasks
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'finance' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Financeiro</h2>
                                <p className="text-gray-500 text-sm">Gestão de receitas e cobranças.</p>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="bg-brand-lime text-brand-black hover:bg-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                            >
                                <DollarSign size={18} /> Novo Link de Pagamento
                            </button>
                        </div>

                        {/* Finance Stats & Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4">Fluxo de Caixa</h3>
                                <div className="h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                            <Bar dataKey="revenue" name="Receita" fill="#CCFF00" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expenses" name="Despesas" fill="#FF4444" radius={[4, 4, 0, 0]} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Receita Recorrente (MRR)</span>
                                    <h3 className="text-3xl font-bold mt-2">R$ {mrr.toLocaleString('pt-BR')}</h3>
                                    <p className="text-xs text-brand-lime mt-2 flex items-center gap-1"><TrendingUp size={12} /> +15% vs mês anterior</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <span className="text-xs font-bold text-gray-500 uppercase">A Receber</span>
                                    <h3 className="text-3xl font-bold mt-2 text-yellow-400">R$ {totalPending.toLocaleString('pt-BR')}</h3>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Total Recebido</span>
                                    <h3 className="text-3xl font-bold mt-2 text-brand-lime">R$ {totalRevenue.toLocaleString('pt-BR')}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Transações Recentes</h3>
                                {invoices.some(i => i.status === 'Aguardando') && (
                                    <span className="flex items-center gap-2 text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/25 px-3 py-1.5 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        {invoices.filter(i => i.status === 'Aguardando').length} pagamento(s) aguardando confirmação
                                    </span>
                                )}
                            </div>

                            {/* Pending payments alert section */}
                            {invoices.filter(i => i.status === 'Aguardando').length > 0 && (
                                <div className="mb-6 space-y-3">
                                    {invoices.filter(i => i.status === 'Aguardando').map(inv => (
                                        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-400/8 border border-amber-400/25">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-lg">
                                                    {inv.paymentMethod === 'PIX' ? '📱' : '💳'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">{inv.client}</p>
                                                    <p className="text-xs text-white/50">{inv.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-amber-400 font-black text-sm">R$ {inv.amount}</span>
                                                        {inv.paymentMethod && (
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/70 border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                                {inv.paymentMethod}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-white/30">{inv.dueDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => confirmReceipt(inv.id)}
                                                className="shrink-0 flex items-center gap-2 bg-brand-lime text-brand-blue font-black text-xs px-5 py-2.5 rounded-full hover:bg-white transition-all duration-200 shadow-[0_0_20px_rgba(204,255,0,.25)]">
                                                <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none">
                                                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Confirmar Recebimento
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/20 text-xs uppercase text-gray-500 font-bold">
                                        <tr>
                                            <th className="p-4">Cliente</th>
                                            <th className="p-4">Descrição</th>
                                            <th className="p-4">Valor</th>
                                            <th className="p-4">Vencimento</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id} className={`hover:bg-white/5 transition-colors ${invoice.status === 'Aguardando' ? 'bg-amber-400/5' : ''}`}>
                                                <td className="p-4 font-bold">{invoice.client}</td>
                                                <td className="p-4 text-gray-400">
                                                    {invoice.description}
                                                    {invoice.paymentMethod && (
                                                        <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/10 px-1.5 py-0.5 rounded-full">
                                                            {invoice.paymentMethod}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono">R$ {invoice.amount}</td>
                                                <td className="p-4 text-gray-400">{invoice.dueDate}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs border font-bold ${getInvoiceStatusColor(invoice.status)}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {invoice.status === 'Aguardando' ? (
                                                            <button
                                                                onClick={() => confirmReceipt(invoice.id)}
                                                                className="text-amber-400 hover:text-brand-lime font-black text-xs transition-colors">
                                                                Confirmar ✓
                                                            </button>
                                                        ) : (
                                                            <button className="text-brand-lime hover:underline text-xs">Reenviar</button>
                                                        )}
                                                        {/* "Cobrar 2ª Parcela" — only for split-payment Paga invoices not yet charged */}
                                                        {invoice.status === 'Paga' && invoice.isSplitPayment && !invoice.secondHalfCharged && (
                                                            <button
                                                                onClick={() => chargeSecondHalf(invoice)}
                                                                title="Enviar cobrança da 2ª parcela (50%) para o cliente via WhatsApp"
                                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#25D366] border border-[#25D366]/30 bg-[#25D366]/8 hover:bg-[#25D366]/20 px-2.5 py-1.5 rounded-full transition-all duration-200">
                                                                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                </svg>
                                                                Cobrar 2ª Parcela
                                                            </button>
                                                        )}
                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => deleteInvoice(invoice.id)}
                                                            title="Excluir transação"
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all duration-200">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLIENTS TAB */}
                {activeTab === 'clients' && (
                    <div className="animate-fadeIn">
                        {selectedClient ? (
                            <div className="animate-fadeIn pb-10">
                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                                >
                                    <ArrowLeft size={20} /> Voltar para carteira
                                </button>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column - Client Info Card */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                                            <div className="flex flex-col items-center justify-center mb-6 text-center mt-2">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1c] to-black flex items-center justify-center border-2 border-brand-lime/30 font-bold text-4xl text-white shadow-[0_0_30px_rgba(204,255,0,0.1)] mb-4 relative drop-shadow-xl">
                                                    {selectedClient.name.charAt(0)}
                                                    <div className="absolute bottom-0 right-0 bg-[#111] rounded-full p-1 border border-white/10 shadow-lg">
                                                        {getHealthScoreIcon(selectedClient.healthScore)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{selectedClient.name}</h2>
                                                    <button
                                                        onClick={() => handleDeleteClient(selectedClient.id)}
                                                        className="text-gray-500 hover:text-red-500 p-1.5 opacity-50 hover:opacity-100 rounded-lg hover:bg-white/5 transition-all"
                                                        title="Excluir Cliente"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                <p className="text-brand-lime font-medium mt-1 text-sm">{selectedClient.company}</p>

                                                <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center items-center w-full">
                                                    <span className={`text-xs uppercase font-bold px-3 py-1.5 rounded-lg border ${selectedClient.status === 'Ativo' ? 'text-brand-lime border-brand-lime/20 bg-brand-lime/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>
                                                        {selectedClient.status}
                                                    </span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1.5 rounded-lg border ${selectedClient.nextAction === 'Nenhuma' ? 'text-gray-400 border-white/10 bg-white/5' : selectedClient.nextAction === 'Renovar' ? 'text-brand-lime border-brand-lime/20 bg-brand-lime/10' : 'text-amber-400 border-amber-400/20 bg-amber-400/10'}`}>
                                                        SAÍDA: {selectedClient.nextAction}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-white/10">
                                                <div>
                                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">Contato Principal</p>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                                                            <Mail size={14} className="text-gray-400 shrink-0" />
                                                            <span className="text-white truncate font-medium">{selectedClient.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                                                            <Phone size={14} className="text-gray-400 shrink-0" />
                                                            <span className="text-white truncate font-medium">{selectedClient.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                                <Zap className="text-brand-lime" size={18} /> Dados Financeiros
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">LTV Estimado</p>
                                                        <p className="text-2xl font-black text-white">R$ {selectedClient.ltv}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Cliente Desde</p>
                                                        <p className="text-sm font-bold text-white flex items-center gap-2"><Calendar size={12} className="text-brand-lime" /> {selectedClient.since}</p>
                                                    </div>
                                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Fim Contrato</p>
                                                        <p className="text-sm font-bold text-white flex items-center gap-2"><Calendar size={12} className="text-amber-400" /> {selectedClient.contractEnd}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Client Timeline/History */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
                                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <History className="text-brand-lime" size={20} /> Histórico & Atividades
                                                </h3>
                                                <button className="bg-brand-lime/10 text-brand-lime hover:bg-brand-lime hover:text-black font-bold px-3 py-2 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] text-sm border border-brand-lime/20 cursor-pointer">
                                                    <Plus size={16} /> Nova Interação
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                                {selectedClient.history.length > 0 ? (
                                                    <div className="relative border-l-2 border-white/10 ml-4 pb-4">
                                                        {selectedClient.history.map((h) => (
                                                            <div key={h.id} className="mb-8 ml-6 relative group">
                                                                <span className={`absolute flex items-center justify-center w-10 h-10 rounded-full -left-11 ring-4 ring-[#1a1a1c] transition-transform group-hover:scale-110 shadow-lg ${h.type === 'Reunião' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                                    h.type === 'Email' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                                        h.type === 'Call' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                                    }`}>
                                                                    {h.type === 'Reunião' ? <Users size={18} /> :
                                                                        h.type === 'Email' ? <Mail size={18} /> :
                                                                            h.type === 'Call' ? <Phone size={18} /> :
                                                                                <FileText size={18} />}
                                                                </span>

                                                                <div className="bg-[#111] p-5 rounded-2xl border border-white/5 shadow-md hover:border-white/10 transition-colors">
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <h4 className="text-white font-bold text-base flex-1">{h.title}</h4>
                                                                        <span className="text-xs text-gray-400 font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1">
                                                                            <Calendar size={10} /> {h.date}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-400 text-sm leading-relaxed">{h.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                                                        <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 border-dashed flex items-center justify-center mb-4">
                                                            <History className="text-white/20" size={32} />
                                                        </div>
                                                        <h3 className="text-white font-bold text-lg mb-1">Nenhum histórico registrado</h3>
                                                        <p className="text-gray-500 text-sm max-w-sm">Adicione notas, reuniões e interações de CS para começar a construir o histórico deste cliente.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">Carteira de Clientes</h2>
                                        <p className="text-gray-500 text-sm">Monitoramento de CS e Saúde da Conta.</p>
                                    </div>
                                    <button className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm border border-white/10">
                                        <Filter size={18} /> Filtrar
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {clients.map(client => (
                                        <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-lime/30 cursor-pointer transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-lg">
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{client.name}</h3>
                                                        <p className="text-gray-500 text-sm">{client.company}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className="text-xs text-gray-500 uppercase font-bold mr-1">Saúde</span>
                                                        {getHealthScoreIcon(client.healthScore)}
                                                    </div>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${client.status === 'Ativo' ? 'text-brand-lime border-brand-lime/20 bg-brand-lime/10' : 'text-red-500 border-red-500/20'}`}>
                                                        {client.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-6 bg-black/20 p-4 rounded-xl">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">LTV</p>
                                                    <p className="text-sm font-bold mt-1 text-white">R$ {client.ltv}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Desde</p>
                                                    <p className="text-sm font-bold mt-1 text-white">{client.since}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Renovação</p>
                                                    <p className="text-sm font-bold mt-1 text-white">{client.contractEnd}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <History size={16} />
                                                    Última: {client.history[0]?.title}
                                                </div>
                                                <button className="text-brand-lime hover:underline text-xs font-bold">Ver Perfil</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* CONTRACTS TAB */}
                {activeTab === 'contracts' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Contratos & Acordos</h2>
                                <p className="text-gray-500 text-sm">Gerencie a validade e status dos contratos dos clientes.</p>
                            </div>
                            <button
                                onClick={() => setIsNewContractModalOpen(true)}
                                className="bg-brand-lime text-brand-black hover:bg-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                            >
                                <Plus size={18} /> Novo Contrato
                            </button>
                        </div>

                        {/* Contracts Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-brand-lime/10 rounded-lg text-brand-lime">
                                        <FileSignature size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Valor em Contrato</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">R$ {activeContractsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                <p className="text-gray-500 text-sm">Soma dos contratos ativos</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-yellow-400/10 rounded-lg text-yellow-400">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pendentes</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{contractsPendingSign}</h3>
                                <p className="text-gray-500 text-sm">Aguardando assinatura</p>
                            </div>
                        </div>

                        {/* Contracts List */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs uppercase text-gray-500 font-bold border-b border-white/10">
                                        <tr>
                                            <th className="pb-4 pl-4">Contrato</th>
                                            <th className="pb-4">Cliente</th>
                                            <th className="pb-4">Valor Total</th>
                                            <th className="pb-4">Vigência</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {contracts.map((contract) => (
                                            <tr
                                                key={contract.id}
                                                onClick={() => setSelectedContractForAction(contract)}
                                                className="hover:bg-white/5 transition-colors cursor-pointer group"
                                            >
                                                <td className="py-4 pl-4">
                                                    <p className="font-bold text-white group-hover:text-brand-lime transition-colors">{contract.title}</p>
                                                    <p className="text-xs text-gray-500">{contract.type}</p>
                                                </td>
                                                <td className="py-4 font-medium text-white">{contract.client}</td>
                                                <td className="py-4 text-gray-300">R$ {contract.value}</td>
                                                <td className="py-4 text-gray-400">
                                                    {contract.startDate} - {contract.endDate}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getContractStatusColor(contract.status)}`}>
                                                        {contract.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right pr-4">
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ONBOARDING TAB */}
                {activeTab === 'onboarding' && (
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                        {!selectedOnboardingProcess ? (
                            <>
                                <div className="flex justify-between items-center mb-10 animate-fadeIn">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">Onboarding de Clientes</h2>
                                        <p className="text-gray-400">Acompanhe a entrada de novos clientes e garanta o sucesso inicial.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsNewOnboardingModalOpen(true)}
                                        className="bg-brand-lime text-brand-black hover:bg-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-lime/20"
                                    >
                                        <Plus size={20} /> Novo Onboarding
                                    </button>
                                </div>

                                {/* Onboarding Overview Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                                <Rocket size={24} />
                                            </div>
                                            <span className="text-gray-400 text-sm font-bold uppercase">Em Andamento</span>
                                        </div>
                                        <h3 className="text-4xl font-bold text-white">{onboardingProcesses.length}</h3>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                                                <CheckCircle size={24} />
                                            </div>
                                            <span className="text-gray-400 text-sm font-bold uppercase">Concluídos (Mês)</span>
                                        </div>
                                        <h3 className="text-4xl font-bold text-white">12</h3>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                                <Target size={24} />
                                            </div>
                                            <span className="text-gray-400 text-sm font-bold uppercase">Taxa de Ativação</span>
                                        </div>
                                        <h3 className="text-4xl font-bold text-white">98%</h3>
                                    </div>
                                </div>

                                {/* Onboarding List */}
                                <div className="grid grid-cols-1 gap-6">
                                    {onboardingProcesses.map((process, idx) => (
                                        <div key={process.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-lime/50 transition-colors animate-fadeIn" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">

                                                <div className="flex items-start md:items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 font-bold text-xl">
                                                        {process.client.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">{process.client}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-brand-lime border border-white/5 uppercase tracking-wide">
                                                                {process.stage}
                                                            </span>
                                                            <span className="text-gray-500 text-xs">• Iniciado em {process.startDate}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 md:max-w-md">
                                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                                                        <span>Progresso</span>
                                                        <span className="text-white">{process.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand-lime rounded-full transition-all duration-1000 ease-out"
                                                            style={{ width: `${process.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-2 text-sm font-bold">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteOnboarding(process.id); }}
                                                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20"
                                                        title="Excluir Processo"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedOnboardingProcess(process)}
                                                        className="md:hidden flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-lg border border-white/10 transition-colors text-sm"
                                                    >
                                                        Ver Detalhes
                                                    </button>
                                                    <button onClick={() => setSelectedOnboardingProcess(process)} className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Ver Detalhes">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </div>

                                            </div>

                                            {/* Quick Steps View */}
                                            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                                {process.steps.map((step) => (
                                                    <div key={step.id} className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${step.completed ? 'bg-brand-lime/10 border-brand-lime/20 text-brand-lime' : 'bg-black/20 border-white/5 text-gray-500'}`}>
                                                        {step.completed ? <CheckCircle size={14} /> : <Circle size={14} />}
                                                        <span className={step.completed ? 'font-bold' : ''}>{step.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="animate-fadeIn pb-10">
                                <div className="flex justify-between items-center mb-6">
                                    <button
                                        onClick={() => setSelectedOnboardingProcess(null)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft size={20} /> Voltar para lista
                                    </button>
                                    <button
                                        onClick={() => handleDeleteOnboarding(selectedOnboardingProcess.id)}
                                        className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-sm font-medium bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20"
                                    >
                                        <Trash2 size={16} /> Excluir Cliente
                                    </button>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                                    {/* Decorator elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-10 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a1c] to-black flex items-center justify-center border border-white/20 font-bold text-3xl text-white shadow-xl">
                                                {selectedOnboardingProcess.client.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold text-white tracking-tight">{selectedOnboardingProcess.client}</h2>
                                                <p className="text-gray-400 mt-1 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></span>
                                                    Onboarding iniciado em {selectedOnboardingProcess.startDate}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <p className="text-gray-400 text-sm font-bold uppercase mb-1">Status Geral</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold px-3 py-1 rounded bg-white/10 text-brand-lime border border-brand-lime/20 uppercase tracking-wide">
                                                        {selectedOnboardingProcess.stage}
                                                    </span>
                                                    <span className="text-2xl font-bold">{selectedOnboardingProcess.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <CheckSquare className="text-brand-lime" /> Etapas do Processo
                                                </h3>
                                            </div>

                                            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mb-6">
                                                <div
                                                    className="h-full bg-brand-lime rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${selectedOnboardingProcess.progress}%` }}
                                                ></div>
                                            </div>

                                            <div className="space-y-3">
                                                {selectedOnboardingProcess.steps.map((step) => (
                                                    <div key={step.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${step.completed ? 'bg-brand-lime/5 border-brand-lime/30 shadow-[0_0_15px_rgba(204,255,0,0.05)]' : 'bg-black/30 border-white/10 hover:border-white/20'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => {
                                                                    const updatedSteps = selectedOnboardingProcess.steps.map(s => s.id === step.id ? { ...s, completed: !s.completed } : s);
                                                                    const completedCount = updatedSteps.filter(s => s.completed).length;
                                                                    const progress = Math.round((completedCount / updatedSteps.length) * 100);
                                                                    let stage = selectedOnboardingProcess.stage;
                                                                    if (progress === 100) stage = 'Go-Live';
                                                                    else if (progress > 50) stage = 'Treinamento';
                                                                    else if (progress > 10) stage = 'Configuração';
                                                                    else stage = 'Kickoff';

                                                                    const updatedProcess = { ...selectedOnboardingProcess, steps: updatedSteps, progress, stage: stage as any };
                                                                    setSelectedOnboardingProcess(updatedProcess);
                                                                    setOnboardingProcesses(onboardingProcesses.map(p => p.id === updatedProcess.id ? updatedProcess : p));
                                                                }}
                                                                className={`w-7 h-7 rounded flex items-center justify-center border transition-all duration-300 ${step.completed ? 'bg-brand-lime border-brand-lime text-black' : 'border-gray-500 hover:border-brand-lime hover:bg-brand-lime/10'}`}
                                                            >
                                                                {step.completed && <Check size={16} strokeWidth={3} />}
                                                            </button>
                                                            <span className={`font-medium text-base ${step.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{step.title}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-lg">
                                                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                                    <Info className="text-brand-lime" size={20} /> Informações do Cliente
                                                </h3>
                                                <div className="space-y-5">
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-1 uppercase font-bold tracking-wider">Email</p>
                                                        <div className="flex items-center gap-2">
                                                            <Mail size={14} className="text-gray-400" />
                                                            <p className="text-white text-sm font-medium">{selectedOnboardingProcess.clientEmail || `contato@${selectedOnboardingProcess.client.toLowerCase().replace(' ', '')}.com`}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-1 uppercase font-bold tracking-wider">Telefone / WhatsApp</p>
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-gray-400" />
                                                            <p className="text-white text-sm font-medium">{selectedOnboardingProcess.clientPhone || '+55 (11) 99999-9999'}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs mb-1 uppercase font-bold tracking-wider">Mídia e Arquivos</p>
                                                        <a href="#" className="text-brand-lime hover:underline text-sm font-medium flex items-center gap-2 w-fit">
                                                            <LinkIcon size={14} /> Drive Compartilhado
                                                        </a>
                                                    </div>
                                                    <div className="pt-4 border-t border-white/10">
                                                        <p className="text-gray-500 text-xs mb-2 uppercase font-bold tracking-wider">Responsável (CS)</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-brand-lime text-black flex items-center justify-center font-bold text-xs">
                                                                EC
                                                            </div>
                                                            <span className="text-white text-sm font-bold">Elizabeth Celina</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-brand-lime/5 border border-brand-lime/20 p-6 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-brand-lime/20"></div>
                                                <h3 className="text-lg font-bold text-brand-lime mb-2 flex items-center gap-2 relative z-10">
                                                    <Zap className="text-brand-lime" size={20} /> Próxima Ação
                                                </h3>
                                                <p className="text-sm text-gray-300 mb-5 relative z-10 leading-relaxed font-medium">
                                                    {selectedOnboardingProcess.steps.find(s => !s.completed)?.title
                                                        ? `Aguardando ${selectedOnboardingProcess.steps.find(s => !s.completed)?.title.toLowerCase()}.`
                                                        : 'Processo de onboarding 100% concluído e entregue com sucesso!'}
                                                </p>
                                                <button className="w-full bg-brand-lime text-black font-bold py-3 rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2 relative z-10">
                                                    <MessageSquare size={18} /> Requisitar Pendência
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* New Onboarding Modal */}
                        {isNewOnboardingModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">Iniciar Onboarding</h2>
                                        <button onClick={() => setIsNewOnboardingModalOpen(false)} className="text-gray-400 hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const cInfo = [...leads, ...clients].find(c => c.name === newOnboardingClient);
                                        const newProcess: OnboardingProcess = {
                                            id: Date.now(),
                                            client: newOnboardingClient,
                                            clientEmail: cInfo?.email || '',
                                            clientPhone: cInfo?.phone || '',
                                            stage: 'Kickoff',
                                            progress: 0,
                                            startDate: new Date().toLocaleDateString('pt-BR'),
                                            steps: [
                                                { id: 1, title: 'Reunião de Kickoff', completed: false },
                                                { id: 2, title: 'Acesso às Contas', completed: false },
                                                { id: 3, title: 'Configuração do CRM', completed: false },
                                                { id: 4, title: 'Treinamento da Equipe', completed: false },
                                                { id: 5, title: 'Lançamento Oficial', completed: false }
                                            ]
                                        };
                                        setOnboardingProcesses([newProcess, ...onboardingProcesses]);
                                        setNewOnboardingClient('');
                                        setIsNewOnboardingModalOpen(false);
                                    }} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-1">Cliente</label>
                                            <select
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                value={newOnboardingClient}
                                                onChange={(e) => setNewOnboardingClient(e.target.value)}
                                            >
                                                <option value="" disabled className="bg-[#1a1a1c] text-gray-500">Selecione...</option>
                                                {/* Combine Clients and Leads for selection */}
                                                {[...leads.filter(l => l.status === 'Fechado'), ...clients].map((c: any, i) => (
                                                    <option key={i} value={c.name} className="bg-[#1a1a1c] text-white">
                                                        {c.name} {c.company ? `(${c.company})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-xs text-brand-lime font-bold mb-2 uppercase">Template Padrão</p>
                                            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                                                <li>Reunião de Kickoff</li>
                                                <li>Acesso às Contas</li>
                                                <li>Configuração do CRM</li>
                                                <li>Treinamento da Equipe</li>
                                                <li>Lançamento Oficial</li>
                                            </ul>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-brand-lime text-black font-bold py-3 rounded-lg hover:bg-white transition-colors mt-6"
                                        >
                                            Iniciar Processo
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* PROPOSALS TAB */}
                {activeTab === 'proposals' && (
                    <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-10 animate-fadeIn">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Propostas Comerciais</h2>
                                <p className="text-gray-400">Crie e gerencie propostas enviadas aos seus leads e clientes.</p>
                            </div>
                            <button
                                onClick={() => { setNewProposal(initialProposalState); setIsNewProposalModalOpen(true); }}
                                className="bg-brand-lime text-brand-black hover:bg-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-lime/20"
                            >
                                <Plus size={20} /> Nova Proposta
                            </button>
                        </div>

                        {/* Proposals Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                        <Send size={24} />
                                    </div>
                                    <span className="text-gray-400 text-sm font-bold uppercase">Enviadas (Total)</span>
                                </div>
                                <h3 className="text-4xl font-bold text-white">{proposals.filter(p => p.status === 'Enviada').length}</h3>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                                        <CheckCircle size={24} />
                                    </div>
                                    <span className="text-gray-400 text-sm font-bold uppercase">Aprovadas</span>
                                </div>
                                <h3 className="text-4xl font-bold text-white">{proposals.filter(p => p.status === 'Aprovada').length}</h3>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                                        <Clock size={24} />
                                    </div>
                                    <span className="text-gray-400 text-sm font-bold uppercase">Rascunhos</span>
                                </div>
                                <h3 className="text-4xl font-bold text-white">{proposals.filter(p => p.status === 'Rascunho').length}</h3>
                            </div>
                        </div>

                        {/* Proposals List */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-xs uppercase text-gray-500 font-bold border-b border-white/10">
                                    <tr>
                                        <th className="pb-4 pl-4">Proposta</th>
                                        <th className="pb-4">Cliente</th>
                                        <th className="pb-4">Valor</th>
                                        <th className="pb-4">Enviar em</th>
                                        <th className="pb-4">Validade</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {proposals.map((proposal) => (
                                        <tr key={proposal.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setViewProposal(proposal)}>
                                            <td className="py-4 pl-4 font-bold text-white group-hover:text-brand-lime transition-colors">
                                                {proposal.title}
                                            </td>
                                            <td className="py-4 text-gray-300">{proposal.client}</td>
                                            <td className="py-4 text-gray-300">
                                                {proposal.setupPrice || proposal.monthlyPrice ? (
                                                    <div className="flex flex-col gap-0.5 leading-tight">
                                                        {proposal.setupPrice ? <span className="text-[11px] font-bold text-white">S: {proposal.setupPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> : null}
                                                        {proposal.monthlyPrice ? <span className="text-[11px] font-black text-brand-lime">M: {proposal.monthlyPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> : null}
                                                    </div>
                                                ) : (
                                                    `R$ ${proposal.value}`
                                                )}
                                            </td>
                                            <td className="py-4 text-gray-400">{proposal.date}</td>
                                            <td className="py-4 text-gray-400">{proposal.validUntil}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${proposal.status === 'Aprovada' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    proposal.status === 'Enviada' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        proposal.status === 'Rejeitada' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {proposal.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    title="Excluir proposta"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Excluir a proposta "${proposal.title}"? Esta ação não pode ser desfeita.`)) {
                                                            deleteProposalFromDb(proposal.id);
                                                        }
                                                    }}
                                                    className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Create Proposal Modal */}
                        {isNewProposalModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
                                <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-4xl p-6 shadow-2xl my-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">{newProposal.id ? 'Editar Proposta Comercial' : 'Nova Proposta Comercial'}</h2>
                                        <button onClick={() => { setIsNewProposalModalOpen(false); setNewProposal(initialProposalState); }} className="text-gray-400 hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const isEditing = !!newProposal.id;
                                        const finalId = newProposal.id || Date.now();

                                        const proposal: Proposal = {
                                            id: finalId,
                                            title: newProposal.title || 'Nova Proposta',
                                            client: newProposal.client || '',
                                            value: newProposal.value || '0,00',
                                            setupPrice: Number(newProposal.setupPrice) || 0,
                                            monthlyPrice: Number(newProposal.monthlyPrice) || 0,
                                            status: newProposal.status || 'Rascunho',
                                            date: newProposal.date || new Date().toLocaleDateString('pt-BR'),
                                            validUntil: newProposal.validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), // +15 days
                                            items: newProposal.items || [],
                                            context: newProposal.context,
                                            solution: newProposal.solution,
                                            scope: newProposal.scope,
                                            schedule: newProposal.schedule,
                                            paymentTerms: newProposal.paymentTerms,
                                            nextSteps: newProposal.nextSteps,
                                            shareToken: newProposal.shareToken || Math.random().toString(36).substring(2, 15) // Unique token for sharing
                                        };

                                        if (isEditing) {
                                            setProposals(prev => prev.map(p => p.id === proposal.id ? proposal : p));
                                        } else {
                                            setProposals(prev => [proposal, ...prev]);
                                        }
                                        await syncProposal(proposal);

                                        setNewProposal(initialProposalState);
                                        setIsNewProposalModalOpen(false);
                                    }} className="space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">

                                        {/* General Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 mb-1">Título da Proposta</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                    value={newProposal.title}
                                                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                                    placeholder="Ex: Gestão de Tráfego - Q3"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 mb-1">Cliente</label>
                                                <select
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                    value={newProposal.client}
                                                    onChange={(e) => setNewProposal({ ...newProposal, client: e.target.value })}
                                                >
                                                    <option value="" disabled className="bg-[#1a1a1c] text-gray-500">Selecione...</option>
                                                    {[...leads, ...clients].map((c: any, i) => (
                                                        <option key={i} value={c.name} className="bg-[#1a1a1c] text-white">
                                                            {c.name} {c.company ? `(${c.company})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 mb-1">Valor Total (R$)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                    value={newProposal.value}
                                                    onChange={(e) => setNewProposal({ ...newProposal, value: e.target.value })}
                                                    placeholder="0,00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 mb-1">Valor Inicial (Setup) - R$</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                    value={newProposal.setupPrice}
                                                    onChange={(e) => setNewProposal({ ...newProposal, setupPrice: Number(e.target.value) })}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 mb-1">Valor Mensal (Recorrente) - R$</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                    value={newProposal.monthlyPrice}
                                                    onChange={(e) => setNewProposal({ ...newProposal, monthlyPrice: Number(e.target.value) })}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-6"></div>

                                        {/* 1. Contexto */}
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-lime mb-4">1. Contexto & Diagnóstico</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Resumo do Diagnóstico</label>
                                                    <textarea
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none h-24"
                                                        value={newProposal.context?.diagnosis}
                                                        onChange={(e) => setNewProposal({ ...newProposal, context: { ...newProposal.context!, diagnosis: e.target.value } })}
                                                        placeholder="Descreva a situação atual..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-400 mb-1">Impacto Atual</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                            value={newProposal.context?.impact}
                                                            onChange={(e) => setNewProposal({ ...newProposal, context: { ...newProposal.context!, impact: e.target.value } })}
                                                            placeholder="Ex: Perda de oportunidades..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-400 mb-1">Oportunidade</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                            value={newProposal.context?.opportunity}
                                                            onChange={(e) => setNewProposal({ ...newProposal, context: { ...newProposal.context!, opportunity: e.target.value } })}
                                                            placeholder="Ex: Posicionar como líder..."
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Gargalos Identificados</label>
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-brand-lime focus:outline-none"
                                                            value={tempBottleneck}
                                                            onChange={(e) => setTempBottleneck(e.target.value)}
                                                            placeholder="Adicionar gargalo..."
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (tempBottleneck) {
                                                                    setNewProposal({ ...newProposal, context: { ...newProposal.context!, bottlenecks: [...(newProposal.context?.bottlenecks || []), tempBottleneck] } });
                                                                    setTempBottleneck('');
                                                                }
                                                            }}
                                                            className="bg-brand-lime/20 text-brand-lime p-2 rounded-lg hover:bg-brand-lime hover:text-black"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {newProposal.context?.bottlenecks?.map((b, i) => (
                                                            <span key={i} className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                                                                {b}
                                                                <button type="button" onClick={() => {
                                                                    const newBottlenecks = newProposal.context?.bottlenecks?.filter((_, idx) => idx !== i);
                                                                    setNewProposal({ ...newProposal, context: { ...newProposal.context!, bottlenecks: newBottlenecks! } });
                                                                }}><X size={12} /></button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-6"></div>

                                        {/* 2. Solução */}
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-lime mb-4">2. Solução Recomendada</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Nome da Solução</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                        value={newProposal.solution?.name}
                                                        onChange={(e) => setNewProposal({ ...newProposal, solution: { ...newProposal.solution!, name: e.target.value } })}
                                                        placeholder="Ex: Sistema Comercial Integrado"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Descrição Estratégica</label>
                                                    <textarea
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none h-24"
                                                        value={newProposal.solution?.strategicDescription}
                                                        onChange={(e) => setNewProposal({ ...newProposal, solution: { ...newProposal.solution!, strategicDescription: e.target.value } })}
                                                        placeholder="Explique a estratégia..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-400 mb-1">Como resolve</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                            value={newProposal.solution?.howItSolves}
                                                            onChange={(e) => setNewProposal({ ...newProposal, solution: { ...newProposal.solution!, howItSolves: e.target.value } })}
                                                            placeholder="Explique a resolução..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-400 mb-1">Impacto Esperado</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                            value={newProposal.solution?.expectedImpact}
                                                            onChange={(e) => setNewProposal({ ...newProposal, solution: { ...newProposal.solution!, expectedImpact: e.target.value } })}
                                                            placeholder="Ex: Aumento de 30%..."
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">O que será construído</label>
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-brand-lime focus:outline-none"
                                                            value={tempBuiltItem}
                                                            onChange={(e) => setTempBuiltItem(e.target.value)}
                                                            placeholder="Adicionar item..."
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (tempBuiltItem) {
                                                                    setNewProposal({ ...newProposal, solution: { ...newProposal.solution!, whatWillBeBuilt: [...(newProposal.solution?.whatWillBeBuilt || []), tempBuiltItem] } });
                                                                    setTempBuiltItem('');
                                                                }
                                                            }}
                                                            className="bg-brand-lime/20 text-brand-lime p-2 rounded-lg hover:bg-brand-lime hover:text-black"
                                                        >
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {newProposal.solution?.whatWillBeBuilt?.map((b, i) => (
                                                            <span key={i} className="bg-brand-lime/10 text-brand-lime px-3 py-1 rounded-full text-xs flex items-center gap-2">
                                                                {b}
                                                                <button type="button" onClick={() => {
                                                                    const newItems = newProposal.solution?.whatWillBeBuilt?.filter((_, idx) => idx !== i);
                                                                    setNewProposal({ ...newProposal, solution: { ...newProposal.solution!, whatWillBeBuilt: newItems! } });
                                                                }}><X size={12} /></button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-6"></div>

                                        {/* 3. Escopo & 4. Cronograma */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Escopo */}
                                            <div>
                                                <h3 className="text-lg font-bold text-brand-lime mb-4">3. Escopo Detalhado</h3>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-brand-lime focus:outline-none"
                                                        value={tempScopeItem}
                                                        onChange={(e) => setTempScopeItem(e.target.value)}
                                                        placeholder="Adicionar item de escopo..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (tempScopeItem) {
                                                                setNewProposal({ ...newProposal, scope: [...(newProposal.scope || []), tempScopeItem] });
                                                                setTempScopeItem('');
                                                            }
                                                        }}
                                                        className="bg-brand-lime/20 text-brand-lime p-2 rounded-lg hover:bg-brand-lime hover:text-black"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                                <ul className="space-y-2">
                                                    {newProposal.scope?.map((item, i) => (
                                                        <li key={i} className="text-sm text-gray-300 flex justify-between bg-white/5 p-2 rounded">
                                                            {item}
                                                            <button type="button" onClick={() => {
                                                                const newScope = newProposal.scope?.filter((_, idx) => idx !== i);
                                                                setNewProposal({ ...newProposal, scope: newScope });
                                                            }} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Cronograma */}
                                            <div>
                                                <h3 className="text-lg font-bold text-brand-lime mb-4">4. Cronograma</h3>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        className="w-24 bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-brand-lime focus:outline-none"
                                                        value={tempScheduleWeek}
                                                        onChange={(e) => setTempScheduleWeek(e.target.value)}
                                                        placeholder="Semana..."
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-brand-lime focus:outline-none"
                                                        value={tempScheduleTask}
                                                        onChange={(e) => setTempScheduleTask(e.target.value)}
                                                        placeholder="Tarefa..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (tempScheduleWeek && tempScheduleTask) {
                                                                setNewProposal({ ...newProposal, schedule: [...(newProposal.schedule || []), { week: tempScheduleWeek, task: tempScheduleTask }] });
                                                                setTempScheduleWeek('');
                                                                setTempScheduleTask('');
                                                            }
                                                        }}
                                                        className="bg-brand-lime/20 text-brand-lime p-2 rounded-lg hover:bg-brand-lime hover:text-black"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                </div>
                                                <ul className="space-y-2">
                                                    {newProposal.schedule?.map((item, i) => (
                                                        <li key={i} className="text-sm text-gray-300 flex justify-between bg-white/5 p-2 rounded">
                                                            <span className="font-bold mr-2">{item.week}:</span> {item.task}
                                                            <button type="button" onClick={() => {
                                                                const newSchedule = newProposal.schedule?.filter((_, idx) => idx !== i);
                                                                setNewProposal({ ...newProposal, schedule: newSchedule });
                                                            }} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-6"></div>

                                        {/* 5. Fechamento */}
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-lime mb-4">5. Fechamento</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Condições de Pagamento</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                        value={newProposal.paymentTerms}
                                                        onChange={(e) => setNewProposal({ ...newProposal, paymentTerms: e.target.value })}
                                                        placeholder="Ex: 50% na assinatura..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Próximo Passo</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                        value={newProposal.nextSteps}
                                                        onChange={(e) => setNewProposal({ ...newProposal, nextSteps: e.target.value })}
                                                        placeholder="Ex: Assinatura do contrato..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-brand-lime text-black font-bold py-4 rounded-xl hover:bg-white transition-colors mt-8 shadow-lg shadow-brand-lime/20"
                                        >
                                            Criar Rascunho da Proposta
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* View Proposal Modal */}
                        {viewProposal && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
                                <div className="fixed top-6 right-6 z-[80] flex items-center gap-2">
                                    <button
                                        title="Editar proposta"
                                        onClick={() => {
                                            setNewProposal(viewProposal);
                                            setIsNewProposalModalOpen(true);
                                            setViewProposal(null);
                                        }}
                                        className="text-white hover:text-brand-lime transition-colors bg-black/50 px-3 py-2 rounded-full backdrop-blur-md flex items-center gap-1.5 text-sm font-bold border border-white/10 hover:border-brand-lime/30"
                                    >
                                        <PenTool size={16} />
                                        Editar
                                    </button>
                                    <button
                                        title="Excluir proposta"
                                        onClick={() => {
                                            if (confirm(`Excluir a proposta "${viewProposal.title}"? Esta ação não pode ser desfeita.`)) {
                                                deleteProposalFromDb(viewProposal.id);
                                                setViewProposal(null);
                                            }
                                        }}
                                        className="text-white hover:text-red-400 transition-colors bg-black/50 px-3 py-2 rounded-full backdrop-blur-md flex items-center gap-1.5 text-sm font-bold border border-white/10 hover:border-red-400/30"
                                    >
                                        <Trash2 size={16} />
                                        Excluir
                                    </button>
                                    <button
                                        onClick={() => setViewProposal(null)}
                                        className="text-white hover:text-brand-lime transition-colors bg-black/50 p-2 rounded-full backdrop-blur-md"
                                    >
                                        <X size={32} />
                                    </button>
                                </div>

                                <div className="w-full max-w-3xl bg-white text-black rounded-lg shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
                                    {/* Proposal Header */}
                                    <div className="bg-brand-black text-white p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime rounded-bl-full opacity-20 transform translate-x-10 -translate-y-10"></div>
                                        <div className="relative z-10">
                                            <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
                                            <p className="text-brand-lime font-bold uppercase tracking-widest text-sm">{viewProposal.title}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 sm:p-12 overflow-y-auto max-h-[70vh] custom-scrollbar">

                                        {/* 1. Contexto */}
                                        {viewProposal.context && (
                                            <div className="mb-10">
                                                <h2 className="text-xl font-bold text-brand-black mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-brand-lime"></div>
                                                    1. Contexto & Diagnóstico
                                                </h2>
                                                <p className="text-gray-600 mb-4 leading-relaxed">{viewProposal.context.diagnosis}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                        <h3 className="font-bold text-red-800 mb-2 text-sm uppercase">Gargalos Identificados</h3>
                                                        <ul className="list-disc pl-5 space-y-1 text-red-700 text-sm">
                                                            {viewProposal.context.bottlenecks.map((b, i) => <li key={i}>{b}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                        <h3 className="font-bold text-green-800 mb-2 text-sm uppercase">Oportunidade</h3>
                                                        <p className="text-green-700 text-sm">{viewProposal.context.opportunity}</p>
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-sm font-medium text-gray-500">Impacto Atual: {viewProposal.context.impact}</p>
                                            </div>
                                        )}

                                        {/* 2. Solução Recomendada */}
                                        {viewProposal.solution && (
                                            <div className="mb-10">
                                                <h2 className="text-xl font-bold text-brand-black mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-brand-lime"></div>
                                                    2. Solução Recomendada: {viewProposal.solution.name}
                                                </h2>
                                                <p className="text-gray-600 mb-6 italic border-l-4 border-gray-200 pl-4">{viewProposal.solution.strategicDescription}</p>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">O que será construído:</h3>
                                                        <ul className="list-disc pl-5 text-gray-600 mt-1">
                                                            {viewProposal.solution.whatWillBeBuilt.map((item, i) => <li key={i}>{item}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">Como resolve os gargalos:</h3>
                                                        <p className="text-gray-600">{viewProposal.solution.howItSolves}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. Escopo Detalhado */}
                                        {viewProposal.scope && (
                                            <div className="mb-10">
                                                <h2 className="text-xl font-bold text-brand-black mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-brand-lime"></div>
                                                    3. Escopo Detalhado
                                                </h2>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                                                    {viewProposal.scope.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <CheckCircle size={18} className="text-brand-lime mt-1 shrink-0" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* 4. Cronograma */}
                                        {viewProposal.schedule && (
                                            <div className="mb-10">
                                                <h2 className="text-xl font-bold text-brand-black mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-brand-lime"></div>
                                                    4. Cronograma de Implementação
                                                </h2>
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    {viewProposal.schedule.map((item, i) => (
                                                        <div key={i} className="flex border-b border-gray-200 last:border-0">
                                                            <div className="bg-gray-50 w-32 p-3 font-bold text-gray-600 border-r border-gray-200 text-sm flex items-center">{item.week}</div>
                                                            <div className="p-3 text-gray-700 flex-1 text-sm">{item.task}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 5. Investimento */}
                                        <div className="mb-10">
                                            <h2 className="text-xl font-bold text-brand-black mb-4 flex items-center gap-2">
                                                <div className="w-1 h-6 bg-brand-lime"></div>
                                                5. Investimento
                                            </h2>
                                            <div className="bg-brand-black text-white p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div>
                                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Valor Total do Projeto</p>
                                                    <p className="text-4xl font-bold text-brand-lime">R$ {viewProposal.value}</p>
                                                </div>
                                                <div className="text-right">
                                                    {viewProposal.paymentTerms && (
                                                        <p className="text-sm text-gray-300 mb-1"><span className="font-bold text-white">Condições:</span> {viewProposal.paymentTerms}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">Proposta válida até {viewProposal.validUntil}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 6. Próximo Passo */}
                                        {viewProposal.nextSteps && (
                                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
                                                <h3 className="font-bold text-green-700 text-lg mb-2">Próximo Passo</h3>
                                                <p className="text-green-800 font-medium">{viewProposal.nextSteps}</p>
                                            </div>
                                        )}

                                    </div>

                                    <div className="bg-gray-50 p-6 flex justify-between gap-4 border-t border-gray-200">
                                        <button
                                            onClick={async () => {
                                                const synced = await syncProposal(viewProposal);
                                                copyToClipboard(generateShareLink(synced));
                                            }}
                                            className="text-brand-lime hover:text-black hover:bg-brand-lime/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium border border-brand-lime/20"
                                        >
                                            <Link size={18} />
                                            Copiar Link Compartilhável
                                        </button>

                                        <div className="flex gap-4">
                                            <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                                                <Download size={20} />
                                                <span className="hidden sm:inline">PDF</span>
                                            </button>

                                            {viewProposal.status === 'Aprovada' ? (
                                                <button
                                                    onClick={() => {
                                                        // Pre-fill contract from proposal, find matching lead for phone/email
                                                        const matchedLead = leads.find(l =>
                                                            l.name.toLowerCase().includes(viewProposal.client.toLowerCase().split(' ')[0]) ||
                                                            viewProposal.client.toLowerCase().includes(l.name.toLowerCase().split(' ')[0])
                                                        ) || null;
                                                        setSelectedLeadForContract(matchedLead);
                                                        handleGenerateContractFromProposal(viewProposal);
                                                    }}
                                                    className="bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-blue/80 transition-all flex items-center gap-2"
                                                >
                                                    <FileText size={18} />
                                                    Gerar Contrato
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        const updated = { ...viewProposal, status: 'Aprovada' as const };
                                                        setProposals(prev => prev.map(p => p.id === viewProposal.id ? updated : p));
                                                        setViewProposal(updated);
                                                        await syncProposal(updated);

                                                        // Create admin notification
                                                        const existingNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
                                                        existingNotifs.unshift({
                                                            id: Date.now(),
                                                            type: 'proposal_approved',
                                                            text: `🎉 Proposta "${viewProposal.title}" marcada como aprovada! Pronto para gerar o contrato.`,
                                                            time: 'Agora mesmo',
                                                            read: false,
                                                            proposalId: viewProposal.id
                                                        });
                                                        localStorage.setItem('admin_notifications', JSON.stringify(existingNotifs));
                                                    }}
                                                    className="bg-brand-lime text-black px-6 py-2 rounded-lg font-bold hover:bg-black hover:text-brand-lime transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle size={18} />
                                                    Aprovar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* LEAD DETAILS MODAL */}
                {selectedLead && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/40">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-full bg-brand-lime/20 flex items-center justify-center text-brand-lime font-bold text-xl border border-brand-lime/30">
                                        {selectedLead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold text-white">{selectedLead.name}</h2>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedLead.priority === 'High' ? 'text-red-400 border-red-400/20 bg-red-400/10' : selectedLead.priority === 'Medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' : 'text-blue-400 border-blue-400/20 bg-blue-400/10'}`}>
                                                {selectedLead.priority}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm flex items-center gap-2">
                                            <Briefcase size={14} /> {selectedLead.company}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDeleteLead}
                                        className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                        title="Excluir Lead"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Main Content - Left Column */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-white/10">
                                    {/* Status Pipeline */}
                                    <div className="mb-8 ">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Estágio do Funil</h3>
                                        <div className="flex items-center gap-1 w-full bg-black/40 p-1 rounded-lg">
                                            {stages.map((stage, idx) => {
                                                const isActive = selectedLead.status === stage;
                                                const isPast = stages.indexOf(selectedLead.status) > idx;
                                                return (
                                                    <button
                                                        key={stage}
                                                        onClick={() => updateSelectedLead({ status: stage })}
                                                        className={`flex-1 py-2 px-1 rounded-md text-[10px] font-bold text-center transition-all ${isActive
                                                            ? 'bg-brand-lime text-black shadow-lg shadow-brand-lime/20'
                                                            : isPast
                                                                ? 'bg-brand-lime/20 text-brand-lime'
                                                                : 'text-gray-600 hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {stage}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Valor Estimado</h3>
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={18} className="text-brand-lime" />
                                                <input
                                                    className="bg-transparent text-xl font-bold text-white focus:outline-none w-full"
                                                    value={selectedLead.value}
                                                    onChange={(e) => updateSelectedLead({ value: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Data Limite</h3>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} className="text-blue-400" />
                                                <input
                                                    className="bg-transparent text-sm font-bold text-white focus:outline-none w-full"
                                                    value={selectedLead.date}
                                                    onChange={(e) => updateSelectedLead({ date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Qualification Fields */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <Target size={18} className="text-brand-lime" /> Qualificação do Lead
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Nicho de Mercado</label>
                                                <input
                                                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                                                    placeholder="Ex: E-commerce de Moda"
                                                    value={selectedLead.niche || ''}
                                                    onChange={(e) => updateSelectedLead({ niche: e.target.value })}
                                                />
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Faturamento Atual</label>
                                                <input
                                                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                                                    placeholder="Ex: R$ 50k/mês"
                                                    value={selectedLead.revenue || ''}
                                                    onChange={(e) => updateSelectedLead({ revenue: e.target.value })}
                                                />
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Meta de Crescimento</label>
                                                <input
                                                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                                                    placeholder="Ex: Dobrar faturamento"
                                                    value={selectedLead.growthGoal || ''}
                                                    onChange={(e) => updateSelectedLead({ growthGoal: e.target.value })}
                                                />
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Orçamento Aproximado</label>
                                                <input
                                                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                                                    placeholder="Ex: R$ 5k - R$ 10k"
                                                    value={selectedLead.estimatedBudget || ''}
                                                    onChange={(e) => updateSelectedLead({ estimatedBudget: e.target.value })}
                                                />
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 md:col-span-2">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Maior Gargalo Hoje</label>
                                                <input
                                                    className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-600"
                                                    placeholder="Ex: Leads desqualificados, falta de processos..."
                                                    value={selectedLead.bottleneck || ''}
                                                    onChange={(e) => updateSelectedLead({ bottleneck: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                            <List size={18} /> Checklist
                                        </h3>
                                        <div className="space-y-2 mb-4">
                                            {selectedLead.tasks?.map(task => (
                                                <div key={task.id} className="flex items-center gap-3 group">
                                                    <button
                                                        onClick={() => toggleLeadTask(task.id)}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.done
                                                            ? 'bg-brand-lime border-brand-lime text-black'
                                                            : 'border-gray-600 hover:border-brand-lime'
                                                            }`}
                                                    >
                                                        {task.done && <Check size={12} strokeWidth={4} />}
                                                    </button>
                                                    <span className={`text-sm flex-1 ${task.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                                        {task.text}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            const remaining = selectedLead.tasks?.filter(t => t.id !== task.id);
                                                            updateSelectedLead({ tasks: remaining });
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-all"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Adicionar tarefa..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                                                value={taskInput}
                                                onChange={(e) => setTaskInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                            />
                                            <button
                                                onClick={handleAddTask}
                                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                            <History size={18} /> Histórico
                                        </h3>
                                        <div className="relative pl-4 border-l border-white/10 space-y-6">
                                            {selectedLead.history?.map((item, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-brand-lime border-2 border-[#1a1a1c]"></div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-brand-lime">{item.type}</span>
                                                        <span className="text-[10px] text-gray-600">{item.date}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Adicionar nota..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                                                value={noteInput}
                                                onChange={(e) => setNoteInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                            />
                                            <button
                                                onClick={handleAddNote}
                                                className="bg-brand-lime text-black p-2 rounded-lg hover:bg-white transition-colors"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar - Right Column */}
                                <div className="w-full md:w-80 bg-black/20 p-6 border-l border-white/10 flex flex-col gap-6 ">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Contato</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] text-gray-600 font-bold uppercase mb-1 block">Email</label>
                                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <Mail size={14} />
                                                    <input
                                                        className="bg-transparent w-full focus:outline-none"
                                                        value={selectedLead.email || ''}
                                                        onChange={(e) => updateSelectedLead({ email: e.target.value })}
                                                        placeholder="Adicionar email"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-600 font-bold uppercase mb-1 block">Telefone</label>
                                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <Phone size={14} />
                                                    <input
                                                        className="bg-transparent w-full focus:outline-none"
                                                        value={selectedLead.phone || ''}
                                                        onChange={(e) => updateSelectedLead({ phone: e.target.value })}
                                                        placeholder="Adicionar telefone"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Ações Rápidas</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <a
                                                href={selectedLead.phone ? `https://wa.me/${selectedLead.phone.replace(/\D/g, '')}` : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${selectedLead.phone
                                                    ? 'bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20'
                                                    : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                <MessageSquare size={20} />
                                                <span className="text-xs font-bold">WhatsApp</span>
                                            </a>
                                            <a
                                                href={selectedLead.email ? `mailto:${selectedLead.email}` : '#'}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${selectedLead.email
                                                    ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/20'
                                                    : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Mail size={20} />
                                                <span className="text-xs font-bold">Email</span>
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedLeadForContract(selectedLead);
                                                setContractMode('new_lead');
                                                setNewContract({ ...newContract, client: selectedLead.name });
                                                setIsNewContractModalOpen(true);
                                            }}
                                            className="w-full mt-2 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border bg-brand-lime/10 border-brand-lime/20 text-brand-lime hover:bg-brand-lime/20 transition-colors"
                                        >
                                            <FileSignature size={20} />
                                            <span className="text-xs font-bold">Gerar Contrato</span>
                                        </button>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BRIEFINGS TAB (Análise Comercial) */}
                {activeTab === 'briefings' && (
                            <div className="animate-fadeIn space-y-8 h-full flex flex-col">
                                <div className="flex justify-between items-center bg-[#1a1a1c] p-6 rounded-3xl border border-white/10 shadow-2xl shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 text-brand-lime">
                                            <ClipboardList size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-1">Análises Comerciais</h2>
                                            <p className="text-gray-400 font-medium">Resultados do mapeamento estratégico de clientes</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsBriefingLinkModalOpen(true)}
                                            className="bg-brand-lime text-brand-black hover:bg-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-brand-lime/20"
                                        >
                                            <LinkIcon size={20} /> Copiar Link do Formulário Público
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex gap-6 overflow-hidden">
                                    {/* Briefings List */}
                                    <div className="w-1/3 flex flex-col bg-[#1a1a1c] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                        <div className="p-4 border-b border-white/10 bg-black/20 font-bold text-gray-300 flex items-center gap-2">
                                            <Users size={18} className="text-brand-lime" /> Últimos Diagnósticos
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                            {briefings.length === 0 ? (
                                                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 mt-4 mx-2">
                                                    <ClipboardList size={40} className="text-gray-600 mx-auto mb-3" />
                                                    <p className="text-gray-400 text-sm">Nenhuma análise comercial recebida ainda.</p>
                                                </div>
                                            ) : (
                                                briefings.map(b => (
                                                    <button
                                                        key={b.id}
                                                        onClick={() => setSelectedBriefing(b)}
                                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedBriefing?.id === b.id ? 'bg-brand-lime/10 border-brand-lime/30 shadow-lg' : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${b.status === 'completed' ? 'text-brand-lime border-brand-lime/20 bg-brand-lime/10' : 'text-amber-400 border-amber-400/20 bg-amber-400/10'}`}>
                                                                {b.status === 'completed' ? 'Respondido' : 'Pendente'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500">{new Date(b.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <h4 className={`font-bold ${selectedBriefing?.id === b.id ? 'text-brand-lime' : 'text-white'}`}>{b.client_name}</h4>
                                                        {b.client_email && <p className="text-xs text-gray-500 mt-1">{b.client_email}</p>}

                                                        {b.status === 'completed' && b.maturity_score !== undefined && (
                                                            <div className="mt-3 flex items-center gap-2 bg-black/40 px-2 py-1.5 rounded-lg w-fit">
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Score</span>
                                                                <span className={`text-sm font-black ${b.maturity_score >= 70 ? 'text-emerald-400' : b.maturity_score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                    {b.maturity_score}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Briefing Details */}
                                    <div className="flex-1 bg-[#1a1a1c] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                                        {selectedBriefing ? (
                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                <div className="p-8 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <div className="flex items-center gap-4 mb-2">
                                                                <h3 className="text-3xl font-black text-white">{selectedBriefing.client_name}</h3>
                                                                <button
                                                                    onClick={() => handleDeleteBriefing(selectedBriefing.id)}
                                                                    className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                                    title="Excluir Análise Comercial"
                                                                >
                                                                    <Trash2 size={24} />
                                                                </button>
                                                            </div>
                                                            {selectedBriefing.client_email && <p className="text-gray-400 flex items-center gap-2"><Mail size={14} /> {selectedBriefing.client_email}</p>}
                                                        </div>
                                                        <div className="text-right">
                                                            {selectedBriefing.status === 'completed' && selectedBriefing.maturity_score !== undefined && (
                                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Score Inteligente</div>
                                                                    <div className={`text-4xl font-black ${selectedBriefing.maturity_score >= 70 ? 'text-emerald-400' : selectedBriefing.maturity_score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                        {selectedBriefing.maturity_score}%
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {selectedBriefing.status === 'completed' && (
                                                                <button
                                                                    onClick={() => handleAnalyzeBriefing(selectedBriefing)}
                                                                    disabled={isAnalyzingBriefing}
                                                                    className="mt-4 w-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10"
                                                                >
                                                                    {isAnalyzingBriefing ? (
                                                                        <><RefreshCw size={18} className="animate-spin" /> Analisando e Criando Proposta...</>
                                                                    ) : (
                                                                        <><Bot size={18} /> Transformar Análise Comercial em Proposta</>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedBriefing.status === 'completed' && selectedBriefing.responses ? (
                                                    <div className="p-8 space-y-8">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {Object.entries(selectedBriefing.responses).map(([key, value]) => {
                                                                const briefingQuestionsMap: Record<string, string> = {
                                                                    company_name: 'Nome da empresa',
                                                                    niche: 'Nicho de atuação',
                                                                    main_product: 'Produto/serviço principal',
                                                                    avg_ticket: 'Ticket médio',
                                                                    monthly_clients: 'Quantidade média de clientes por mês',
                                                                    team_size: 'Tamanho da equipe comercial',
                                                                    lead_sources: 'De onde vêm seus leads hoje?',
                                                                    monthly_leads: 'Quantos leads por mês aproximadamente?',
                                                                    has_landing_page: 'Existe página de captura (landing page)?',
                                                                    who_responds: 'Quem responde os leads?',
                                                                    response_time: 'Quanto tempo demora para responder?',
                                                                    has_script: 'Existe script ou roteiro de vendas?',
                                                                    uses_crm: 'Usa CRM ou planilha para acompanhar?',
                                                                    where_loses: 'Em qual etapa mais perde cliente?',
                                                                    current_tools: 'Quais ferramentas usa hoje?',
                                                                    uses_whatsapp_biz: 'Usa WhatsApp Business com catálogo e etiquetas?',
                                                                    uses_email_mkt: 'Faz email marketing?',
                                                                    automation_level: 'Nível de automação hoje (1 a 5)',
                                                                    biggest_frustration: 'O que mais frustra hoje no processo comercial?',
                                                                    growth_bottleneck: 'Qual gargalo mais atrapalha o crescimento?',
                                                                    wants_to_automate: 'O que você gostaria de automatizar?',
                                                                    first_priority: 'O que você quer resolver primeiro?',
                                                                    ideal_outcome: 'Em 3 meses, qual resultado ideal?',
                                                                    investment_readiness: 'Disposição para investir em estrutura (1 a 5)',
                                                                };

                                                                const displayLabel = briefingQuestionsMap[key] || key.replace(/_/g, ' ');

                                                                return (
                                                                    <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-brand-lime/20 transition-colors">
                                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">{displayLabel}</span>
                                                                        <div className="text-sm font-medium text-gray-200">
                                                                            {Array.isArray(value) ? (
                                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                                    {value.map(v => <span key={v} className="bg-white/10 px-2 py-1 rounded text-xs">{v}</span>)}
                                                                                </div>
                                                                            ) : (
                                                                                <p>{value}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center p-12 text-center">
                                                        <div>
                                                            <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/20">
                                                                <Clock size={32} className="text-amber-400 animate-pulse" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white mb-2">Aguardando Respostas</h3>
                                                            <p className="text-gray-500">Este cliente ainda não completou o diagnóstico.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
                                                <div>
                                                    <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                                                    <p>Selecione uma análise comercial ao lado para visualizar os detalhes.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                        }

                        {/* CALENDAR TAB */}
                        {
                            activeTab === 'calendar' && (
                                <div className="animate-fadeIn space-y-8">
                                    {/* Header */}
                                    <div className="flex justify-between items-center bg-[#1a1a1c] p-6 rounded-3xl border border-white/10 shadow-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 text-brand-lime">
                                                <Calendar size={32} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold text-white mb-1">Calendário Operacional</h2>
                                                <p className="text-gray-400 font-medium">Cronograma de projetos, pagamentos e entregas</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-black/30 p-2 rounded-2xl border border-white/5">
                                            <button
                                                onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))}
                                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="text-lg font-bold min-w-[120px] text-center text-white">
                                                {calendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                                            </span>
                                            <button
                                                onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))}
                                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                            <button
                                                onClick={() => setCalendarDate(new Date())}
                                                className="ml-2 px-4 py-2 bg-brand-lime text-black font-bold rounded-xl hover:bg-white transition-colors"
                                            >
                                                Hoje
                                            </button>
                                            <button
                                                onClick={() => setIsNewEventModalOpen(true)}
                                                className="ml-2 px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/10"
                                            >
                                                <Plus size={16} /> Novo Evento
                                            </button>
                                        </div>
                                    </div>

                                    {/* Legenda */}
                                    <div className="flex flex-wrap gap-4 items-center px-2">
                                        <span className="text-sm font-bold text-gray-400">Legenda:</span>
                                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-blue"></span><span className="text-xs text-gray-300">Projetos</span></div>
                                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span><span className="text-xs text-gray-300">Contratos</span></div>
                                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-lime"></span><span className="text-xs text-gray-300">Faturas Pagas</span></div>
                                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span><span className="text-xs text-gray-300">Faturas Pendentes</span></div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="bg-[#1a1a1c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                                        {/* Days of Week */}
                                        <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
                                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                                <div key={day} className="p-4 text-center text-sm font-bold text-gray-400">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar Days */}
                                        <div className="grid grid-cols-7 auto-rows-[140px]">
                                            {Array.from({ length: calendarFirstDay }).map((_, i) => (
                                                <div key={`empty-${i}`} className="p-2 border-b border-r border-white/5 bg-white/[0.02]"></div>
                                            ))}

                                            {calendarMonthDays.map(day => {
                                                const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                                                const isToday = new Date().toDateString() === currentDate.toDateString();

                                                // Get events for this day
                                                const dayEvents = calendarEvents.filter(e => e.date.toDateString() === currentDate.toDateString());

                                                return (
                                                    <div key={day} className={`p-2 border-b border-r border-white/5 relative group transition-colors ${isToday ? 'bg-brand-lime/5' : 'hover:bg-white/5'}`}>
                                                        <div className="flex items-center justify-between pl-1 mb-2">
                                                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-lime text-black shadow-[0_0_15px_rgba(204,255,0,0.5)]' : 'text-gray-400 group-hover:text-white'}`}>
                                                                {day}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1.5 overflow-y-auto max-h-[90px] custom-scrollbar px-1 block group">
                                                            {dayEvents.map((evt: any, i) => (
                                                                <div key={i} onClick={() => setSelectedEventDetails(evt)} className={`relative px-2 py-1 rounded truncate border ${evt.color} cursor-pointer hover:brightness-125 transition-all text-xs font-bold shadow-sm flex justify-between items-center group/item`}>
                                                                    <span className="truncate pr-4">{evt.title}</span>
                                                                    {evt.id.startsWith('custom-') && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(Number(evt.id.split('-')[1])); }}
                                                                            className="absolute right-1 text-white/50 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5"
                                                                            title="Excluir evento"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {Array.from({ length: (7 - ((calendarFirstDay + calendarMonthDays.length) % 7)) % 7 }).map((_, i) => (
                                                <div key={`end-empty-${i}`} className="p-2 border-b border-r border-white/5 bg-white/[0.02]"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Modal para Adicionar Novo Evento */}
                                    {isNewEventModalOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                                                <h3 className="text-xl font-bold text-white mb-6">Criar Novo Evento</h3>
                                                <button onClick={() => setIsNewEventModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                                                    <X size={20} />
                                                </button>
                                                <form onSubmit={handleCreateEvent} className="space-y-5">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-1">Título do Evento</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={newEvent.title}
                                                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors"
                                                            placeholder="Ex: Reunião de Alinhamento"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex gap-4">
                                                            <div className="w-1/2">
                                                                <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
                                                                <input
                                                                    type="date"
                                                                    required
                                                                    value={newEvent.date}
                                                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors calendar-picker-indicator-white"
                                                                />
                                                            </div>
                                                            <div className="w-1/2">
                                                                <label className="block text-sm font-medium text-gray-400 mb-1">Horário (opcional)</label>
                                                                <input
                                                                    type="time"
                                                                    value={newEvent.time}
                                                                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors calendar-picker-indicator-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-1">Com quem será?</label>
                                                        <select
                                                            value={newEvent.meetingMode}
                                                            onChange={e => setNewEvent({ ...newEvent, meetingMode: e.target.value, client_name: '', client_phone: '' })}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors"
                                                        >
                                                            <option value="privada">Reunião Privada / Compromisso pessoal</option>
                                                            <option value="lead">Reunião com Lead (Potencial Cliente)</option>
                                                            <option value="cliente">Reunião com Cliente (Contato Ativo)</option>
                                                        </select>
                                                    </div>

                                                    {newEvent.meetingMode === 'lead' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400 mb-1">Selecione o Lead</label>
                                                            <select
                                                                value={newEvent.client_name}
                                                                onChange={e => {
                                                                    const selectedName = e.target.value;
                                                                    const lead = leads.find(l => l.name === selectedName);
                                                                    setNewEvent({ ...newEvent, client_name: selectedName, client_phone: lead?.phone || '' });
                                                                }}
                                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors"
                                                            >
                                                                <option value="" disabled>Escolha um Lead...</option>
                                                                {leads.map(lead => (
                                                                    <option key={'lead-' + lead.id} value={lead.name}>{lead.name} {lead.company ? `(${lead.company})` : ''}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {newEvent.meetingMode === 'cliente' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400 mb-1">Selecione o Cliente</label>
                                                            <select
                                                                value={newEvent.client_name}
                                                                onChange={e => {
                                                                    const selectedName = e.target.value;
                                                                    const client = clients.find(c => c.name === selectedName);
                                                                    setNewEvent({ ...newEvent, client_name: selectedName, client_phone: client?.phone || '' });
                                                                }}
                                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors"
                                                            >
                                                                <option value="" disabled>Escolha um Cliente...</option>
                                                                {clients.map(client => (
                                                                    <option key={'client-' + client.id} value={client.name}>{client.name} {client.company ? `(${client.company})` : ''}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {newEvent.meetingMode !== 'privada' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp do Cliente (Autopreenchido)</label>
                                                            <input
                                                                type="text"
                                                                value={newEvent.client_phone}
                                                                onChange={e => setNewEvent({ ...newEvent, client_phone: e.target.value })}
                                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors"
                                                                placeholder="Ex: 11999999999"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-1">Notas (opcional)</label>
                                                        <textarea
                                                            value={newEvent.notes}
                                                            onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors resize-none"
                                                            rows={3}
                                                            placeholder="Informações adicionais importantes..."
                                                        ></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-1">Tipo / Cor</label>
                                                        <select
                                                            value={newEvent.color}
                                                            onChange={e => setNewEvent({ ...newEvent, color: e.target.value, type: e.target.options[e.target.selectedIndex].text.split(' ')[1] || 'Outro' })}
                                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors appearance-none"
                                                        >
                                                            <option value="bg-white/10 text-white border-white/20">⚪️ Genérico / Reunião</option>
                                                            <option value="bg-brand-lime/20 text-brand-lime border-brand-lime/30">🟢 Importante / Milestone</option>
                                                            <option value="bg-brand-blue/20 text-brand-blue border-brand-blue/30">🔵 Ação / Tarefa</option>
                                                            <option value="bg-purple-500/20 text-purple-400 border-purple-500/30">🟣 Prazo Final</option>
                                                            <option value="bg-red-500/20 text-red-400 border-red-500/30">🔴 Urgente / Bloqueio</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className="w-full bg-brand-lime text-black font-bold py-3 rounded-xl hover:bg-white transition-colors"
                                                    >
                                                        Salvar Evento
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {/* Modal de Detalhes do Evento */}
                                    {selectedEventDetails && (
                                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedEventDetails(null)}>
                                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                                                <h3 className="text-xl font-bold text-white mb-2 pr-10">{selectedEventDetails.title}</h3>
                                                <button onClick={() => setSelectedEventDetails(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                                                    <X size={20} />
                                                </button>

                                                <div className="space-y-4 text-sm mt-6">
                                                    <div className="flex bg-white/5 rounded-xl p-3 border border-white/10">
                                                        <Calendar size={18} className="text-brand-lime w-1/12 mt-0.5" />
                                                        <div className="w-11/12 pl-2">
                                                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-0.5">Data e Hora</p>
                                                            <p className="text-white font-medium">{selectedEventDetails.date.toLocaleDateString('pt-BR')} {selectedEventDetails.time ? `às ${selectedEventDetails.time}` : ''}</p>
                                                        </div>
                                                    </div>

                                                    {(selectedEventDetails.client_name || selectedEventDetails.client_phone) && (
                                                        <div className="flex bg-white/5 rounded-xl p-3 border border-white/10">
                                                            <UserCheck size={18} className="text-brand-lime w-1/12 mt-0.5" />
                                                            <div className="w-11/12 pl-2">
                                                                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-0.5">Cliente</p>
                                                                <p className="text-white font-medium">{selectedEventDetails.client_name || 'Não informado'}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedEventDetails.client_phone && (
                                                        <div className="pt-2">
                                                            <a
                                                                href={`https://wa.me/${selectedEventDetails.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedEventDetails.client_name?.split(' ')[0] || ''}, tudo bem? Estou entrando em contato sobre a nossa reunião de Kickoff.`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full flex items-center justify-center gap-2 bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 py-3 rounded-xl hover:bg-[#25D366] hover:text-black transition-all font-bold"
                                                            >
                                                                <Smartphone size={18} />
                                                                Chamar no WhatsApp
                                                            </a>
                                                        </div>
                                                    )}

                                                    {selectedEventDetails.notes && (
                                                        <div className="flex bg-white/5 rounded-xl p-3 border border-white/10 mt-2">
                                                            <FileText size={18} className="text-gray-400 w-1/12 mt-0.5" />
                                                            <div className="w-11/12 pl-2">
                                                                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-0.5">Notas</p>
                                                                <p className="text-white whitespace-pre-wrap leading-relaxed">{selectedEventDetails.notes}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedEventDetails.id.toString().startsWith('custom-') && (
                                                        <div className="pt-4 border-t border-white/10 mt-4">
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteEvent(Number(selectedEventDetails.id.split('-')[1]));
                                                                    setSelectedEventDetails(null);
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 text-red-400/80 hover:text-red-400 hover:bg-red-400/10 py-3 rounded-xl transition-all font-bold text-sm"
                                                            >
                                                                <Trash2 size={16} />
                                                                Excluir Evento
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        {/* AUTOMATIONS TAB */}
                        {activeTab === 'automations' && (
                            <div className="animate-fadeIn space-y-8 h-full flex flex-col">
                                <div className="flex justify-between items-center bg-[#1a1a1c] p-6 rounded-3xl border border-white/10 shadow-2xl shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-brand-lime/10 rounded-2xl border border-brand-lime/20 text-brand-lime">
                                            <Zap size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-1">Automações Semiautomáticas</h2>
                                            <p className="text-gray-400 font-medium">Acione mensagens rápidas com variáveis automáticas de clientes e leads.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                                    {/* Box 1: Leads */}
                                    <div className="bg-[#1a1a1c] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col">
                                        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
                                            <Users className="text-brand-lime" size={28} /> Automações de Leads
                                        </h3>
                                        <div className="mb-8">
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Selecionar Lead Alvo</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-lime focus:outline-none focus:ring-1 focus:ring-brand-lime transition-all"
                                                value={automationLeadId}
                                                onChange={(e) => setAutomationLeadId(e.target.value)}
                                            >
                                                <option value="" className="bg-[#1a1a1c]">-- Selecione um lead --</option>
                                                {leads.map(l => (
                                                    <option key={l.id} value={l.id} className="bg-[#1a1a1c]">{l.name} - {l.company}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="flex flex-col gap-3 flex-1">
                                            {[
                                                { label: 'Follow-up 24h', msg: (name: string) => `Olá ${name.split(' ')[0]}, tudo bem?\n\nPassando rapidamente para saber se conseguiu analisar a proposta ou se ficou alguma dúvida inicial.` },
                                                { label: 'Follow-up 3 dias', msg: (name: string) => `Olá ${name.split(' ')[0]}, tudo bem?\n\nPassando para saber se você conseguiu analisar a proposta que enviamos sobre a estruturação do seu sistema comercial.\n\nSe fizer sentido para você, posso te explicar os próximos passos.` },
                                                { label: 'Follow-up 7 dias', msg: (name: string) => `Oi ${name.split(' ')[0]}, tudo bem?\n\nEstou organizando nossa agenda e queria saber como estamos em relação à proposta. Podemos seguir ou deixamos para um outro momento?` },
                                                { label: 'Reativação de lead', msg: (name: string) => `Oi ${name.split(' ')[0]}, tudo bem?\n\nAlgum tempo atrás conversamos sobre estruturar o seu sistema comercial. Queria saber se ainda faz sentido para você ou se posso te ajudar em algo.` }
                                            ].map(auto => {
                                                const selectedLeadForAuto = leads.find(l => l.id === automationLeadId);
                                                const tel = selectedLeadForAuto?.phone ? selectedLeadForAuto.phone.replace(/\D/g, '') : '';
                                                const finalMsg = selectedLeadForAuto ? auto.msg(selectedLeadForAuto.name) : '';
                                                return (
                                                    <a
                                                        key={auto.label}
                                                        href={tel ? `https://wa.me/${tel}?text=${encodeURIComponent(finalMsg)}` : '#'}
                                                        target={tel ? "_blank" : undefined}
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => { 
                                                            if (!selectedLeadForAuto) { e.preventDefault(); alert('Selecione um lead primeiro.'); }
                                                            else if (!tel) { e.preventDefault(); alert('O lead selecionado não possui um telefone válido.'); }
                                                        }}
                                                        className={`flex justify-between items-center p-4 rounded-xl border transition-all ${tel ? 'bg-white/5 border-white/10 hover:border-brand-lime/50 text-gray-300 hover:text-white group' : 'bg-white/5 border-transparent text-gray-600 cursor-not-allowed'}`}
                                                    >
                                                        <span className="text-sm font-bold">{auto.label}</span>
                                                        <MessageSquare size={18} className={tel ? 'text-brand-lime opacity-50 group-hover:opacity-100 transition-opacity' : 'opacity-20'} />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Box 2: Clientes */}
                                    <div className="bg-[#1a1a1c] p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col">
                                        <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
                                            <Briefcase className="text-brand-lime" size={28} /> Automações de Clientes
                                        </h3>
                                        <div className="mb-8">
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Selecionar Cliente Alvo</label>
                                        <select
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-lime focus:outline-none focus:ring-1 focus:ring-brand-lime transition-all"
                                                value={automationClientId}
                                                onChange={(e) => setAutomationClientId(e.target.value)}
                                            >
                                                <option value="" className="bg-[#1a1a1c]">-- Selecione um cliente --</option>
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-[#1a1a1c]">{c.name} - {c.company}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-3 flex-1">
                                            {[
                                                { label: 'Cobrança mensal', msg: (name: string) => `Olá ${name.split(' ')[0]}, tudo bem?\n\nPassando para lembrar do pagamento referente ao serviço deste mês.\n\nSegue o link de pagamento:\n[COLE_AQUI_O_LINK]` },
                                                { label: 'Enviar boas-vindas', msg: (name: string) => `Olá ${name.split(' ')[0]}! Boas-vindas oficiais à Soluções Digitais & CX!\n\nEstamos muito animados para começar nosso projeto. Vamos marcar nosso Kickoff?` },
                                                { label: 'Enviar análise comercial', msg: (name: string, lead?: Lead) => `Oi ${name.split(' ')[0]}, tudo bem?\n\nTudo certo com o seu contrato. O próximo passo é você preencher nossa Análise Comercial Estratégica para conhecermos a fundo o momento do seu negócio.\n\nLink do formulário:\n${window.location.origin}/?briefing_id=new${lead ? `&lead_id=${lead.id}&client_name=${encodeURIComponent(lead.name)}${lead.company ? `&company_name=${encodeURIComponent(lead.company)}` : ''}${lead.niche ? `&niche=${encodeURIComponent(lead.niche)}` : ''}${lead.email ? `&email=${encodeURIComponent(lead.email)}` : ''}` : ''}` }
                                            ].map(auto => {
                                                const selectedClientForAuto = clients.find(c => c.id === automationClientId);
                                                const tel = selectedClientForAuto?.phone ? selectedClientForAuto.phone.replace(/\D/g, '') : '';
                                                const finalMsg = selectedClientForAuto ? auto.msg(selectedClientForAuto.name, selectedClientForAuto) : '';

                                                return (
                                                    <a
                                                        key={auto.label}
                                                        href={tel ? `https://wa.me/${tel}?text=${encodeURIComponent(finalMsg)}` : '#'}
                                                        target={tel ? "_blank" : undefined}
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => { 
                                                            if (!selectedClientForAuto) { e.preventDefault(); alert('Selecione um cliente primeiro.'); }
                                                            else if (!tel) { e.preventDefault(); alert('O cliente selecionado não possui um telefone válido.'); }
                                                        }}
                                                        className={`flex justify-between items-center p-4 rounded-xl border transition-all ${tel ? 'bg-white/5 border-white/10 hover:border-brand-lime/50 text-gray-300 hover:text-white group' : 'bg-white/5 border-transparent text-gray-600 cursor-not-allowed'}`}
                                                    >
                                                        <span className="text-sm font-bold">{auto.label}</span>
                                                        <MessageSquare size={18} className={tel ? 'text-brand-lime opacity-50 group-hover:opacity-100 transition-opacity' : 'opacity-20'} />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </main>

    {/* Contract Action Modal (Share or Open) */}
                {
                    selectedContractForAction && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Opções do Contrato</h3>
                                        <p className="text-sm text-gray-500">{selectedContractForAction.client}</p>
                                    </div>
                                    <button onClick={() => setSelectedContractForAction(null)} className="text-gray-500 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setSelectedContractForAction(null);
                                            setViewDigitalContract(selectedContractForAction);
                                        }}
                                        className="w-full flex items-center justify-center gap-3 p-4 bg-brand-blue rounded-xl text-white font-bold hover:bg-brand-blue/80 transition-colors"
                                    >
                                        <Eye size={20} />
                                        Abrir Contrato Digital
                                    </button>
                                    <button
                                        onClick={() => handleShareContract(selectedContractForAction)}
                                        className="w-full flex items-center justify-center gap-3 p-4 bg-[#25D366] border border-[#25D366]/20 rounded-xl text-black font-bold hover:bg-[#20bd5a] transition-colors"
                                    >
                                        <Send size={20} />
                                        Enviar no WhatsApp
                                    </button>
                                    <button
                                        onClick={() => handleDeleteContract(selectedContractForAction.id)}
                                        className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                        Excluir Contrato
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Digital Contract Viewer Modal (Designed PDF Style) */}
                {
                    viewDigitalContract && (
                        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto custom-scrollbar">

                            {/* Close Button Fixed */}
                            <div className="fixed top-6 right-6 z-[80]">
                                <button
                                    onClick={() => setViewDigitalContract(null)}
                                    className="text-white hover:text-brand-lime transition-colors bg-black/50 p-2 rounded-full backdrop-blur-md"
                                >
                                    <X size={32} />
                                </button>
                            </div>

                            {/* Scrollable content wrapper */}
                            <div className="flex justify-center min-h-full p-4 sm:p-8 py-20">
                                <div className="w-full max-w-4xl h-fit animate-fadeInUp bg-[#F5F5F7] rounded-[2rem] overflow-hidden shadow-2xl text-brand-black font-sans">

                                    {/* Header Bar */}
                                    <div className="bg-brand-black text-white p-6 md:p-10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime rounded-bl-full opacity-20 transform translate-x-10 -translate-y-10"></div>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
                                            <div>
                                                <div className="bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full inline-block mb-4 border border-white/10">
                                                    <h2 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-brand-lime uppercase">Contrato de Social Media</h2>
                                                </div>
                                                <h1 className="text-2xl md:text-4xl font-bold leading-tight">Prestação de Serviços<br />Digitais & Consultoria</h1>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Documento Nº</p>
                                                <p className="font-mono text-white text-xl border border-white/20 px-3 py-1 rounded-lg">#{viewDigitalContract.id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-12 space-y-8 md:space-y-10">

                                        {/* ── Seção 1 & 2: Identificação das Partes ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">01.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Identificação das Partes</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Contratada */}
                                                <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-brand-black/5 shadow-xl relative group overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-6 opacity-5"><Box size={100} /></div>
                                                    <div className="inline-flex items-center gap-2 bg-brand-black text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                                                        <span className="text-brand-lime">CONTRATADA</span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-brand-black mb-1">Elizabeth Celina Gentil Vieira Mêne Melo</h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-4">Soluções Digitais & CX</p>
                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <p className="flex items-center gap-2"><FileText size={14} className="text-brand-lime shrink-0" /> CPF: 042.122.602-12</p>
                                                        <p className="flex items-center gap-2"><MapPin size={14} className="text-brand-lime shrink-0" /> Manaus - AM</p>
                                                        <p className="flex items-center gap-2"><Mail size={14} className="text-brand-lime shrink-0" /> elizabethcelina.comercial@gmail.com</p>
                                                    </div>
                                                </div>
                                                {/* Contratante */}
                                                <div className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-brand-blue/10 shadow-xl relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-6 opacity-5 text-brand-blue"><UserCheck size={100} /></div>
                                                    <div className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                                                        <span className="text-brand-lime">CONTRATANTE</span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-brand-blue mb-1">{viewDigitalContract.clientFullName || viewDigitalContract.client}</h4>
                                                    {viewDigitalContract.clientCompany && <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">{viewDigitalContract.clientCompany}</p>}
                                                    {viewDigitalContract.clientResponsible && <p className="text-xs text-gray-500 mb-3">Responsável Legal: <span className="font-bold text-gray-700">{viewDigitalContract.clientResponsible}</span></p>}
                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <p className="flex items-center gap-2"><FileText size={14} className="text-brand-blue shrink-0" /> CPF/CNPJ: {viewDigitalContract.clientCPF || 'Não informado'}</p>
                                                        {viewDigitalContract.clientAddress && <p className="flex items-center gap-2"><MapPin size={14} className="text-brand-blue shrink-0" /> {viewDigitalContract.clientAddress}</p>}
                                                        {(viewDigitalContract.clientPhone || clients.find(c => c.name === viewDigitalContract.client)?.phone) && (
                                                            <p className="flex items-center gap-2"><Smartphone size={14} className="text-brand-blue shrink-0" /> {viewDigitalContract.clientPhone || clients.find(c => c.name === viewDigitalContract.client)?.phone}</p>
                                                        )}
                                                        {viewDigitalContract.clientEmail && <p className="flex items-center gap-2"><Mail size={14} className="text-brand-blue shrink-0" /> {viewDigitalContract.clientEmail}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200" />

                                        {/* ── Seção 2: Objeto do Contrato ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">02.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Objeto do Contrato</h3>
                                            </div>
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                                    O presente contrato tem por objeto a <strong className="text-brand-black">Prestação de Serviços de {viewDigitalContract.title}</strong>, incluindo todas as entregas
                                                    descritas no Escopo Detalhado (Cláusula 3ª), conforme acordado entre as partes.
                                                    Qualquer serviço não listado explicitamente não faz parte do escopo e poderá ser
                                                    contratado separadamente mediante proposta comercial.
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── Seção 3: Escopo Detalhado (Serviços) ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">03.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Escopo Detalhado</h3>
                                            </div>
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                <div className="space-y-3">
                                                    {viewDigitalContract.items.map((item, idx) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 rounded-full bg-brand-lime flex items-center justify-center text-xs font-bold text-brand-black shrink-0">{idx + 1}</div>
                                                                <span className="font-bold text-brand-black text-sm">{item.description}</span>
                                                            </div>
                                                            <span className="font-mono text-gray-500 text-xs bg-white px-3 py-1 rounded-full border">R$ {item.price.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-red-500 font-bold mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                                                    ⚠️ Qualquer item não listado explicitamente acima NÃO faz parte do escopo e não será executado sem nova negociação.
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── Seção 4: O que NÃO está incluso ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">04.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">O Que Não Está Incluso</h3>
                                            </div>
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                <p className="text-sm text-gray-600 leading-relaxed">{viewDigitalContract.excludedScope || 'Gestão comercial diária, produção de conteúdo, gestão de tráfego pago, alterações estruturais após aprovação final, suporte ilimitado e treinamento contínuo.'}</p>
                                            </div>
                                        </div>

                                        {/* ── Seção 5: Prazos ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">05.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Prazos</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                                                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Início dos Serviços</p>
                                                    <p className="text-2xl font-bold text-brand-black">{viewDigitalContract.startDate}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">Após confirmação do pagamento inicial</p>
                                                </div>
                                                <div className="bg-brand-blue text-white rounded-2xl p-5 shadow-sm text-center">
                                                    <p className="text-[10px] font-bold uppercase text-white/60 tracking-widest mb-2">Prazo de Entrega</p>
                                                    <p className="text-2xl font-bold">{viewDigitalContract.deliveryDeadline || viewDigitalContract.endDate}</p>
                                                    <p className="text-[10px] text-white/50 mt-1">Pode ajustar por atraso do contratante</p>
                                                </div>
                                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                                                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Encerramento</p>
                                                    <p className="text-2xl font-bold text-brand-black">{viewDigitalContract.endDate}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">Vigência do contrato</p>
                                                </div>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4">
                                                <p className="text-sm text-amber-800 font-medium">⏱️ O prazo poderá ser ajustado caso o Contratante não envie acessos ou informações necessárias no período acordado. Atrasos de entrega causados pelo Contratante não configuram descumprimento contratual pela Contratada.</p>
                                            </div>
                                        </div>

                                        {/* ── Seção 6: Obrigações do Cliente ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">06.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Obrigações do Contratante</h3>
                                            </div>
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                <ul className="space-y-3">
                                                    {[
                                                        'Enviar acessos e credenciais necessários em até 5 dias úteis após o início do contrato.',
                                                        'Disponibilizar equipe e/ou responsável para alinhamentos semanais.',
                                                        'Testar e aprovar o sistema/entrega dentro dos prazos estipulados.',
                                                        'Aprovar etapas do projeto no prazo acordado. Silêncio por mais de 5 dias úteis equivale a aprovação tácita.',
                                                        'Utilizar o sistema/serviço conforme orientações fornecidas pela Contratada.',
                                                        'Informar qualquer mudança de escopo com antecedência mínima de 5 dias úteis.'
                                                    ].map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <span className="w-5 h-5 rounded-full bg-brand-lime text-brand-black font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* ── Seção 7: Investimento e Pagamento ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">07.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Investimento e Pagamento</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-brand-black text-white rounded-2xl p-6 relative overflow-hidden">
                                                    <p className="text-[10px] font-bold text-brand-lime uppercase tracking-widest mb-2">Investimento Total</p>
                                                    <p className="text-4xl font-bold">R$ {viewDigitalContract.value}</p>
                                                    <div className="mt-4 space-y-2 text-sm text-gray-400">
                                                        <p><span className="text-white font-bold">Condições:</span> {viewDigitalContract.paymentTerms || '50% no início e 50% na entrega.'}</p>
                                                        <p><span className="text-white font-bold">Multa por atraso:</span> {viewDigitalContract.lateFine || '2% ao mês.'}</p>
                                                    </div>
                                                    <div className="absolute right-0 bottom-0 text-white/5"><DollarSign size={100} /></div>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center gap-3">
                                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                                        <p className="text-sm text-amber-800 font-bold">⚠️ Os serviços terão início somente após a confirmação do pagamento inicial. Sem exceções.</p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                                        <p className="text-xs text-gray-500">Pagamentos realizados via PIX, TED ou boleto bancário, conforme combinado previamente. Em caso de cancelamento após o início dos serviços, os valores pagos não serão reembolsados.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Seção 8 & 9: Propriedade / Confidencialidade ── */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-4xl font-bold text-gray-200 leading-none">08.</span>
                                                    <h3 className="text-xl font-bold text-brand-black">Propriedade e Uso</h3>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                                                    <ul className="space-y-3 text-sm text-gray-600">
                                                        <li className="flex items-start gap-2"><span className="text-brand-lime font-bold shrink-0">→</span> O Contratante é proprietário do sistema/produto configurado após quitação integral do contrato.</li>
                                                        <li className="flex items-start gap-2"><span className="text-brand-lime font-bold shrink-0">→</span> A metodologia, processos e know-how aplicados pela Contratada permanecem de propriedade exclusiva desta.</li>
                                                        <li className="flex items-start gap-2"><span className="text-brand-lime font-bold shrink-0">→</span> A Contratada poderá utilizar o projeto como case de portfólio, salvo se o Contratante solicitar cláusula de confidencialidade expressa.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-4xl font-bold text-gray-200 leading-none">09.</span>
                                                    <h3 className="text-xl font-bold text-brand-black">Confidencialidade</h3>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        Ambas as partes comprometem-se a manter em sigilo todas as informações confidenciais
                                                        obtidas durante a execução deste contrato, incluindo dados de clientes, estratégias
                                                        comerciais, informações financeiras e processos internos. Esta obrigação permanece
                                                        vigente por <strong className="text-brand-black">2 anos</strong> após o término do contrato.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Seção 10 & 11: Limitação / Rescisão ── */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-4xl font-bold text-gray-200 leading-none">10.</span>
                                                    <h3 className="text-xl font-bold text-brand-black">Limitação de Responsabilidade</h3>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                                                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                                        A Contratada entrega <strong className="text-brand-black">estrutura, estratégia e execução técnica</strong>.
                                                        Não são garantidos resultados específicos como aumento de faturamento, crescimento
                                                        imediato de métricas ou taxas de conversão determinadas, pois estes dependem
                                                        diretamente da execução e do engajamento do Contratante.
                                                    </p>
                                                    <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 border">
                                                        Resultado = Estrutura (Contratada) + Execução (Contratante).
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-4xl font-bold text-gray-200 leading-none">11.</span>
                                                    <h3 className="text-xl font-bold text-brand-black">Rescisão</h3>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                                                    <ul className="space-y-3 text-sm text-gray-600">
                                                        <li className="flex items-start gap-2"><span className="text-red-400 font-bold shrink-0">→</span> Qualquer parte poderá rescindir com aviso prévio mínimo de <strong className="text-brand-black">30 dias corridos</strong>.</li>
                                                        <li className="flex items-start gap-2"><span className="text-red-400 font-bold shrink-0">→</span> Para projetos fechados, os valores pagos não são reembolsáveis após o início da execução.</li>
                                                        <li className="flex items-start gap-2"><span className="text-red-400 font-bold shrink-0">→</span> Rescisão imediata é possível em caso de descumprimento grave de qualquer cláusula contratual, sem necessidade de aviso prévio.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Seção 12: Aceite Final ── */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-5xl font-bold text-gray-200 leading-none">12.</span>
                                                <h3 className="text-2xl font-bold text-brand-black">Aceite Final</h3>
                                            </div>
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Após a entrega e treinamento, o Contratante terá <strong className="text-brand-black">{viewDigitalContract.acceptanceDays || '5'} dias corridos</strong> para
                                                    solicitar ajustes técnicos previstos no escopo. Após esse prazo, o projeto é
                                                    considerado <strong className="text-green-600">oficialmente concluído e aceito</strong>,
                                                    encerrando o onboarding e quaisquer obrigações de entrega previstas neste contrato.
                                                    Novos ajustes após esse prazo serão tratados como nova demanda.
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── Assinatura Digital ── */}
                                        <div className="bg-brand-black text-white rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col items-center text-center gap-6 md:gap-8">
                                                <div>
                                                    <h3 className="text-2xl md:text-3xl font-bold mb-3">Assinatura Digital</h3>
                                                    <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                                                        Ao clicar no botão abaixo, você declara ter lido, compreendido e concordado com todos os termos deste contrato de prestação de serviços, validando sua identidade eletronicamente.
                                                    </p>
                                                </div>

                                                {viewDigitalContract.status === 'Assinado' ? (
                                                    <div className="bg-white text-brand-black px-8 md:px-10 py-4 md:py-5 rounded-full font-bold flex items-center gap-3 animate-pulse">
                                                        <CheckCircle2 className="text-brand-lime" fill="black" size={24} />
                                                        <div className="text-left leading-tight">
                                                            <span className="block text-xs text-gray-500 uppercase font-bold">Status</span>
                                                            Assinado em {viewDigitalContract.signedDate}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleSignContract}
                                                        className="group w-full md:w-auto bg-brand-lime text-brand-black px-8 md:px-12 py-4 md:py-6 rounded-full font-bold text-lg md:text-xl hover:bg-white transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transform hover:-translate-y-1"
                                                    >
                                                        {isSigning ? <Loader2 className="animate-spin" /> : <PenTool size={24} />}
                                                        Assinar Contrato Agora
                                                    </button>
                                                )}

                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase font-bold tracking-widest mt-4">
                                                    <ShieldCheck size={14} /> Documento Protegido por Criptografia
                                                </div>
                                            </div>

                                            {/* Decorative BG */}
                                            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-brand-blue rounded-full blur-[100px] opacity-20 pointer-events-none transform translate-x-20 -translate-y-20"></div>
                                            <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-brand-lime rounded-full blur-[80px] opacity-10 pointer-events-none transform -translate-x-20 translate-y-20"></div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* New Contract Modal */}
                {
                    isNewContractModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-fadeIn">
                            {/* ... Content remains same ... */}
                            <div className="bg-[#0f0f11] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Novo Contrato</h3>
                                    <button onClick={() => setIsNewContractModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleAddContract} className="space-y-6">
                                    {/* Contract Mode Toggle */}
                                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => handleContractModeChange('renewal')}
                                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${contractMode === 'renewal' ? 'bg-brand-lime text-brand-black' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <RefreshCw size={14} /> Renovação
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleContractModeChange('new_lead')}
                                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${contractMode === 'new_lead' ? 'bg-brand-lime text-brand-black' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <UserPlus size={14} /> Novo Lead
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Título do Contrato</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newContract.title}
                                                onChange={e => setNewContract({ ...newContract, title: e.target.value })}
                                                placeholder="Ex: Gestão de Tráfego Mensal"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">
                                                {contractMode === 'renewal' ? 'Cliente Existente' : 'Lead do CRM'}
                                            </label>
                                            <select
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newContract.client}
                                                onChange={handleContractClientSelect}
                                            >
                                                <option value="" disabled className="bg-brand-black text-gray-500">Selecione...</option>
                                                {contractMode === 'renewal'
                                                    ? clients.map(c => <option key={c.id} value={c.name} className="bg-black">{c.name} ({c.company})</option>)
                                                    : leads.map(l => <option key={l.id} value={l.name} className="bg-black">{l.name} ({l.company})</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    {/* Auto-populated Lead Info & Form Link Sender */}
                                    {contractMode === 'new_lead' && selectedLeadForContract && (
                                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4 animate-fadeIn">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Telefone</label>
                                                    <div className="text-white text-sm font-mono">{selectedLeadForContract.phone || "N/A"}</div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Email</label>
                                                    <div className="text-white text-sm font-mono truncate">{selectedLeadForContract.email || "N/A"}</div>
                                                </div>
                                            </div>

                                            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[#25D366] text-xs font-bold flex items-center gap-1">
                                                        <MessageSquare size={12} /> Solicitar Dados via Formulário
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-xs italic mb-1 leading-relaxed">
                                                    Será enviado um link de formulário seguro para <span className="text-white font-bold">{selectedLeadForContract.name.split(' ')[0]}</span> preencher os dados pessoais. Quando ele preencher, você receberá uma notificação automática! 🔔
                                                </p>
                                                <div className="bg-black/30 rounded px-2 py-1 text-[10px] text-gray-500 font-mono mb-3 truncate">
                                                    🔗 {window.location.origin}?contract_form=...&client={encodeURIComponent(selectedLeadForContract.name)}
                                                </div>
                                                <a
                                                    href={getWhatsAppLink(selectedLeadForContract)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-2 rounded text-center transition-colors"
                                                >
                                                    <MessageSquare size={14} />
                                                    Enviar Formulário pelo WhatsApp
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* CLIENT DETAILED DATA FORM */}
                                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User size={16} className="text-brand-lime" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">Dados do Contratante</span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nome completo do cliente"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                    value={newContract.clientFullName}
                                                    onChange={(e) => setNewContract({ ...newContract, clientFullName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">CPF/CNPJ</label>
                                                    <input
                                                        type="text"
                                                        placeholder="000.000.000-00"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientCPF}
                                                        onChange={(e) => setNewContract({ ...newContract, clientCPF: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Data Nasc.</label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1 [color-scheme:dark]"
                                                        value={newContract.clientDob}
                                                        onChange={(e) => setNewContract({ ...newContract, clientDob: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">WhatsApp / Telefone</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="(00) 00000-0000"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientPhone}
                                                        onChange={(e) => setNewContract({ ...newContract, clientPhone: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">E-mail</label>
                                                    <input
                                                        type="email"
                                                        placeholder="email@cliente.com"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientEmail}
                                                        onChange={(e) => setNewContract({ ...newContract, clientEmail: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">CEP</label>
                                                    <input
                                                        type="text"
                                                        placeholder="00000-000"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientCep}
                                                        onChange={(e) => setNewContract({ ...newContract, clientCep: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Cidade / Estado</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Cidade - UF"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientCity ? `${newContract.clientCity}${newContract.clientState ? ' - ' + newContract.clientState : ''}` : ''}
                                                        onChange={(e) => setNewContract({ ...newContract, clientCity: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold">Endereço Completo</label>
                                                <input
                                                    type="text"
                                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                    value={newContract.clientAddress}
                                                    onChange={(e) => setNewContract({ ...newContract, clientAddress: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Empresa do Cliente</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nome da empresa (se houver)"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientCompany}
                                                        onChange={(e) => setNewContract({ ...newContract, clientCompany: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Responsável Legal</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nome do responsável"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                        value={newContract.clientResponsible}
                                                        onChange={(e) => setNewContract({ ...newContract, clientResponsible: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            {/* Pre-fill indicator */}
                                            {newContract.clientFullName && newContract.clientCPF && (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 p-2 bg-brand-lime/10 border border-brand-lime/20 rounded-lg">
                                                        <span className="text-brand-lime text-xs">✅</span>
                                                        <span className="text-brand-lime text-xs font-bold">Dados pessoais preenchidos pelo cliente!</span>
                                                    </div>
                                                    {newContract.title && (
                                                        <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                            <span className="text-blue-400 text-xs">📋</span>
                                                            <span className="text-blue-400 text-xs font-bold">Proposta aprovada vinculada — título e serviços importados!</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Escopo, Prazos e Condições */}
                                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText size={16} className="text-brand-lime" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">Escopo, Prazos e Condições</span>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">O que NÃO está incluso no escopo</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Ex: Gestão diária, produção de conteúdo, tráfego pago..."
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newContract.excludedScope}
                                                onChange={(e) => setNewContract({ ...newContract, excludedScope: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold">Prazo estimado de entrega</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: 21 dias úteis"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                    value={newContract.deliveryDeadline}
                                                    onChange={(e) => setNewContract({ ...newContract, deliveryDeadline: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold">Prazo de aceite final (dias)</label>
                                                <input
                                                    type="number"
                                                    placeholder="Ex: 5"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                    value={newContract.acceptanceDays}
                                                    onChange={(e) => setNewContract({ ...newContract, acceptanceDays: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-3 block">Formato de Pagamento</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    {
                                                        id: 'full',
                                                        label: '100% antes de começar',
                                                        desc: 'Pagamento integral antes do início dos serviços.',
                                                        value: '100% antes do início dos serviços.',
                                                        icon: '💰',
                                                        badge: 'Segurança máxima',
                                                    },
                                                    {
                                                        id: 'split',
                                                        label: '50% antes + 50% na entrega',
                                                        desc: 'Metade na assinatura, metade na entrega final.',
                                                        value: '50% no início e 50% na entrega final.',
                                                        icon: '✂️',
                                                        badge: 'Mais comum',
                                                    },
                                                ].map((opt) => {
                                                    const selected = newContract.paymentTerms === opt.value;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setNewContract({ ...newContract, paymentTerms: opt.value })}
                                                            className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none
                                                        ${selected
                                                                    ? 'border-brand-lime bg-brand-lime/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                                                                    : 'border-white/10 bg-black/30 hover:border-white/25'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <span className="text-xl">{opt.icon}</span>
                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                                                            ${selected ? 'bg-brand-lime text-brand-blue' : 'bg-white/10 text-white/40'}`}>
                                                                    {opt.badge}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm font-black mb-1 ${selected ? 'text-brand-lime' : 'text-white'}`}>{opt.label}</p>
                                                            <p className="text-xs text-white/40 leading-snug">{opt.desc}</p>
                                                            {selected && (
                                                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-lime flex items-center justify-center">
                                                                    <svg viewBox="0 0 12 10" className="w-3 h-3" fill="none">
                                                                        <path d="M1 5L4.5 8.5L11 1" stroke="#0035C5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-white/30 mt-2">
                                                Selecionado: <span className="text-white/60 font-medium">{newContract.paymentTerms}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Multa por atraso de pagamento</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 2% ao mês sobre o valor em aberto"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newContract.lateFine}
                                                onChange={(e) => setNewContract({ ...newContract, lateFine: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Services List */}
                                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                                        <label className="text-xs text-gray-500 uppercase font-bold mb-3 block">Serviços & Valores</label>
                                        <div className="space-y-3">
                                            {contractItems.map((item, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Descrição do serviço"
                                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                                                        value={item.description}
                                                        onChange={(e) => handleContractItemChange(idx, 'description', e.target.value)}
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Valor (R$)"
                                                        className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                                                        value={item.price}
                                                        onChange={(e) => handleContractItemChange(idx, 'price', e.target.value)}
                                                        required
                                                    />
                                                    {contractItems.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveContractItem(idx)}
                                                            className="text-red-500 hover:text-red-400 p-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddContractItem}
                                                className="text-xs font-bold text-brand-lime hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={12} /> Adicionar Item
                                            </button>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-400">Total Estimado:</span>
                                            <span className="text-xl font-bold text-white">
                                                R$ {calculateContractTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Início</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newContract.startDate}
                                                onChange={e => setNewContract({ ...newContract, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Fim</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newContract.endDate}
                                                onChange={e => setNewContract({ ...newContract, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setIsNewContractModalOpen(false)}
                                            className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 rounded-lg bg-brand-lime text-brand-black font-bold hover:bg-white transition-colors"
                                        >
                                            Salvar Contrato
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Payment Link Modal */}
                {
                    isPaymentModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-fadeIn">
                            {/* ... Content remains same ... */}
                            <div className="bg-[#0f0f11] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <LinkIcon className="text-brand-lime" size={20} />
                                        Gerar Link de Pagamento
                                    </h3>
                                    <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-white">
                                        <MoreVertical size={20} className="rotate-90" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreatePaymentLink} className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Cliente</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                            value={newInvoice.client}
                                            onChange={e => setNewInvoice({ ...newInvoice, client: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Descrição do Serviço</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                            value={newInvoice.description}
                                            onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Valor (R$)</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="0,00"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newInvoice.amount}
                                                onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold">Tipo</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none mt-1"
                                                value={newInvoice.type}
                                                onChange={e => setNewInvoice({ ...newInvoice, type: e.target.value })}
                                            >
                                                <option value="Pontual" className="bg-black">Pontual</option>
                                                <option value="Recorrente" className="bg-black">Recorrente</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-brand-blue/10 rounded-xl border border-brand-blue/20 text-sm text-gray-300 mt-4">
                                        <p className="flex items-center gap-2 mb-1 text-brand-blue font-bold">
                                            <Wallet size={14} /> Recebimento
                                        </p>
                                        O link gerado aceitará Pix, Cartão de Crédito e Boleto. A taxa é de 2.99%.
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setIsPaymentModalOpen(false)}
                                            className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 rounded-lg bg-brand-lime text-brand-black font-bold hover:bg-white transition-colors"
                                        >
                                            Gerar & Copiar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* AI Copilot Sidebar (Hidden for brevity, exists in full file) */}
                <div
                    className={`fixed top-0 right-0 h-full w-96 bg-[#0f0f11] border-l border-white/10 shadow-2xl z-40 transform transition-transform duration-300 flex flex-col ${isAiOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    {/* AI Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center text-brand-black">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Copilot Inteligente</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsAiOpen(false)} className="text-gray-500 hover:text-white p-2">
                            <X size={18} />
                        </button>
                    </div>

                    {/* AI Chat Area */}
                    <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {aiMessages.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Bot size={40} className="mx-auto mb-4 text-gray-500" />
                                <p className="text-sm text-gray-400">
                                    Estou lendo o contexto da sua tela atual.<br />
                                    Como posso ajudar hoje?
                                </p>
                            </div>
                        ) : (
                            aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-brand-blue text-white rounded-tr-none'
                                        : 'bg-[#1a1a1c] text-gray-200 rounded-tl-none border border-white/10'
                                        }`}>
                                        {msg.role === 'model' ? formatAiResponse(msg.text) : msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {aiLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-brand-lime" />
                                    <span className="text-xs text-gray-400">Pensando...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Quick Actions & Input */}
                    <div className="p-4 border-t border-white/10 bg-black/40">
                        {/* Context Aware Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar mb-2">
                            {getQuickActions().map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAiSend(action)}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-brand-lime/20 hover:text-brand-lime border border-white/10 text-xs text-gray-400 transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>

                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                                placeholder="Pergunte algo ao Copilot..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-lime transition-all placeholder-gray-600"
                            />
                            <button
                                onClick={() => handleAiSend()}
                                disabled={aiLoading || !aiInput.trim()}
                                className="p-3 bg-brand-lime rounded-xl text-brand-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>


                {/* === BRIEFING LINK MODAL === */}
                {
                    isBriefingLinkModalOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                            <div className="bg-[#1a1a1c] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-brand-lime/10 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-brand-lime/20 rounded-xl text-brand-lime">
                                            <LinkIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Link Público</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">Personalize o formulário de diagnóstico</p>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        setIsBriefingLinkModalOpen(false);
                                        setSelectedLeadForBriefingLink(null);
                                    }} className="text-gray-400 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 block">
                                        Para qual cliente é este link? <span className="text-gray-600 normal-case font-normal">(opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedLeadForBriefingLink?.id?.toString() || ''}
                                            onChange={(e) => {
                                                const lead = leads.find(l => l.id.toString() === e.target.value);
                                                setSelectedLeadForBriefingLink(lead || null);
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brand-lime transition-all appearance-none cursor-pointer pr-10"
                                        >
                                            <option value="">Link Genérico (Sem Nome)</option>
                                            {leads.map(lead => (
                                                <option key={lead.id} value={lead.id.toString()}>
                                                    {lead.name} {lead.company ? `- ${lead.company}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>

                                    {selectedLeadForBriefingLink && (
                                        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
                                            <Sparkles className="text-brand-lime mt-0.5 shrink-0" size={16} />
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                O link será personalizado para <strong className="text-white">{selectedLeadForBriefingLink.name}</strong>. 
                                                Ele verá uma mensagem de boas-vindas com o seu nome na primeira tela do formulário.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3 rounded-b-3xl">
                                    <button
                                        onClick={() => {
                                            setIsBriefingLinkModalOpen(false);
                                            setSelectedLeadForBriefingLink(null);
                                        }}
                                        className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            let link = `${window.location.origin}/?briefing_id=new`;
                                            if (selectedLeadForBriefingLink) {
                                                link += `&lead_id=${selectedLeadForBriefingLink.id}`;
                                                link += `&client_name=${encodeURIComponent(selectedLeadForBriefingLink.name)}`;
                                                
                                                const invalidCompanyNames = [
                                                    'N/A', 'Lead do Site', 
                                                    'Estratégia Completa (360º)', 'Implementação de CRM', 
                                                    'Funil de Vendas', 'Gestão de Social Media', 'Site / Landing Page'
                                                ];
                                                
                                                if (selectedLeadForBriefingLink.company && !invalidCompanyNames.includes(selectedLeadForBriefingLink.company)) {
                                                    link += `&company_name=${encodeURIComponent(selectedLeadForBriefingLink.company)}`;
                                                }
                                                if (selectedLeadForBriefingLink.niche) {
                                                    link += `&niche=${encodeURIComponent(selectedLeadForBriefingLink.niche)}`;
                                                }
                                                if (selectedLeadForBriefingLink.email) {
                                                    link += `&email=${encodeURIComponent(selectedLeadForBriefingLink.email)}`;
                                                }
                                            }
                                            navigator.clipboard.writeText(link);
                                            alert('Link copiado para a área de transferência!');
                                            setIsBriefingLinkModalOpen(false);
                                            setSelectedLeadForBriefingLink(null);
                                        }}
                                        className="bg-brand-lime text-brand-black px-6 py-2.5 rounded-xl font-black hover:bg-white flex items-center gap-2 transition-all shadow-lg shadow-brand-lime/20"
                                    >
                                        <LinkIcon size={18} /> Copiar Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* NEW LEAD MODAL */}
                {
                    isNewLeadModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Novo Lead</h2>
                                    <button onClick={() => setIsNewLeadModalOpen(false)} className="text-gray-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateLead} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Nome do Contato</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                            value={newLead.name}
                                            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Empresa</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                            value={newLead.company}
                                            onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Valor Estimado</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                            placeholder="R$ 0,00"
                                            value={newLead.value}
                                            onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-lime text-black font-bold py-3 rounded-lg hover:bg-white transition-colors mt-6"
                                    >
                                        Criar Lead
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Create Project Modal */}
                {
                    isNewProjectModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">Novo Projeto</h2>
                                    <button onClick={() => setIsNewProjectModalOpen(false)} className="text-gray-400 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateProject} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Nome do Projeto</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                            value={newProject.name}
                                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Cliente</label>
                                        <select
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                            value={newProject.client}
                                            onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                                        >
                                            <option value="" disabled className="bg-[#1a1a1c] text-gray-400">Selecione um cliente...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.name} className="bg-[#1a1a1c] text-white">
                                                    {client.name} ({client.company})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Descrição</label>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none min-h-[80px]"
                                            placeholder="Breve descrição do escopo..."
                                            value={newProject.description}
                                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-1">Prazo (Deadline)</label>
                                            <input
                                                type="text"
                                                placeholder="DD/MM"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                value={newProject.deadline}
                                                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-500 mb-1">Orçamento</label>
                                            <input
                                                type="text"
                                                placeholder="R$ 0,00"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                                value={newProject.budget}
                                                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Equipe</label>
                                        <input
                                            type="text"
                                            placeholder="Iniciais separadas por vírgula (Ex: EC, JD)"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-lime focus:outline-none"
                                            value={newProject.team}
                                            onChange={(e) => setNewProject({ ...newProject, team: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-lime text-black font-bold py-3 rounded-lg hover:bg-white transition-colors mt-6"
                                    >
                                        Criar Projeto
                                    </button>
                                </form>
                            </div>
                        </div >
                    )
                }

                {/* Helper Icon for Footer */} {/* Helper Icon for Footer */}
                {
                    selectedProject && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1c] z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            {selectedProject.name}
                                            <span className={`px-2 py-0.5 rounded text-xs border font-bold ${getProjectStatusColor(selectedProject.status)}`}>
                                                {selectedProject.status}
                                            </span>
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">{selectedProject.client} • Deadline: {selectedProject.deadline}</p>
                                    </div>
                                    <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                                    {/* Funnel Section */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                                                    <Layers size={20} className="text-brand-lime" />
                                                    Visualizador de Funil (Flowchart Interativo)
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    Mapeamento visual da jornada do cliente. Arraste os nós para organizar.
                                                </p>
                                            </div>
                                            <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded border border-white/10 transition-colors">
                                                Exportar PDF
                                            </button>
                                        </div>
                                        <FunnelVisualizer
                                            initialData={selectedProject.funnel_data}
                                            onSave={handleSaveFunnel}
                                        />
                                    </div>

                                    {/* Project Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Progresso Geral</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-bold text-white">{selectedProject.progress}%</span>
                                            </div>
                                            <div className="w-full bg-black/40 h-2 rounded-full mt-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-lime rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${selectedProject.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Tarefas Concluídas</p>
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="text-brand-lime" size={24} />
                                                <span className="text-3xl font-bold text-white">
                                                    {selectedProject.tasksCompleted}/{selectedProject.tasksTotal}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Orçamento</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="text-brand-lime" size={24} />
                                                <span className="text-3xl font-bold text-white">{selectedProject.budget}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task Manager Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                                <List size={20} className="text-brand-lime" />
                                                Gerenciador de Tarefas
                                            </h3>

                                            <form onSubmit={handleAddProjectTask} className="flex gap-2 mb-6">
                                                <input
                                                    type="text"
                                                    placeholder="Adicionar nova tarefa..."
                                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-lime focus:outline-none"
                                                    value={newTaskText}
                                                    onChange={(e) => setNewTaskText(e.target.value)}
                                                />
                                                <button
                                                    type="submit"
                                                    className="bg-brand-lime text-black p-2 rounded-lg hover:bg-white transition-colors"
                                                    disabled={!newTaskText.trim()}
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </form>

                                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                                                    selectedProject.tasks.map(task => (
                                                        <div key={task.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleToggleProjectTask(task.id)}
                                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.completed
                                                                        ? 'bg-brand-lime border-brand-lime text-black'
                                                                        : 'border-gray-600 hover:border-brand-lime'
                                                                        }`}
                                                                >
                                                                    {task.completed && <Check size={14} strokeWidth={3} />}
                                                                </button>
                                                                <span className={`${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                                    {task.text}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteProjectTask(task.id)}
                                                                className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm text-center py-4">Nenhuma tarefa criada.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Team & Details */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                                <Users size={20} className="text-brand-lime" />
                                                Equipe & Detalhes
                                            </h3>
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Descrição do Projeto</p>
                                                    <p className="text-gray-300 text-sm leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                                                        {selectedProject.description || "Sem descrição disponível."}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Membros da Equipe</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedProject.team && selectedProject.team.length > 0 ? (
                                                            selectedProject.team.map((member, i) => (
                                                                <div key={i} className="bg-brand-lime/10 border border-brand-lime/20 text-brand-lime px-3 py-1 rounded-full text-sm font-bold">
                                                                    {member}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-gray-500 text-sm">Nenhum membro atribuído.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Helper Icon for Footer */}
            <div style={{ display: 'none' }}>
                    <ShieldCheckIcon />
                </div>

                <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(204,255,0,0.5);
        }
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-cursive {
            font-family: 'Dancing Script', cursive;
        }
        .font-serif {
            font-family: 'Georgia', serif;
        }
      `}</style>
        </div >
    );
};

// Internal icon for the footer to avoid extra imports not listed
const ShieldCheckIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);