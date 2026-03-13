import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles, Building2, Users, Target, Zap, AlertTriangle, Rocket,
    ArrowRight, ArrowLeft, Check, CheckCircle, ChevronDown,
    Globe, Instagram, Phone, MessageCircle, Mail, BarChart3, Settings,
    ShieldCheck, Star, TrendingUp
} from 'lucide-react';

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
interface BriefingData {
    id: string;
    client_name: string;
    client_email?: string;
    status: string;
    responses: Record<string, any>;
    maturity_score?: number;
}

interface PublicBriefingViewerProps {
    briefing: BriefingData;
    onSubmit: (id: string, responses: Record<string, any>, score: number) => void;
}

/* ═══════════════════════════════════════════
   PHASE DEFINITIONS
═══════════════════════════════════════════ */
interface Question {
    key: string;
    label: string;
    type: 'text' | 'select' | 'multi' | 'scale';
    placeholder?: string;
    options?: string[];
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: [string, string];
}

interface Phase {
    num: string;
    emoji: string;
    tag: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    questions: Question[];
}

const PHASES: Phase[] = [
    {
        num: '01', emoji: '🧩', tag: 'FASE 1', title: 'Base do Negócio', subtitle: 'Conhecendo a fundação da sua empresa',
        icon: Building2, color: 'brand-blue',
        questions: [
            { key: 'company_name', label: 'Nome da empresa', type: 'text', placeholder: 'Ex: Luxe Estate Imobiliária' },
            { key: 'niche', label: 'Nicho de atuação', type: 'text', placeholder: 'Ex: Imobiliário, SaaS, E-commerce...' },
            { key: 'main_product', label: 'Produto/serviço principal', type: 'text', placeholder: 'Ex: Consultoria de marketing digital' },
            { key: 'avg_ticket', label: 'Ticket médio', type: 'select', options: ['Até R$ 500', 'R$ 500 – R$ 2.000', 'R$ 2.000 – R$ 5.000', 'R$ 5.000 – R$ 15.000', 'Acima de R$ 15.000'] },
            { key: 'monthly_clients', label: 'Quantidade média de clientes por mês', type: 'select', options: ['1 – 5', '6 – 15', '16 – 30', '31 – 50', '50+'] },
            { key: 'team_size', label: 'Tamanho da equipe comercial', type: 'select', options: ['Só eu', '2 – 3 pessoas', '4 – 7 pessoas', '8+ pessoas'] },
        ],
    },
    {
        num: '02', emoji: '🎯', tag: 'FASE 2', title: 'Origem dos Leads', subtitle: 'Como os clientes chegam até você',
        icon: Target, color: 'brand-lime',
        questions: [
            { key: 'lead_sources', label: 'De onde vêm seus leads hoje?', type: 'multi', options: ['Instagram', 'Indicação', 'Tráfego pago', 'Site', 'WhatsApp', 'Google', 'LinkedIn', 'Outro'] },
            { key: 'monthly_leads', label: 'Quantos leads por mês aproximadamente?', type: 'select', options: ['Menos de 10', '10 – 30', '30 – 60', '60 – 100', '100+'] },
            { key: 'has_landing_page', label: 'Existe página de captura (landing page)?', type: 'select', options: ['Sim, e funciona bem', 'Sim, mas não converte', 'Não, mas pretendo criar', 'Não sei o que é'] },
        ],
    },
    {
        num: '03', emoji: '💰', tag: 'FASE 3', title: 'Motor de Vendas', subtitle: 'Como acontece o fechamento',
        icon: TrendingUp, color: 'emerald-500',
        questions: [
            { key: 'who_responds', label: 'Quem responde os leads?', type: 'select', options: ['Eu mesmo(a)', 'Equipe comercial', 'Assistente virtual', 'Ninguém fixo'] },
            { key: 'response_time', label: 'Quanto tempo demora para responder?', type: 'select', options: ['Menos de 5 minutos', '5 – 30 minutos', '1 – 3 horas', 'Mais de 3 horas', 'Às vezes nem respondo'] },
            { key: 'has_script', label: 'Existe script ou roteiro de vendas?', type: 'select', options: ['Sim, estruturado', 'Sim, mas informal', 'Não, improviso', 'Não sei como fazer'] },
            { key: 'uses_crm', label: 'Usa CRM ou planilha para acompanhar?', type: 'select', options: ['CRM profissional', 'Planilha / Google Sheets', 'Bloco de notas / cabeça', 'Nada'] },
            { key: 'where_loses', label: 'Em qual etapa mais perde cliente?', type: 'select', options: ['Na primeira resposta', 'No envio de proposta', 'Na negociação de preço', 'No follow-up', 'Não sei ao certo'] },
        ],
    },
    {
        num: '04', emoji: '⚙️', tag: 'FASE 4', title: 'Estrutura Atual', subtitle: 'Ferramentas e processos internos',
        icon: Settings, color: 'violet-500',
        questions: [
            { key: 'current_tools', label: 'Quais ferramentas usa hoje?', type: 'multi', options: ['WhatsApp Business', 'E-mail marketing', 'CRM', 'Automação (Zapier, N8N, etc.)', 'ERP / Sistema de gestão', 'Planilhas', 'Nenhuma'] },
            { key: 'uses_whatsapp_biz', label: 'Usa WhatsApp Business com catálogo e etiquetas?', type: 'select', options: ['Sim, completo', 'Sim, básico', 'Não', 'Nem sabia que dava'] },
            { key: 'uses_email_mkt', label: 'Faz email marketing?', type: 'select', options: ['Sim, regular', 'Às vezes', 'Não', 'Não sei como'] },
            { key: 'automation_level', label: 'Nível de automação hoje', type: 'scale', scaleMin: 1, scaleMax: 5, scaleLabels: ['Tudo manual', 'Tudo automatizado'] },
        ],
    },
    {
        num: '05', emoji: '🚨', tag: 'FASE 5', title: 'Gargalos', subtitle: 'Onde o sistema está quebrando',
        icon: AlertTriangle, color: 'red-500',
        questions: [
            { key: 'biggest_frustration', label: 'O que mais frustra hoje no processo comercial?', type: 'text', placeholder: 'Descreva livremente...' },
            { key: 'growth_bottleneck', label: 'Qual gargalo mais atrapalha o crescimento?', type: 'select', options: ['Falta de leads', 'Demora na resposta', 'Não ter processo definido', 'Falta de tempo', 'Ferramentas inadequadas', 'Equipe desalinhada'] },
            { key: 'wants_to_automate', label: 'O que você gostaria de automatizar?', type: 'multi', options: ['Captação de leads', 'Respostas iniciais', 'Follow-up', 'Envio de propostas', 'Cobrança', 'Relatórios', 'Tudo que puder'] },
        ],
    },
    {
        num: '06', emoji: '🚀', tag: 'FASE FINAL', title: 'Objetivo do Sistema', subtitle: 'Missão do seu sistema comercial',
        icon: Rocket, color: 'brand-blue',
        questions: [
            { key: 'first_priority', label: 'O que você quer resolver primeiro?', type: 'multi', options: ['Organizar leads', 'Responder mais rápido', 'Aumentar conversão', 'Automatizar tarefas', 'Ter controle de dados', 'Escalar vendas'] },
            { key: 'ideal_outcome', label: 'Em 3 meses, qual resultado ideal?', type: 'text', placeholder: 'Ex: Dobrar o faturamento, ter processo previsível...' },
            { key: 'investment_readiness', label: 'Disposição para investir em estrutura', type: 'scale', scaleMin: 1, scaleMax: 5, scaleLabels: ['Ainda pensando', 'Pronto para investir'] },
        ],
    },
];

