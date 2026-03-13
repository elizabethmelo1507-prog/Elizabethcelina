import React, { useState } from 'react';
import { SectionId, ServiceItem } from '../types';
import { Monitor, Database, TrendingUp, Users, Settings, Smartphone, ArrowRight } from 'lucide-react';
import { ServiceDetailsPage } from './ServiceDetailsPage';

const services: ServiceItem[] = [
  {
    id: 'landing-pages',
    title: 'Páginas de Alta Conversão',
    description: 'Design e copy alinhados para transformar visitantes em leads qualificados. Velocidade extrema de carregamento.',
    icon: <Monitor size={24} />,
    fullDescription: `
      Uma Landing Page não é apenas um "site bonito". É a sua melhor vendedora, trabalhando 24 horas por dia. 
      
      Minha abordagem combina três pilares: **Design Psicológico** (para guiar o olhar), **Copywriting Persuasivo** (para quebrar objeções) e **Performance Técnica** (para carregar instantaneamente).
      
      Eu não uso templates prontos que quebram no celular. Desenvolvo estruturas pensadas para o seu público, com tagueamento avançado (Pixel/API de Conversão) para que seu tráfego pago fique mais inteligente a cada visita.`,
    painPoints: [
      "Site lento que faz o cliente desistir (Bounce Rate alto).",
      "Páginas bonitas que não convertem visitantes em leads.",
      "Falta de rastreamento (você não sabe de onde vêm as vendas).",
      "Layout que quebra no celular."
    ],
    deliverables: [
      "Design UX/UI Exclusivo",
      "Copywriting de Vendas (Texto Persuasivo)",
      "Desenvolvimento Next.js (Carregamento < 1s)",
      "Instalação de Pixel (Meta/Google)",
      "Integração com CRM/Email Marketing"
    ],
    ctaText: "Quero uma Página que Vende"
  },
  {
    id: 'custom-crm',
    title: 'Inteligência Comercial (CRM)',
    description: 'Sistemas sob medida (CRMs) que se adaptam ao SEU processo. Centralizo seus dados para controle total.',
    icon: <Database size={24} />,
    fullDescription: `
      Planilhas de Excel não escalam. Sistemas de mercado (Pipedrive, Salesforce) muitas vezes são caros e complexos demais para o que você precisa, ou rígidos demais para o seu processo.
      
      Eu crio **CRMs Personalizados** que se moldam exatamente à forma como sua empresa vende. Você terá um dashboard central onde visualiza cada lead, em qual etapa do funil ele está e qual a próxima ação necessária.
      
      Mais do que organizar, o sistema traz inteligência: alertas de follow-up, distribuição automática de leads para vendedores e relatórios de performance em tempo real.`,
    painPoints: [
      "Leads perdidos em planilhas bagunçadas.",
      "Vendedores esquecendo de fazer follow-up.",
      "Falta de visibilidade da diretoria sobre o forecast de vendas.",
      "Sistemas atuais caros e cheios de funções inúteis."
    ],
    deliverables: [
      "Arquitetura de Banco de Dados",
      "Dashboard Administrativo Personalizado",
      "Kanban de Vendas (Arrastar e Soltar)",
      "Automação de Distribuição de Leads",
      "Integração com WhatsApp Web"
    ],
    ctaText: "Organizar meu Comercial"
  },
  {
    id: 'sales-funnel',
    title: 'Engenharia de Funil',
    description: 'Arquitetura completa da jornada. Conecto a atração (tráfego) até o fechamento, sem vazamentos.',
    icon: <TrendingUp size={24} />,
    fullDescription: `
      O funil de vendas é o caminho que seu cliente percorre. Se houver buracos nesse caminho, você está perdendo dinheiro.
      
      Eu desenho e implemento a **Engenharia do Funil**. Isso significa conectar todas as pontas: do anúncio no Facebook, passando pela captura na Landing Page, nutrindo com sequências de e-mail/WhatsApp, até o agendamento da reunião ou a compra final.
      
      O objetivo é criar uma máquina previsível, onde você sabe que, ao colocar X reais em tráfego, sairão Y reais em vendas.`,
    painPoints: [
      "Muitos cliques, poucas vendas.",
      "Leads que esfriam por falta de contato rápido.",
      "Processo manual e dependente de memória.",
      "Desconexão entre Marketing e Vendas."
    ],
    deliverables: [
      "Mapeamento da Jornada do Cliente",
      "Configuração de Ferramentas de Email Marketing",
      "Sequências de Nutrição (Email/WhatsApp)",
      "Score de Leads (Lead Scoring)",
      "Recuperação de Carrinho/Checkout"
    ],
    ctaText: "Construir meu Funil"
  },
  {
    id: 'cx-process',
    title: 'Design de Experiência (CX)',
    description: 'Encante seu cliente em cada ponto de contato. Processos que geram retenção e indicações orgânicas.',
    icon: <Users size={24} />,
    fullDescription: `
      Vender é apenas o começo. O lucro real está na retenção e na recomendação (LTV).
      
      Atuo desenhando a **Jornada do Cliente (CX)** pós-venda. Criamos processos de Onboarding (boas-vindas) incríveis para que o cliente sinta que fez a melhor escolha. Implementamos pesquisas de satisfação (NPS) automáticas e réguas de relacionamento para upsell.
      
      Transforme clientes satisfeitos em fãs advogados da sua marca.`,
    painPoints: [
      "Churn alto (clientes cancelando rápido).",
      "Baixa taxa de recompra.",
      "Reclamações por falta de suporte ou atenção.",
      "Cliente sente que foi 'abandonado' após pagar."
    ],
    deliverables: [
      "Mapeamento de Pontos de Contato (Touchpoints)",
      "Playbook de Atendimento/Sucesso do Cliente",
      "Implementação de NPS Automático",
      "Estratégia de Onboarding",
      "Régua de Relacionamento Pós-Venda"
    ],
    ctaText: "Melhorar Experiência do Cliente"
  },
  {
    id: 'automation',
    title: 'Operação Invisível (Automação)',
    description: 'Automações inteligentes (Zapier/n8n) que eliminam trabalho manual entre Marketing e Vendas.',
    icon: <Settings size={24} />,
    fullDescription: `
      Sua equipe perde tempo copiando e colando dados? Exportando CSVs? Enviando mensagens manuais de confirmação?
      
      A **Automação (Operação Invisível)** serve para que humanos façam trabalho de humanos (estratégia e relacionamento) e robôs façam trabalho de robôs (dados e repetição).
      
      Eu conecto suas ferramentas (Site, CRM, Email, Planilhas, ERP) usando tecnologias como n8n, Make ou Zapier. O resultado é velocidade instantânea e zero erro humano.`,
    painPoints: [
      "Erros de digitação em contratos ou cadastros.",
      "Lentidão para passar o lead do Marketing para Vendas.",
      "Horas gastas em tarefas repetitivas.",
      "Dados desatualizados em sistemas diferentes."
    ],
    deliverables: [
      "Integração via Webhooks/API",
      "Automação de Contratos/Propostas",
      "Notificações em Tempo Real (Slack/WhatsApp)",
      "Sincronização de Banco de Dados",
      "Eliminação de Tarefas Manuais"
    ],
    ctaText: "Automatizar minha Empresa"
  },
  {
    id: 'social-content',
    title: 'Social Media & Conteúdo',
    description: 'Criação de conteúdo estratégico. Posts que não apenas engajam, mas conduzem o lead para dentro do funil.',
    icon: <Smartphone size={24} />,
    fullDescription: `
      Likes não pagam boletos. Muitas agências focam em métricas de vaidade. Eu foco em métricas de negócio.
      
      Minha estratégia de **Social Media** é intencional. Cada conteúdo (Post, Story, Reel) tem uma função específica no funil: atrair consciência, educar sobre o problema ou ofertar a solução.
      
      Eu crio a narrativa que conecta a dor do seu cliente à sua solução, preparando o terreno para que, quando ele chegue na página de vendas, ele já esteja pronto para comprar.`,
    painPoints: [
      "Posta todo dia mas não vende nada.",
      "Não sabe o que postar (falta de linha editorial).",
      "Seguidores que não são o público-alvo.",
      "Conteúdo 'mais do mesmo' que não gera autoridade."
    ],
    deliverables: [
      "Linha Editorial Estratégica",
      "Calendário de Conteúdo",
      "Roteiros para Reels/Vídeos",
      "Design de Posts de Alta Performance",
      "Análise de Métricas de Conversão"
    ],
    ctaText: "Criar Conteúdo que Vende"
  }
];

