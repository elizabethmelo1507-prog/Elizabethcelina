import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle, FileText, MapPin, Smartphone, Mail, ShieldCheck, PenTool,
    Loader2, Sparkles, DollarSign, Clock, AlertTriangle, Lock,
    Check, ChevronDown, UserCheck, Zap, Calendar
} from 'lucide-react';
import { supabase } from '../services/supabase';

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface ContractItem { id?: number; description: string; price: number; }
interface Contract {
    id: number | string;
    title: string;
    client: string;
    clientFullName?: string;
    clientCPF?: string;
    clientAddress?: string;
    clientDob?: string;
    clientCompany?: string;
    clientResponsible?: string;
    clientPhone?: string;
    clientEmail?: string;
    deliveryDeadline?: string;
    excludedScope?: string;
    paymentTerms?: string;
    lateFine?: string;
    acceptanceDays?: string;
    value: string;
    items: ContractItem[];
    startDate: string;
    endDate: string;
    status: string;
    type: string;
    signedDate?: string;
}
interface Props { contract: Contract; onSign: (id: number | string) => void; }

/* ══════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════ */
function useScrollProgress() {
    const [p, setP] = useState(0);
    useEffect(() => {
        const fn = () => {
            const el = document.documentElement;
            const max = el.scrollHeight - el.clientHeight;
            setP(max > 0 ? el.scrollTop / max : 0);
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);
    return p;
}

function useInView(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, v };
}

/* ═══ Reveal wrapper ═══ */
function Reveal({ children, delay = 0, up = 32, className = '' }: { children: React.ReactNode; delay?: number; up?: number; className?: string }) {
    const { ref, v } = useInView();
    return (
        <div ref={ref} className={className} style={{
            transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
            opacity: v ? 1 : 0,
            transform: v ? 'none' : `translateY(${up}px)`,
        }}>
            {children}
        </div>
    );
}

/* ══════════════════════════════════════════════
   DECORATIVE ELEMENTS
══════════════════════════════════════════════ */
function StarShape({ sz = 40, className = '' }: { sz?: number; className?: string }) {
    return (
        <svg width={sz} height={sz} viewBox="0 0 50 50" fill="currentColor" className={className}>
            <path d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20Z" />
        </svg>
    );
}
function RingShape({ sz = 80, className = '' }: { sz?: number; className?: string }) {
    return (
        <svg width={sz} height={sz} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="9 9" className={className}>
            <circle cx="50" cy="50" r="45" />
        </svg>
    );
}
function CrossShape({ sz = 28, className = '' }: { sz?: number; className?: string }) {
    return (
        <svg width={sz} height={sz} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
            <line x1="14" y1="0" x2="14" y2="28" />
            <line x1="0" y1="14" x2="28" y2="14" />
        </svg>
    );
}

/* Gradient text underline */
function Underline() {
    return (
        <svg viewBox="0 0 260 12" fill="none" className="w-full mt-0.5" height="12" preserveAspectRatio="none">
            <path d="M2 9 Q65 1 130 7 Q195 13 258 5" stroke="#ccff00" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </svg>
    );
}

/* Wave section divider — direction: 'down' or 'up' */
function Wave({ fill, dir = 'down' }: { fill: string; dir?: 'down' | 'up' }) {
    const path = dir === 'down'
        ? 'M0 0L1440 0L1440 40C1080 80 720 0 360 40C180 60 60 20 0 40Z'
        : 'M0 60L1440 60L1440 20C1080 0 720 60 360 20C180 0 60 40 0 20Z';
    return (
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 block" fill={fill}>
            <path d={path} />
        </svg>
    );
}

/* Pill label */
function Pill({ children, color = 'lime' }: { children: React.ReactNode; color?: 'lime' | 'blue' | 'red' | 'amber' | 'white' }) {
    const cls: Record<string, string> = {
        lime: 'bg-brand-lime/15 border-brand-lime/30 text-brand-blue',
        blue: 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue',
        red: 'bg-red-500/10 border-red-500/30 text-red-500',
        amber: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
        white: 'bg-white/10 border-brand-lime/30 text-brand-lime',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.15em] ${cls[color]}`}>
            {children}
        </span>
    );
}

/* Section number badge */
function Num({ n }: { n: string }) {
    return (
        <div className="relative inline-flex items-center justify-center w-14 h-14 shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-brand-blue border border-brand-blue/20" />
            <span className="relative text-white font-bold text-sm">{n}</span>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export const PublicContractViewer: React.FC<Props> = ({ contract, onSign }) => {
    const [isSigning, setIsSigning] = useState(false);
    const [hasSigned, setHasSigned] = useState(contract.status === 'Assinado');
    const [mounted, setMounted] = useState(false);
    const [intro, setIntro] = useState<'in' | 'show' | 'out' | 'gone'>('in');
    const [agreed, setAgreed] = useState(false);
    const scrollP = useScrollProgress();

    // Post-signature payment flow
    const [paymentStep, setPaymentStep] = useState<'idle' | 'kickoff' | 'choose' | 'pix' | 'card' | 'done'>(
        contract.status === 'Assinado' ? 'done' : 'idle'
    );
    const [kickoffDate, setKickoffDate] = useState('');
    const [kickoffTime, setKickoffTime] = useState('');
    const [isSavingKickoff, setIsSavingKickoff] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [pixAnimStep, setPixAnimStep] = useState<'idle' | 'copying' | 'copied'>('idle');

    const firstName = (contract.clientFullName || contract.client).trim().split(' ')[0];
    const totalNum = contract.items.reduce((s, i) => s + Number(i.price), 0)
        || parseFloat(contract.value.replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.')) || 0;

    useEffect(() => {
        const t1 = setTimeout(() => setIntro('show'), 100);
        const t2 = setTimeout(() => setIntro('out'), 2200);
        const t3 = setTimeout(() => { setIntro('gone'); setMounted(true); }, 3300);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    const sign = () => {
        if (!agreed) return;
        if (!window.confirm('Confirma a assinatura digital deste contrato? Ao confirmar você concorda com todos os termos.')) return;
        setIsSigning(true);
        setTimeout(() => {
            onSign(contract.id);
            setHasSigned(true);
            setIsSigning(false);
            // After signing, go to kickoff choice
            setTimeout(() => setPaymentStep('kickoff'), 800);
        }, 1800);
    };

    const handleSaveKickoff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kickoffDate || !kickoffTime) return;
        setIsSavingKickoff(true);
        try {
            const { error } = await supabase.from('custom_events').insert({
                title: `Kickoff: ${contract.clientFullName || contract.client} (${kickoffTime})`,
                date: kickoffDate,
                type: 'Reunião',
                color: 'bg-brand-lime/20 text-brand-lime border-brand-lime/30',
                time: kickoffTime,
                client_name: contract.clientFullName || contract.client,
                client_phone: contract.clientPhone || ''
            });
            if (error) throw error;
            setIsSavingKickoff(false);
            setPaymentStep('choose');
        } catch (err: any) {
            console.error('Erro ao salvar kickoff:', err);
            setIsSavingKickoff(false);
            alert('Não foi possível salvar a data. Tente novamente: ' + (err.message || String(err)));
        }
    };

    const handleChooseMethod = (method: 'pix' | 'card') => {
        savePendingInvoice(method);
        setPaymentMethod(method);
        setPaymentStep(method);
    };

    const savePendingInvoice = (method: 'pix' | 'card') => {
        try {
            const existing: object[] = JSON.parse(localStorage.getItem('ec_pending_invoices') || '[]');
            const filteredExisting = existing.filter((inv: any) => inv.contractId !== contract.id);
            const amount = isSplitPayment ? totalValues.halfFmt : totalValues.totalFmt;
            const now = new Date();
            const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
            const newInv = {
                id: Date.now(),
                client: contract.clientFullName || contract.client,
                description: `${contract.title} · Contrato #${contract.id}${isSplitPayment ? ' (50% entrada)' : ''}`,
                amount,
                dueDate: dateStr,
                status: 'Aguardando',
                type: 'Pontual',
                paymentMethod: method === 'pix' ? 'PIX' : 'Cartão',
                contractId: contract.id,
                source: 'contract',
                // Split payment fields for second installment billing
                isSplitPayment: !!isSplitPayment,
                secondHalfAmount: isSplitPayment ? totalValues.halfFmt : undefined,
                clientPhone: contract.clientPhone || undefined,
            };
            localStorage.setItem('ec_pending_invoices', JSON.stringify([newInv, ...filteredExisting]));

            // Add new Onboarding process
            const existingOnboardings = JSON.parse(localStorage.getItem('ec_onboarding_processes') || '[]');
            // Check if one already exists for this client to avoid duplicates
            if (!existingOnboardings.find((o: any) => o.client === (contract.clientFullName || contract.client))) {
                const newProcess = {
                    id: Date.now() + 1, // ensure unique ID
                    client: contract.clientFullName || contract.client,
                    clientEmail: contract.clientEmail || '',
                    clientPhone: contract.clientPhone || '',
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

            // Also add as a Client in the CRM
            const existingClients = JSON.parse(localStorage.getItem('ec_clients_db') || '[]');
            if (!existingClients.find((c: any) => c.name === (contract.clientFullName || contract.client))) {
                const newClient = {
                    id: Date.now() + 2,
                    name: contract.clientFullName || contract.client,
                    company: contract.clientCompany || 'Sem Empresa',
                    email: contract.clientEmail || '',
                    phone: contract.clientPhone || '',
                    healthScore: 3,
                    ltv: totalValues.totalFmt,
                    since: dateStr,
                    contractEnd: contract.endDate,
                    status: 'Ativo',
                    nextAction: 'Onboarding',
                    history: [
                        { id: 1, date: dateStr, type: 'Sistema', title: 'Contrato Assinado', description: `Contrato digital assinado e primeiro pagamento (${method === 'pix' ? 'PIX' : 'Cartão'}) efetuado.` }
                    ]
                };
                localStorage.setItem('ec_clients_db', JSON.stringify([newClient, ...existingClients]));
            }
        } catch { /* ignore */ }
    };

    const handleProcessPayment = () => {
        setIsProcessingPayment(true);
        setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentStep('done');
        }, 2000);
    };

    const handleCopyPix = () => {
        const pixKey = '042.122.602-12'; // Chave PIX - CPF Elizabeth Celina
        navigator.clipboard.writeText(pixKey).catch(() => { });
        setPixAnimStep('copying');
        setTimeout(() => setPixAnimStep('copied'), 600);
        setTimeout(() => setPixAnimStep('idle'), 2500);
    };

    const isSplitPayment = contract.paymentTerms?.includes('50%');
    const totalValues = (() => {
        const raw = parseFloat(contract.value.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.'));
        const total = isNaN(raw) ? 0 : raw;
        return {
            total,
            half: total / 2,
            totalFmt: total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            halfFmt: (total / 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        };
    })();

    /* ───── common card style ───── */
    const card = 'rounded-[2rem] border-2 border-white bg-white shadow-lg';

    return (
        <div className="min-h-screen bg-brand-gray text-gray-700 overflow-x-hidden font-sans selection:bg-brand-lime selection:text-brand-blue">

            {/* ══ INTRO OVERLAY ══ */}
            {intro !== 'gone' && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-brand-blue text-white overflow-hidden pointer-events-none"
                    style={{ opacity: intro === 'out' ? 0 : 1, transition: intro === 'out' ? 'opacity 1s cubic-bezier(.4,0,.6,1)' : 'none' }}>

                    {/* ambient blobs */}
                    <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-lime/10 blur-[100px]" />
                    <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/5 blur-[80px]" />

                    <StarShape sz={36} className="absolute top-16 left-12 text-brand-lime opacity-50 animate-float" />
                    <RingShape sz={90} className="absolute bottom-16 right-12 text-brand-lime opacity-20 animate-spin-slow" />
                    <CrossShape sz={24} className="absolute top-1/3 right-[18%] text-brand-lime opacity-30" />

                    <div className="text-center px-8"
                        style={{
                            transition: 'opacity .65s ease, transform .65s ease',
                            opacity: intro === 'in' ? 0 : intro === 'show' ? 1 : 0,
                            transform: intro === 'in' ? 'translateY(30px)' : intro === 'show' ? 'none' : 'translateY(-20px) scale(.97)',
                        }}>
                        <p className="text-brand-lime/70 text-[10px] font-black uppercase tracking-[0.4em] mb-5">Contrato Digital · #{contract.id}</p>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.88] mb-5 text-white">
                            Olá,<br /><span className="text-brand-lime">{firstName}.</span>
                        </h1>
                        <p className="text-white/50 text-lg md:text-xl font-light">Seu contrato está pronto para assinar.</p>
                    </div>
                </div>
            )}

            {/* ══ SCROLL PROGRESS ══ */}
            <div className="fixed top-0 left-0 z-[200] h-[3px] bg-brand-blue"
                style={{ width: `${scrollP * 100}%`, transition: 'width 80ms linear' }} />

            {/* ══ NAV ══ */}
            <nav className="fixed top-[3px] left-0 right-0 z-[100] h-14 bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
                    <span className="font-bold tracking-tighter text-base text-brand-blue">
                        E<span className="text-brand-blue">.</span>Celina
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-[11px] text-gray-400">Para <span className="text-gray-700 font-bold">{firstName}</span></span>
                        <Pill color={hasSigned ? 'lime' : 'blue'}>
                            {hasSigned ? <><CheckCircle size={9} /> Assinado</> : <><Lock size={9} /> Aguardando assinatura</>}
                        </Pill>
                    </div>
                </div>
            </nav>

            {/* ══════════════════════════════════
                HERO
            ══════════════════════════════════ */}
            <section className="relative min-h-[80vh] flex items-center overflow-x-hidden bg-brand-blue text-white">

                {/* ambient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(204,255,0,.12),transparent)]" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-brand-blue/0 via-transparent to-transparent" />

                {/* doodles */}
                <StarShape sz={44} className="absolute top-24 left-8 sm:left-16 text-brand-lime animate-float opacity-80" />
                <RingShape sz={110} className="absolute top-20 right-8 sm:right-16 text-brand-lime opacity-35 animate-spin-slow" />
                <CrossShape sz={28} className="absolute top-[40%] left-[8%] text-brand-lime opacity-25 hidden md:block" />
                <StarShape sz={22} className="absolute bottom-[35%] right-[12%] text-white opacity-20 animate-float hidden sm:block" />
                {/* large ghost number */}
                <span className="absolute right-4 bottom-8 text-[20vw] font-black leading-none text-white/[0.04] select-none pointer-events-none hidden lg:block">
                    #{contract.id}
                </span>

                <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20 pb-24 md:pb-32">
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all .65s ease .05s' }}>
                        <Pill color="white"><Sparkles size={10} className="fill-current" /> Contrato de Prestação de Serviços</Pill>
                    </div>

                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(28px)', transition: 'all .7s cubic-bezier(.22,1,.36,1) .18s' }}>
                        <h1 className="text-5xl sm:text-7xl md:text-[88px] font-black tracking-tighter leading-[0.88] mt-6 mb-4 text-white">
                            Olá,<br />
                            <span className="relative">
                                <span className="text-brand-lime">{firstName}</span>
                                <span className="text-white"> 👋</span>
                            </span>
                        </h1>
                        <p className="text-white/55 text-base md:text-xl max-w-xl leading-relaxed mb-8">
                            Seu contrato digital está aqui. Leia cada cláusula com atenção e assine ao final com 1 clique. Leva menos de <strong className="text-white/90">5 minutos</strong>.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => document.getElementById('partes')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group flex items-center gap-3 bg-white text-brand-blue font-black px-7 py-3.5 rounded-full hover:bg-brand-lime transition-all duration-300 shadow-lg hover:-translate-y-0.5 text-sm"
                            >
                                Ler o Contrato
                                <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                            </button>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <ShieldCheck size={13} className="text-brand-lime" />
                                Documento protegido · LGPD
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all .7s ease .4s' }}
                        className="mt-14 flex flex-wrap gap-6 border-t border-white/10 pt-8">
                        {[
                            { label: 'Documento', val: `#${contract.id}` },
                            { label: 'Investimento', val: `R$ ${contract.value}` },
                            { label: 'Início', val: contract.startDate },
                            { label: 'Cláusulas', val: '12' },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-[9px] text-white/35 uppercase tracking-widest font-black mb-0.5">{s.label}</p>
                                <p className="text-sm font-black text-white">{s.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <Wave fill="#f5f5f5" dir="up" />
                </div>
            </section>

            {/* ══════════════════════════════════
                CONTRACT BODY
            ══════════════════════════════════ */}
            <div className="max-w-5xl mx-auto px-5 sm:px-6">

                {/* ─── 01. PARTES ─── */}
                <section id="partes" className="py-20 space-y-8">
                    <Reveal>
                        <div className="flex items-center gap-4 mb-2">
                            <Num n="01" />
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Primeira</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tighter">Identificação das Partes</h2>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 ml-[4.5rem] leading-relaxed max-w-xl">
                            Este instrumento é celebrado entre as seguintes partes, que se identificam e aceitam os termos aqui dispostos.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CONTRATADA */}
                        <Reveal delay={60}>
                            <div className={`${card} p-7 relative overflow-hidden group hover:shadow-xl transition-all duration-500 h-full`}>
                                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand-blue/5 group-hover:bg-brand-blue/10 transition-colors duration-500" />
                                <Pill color="lime"><Sparkles size={8} className="fill-current" /> Contratada</Pill>
                                <h3 className="mt-4 text-xl font-bold text-gray-700 leading-tight">Elizabeth Celina<br />Gentil Vieira Mêne Melo</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-5">Soluções Digitais & CX</p>
                                <div className="space-y-2.5">
                                    {[
                                        { icon: FileText, text: 'CPF: 042.122.602-12' },
                                        { icon: MapPin, text: 'Manaus – AM, Brasil' },
                                        { icon: Mail, text: 'elizabethcelina.comercial@gmail.com' },
                                    ].map(({ icon: Icon, text }) => (
                                        <p key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                                            <Icon size={13} className="text-brand-blue shrink-0" />{text}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* CONTRATANTE */}
                        <Reveal delay={120}>
                            <div className={`${card} p-7 !border-brand-blue/15 relative overflow-hidden group hover:shadow-xl transition-all duration-500 h-full`}>
                                <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-brand-blue/5 group-hover:bg-brand-blue/10 transition-colors duration-500" />
                                <Pill color="blue"><UserCheck size={8} /> Contratante</Pill>
                                <h3 className="mt-4 text-xl font-bold text-gray-700 leading-tight">
                                    {contract.clientFullName || contract.client}
                                </h3>
                                {contract.clientCompany && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{contract.clientCompany}</p>}
                                {contract.clientResponsible && <p className="text-xs text-gray-500 mt-1 mb-3">Resp.: <span className="text-gray-700 font-bold">{contract.clientResponsible}</span></p>}
                                <div className="space-y-2.5 mt-5">
                                    {[
                                        { icon: FileText, text: `CPF/CNPJ: ${contract.clientCPF || 'Não informado'}` },
                                        contract.clientAddress ? { icon: MapPin, text: contract.clientAddress } : null,
                                        contract.clientPhone ? { icon: Smartphone, text: contract.clientPhone } : null,
                                        contract.clientEmail ? { icon: Mail, text: contract.clientEmail } : null,
                                    ].filter(Boolean).map((item) => {
                                        const { icon: Icon, text } = item as { icon: any; text: string };
                                        return (
                                            <p key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                                                <Icon size={13} className="text-brand-blue shrink-0" />{text}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ─── 02. OBJETO ─── */}
                <section className="py-12 border-t border-gray-200">
                    <Reveal>
                        <div className="flex items-center gap-4 mb-8">
                            <Num n="02" />
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Segunda</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tighter">Objeto do Contrato</h2>
                            </div>
                        </div>
                        <div className={`${card} p-7 ml-0 md:ml-[4.5rem]`}>
                            <p className="text-gray-600 leading-relaxed">
                                O presente instrumento tem por objeto a{' '}
                                <strong className="text-gray-700">Prestação de Serviços de {contract.title}</strong>,
                                compreendendo todas as entregas descritas na Cláusula Terceira (Escopo Detalhado),
                                conforme acordado entre as partes. Serviços não listados explicitamente não integram
                                este escopo e poderão ser contratados mediante nova proposta comercial.
                            </p>
                        </div>
                    </Reveal>
                </section>
            </div>

            {/* ─── 03. ESCOPO — FULL WIDTH BLUE ─── */}
            <section className="relative">
                <Wave fill="#0035C5" dir="down" />
                <div className="bg-brand-blue py-20 relative overflow-hidden">
                    {/* ambient */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(204,255,0,.07),transparent)] pointer-events-none" />
                    <StarShape sz={40} className="absolute top-10 right-[5%] text-brand-lime opacity-30 animate-float hidden sm:block" />
                    <RingShape sz={80} className="absolute bottom-10 left-[4%] text-brand-lime opacity-15 animate-spin-slow hidden md:block" />

                    <div className="max-w-5xl mx-auto px-5 sm:px-6">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="relative inline-flex items-center justify-center w-14 h-14 shrink-0">
                                    <div className="absolute inset-0 rounded-2xl bg-brand-lime/20 border border-brand-lime/40" />
                                    <span className="relative text-brand-lime font-black text-sm">03</span>
                                </div>
                                <div>
                                    <p className="text-[9px] text-brand-lime/50 font-black uppercase tracking-widest">Cláusula Terceira</p>
                                    <h2 className="text-2xl md:text-3xl font-black text-white">Escopo Detalhado</h2>
                                </div>
                            </div>
                        </Reveal>

                        <div className="space-y-3 mb-6">
                            {contract.items.map((item, i) => (
                                <div key={i}>
                                    <Reveal delay={i * 50}>
                                        <div className="group flex flex-col sm:flex-row sm:items-center justify-between
                                            bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-lime/40
                                            rounded-2xl px-5 py-4 gap-3 transition-all duration-300 hover:-translate-y-0.5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-brand-lime/15 text-brand-lime font-black text-xs
                                                    flex items-center justify-center shrink-0
                                                    group-hover:bg-brand-lime group-hover:text-brand-blue transition-all duration-300">
                                                    {i + 1}
                                                </div>
                                                <span className="font-semibold text-white/90 text-sm">{item.description}</span>
                                            </div>
                                            <span className="ml-12 sm:ml-0 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime font-black text-xs font-mono shrink-0">
                                                R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </Reveal>
                                </div>
                            ))}
                        </div>

                        <Reveal delay={80}>
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-400/20 rounded-2xl backdrop-blur-sm">
                                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-300/75 leading-relaxed">
                                    Qualquer item não listado acima <strong className="text-red-300">NÃO integra o escopo</strong> confirmado e não será executado sem nova negociação e aditivo contratual.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
                <Wave fill="#f5f5f5" dir="up" />
            </section>

            {/* ─── SEÇÕES 04-12 ─── */}
            <div className="max-w-5xl mx-auto px-5 sm:px-6 space-y-16 pb-10">

                {/* ─── 04. FORA DO ESCOPO ─── */}
                <section className="pt-4">
                    <Reveal>
                        <div className="flex items-center gap-4 mb-6">
                            <Num n="04" />
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Quarta</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tighter">O Que Não Está Incluso</h2>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal delay={60} className="md:ml-[4.5rem]">
                        <div className={`${card} p-7`}>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {contract.excludedScope || 'Gestão comercial diária, produção de conteúdo, gestão de tráfego pago, alterações estruturais após aprovação final, suporte ilimitado e treinamento contínuo.'}
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ─── 05. PRAZOS ─── */}
                <section className="border-t border-gray-200 pt-16">
                    <Reveal>
                        <div className="flex items-center gap-4 mb-8">
                            <Num n="05" />
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Quinta</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tighter">Prazos e Cronograma</h2>
                            </div>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:ml-[4.5rem]">
                        {[
                            { label: 'Início dos Serviços', val: contract.startDate, sub: 'Após pagamento inicial', accent: false },
                            { label: 'Prazo de Entrega', val: contract.deliveryDeadline || contract.endDate, sub: 'Sujeito ao fluxo de aprovações', accent: true },
                            { label: 'Encerramento Vigência', val: contract.endDate, sub: 'Data limite do contrato', accent: false },
                        ].map((d, i) => (
                            <div key={d.label}>
                                <Reveal delay={i * 70}>
                                    <div className={`${card} p-6 text-center relative overflow-hidden ${d.accent ? '!border-brand-blue/20 !bg-brand-blue/5' : ''}`}>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-3">{d.label}</p>
                                        <p className={`text-2xl font-bold ${d.accent ? 'text-brand-blue' : 'text-gray-700'}`}>{d.val}</p>
                                        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{d.sub}</p>
                                    </div>
                                </Reveal>
                            </div>
                        ))}
                    </div>
                    <Reveal delay={100} className="md:ml-[4.5rem] mt-4">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 leading-relaxed">O prazo poderá ser ajustado proporcionalmente caso o Contratante não envie acessos, materiais ou informações nas datas combinadas. Atrasos de responsabilidade do Contratante não configuram inadimplência da Contratada.</p>
                        </div>
                    </Reveal>
                </section>

                {/* ─── 06. OBRIGAÇÕES ─── */}
                <section className="border-t border-gray-200 pt-16">
                    <Reveal>
                        <div className="flex items-center gap-4 mb-8">
                            <Num n="06" />
                            <div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Sexta</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-brand-blue tracking-tighter">Obrigações do Contratante</h2>
                            </div>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:ml-[4.5rem]">
                        {[
                            'Enviar acessos e credenciais necessários em até 5 dias úteis após o início.',
                            'Disponibilizar responsável para alinhamentos semanais.',
                            'Testar e aprovar entregas dentro dos prazos estipulados.',
                            'Silêncio por mais de 5 dias úteis equivale a aprovação tácita da etapa.',
                            'Utilizar o serviço conforme orientações da Contratada.',
                            'Comunicar mudanças de escopo com no mínimo 5 dias úteis de antecedência.',
                        ].map((item, i) => (
                            <div key={i}>
                                <Reveal delay={(i % 2) * 55}>
                                    <div className={`${card} p-5 flex items-start gap-3 h-full hover:shadow-xl transition-all duration-300`}>
                                        <div className="w-6 h-6 rounded-full bg-brand-blue shrink-0 flex items-center justify-center text-white font-bold text-[10px] mt-0.5">{i + 1}</div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{item}</p>
                                    </div>
                                </Reveal>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ─── 07. PAGAMENTO — BLUE FULL WIDTH ─── */}
            <section className="relative mt-16">
                <Wave fill="#0035C5" dir="down" />
                <div className="bg-brand-blue text-white py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_20%_50%,rgba(204,255,0,.08),transparent)] pointer-events-none" />
                    <StarShape sz={32} className="absolute bottom-16 right-[8%] text-brand-lime opacity-25 animate-float hidden sm:block" />

                    <div className="max-w-5xl mx-auto px-5 sm:px-6">
                        <Reveal>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="relative inline-flex items-center justify-center w-14 h-14 shrink-0">
                                    <div className="absolute inset-0 rounded-2xl bg-brand-lime/20 border border-brand-lime/40" />
                                    <span className="relative text-brand-lime font-black text-sm">07</span>
                                </div>
                                <div>
                                    <p className="text-[9px] text-brand-lime/50 font-black uppercase tracking-widest">Cláusula Sétima</p>
                                    <h2 className="text-2xl md:text-3xl font-black text-white">Investimento e Pagamento</h2>
                                </div>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                            {/* Value card — large */}
                            <Reveal className="md:col-span-2">
                                <div className="rounded-[1.75rem] bg-brand-lime p-8 relative overflow-hidden h-full flex flex-col justify-between">
                                    <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-brand-blue/10 blur-[30px]" />
                                    <div>
                                        <p className="text-brand-blue/70 text-[10px] font-black uppercase tracking-widest mb-3">Investimento Total</p>
                                        <p className="text-4xl md:text-5xl font-black text-brand-blue leading-none">R$</p>
                                        <p className="text-5xl md:text-6xl font-black text-brand-blue leading-none">{contract.value}</p>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-brand-blue/15 space-y-2">
                                        <p className="text-xs text-brand-blue/70"><span className="font-black text-brand-blue">Condições:</span> {contract.paymentTerms || '50% no início e 50% na entrega.'}</p>
                                        <p className="text-xs text-brand-blue/70"><span className="font-black text-brand-blue">Multa atraso:</span> {contract.lateFine || '2% ao mês sobre o valor.'}</p>
                                    </div>
                                    <DollarSign className="absolute top-5 right-5 text-brand-blue/10" size={80} />
                                </div>
                            </Reveal>

                            {/* Notes */}
                            <Reveal delay={80} className="md:col-span-3">
                                <div className="flex flex-col gap-4 h-full">
                                    <div className="flex-1 rounded-[1.75rem] bg-white/5 border border-amber-500/20 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap size={14} className="text-amber-400" />
                                            <p className="text-xs font-black text-amber-300 uppercase tracking-wide">Importante</p>
                                        </div>
                                        <p className="text-sm text-white/65 leading-relaxed">Os serviços terão início <strong className="text-white">somente após a confirmação do pagamento inicial</strong>. Sem exceções.</p>
                                    </div>
                                    <div className="flex-1 rounded-[1.75rem] bg-white/5 border border-white/10 p-6">
                                        <p className="text-xs font-black text-white/40 uppercase tracking-wide mb-3">Meios de Pagamento</p>
                                        <p className="text-sm text-white/55 leading-relaxed">Pagamentos via <strong className="text-white/80">PIX, TED ou boleto bancário</strong>. Em caso de cancelamento após o início dos serviços, os valores pagos não serão reembolsados.</p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
                <Wave fill="#f5f5f5" dir="up" />
            </section>

            {/* ─── 08-12: GRID DE CLÁUSULAS ─── */}
            <div className="max-w-5xl mx-auto px-5 sm:px-6 pb-8 space-y-14">

                {/* 08 & 09 */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            num: '08', clause: 'Oitava', title: 'Propriedade e Uso',
                            content: [
                                'O Contratante é proprietário do produto entregue após quitação integral do contrato.',
                                'Metodologia, processos e know-how da Contratada permanecem de propriedade exclusiva desta.',
                                'A Contratada poderá utilizar o projeto como case de portfólio, salvo solicitação de cláusula de sigilo expressa.',
                            ],
                            bullet: '→', bulletColor: 'brand-blue',
                        },
                        {
                            num: '09', clause: 'Nona', title: 'Confidencialidade',
                            content: [
                                'Ambas as partes se comprometem a manter sigilo sobre informações confidenciais obtidas durante a execução deste contrato.',
                                'Tal obrigação abrange dados de clientes, estratégias, finanças e processos internos.',
                                'Esta obrigação permanece vigente por 2 (dois) anos após o encerramento do contrato.',
                            ],
                            bullet: '→', bulletColor: 'brand-blue',
                        },
                    ].map((sec) => (
                        <div key={sec.num}>
                            <Reveal>
                                <div className={`${card} p-7 h-full`}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <Num n={sec.num} />
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula {sec.clause}</p>
                                            <h3 className="text-lg font-bold text-brand-blue">{sec.title}</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {sec.content.map((t, i) => (
                                            <div key={i} className="flex items-start gap-2.5">
                                                <span className={`text-${sec.bulletColor} font-bold shrink-0 mt-0.5 text-sm`}>{sec.bullet}</span>
                                                <p className="text-sm text-gray-500 leading-relaxed">{t}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    ))}
                </section>

                {/* 10 & 11 */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Reveal>
                        <div className={`${card} p-7 h-full`}>
                            <div className="flex items-center gap-3 mb-5">
                                <Num n="10" />
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Décima</p>
                                    <h3 className="text-lg font-bold text-brand-blue">Limitação de Responsabilidade</h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                A Contratada entrega <strong className="text-gray-700">estrutura, estratégia e execução técnica</strong>. Resultados específicos como aumento de faturamento ou crescimento de métricas dependem diretamente da execução e engajamento do Contratante.
                            </p>
                            <div className="bg-brand-gray border border-gray-200 rounded-xl p-3">
                                <p className="text-[11px] text-gray-400 font-mono">Resultado = Estrutura (Contratada) + Execução (Contratante)</p>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal delay={70}>
                        <div className={`${card} p-7 h-full`}>
                            <div className="flex items-center gap-3 mb-5">
                                <Num n="11" />
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Décima Primeira</p>
                                    <h3 className="text-lg font-bold text-brand-blue">Rescisão</h3>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    'Qualquer parte pode rescindir com aviso prévio mínimo de 30 dias corridos.',
                                    'Valores pagos não são reembolsáveis após o início da execução dos serviços.',
                                    'Rescisão imediata em caso de descumprimento grave sem necessidade de aviso prévio.',
                                ].map((t, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="text-red-500 font-bold shrink-0 mt-0.5">→</span>
                                        <p className="text-sm text-gray-500 leading-relaxed">{t}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* 12 — ACEITE */}
                <section>
                    <Reveal>
                        <div className={`${card} p-7`}>
                            <div className="flex items-center gap-3 mb-5">
                                <Num n="12" />
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cláusula Décima Segunda</p>
                                    <h3 className="text-xl font-bold text-brand-blue">Aceite e Encerramento do Projeto</h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed md:ml-[4.5rem]">
                                Após a entrega, o Contratante terá <strong className="text-gray-700">{contract.acceptanceDays || '5'} dias corridos</strong> para solicitar ajustes técnicos previstos no escopo. Decorrido este prazo sem manifestação, o projeto é considerado <strong className="text-brand-blue">oficialmente concluído e aceito</strong>, encerrando todas as obrigações de entrega previstas neste instrumento.
                            </p>
                        </div>
                    </Reveal>
                </section>
            </div>

            {/* ══════════════════════════════════
                ASSINATURA
            ══════════════════════════════════ */}
            <section className="relative mt-16">
                <Wave fill="#0035C5" dir="down" />
                <div className="bg-brand-blue text-white py-28 md:py-40 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(204,255,0,.09),transparent)] pointer-events-none" />
                    <StarShape sz={50} className="absolute top-16 left-10 text-brand-lime opacity-30 animate-float hidden sm:block" />
                    <RingShape sz={120} className="absolute bottom-12 right-8 text-brand-lime opacity-15 animate-spin-slow hidden md:block" />
                    <CrossShape sz={30} className="absolute top-[30%] right-[15%] text-brand-lime opacity-20 hidden lg:block" />

                    <div className="max-w-2xl mx-auto text-center relative z-10">
                        <Reveal>
                            {hasSigned ? (
                                /* ── SIGNED STATE: multi-step payment flow ── */
                                <div>
                                    {paymentStep === 'kickoff' && (
                                        <div className="animate-fadeIn">
                                            <div className="w-20 h-20 rounded-full bg-brand-lime/20 border-2 border-brand-lime mx-auto mb-7 flex items-center justify-center shadow-[0_0_50px_rgba(204,255,0,.35)]">
                                                <Calendar size={38} className="text-brand-lime" strokeWidth={1.5} />
                                            </div>
                                            <Pill color="lime"><CheckCircle size={9} /> Contrato Assinado!</Pill>
                                            <h2 className="text-3xl md:text-5xl font-black mt-5 mb-3 leading-tight">
                                                Vamos agendar nosso<br /><span className="text-brand-lime">Kickoff.</span>
                                            </h2>
                                            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                                                Escolha a data ideal para realizarmos nossa primeira reunião de alinhamento e darmos início imediato ao seu projeto.
                                            </p>
                                            <form onSubmit={handleSaveKickoff} className="max-w-xs mx-auto space-y-4 text-left">
                                                <div className="flex gap-4">
                                                    <div className="w-1/2">
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Data</label>
                                                        <input
                                                            type="date"
                                                            required
                                                            value={kickoffDate}
                                                            onChange={e => setKickoffDate(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors calendar-picker-indicator-white"
                                                        />
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">Horário</label>
                                                        <input
                                                            type="time"
                                                            required
                                                            value={kickoffTime}
                                                            onChange={e => setKickoffTime(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-lime/50 transition-colors calendar-picker-indicator-white"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isSavingKickoff || !kickoffDate || !kickoffTime}
                                                    className="w-full flex justify-center items-center gap-2 bg-brand-lime text-black font-bold py-3.5 rounded-xl hover:bg-white transition-colors disabled:opacity-50 mt-4"
                                                >
                                                    {isSavingKickoff ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Confirmar e Prosseguir'}
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {paymentStep === 'choose' && (
                                        <div>
                                            <div className="w-20 h-20 rounded-full bg-brand-lime/20 border-2 border-brand-lime mx-auto mb-7 flex items-center justify-center shadow-[0_0_50px_rgba(204,255,0,.35)]">
                                                <CheckCircle size={38} className="text-brand-lime" strokeWidth={1.5} />
                                            </div>
                                            <Pill color="lime"><CheckCircle size={9} /> Contrato Assinado!</Pill>
                                            <h2 className="text-3xl md:text-5xl font-black mt-5 mb-3 leading-tight">
                                                Agora, escolha como<br /><span className="text-brand-lime">pagar.</span>
                                            </h2>
                                            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                                                {isSplitPayment
                                                    ? <>Você paga <strong className="text-white">R$ {totalValues.halfFmt}</strong> agora (50%) e o restante na entrega.<br />Escolha o método: </>
                                                    : <>Pagamento integral de <strong className="text-white">R$ {totalValues.totalFmt}</strong>. Escolha seu método preferido:</>
                                                }
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                                <button onClick={() => handleChooseMethod('pix')}
                                                    className="group p-6 rounded-2xl border-2 border-white/15 bg-white/5 hover:border-[#32BCAD]/60 hover:bg-[#32BCAD]/8 transition-all duration-300 hover:-translate-y-1 text-center">
                                                    <div className="w-14 h-14 rounded-2xl bg-[#32BCAD]/15 border border-[#32BCAD]/30 mx-auto mb-4 flex items-center justify-center text-2xl">📱</div>
                                                    <p className="font-black text-white text-base mb-1">PIX</p>
                                                    <p className="text-xs text-white/40">Instantâneo · Aprovação imediata</p>
                                                    <span className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-[#32BCAD] border border-[#32BCAD]/30 bg-[#32BCAD]/10 px-2.5 py-1 rounded-full">Recomendado</span>
                                                </button>
                                                <button onClick={() => handleChooseMethod('card')}
                                                    className="group p-6 rounded-2xl border-2 border-white/15 bg-white/5 hover:border-purple-500/60 hover:bg-purple-500/8 transition-all duration-300 hover:-translate-y-1 text-center">
                                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 mx-auto mb-4 flex items-center justify-center text-2xl">💳</div>
                                                    <p className="font-black text-white text-base mb-1">Cartão de Crédito</p>
                                                    <p className="text-xs text-white/40">Parcelamento disponível</p>
                                                    <span className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 rounded-full">Até 3x</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {paymentStep === 'pix' && (() => {
                                        const waMsg = encodeURIComponent(
                                            `Olá, Elizabeth! Realizei o pagamento via PIX do contrato "${contract.title}" (Contrato #${contract.id}) no valor de R$ ${isSplitPayment ? totalValues.halfFmt : totalValues.totalFmt}. Segue o comprovante em anexo! 🧾`
                                        );
                                        const waUrl = `https://wa.me/5592982031507?text=${waMsg}`;
                                        return (
                                            <div>
                                                <div className="w-20 h-20 rounded-2xl bg-[#32BCAD]/15 border border-[#32BCAD]/30 mx-auto mb-7 flex items-center justify-center text-4xl">📱</div>
                                                <Pill color="lime">PIX · Pagamento Instantâneo</Pill>
                                                <h2 className="text-3xl md:text-5xl font-black mt-5 mb-2">Transfira via <span className="text-[#32BCAD]">PIX</span></h2>
                                                <p className="text-white/50 text-sm mb-6">
                                                    Valor: <strong className="text-white text-lg">R$ {isSplitPayment ? totalValues.halfFmt : totalValues.totalFmt}</strong>
                                                    {isSplitPayment && <span className="text-white/30 text-sm"> (50% — entrada)</span>}
                                                </p>

                                                {/* PIX Card */}
                                                <div className="max-w-sm mx-auto mb-5 p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-left">
                                                    {/* QR Code */}
                                                    <div className="flex justify-center mb-5">
                                                        <div className="p-2 bg-white rounded-2xl shadow-[0_0_30px_rgba(204,255,0,.2)]">
                                                            <img
                                                                src="/pix-qrcode.jpg"
                                                                alt="QR Code PIX Elizabeth Celina"
                                                                className="w-44 h-44 object-contain rounded-xl"
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 text-center">Ou copie a Chave PIX (CPF)</p>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <code className="flex-1 text-sm text-brand-lime font-mono bg-brand-lime/8 px-3 py-2 rounded-xl border border-brand-lime/20 break-all text-center">
                                                            042.122.602-12
                                                        </code>
                                                        <button
                                                            onClick={handleCopyPix}
                                                            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all duration-300 border
                                                                ${pixAnimStep === 'copied'
                                                                    ? 'bg-brand-lime text-brand-blue border-brand-lime'
                                                                    : 'border-white/15 text-white/60 hover:border-white/30'
                                                                }`}>
                                                            {pixAnimStep === 'copied' ? '✓ Copiado!' : 'Copiar'}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1.5 text-xs text-white/40 border-t border-white/8 pt-4">
                                                        <p>👤 <span className="text-white/60">Favorecida:</span> Elizabeth Celina G. V. M. Melo</p>
                                                        <p>🏦 <span className="text-white/60">Banco:</span> Nubank</p>
                                                        <p>📋 <span className="text-white/60">Descrição:</span> Contrato #{contract.id} · {contract.title}</p>
                                                    </div>
                                                </div>

                                                {/* WhatsApp comprovante hint */}
                                                <div className="max-w-sm mx-auto mb-6 p-4 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/25 text-left">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-base">💬</div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366] opacity-80 mb-1">Mensagem pronta</p>
                                                            <p className="text-xs text-white/50 leading-relaxed italic">
                                                                "Olá, Elizabeth! Realizei o pagamento via PIX do contrato <strong className="text-white not-italic">"{contract.title}"</strong>... Segue o comprovante em anexo! 🧾"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                    <button
                                                        onClick={() => setPaymentStep('choose')}
                                                        className="px-6 py-3 rounded-full border border-white/15 text-white/60 hover:border-white/30 text-sm font-bold transition-all">
                                                        ← Voltar
                                                    </button>
                                                    <a
                                                        href={waUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => { setTimeout(() => setPaymentStep('done'), 800); }}
                                                        className="group inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-black px-8 py-3.5 rounded-full hover:bg-[#20bc5a] transition-all duration-300 shadow-[0_0_40px_rgba(37,211,102,.35)] hover:-translate-y-0.5 text-sm">
                                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                        </svg>
                                                        Confirmar pagamento via PIX
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {paymentStep === 'card' && (() => {
                                        const waMsg = encodeURIComponent(
                                            `Olá, Elizabeth! Acabei de assinar o contrato "${contract.title}" (Contrato #${contract.id}) e gostaria de receber o link de pagamento via cartão de crédito. 😊`
                                        );
                                        const waUrl = `https://wa.me/5592982031507?text=${waMsg}`;
                                        return (
                                            <div>
                                                <div className="w-20 h-20 rounded-2xl bg-purple-500/15 border border-purple-500/30 mx-auto mb-7 flex items-center justify-center text-4xl">💳</div>
                                                <Pill color="lime">Cartão de Crédito · Até 3x</Pill>
                                                <h2 className="text-3xl md:text-5xl font-black mt-5 mb-3 leading-tight">
                                                    Link enviado pelo <span className="text-[#25D366]">WhatsApp</span>
                                                </h2>
                                                <p className="text-white/50 text-sm mb-3 max-w-md mx-auto leading-relaxed">
                                                    O link de pagamento via cartão é gerado e enviado manualmente pelo WhatsApp.
                                                    Clique no botão abaixo e enviarei o link seguro em instantes! 🚀
                                                </p>
                                                <p className="text-white/35 text-xs mb-8">
                                                    Valor: <strong className="text-white">R$ {isSplitPayment ? totalValues.halfFmt : totalValues.totalFmt}</strong>
                                                    {isSplitPayment && <span className="text-white/30"> (50% — entrada)</span>}
                                                </p>

                                                {/* WhatsApp card */}
                                                <div className="max-w-sm mx-auto mb-8 p-5 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/25 text-left">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-xl">💬</div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366] opacity-80">Mensagem pronta</p>
                                                            <p className="text-xs text-white/60 font-bold">Será enviada automaticamente</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/[0.05] rounded-xl p-3 border border-white/8">
                                                        <p className="text-xs text-white/55 leading-relaxed italic">
                                                            "Olá, Elizabeth! Acabei de assinar o contrato <strong className="text-white not-italic">"{contract.title}"</strong> e gostaria de receber o link de pagamento via cartão de crédito. 😊"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                    <button
                                                        onClick={() => setPaymentStep('choose')}
                                                        className="px-6 py-3 rounded-full border border-white/15 text-white/60 hover:border-white/30 text-sm font-bold transition-all">
                                                        ← Voltar
                                                    </button>
                                                    <a
                                                        href={waUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => { setTimeout(() => setPaymentStep('done'), 800); }}
                                                        className="group inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-black px-8 py-3.5 rounded-full hover:bg-[#20bc5a] transition-all duration-300 shadow-[0_0_40px_rgba(37,211,102,.35)] hover:-translate-y-0.5 text-sm">
                                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                        </svg>
                                                        Pedir link pelo WhatsApp
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {paymentStep === 'done' && (
                                        <div>
                                            <div className="w-24 h-24 rounded-full bg-brand-lime/20 border-2 border-brand-lime mx-auto mb-8 flex items-center justify-center shadow-[0_0_60px_rgba(204,255,0,.35)]">
                                                <CheckCircle size={46} className="text-brand-lime" strokeWidth={1.5} />
                                            </div>
                                            <Pill color="lime"><CheckCircle size={9} /> Tudo certo!</Pill>
                                            <h2 className="text-4xl md:text-6xl font-black mt-6 mb-4">Contrato Ativo 🎉</h2>
                                            <p className="text-white/55 text-lg">
                                                Obrigada, <strong className="text-brand-lime">{firstName}</strong>!<br />
                                                Contrato assinado e pagamento registrado. Fique de olho no WhatsApp!
                                            </p>
                                            {paymentMethod && <p className="text-white/30 text-xs mt-4">Método: <span className="text-white/50 font-bold">{paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</span></p>}
                                            {contract.signedDate && <p className="text-white/20 text-xs mt-2">Assinado em {contract.signedDate}</p>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── SIGN CTA ── */
                                <div>
                                    <Pill color="white"><ShieldCheck size={10} /> Assinatura Digital · 1 Clique</Pill>
                                    <h2 className="text-4xl md:text-[64px] font-black tracking-tighter leading-[0.9] mt-6 mb-3 text-white">
                                        Tudo lido?<br />
                                        <span className="relative">
                                            <span className="text-brand-lime">Vamos assinar.</span>
                                            <span className="absolute -bottom-1 left-0 w-full block"><Underline /></span>
                                        </span>
                                    </h2>
                                    <p className="text-white/50 text-sm md:text-base max-w-lg mx-auto mt-6 mb-10 leading-relaxed">
                                        Ao clicar no botão abaixo você declara ter lido, compreendido e concordado com todos os termos deste instrumento, validando sua identidade eletronicamente.
                                    </p>

                                    {/* Checkbox */}
                                    <label className="flex items-center justify-center gap-3 mb-8 cursor-pointer group">
                                        <button
                                            onClick={() => setAgreed(!agreed)}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200
                                                ${agreed ? 'bg-brand-lime border-brand-lime' : 'border-white/25 bg-transparent group-hover:border-white/50'}`}
                                        >
                                            {agreed && <Check size={13} strokeWidth={3} className="text-brand-blue" />}
                                        </button>
                                        <span className="text-sm text-white/60 text-left leading-snug">Li e concordo com todos os termos e condições deste contrato.</span>
                                    </label>

                                    {/* CTA */}
                                    <button
                                        onClick={sign}
                                        disabled={isSigning || !agreed}
                                        className="group relative inline-flex items-center gap-4 bg-brand-lime text-brand-blue font-black
                                            px-10 py-5 rounded-full text-lg md:text-xl
                                            hover:bg-white hover:text-brand-blue
                                            transition-all duration-300
                                            shadow-[0_0_70px_rgba(204,255,0,.4)] hover:shadow-[0_0_90px_rgba(255,255,255,.35)]
                                            hover:-translate-y-1.5
                                            disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                                        {isSigning
                                            ? <><Loader2 size={20} className="animate-spin" /> Processando assinatura...</>
                                            : <><PenTool size={20} /> Assinar Contrato Agora</>
                                        }
                                    </button>

                                    <p className="text-[11px] text-white/25 mt-6 flex items-center justify-center gap-1.5">
                                        <Lock size={9} /> Documento criptografado · Autenticidade verificável
                                    </p>
                                </div>
                            )}
                        </Reveal>
                    </div>
                </div>
                {/* no bottom wave needed */}
            </section>

            {/* FOOTER */}
            <footer className="bg-brand-black py-10 px-6 text-center">
                <p className="text-[11px] text-white/25">
                    © {new Date().getFullYear()} <span className="text-white/40 font-semibold">Elizabeth Celina</span> · Soluções Digitais & CX
                </p>
                <p className="text-[10px] text-white/10 mt-1">
                    Contrato #{contract.id} · Documento confidencial elaborado exclusivamente para {contract.clientFullName || contract.client}.
                </p>
            </footer>

            {/* ─── GLOBAL ANIMATIONS ─── */}
            <style>{`
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
                .animate-float { animation: float 5.5s ease-in-out infinite; }
                @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .animate-spin-slow { animation: spin-slow 16s linear infinite; }
            `}</style>
        </div>
    );
};