/* ═══════════════════════════════════════════
   MATURITY SCORE CALCULATOR
═══════════════════════════════════════════ */
function calculateMaturityScore(responses: Record<string, any>): number {
    let score = 0;
    let maxScore = 0;

    // Has landing page? (15 pts)
    maxScore += 15;
    if (responses.has_landing_page === 'Sim, e funciona bem') score += 15;
    else if (responses.has_landing_page === 'Sim, mas não converte') score += 7;

    // Response time (20 pts)
    maxScore += 20;
    const rt = responses.response_time;
    if (rt === 'Menos de 5 minutos') score += 20;
    else if (rt === '5 – 30 minutos') score += 14;
    else if (rt === '1 – 3 horas') score += 6;

    // Has script (15 pts)
    maxScore += 15;
    if (responses.has_script === 'Sim, estruturado') score += 15;
    else if (responses.has_script === 'Sim, mas informal') score += 8;

    // Uses CRM (15 pts)
    maxScore += 15;
    if (responses.uses_crm === 'CRM profissional') score += 15;
    else if (responses.uses_crm === 'Planilha / Google Sheets') score += 7;

    // Automation level (15 pts)
    maxScore += 15;
    const al = Number(responses.automation_level) || 1;
    score += Math.round((al / 5) * 15);

    // Tools count (10 pts)
    maxScore += 10;
    const tools = responses.current_tools || [];
    score += Math.min(10, tools.length * 2);

    // Email marketing (10 pts)
    maxScore += 10;
    if (responses.uses_email_mkt === 'Sim, regular') score += 10;
    else if (responses.uses_email_mkt === 'Às vezes') score += 4;

    return Math.round((score / maxScore) * 100);
}

