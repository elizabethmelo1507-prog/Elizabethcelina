import React, { useState } from 'react';
import { SectionId } from '../types';
import { ArrowUpRight, Layout, ArrowRight } from 'lucide-react';
import { ProjectDetailsPage, ProjectDetails } from './ProjectDetailsPage';

// Enhanced Data
const projects: ProjectDetails[] = [
  {
    id: 1,
    title: "Nexus CRM Dashboard",
    category: "Sistemas",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    description: "Um CRM personalizado desenvolvido para uma fintech, com automação de follow-ups e relatórios em tempo real.",
    fullDescription: "A Nexus precisava de uma solução robusta para gerenciar mais de 5.000 leads mensais. As soluções de mercado eram caras e rígidas. Desenvolvi um dashboard completo que centraliza a operação comercial.",
    challenge: "Os dados estavam espalhados em múltiplas planilhas, gerando lentidão no atendimento e perda de leads qualificados por falta de follow-up rápido.",
    solution: "Criação de um CRM Single-Page Application (SPA) com React e Node.js, integrando diretamente com o WhatsApp da equipe e automatizando a distribuição de leads.",
    client: "Fintech Nexus",
    year: "2023",
    results: [
      "Aumento de 30% na produtividade do time de vendas",
      "Redução do tempo de primeiro contato de 2h para 5min",
      "Dashboard em tempo real para diretoria"
    ],
    tags: ["React", "Node.js", "PostgreSQL", "Socket.io"]
  },
  {
    id: 2,
    title: "Alpha Sales Page",
    category: "Landing Pages",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    description: "Landing Page de alta conversão para lançamento de infoproduto, otimizada para carregamento em <1s.",
    fullDescription: "Para o lançamento do curso 'Alpha Finance', o objetivo era claro: conversão máxima. A página foi desenhada com psicologia de cores e copywriting persuasivo, aliada a uma infraestrutura técnica impecável.",
    challenge: "A página antiga demorava 4 segundos para carregar no 4G, resultando em uma taxa de rejeição de 60% antes mesmo do usuário ver a oferta.",
    solution: "Reconstrução total usando Next.js com Static Site Generation (SSG). Otimização agressiva de imagens e scripts de terceiros (pixels).",
    client: "Alpha Education",
    year: "2024",
    results: [
      "Carregamento em 0.8s (Google Lighthouse 98/100)",
      "Aumento de 215% na taxa de conversão",
      "Faturamento de 6 dígitos no primeiro lançamento"
    ],
    tags: ["Next.js", "Tailwind", "Analytics", "Vercel"]
  },
  {
    id: 3,
    title: "AutoFlow System",
    category: "Automação",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    description: "Sistema visual de integração entre Marketing e Vendas, eliminando 100% da entrada manual de dados.",
    fullDescription: "O AutoFlow é uma arquitetura de integração que conecta Facebook Ads, RD Station e o ERP da empresa sem intervenção humana.",
    challenge: "A equipe de marketing perdia 10 horas semanais exportando e importando CSVs entre plataformas, gerando erros de digitação e leads duplicados.",
    solution: "Implementação de Webhooks via n8n para orquestrar o fluxo de dados. Validação automática de CPF/CNPJ antes de enviar ao ERP.",
    client: "Logística Express",
    year: "2023",
    results: [
      "Zero intervenção manual no tráfego de dados",
      "Economia de 40h mensais da equipe",
      "Sincronização instantânea Marketing-Vendas"
    ],
    tags: ["n8n", "Webhook", "API REST", "Python"]
  },
  {
    id: 4,
    title: "Luxe Estate Mobile",
    category: "Sistemas",
    image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1600&q=80",
    description: "Plataforma de gestão imobiliária focada na experiência do usuário mobile-first.",
    fullDescription: "O setor imobiliário de luxo exige uma apresentação impecável. Criamos uma plataforma web progressiva (PWA) que funciona como app nativo.",
    challenge: "Os corretores precisavam acessar fichas técnicas e agendar visitas em trânsito, mas o sistema antigo não era responsivo.",
    solution: "Desenvolvimento de PWA com React Native Web, permitindo acesso offline às fichas dos imóveis visitados recentemente.",
    client: "Luxe Estate",
    year: "2024",
    results: [
      "Adoção de 100% pelos corretores em 2 semanas",
      "Melhora na percepção de valor pelos clientes finais",
      "Agendamento de visitas 3x mais rápido"
    ],
    tags: ["React Native", "Firebase", "UX Design"]
  }
];

const categories = ["Todos", "Sistemas", "Landing Pages", "Automação"];

export const Work: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);

  const filteredProjects = activeFilter === "Todos"
    ? projects
    : projects.filter(p => p.category === activeFilter);

  return (
    <section id={SectionId.WORK} className="py-20 md:py-32 bg-brand-white relative bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider mb-4">
              <Layout size={14} />
              <span>Portfólio Selecionado</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-brand-black leading-tight">
              Transformando ideias em <br />
              <span className="text-brand-blue">ativos digitais</span>.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2 border rounded-full text-sm font-bold transition-all duration-300 backdrop-blur-md ${activeFilter === cat
                  ? 'bg-brand-black border-transparent text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transform scale-105'
                  : 'bg-white/50 border-gray-200 text-gray-500 hover:bg-white hover:border-brand-blue/30 hover:shadow-sm'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm shadow-xl shadow-gray-100 hover:shadow-[0_20px_50px_rgba(0,53,197,0.15)] transition-all duration-500 border border-white hover:border-brand-blue/20 cursor-pointer active:scale-95 md:active:scale-100"
              onClick={() => setSelectedProject(project)}
            >
              {/* Image Container */}
              <div className="aspect-[16/10] overflow-hidden relative">
                <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-multiply hidden md:block"></div>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transform md:group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Button - Hidden on mobile, handled by simple tap */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 hidden md:flex">
                  <button className="bg-white text-brand-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-brand-lime transition-colors">
                    Ver Detalhes
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 relative">
                <div className="absolute -top-6 right-8 bg-brand-lime text-brand-blue text-xs font-bold px-4 py-2 rounded-xl shadow-lg transform rotate-2 md:group-hover:rotate-0 transition-transform duration-300">
                  {project.category}
                </div>

                <h3 className="text-2xl font-bold text-brand-black mb-3 md:group-hover:text-brand-blue transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {project.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById(SectionId.CONTACT)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-brand-black text-white hover:bg-brand-lime hover:text-brand-black font-bold py-3 rounded-xl mb-6 transition-all duration-300 flex items-center justify-center gap-2 group/btn text-sm shadow-lg shadow-brand-blue/5"
                >
                  Quero um projeto assim
                  <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium bg-brand-gray text-gray-600 px-3 py-1 rounded-lg border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Mobile tap indicator */}
                <div className="mt-4 md:hidden flex items-center text-brand-blue text-xs font-bold uppercase tracking-wide">
                  Ver Detalhes <ArrowUpRight size={14} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render Full Page Project Details */}
      {selectedProject && (
        <ProjectDetailsPage
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};