export const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  return (
    <section id={SectionId.SERVICES} className="py-24 md:py-40 bg-brand-gray relative bg-grid-pattern overflow-hidden">
      <div className="absolute top-10 left-10 hidden md:block">
        <svg width="60" height="60" viewBox="0 0 40 40" fill="none" stroke="#0035C5" strokeWidth="2" className="opacity-20 animate-spin-slow">
          <path d="M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Soluções Ponta a Ponta
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-brand-black leading-[0.9] tracking-tighter">
              O Ecossistema de Vendas <br />
              <span className="text-brand-blue relative">
                Completo
                <svg className="absolute -top-8 -right-10 w-16 h-16 text-brand-lime hidden md:block animate-pulse" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z" /></svg>
              </span> para sua escala.
            </h2>
          </div>
          <div className="w-24 md:w-40 h-3 bg-brand-blue rounded-full opacity-10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`rounded-[3rem] p-10 transition-all duration-700 hover:-translate-y-4 flex flex-col justify-between h-full border-2 cursor-pointer group shimmer-effect ${idx === 1 || idx === 4
                ? 'bg-brand-blue text-white border-brand-blue/80 hover:border-brand-lime hover:shadow-[0_30px_60px_rgba(0,53,197,0.4)] relative overflow-hidden'
                : 'bg-white text-brand-black border-transparent hover:bg-white hover:border-brand-blue/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] glass-card-light'
                }`}
            >
              <div>
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 text-2xl border transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-[15deg] group-hover:shadow-xl ${idx === 1 || idx === 4
                  ? 'bg-white/10 border-white/20 text-brand-lime shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                  : 'bg-brand-blue/5 border-brand-blue/10 text-brand-blue'
                  }`}>
                  {service.icon}
                </div>
                <h4 className="text-2xl md:text-3xl font-black mb-6 tracking-tight leading-tight">{service.title}</h4>
                <p className={`text-lg leading-relaxed font-light ${idx === 1 || idx === 4 ? 'text-white/70' : 'text-gray-500'}`}>
                  {service.description}
                </p>
              </div>
              <div className="mt-12 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-all">
                <span className="font-black text-xs tracking-[0.2em] uppercase">
                  Explorar Detalhes
                </span>
                <div className={`p-2 rounded-full transition-colors ${idx === 1 || idx === 4 ? 'bg-white/10 text-brand-lime group-hover:bg-brand-lime group-hover:text-brand-blue' : 'bg-brand-blue/5 text-brand-blue group-hover:bg-brand-blue group-hover:text-white'}`}>
                  <ArrowRight size={20} className="transform -translate-x-1 group-hover:translate-x-0 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Render Full Page Service Details */}
      {selectedService && (
        <ServiceDetailsPage
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </section>
  );
};