/* ═══════════════════════════════════════════
   SVG DOODLES
═══════════════════════════════════════════ */
const StarDoodle = ({ className = '' }: { className?: string }) => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <path d="M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15Z" />
    </svg>
);
const RingDoodle = ({ className = '' }: { className?: string }) => (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" className={className}>
        <circle cx="45" cy="45" r="36" stroke="currentColor" strokeWidth="2" strokeDasharray="12 8" />
    </svg>
);
const CrossDoodle = ({ className = '' }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 2v20M2 12h20" />
    </svg>
);

/* ═══════════════════════════════════════════
   Reveal animation wrapper
═══════════════════════════════════════════ */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export const PublicBriefingViewer: React.FC<PublicBriefingViewerProps> = ({ briefing, onSubmit }) => {
    const [phase, setPhase] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>(briefing.responses || {});
    const [introState, setIntroState] = useState<'in' | 'show' | 'out' | 'gone'>('in');
    const [mounted, setMounted] = useState(false);
    const [completed, setCompleted] = useState(briefing.status === 'completed');
    const [maturityScore, setMaturityScore] = useState(briefing.maturity_score || 0);
    const [scoreAnimated, setScoreAnimated] = useState(0);
    const topRef = useRef<HTMLDivElement>(null);

    const firstName = briefing.client_name.trim().split(' ')[0];
    const totalPhases = PHASES.length;
    const progress = ((phase + 1) / totalPhases) * 100;
    const currentPhase = PHASES[phase];

    // Intro animation
    useEffect(() => {
        const t1 = setTimeout(() => setIntroState('show'), 100);
        const t2 = setTimeout(() => setIntroState('out'), 2200);
        const t3 = setTimeout(() => { setIntroState('gone'); setMounted(true); }, 3300);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    // Score animation
    useEffect(() => {
        if (!completed) return;
        let current = 0;
        const interval = setInterval(() => {
            current += 1;
            if (current >= maturityScore) { clearInterval(interval); current = maturityScore; }
            setScoreAnimated(current);
        }, 20);
        return () => clearInterval(interval);
    }, [completed, maturityScore]);

    const setResponse = (key: string, value: any) => {
        setResponses(prev => ({ ...prev, [key]: value }));
    };

    const toggleMulti = (key: string, option: string) => {
        const current: string[] = responses[key] || [];
        setResponse(key, current.includes(option) ? current.filter(o => o !== option) : [...current, option]);
    };

    const canAdvance = () => {
        return currentPhase.questions.every(q => {
            const val = responses[q.key];
            if (q.type === 'multi') return val && val.length > 0;
            if (q.type === 'scale') return val !== undefined;
            return val && val.toString().trim().length > 0;
        });
    };

    const handleNext = () => {
        if (phase < totalPhases - 1) {
            setPhase(phase + 1);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Complete!
            const score = calculateMaturityScore(responses);
            setMaturityScore(score);
            setCompleted(true);
            onSubmit(briefing.id, responses, score);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (phase > 0) {
            setPhase(phase - 1);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getScoreColor = () => {
        if (scoreAnimated >= 70) return 'text-emerald-400';
        if (scoreAnimated >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreLabel = () => {
        if (maturityScore >= 70) return 'Avançado';
        if (maturityScore >= 40) return 'Intermediário';
        return 'Iniciante';
    };

    const getScoreEmoji = () => {
        if (maturityScore >= 70) return '🟢';
        if (maturityScore >= 40) return '🟡';
        return '🔴';
    };

    /* ─── RENDER ─── */
    return (
        <div className="min-h-screen bg-brand-gray text-gray-700 font-sans overflow-x-hidden selection:bg-brand-lime selection:text-brand-blue">
            <div ref={topRef} />

            {/* ══ INTRO OVERLAY ══ */}
            {introState !== 'gone' && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-brand-blue text-white overflow-hidden pointer-events-none"
                    style={{ opacity: introState === 'out' ? 0 : 1, transition: introState === 'out' ? 'opacity 1s cubic-bezier(.4,0,.6,1)' : 'none' }}>
                    <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-lime/10 blur-[100px]" />
                    <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/5 blur-[80px]" />
                    <StarDoodle className="absolute top-16 left-12 text-brand-lime opacity-50" />
                    <RingDoodle className="absolute bottom-16 right-12 text-brand-lime opacity-20" />
                    <CrossDoodle className="absolute top-1/3 right-[18%] text-brand-lime opacity-30" />
                    <div className="text-center px-8"
                        style={{
                            transition: 'opacity .65s ease, transform .65s ease',
                            opacity: introState === 'in' ? 0 : introState === 'show' ? 1 : 0,
                            transform: introState === 'in' ? 'translateY(30px)' : introState === 'show' ? 'none' : 'translateY(-20px) scale(.97)',
                        }}>
                        {briefing.client_name === 'Futuro Parceiro' ? (
                            <>
                                <p className="text-brand-lime/70 text-[10px] font-black uppercase tracking-[0.4em] mb-5">Diagnóstico Estratégico</p>
                                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.88] mb-5 text-white">
                                    Olá,<br /><span className="text-brand-lime">Seja bem-vindo(a).</span>
                                </h1>
                            </>
                        ) : (
                            <>
                                <p className="text-brand-lime/70 text-[10px] font-black uppercase tracking-[0.4em] mb-5">Diagnóstico Estratégico · {firstName}</p>
                                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.88] mb-5 text-white">
                                    Olá,<br /><span className="text-brand-lime">{firstName}.</span>
                                </h1>
                            </>
                        )}
                        <p className="text-white/50 text-lg md:text-xl font-light">Vamos mapear seu sistema comercial.</p>
                    </div>
                </div>
            )}

            {/* ══ NAV ══ */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-sm">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 h-[3px] bg-brand-blue transition-all duration-700 ease-out" style={{ width: completed ? '100%' : `${progress}%` }} />
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span className="font-bold text-base tracking-tighter text-brand-blue">
                        E<span className="text-brand-blue">.</span>Celina
                    </span>
                    <div className="flex items-center gap-3">
                        {!completed && (
                            <span className="text-[10px] text-gray-400 font-bold">
                                Fase {phase + 1} de {totalPhases}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.15em] bg-brand-blue/10 border-brand-blue/20 text-brand-blue">
                            <Sparkles size={9} className="fill-current" />
                            {completed ? 'Completo' : 'Em Progresso'}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ══ HERO ══ */}
            <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-brand-blue text-white pt-14">
                <StarDoodle className="absolute top-24 left-8 text-brand-lime animate-float opacity-70 hidden sm:block" />
                <RingDoodle className="absolute bottom-20 right-10 text-brand-lime opacity-30 animate-spin-slow hidden md:block" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-lime rounded-full blur-[100px] opacity-15 pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center py-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-brand-lime/30 text-brand-lime text-[10px] font-bold uppercase tracking-widest mb-6"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)', transition: 'all 0.65s ease' }}>
                        <Zap size={11} className="fill-current" /> Diagnóstico Estratégico
                    </div>

                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.65s ease 0.15s' }}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4 text-white">
                            Missão: Mapear<br />
                            <span className="text-brand-lime">Seu Sistema</span> Comercial.
                        </h1>
                        <p className="text-white/50 text-sm md:text-base max-w-lg mx-auto mb-6">
                            Responda as 6 fases abaixo para que possamos construir a arquitetura ideal do seu negócio. <strong className="text-white/80">Leva menos de 4 minutos.</strong>
                        </p>
                    </div>

                    {/* Phase indicator pills */}
                    <div className="flex justify-center gap-1.5 mt-4" style={{ opacity: mounted ? 1 : 0, transition: 'opacity .5s ease .3s' }}>
                        {PHASES.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= phase || completed ? 'bg-brand-lime w-8' : 'bg-white/20 w-4'}`} />
                        ))}
                    </div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
                        <path d="M0 60L1440 60L1440 20C1200 60 900 0 720 20C540 40 240 0 0 20L0 60Z" fill="#f5f5f5" />
                    </svg>
                </div>
            </section>

            {/* ══ BODY ══ */}
            <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 md:py-20">
                {!completed ? (
                    /* ─── PHASE FORM ─── */
                    <div key={phase}>
                        <Reveal>
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{currentPhase.tag}</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tighter">
                                    {currentPhase.emoji} {currentPhase.title}
                                </h2>
                                <p className="text-gray-500 mt-2">{currentPhase.subtitle}</p>
                            </div>

                            <div className="space-y-6">
                                {currentPhase.questions.map((q, qi) => (
                                    <div key={q.key} className="bg-white rounded-[2rem] p-7 shadow-lg border-2 border-white hover:border-brand-blue/10 transition-all duration-300">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-3">
                                            {q.label}
                                        </label>

                                        {q.type === 'text' && (
                                            <input
                                                type="text"
                                                value={responses[q.key] || ''}
                                                onChange={e => setResponse(q.key, e.target.value)}
                                                placeholder={q.placeholder}
                                                className="w-full bg-brand-gray border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:shadow-lg focus:shadow-brand-blue/5 text-sm transition-all duration-200"
                                            />
                                        )}

                                        {q.type === 'select' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {q.options!.map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setResponse(q.key, opt)}
                                                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2
                                                        ${responses[q.key] === opt
                                                                ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                                                                : 'bg-brand-gray text-gray-600 border-gray-200 hover:border-brand-blue/30 hover:bg-brand-blue/5'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {responses[q.key] === opt && <Check size={14} />}
                                                            {opt}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === 'multi' && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {q.options!.map(opt => {
                                                    const selected = (responses[q.key] || []).includes(opt);
                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => toggleMulti(q.key, opt)}
                                                            className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2
                                                            ${selected
                                                                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                                                                    : 'bg-brand-gray text-gray-600 border-gray-200 hover:border-brand-blue/30 hover:bg-brand-blue/5'
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {selected ? <Check size={14} /> : <span className="w-3.5 h-3.5 rounded border-2 border-gray-300 block" />}
                                                                {opt}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {q.type === 'scale' && (
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-[10px] text-gray-400 font-bold">{q.scaleLabels?.[0]}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{q.scaleLabels?.[1]}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {Array.from({ length: (q.scaleMax || 5) - (q.scaleMin || 1) + 1 }, (_, i) => i + (q.scaleMin || 1)).map(n => (
                                                        <button
                                                            key={n}
                                                            onClick={() => setResponse(q.key, n)}
                                                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-200 border-2
                                                            ${Number(responses[q.key]) === n
                                                                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20 scale-110'
                                                                    : 'bg-brand-gray text-gray-500 border-gray-200 hover:border-brand-blue/30'
                                                                }`}
                                                        >
                                                            {n}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-10">
                                <button
                                    onClick={handleBack}
                                    disabled={phase === 0}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200
                                    ${phase === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-brand-blue hover:bg-white hover:shadow-lg'}`}
                                >
                                    <ArrowLeft size={16} /> Anterior
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={!canAdvance()}
                                    className={`group flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black transition-all duration-300 shadow-lg
                                    ${canAdvance()
                                            ? 'bg-brand-blue text-white hover:bg-brand-lime hover:text-brand-blue hover:-translate-y-0.5 hover:shadow-xl'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    {phase === totalPhases - 1 ? 'Enviar Diagnóstico' : 'Próxima Fase'}
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>

                            {/* Phase progress bar */}
                            <div className="mt-8 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className="h-full bg-brand-blue rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-center text-[11px] text-gray-400 font-bold mt-2">
                                Progresso da Missão: {Math.round(progress)}%
                            </p>
                        </Reveal>
                    </div>
                ) : (
                    /* ─── COMPLETED STATE ─── */
                    <Reveal>
                        <div className="text-center">
                            {/* Score circle */}
                            <div className="relative w-48 h-48 mx-auto mb-8">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                                    <circle cx="50" cy="50" r="42" fill="none"
                                        stroke={scoreAnimated >= 70 ? '#10b981' : scoreAnimated >= 40 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={`${(scoreAnimated / 100) * 264} 264`}
                                        className="transition-all duration-100"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-black ${getScoreColor()}`}>{scoreAnimated}%</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Maturidade</span>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                                <CheckCircle size={14} className="text-emerald-500" />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Diagnóstico Completo</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-brand-blue tracking-tighter mb-3">
                                🎉 Diagnóstico Enviado!
                            </h2>
                            <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
                                Agora vamos analisar seu sistema atual e preparar a <strong className="text-gray-700">arquitetura ideal</strong> para seu negócio.
                            </p>

                            {/* Score card */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-xl border-2 border-white max-w-md mx-auto mb-8">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Score de Maturidade Comercial</p>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="text-2xl">{getScoreEmoji()}</span>
                                    <span className={`text-2xl font-black ${getScoreColor()}`}>{getScoreLabel()}</span>
                                </div>
                                <div className="bg-brand-gray rounded-xl p-4">
                                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                                        <div className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${scoreAnimated}%`,
                                                backgroundColor: scoreAnimated >= 70 ? '#10b981' : scoreAnimated >= 40 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold">
                                        Sistema Comercial: <span className={getScoreColor()}>{scoreAnimated}% estruturado</span>
                                    </p>
                                </div>
                            </div>

                            {/* Next step */}
                            <div className="bg-brand-blue/5 border-2 border-brand-blue/10 rounded-[2rem] p-8 max-w-md mx-auto">
                                <Rocket size={28} className="text-brand-blue mx-auto mb-3" />
                                <h3 className="font-bold text-brand-blue text-lg mb-2">Próximo Passo</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Reunião de diagnóstico para apresentar a estratégia personalizada baseada nas suas respostas.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                )}
            </div>

            {/* ══ FOOTER ══ */}
            <footer className="bg-brand-black py-10 px-6 text-center">
                <p className="text-[11px] text-white/25 tracking-wide">
                    © {new Date().getFullYear()} <span className="text-white/40 font-semibold">Elizabeth Celina</span> · Soluções Digitais & CX
                </p>
            </footer>

            <style>{`
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
                .animate-float { animation: float 5.5s ease-in-out infinite; }
                @keyframes spin-slow { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                .animate-spin-slow { animation: spin-slow 16s linear infinite; }
            `}</style>
        </div>
    );
};
