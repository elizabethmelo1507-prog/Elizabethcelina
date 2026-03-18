import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle, User, FileText, MapPin, Cake, ArrowRight, Shield,
    Loader2, Phone, Mail, Hash, Sparkles, Lock
} from 'lucide-react';

interface ClientDataFormProps {
    contractId: string;
    clientName: string;
}

/* ── Scroll Progress ── */
function useScrollProgress() {
    const [p, setP] = useState(0);
    useEffect(() => {
        const fn = () => {
            const el = document.documentElement;
            setP(el.scrollTop / (el.scrollHeight - el.clientHeight));
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);
    return p;
}

/* ── Intersection Observer ── */
function useInView(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setInView(true); obs.disconnect(); }
        }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

/* ── Animated section entry ── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(28px)',
            }}
        >
            {children}
        </div>
    );
}

/* ── Doodle SVG shapes ── */
function StarDoodle({ className = '' }: { className?: string }) {
    return (
        <svg className={className} width="40" height="40" viewBox="0 0 50 50" fill="currentColor">
            <path d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20Z" />
        </svg>
    );
}
function CircleDoodle({ className = '' }: { className?: string }) {
    return (
        <svg className={className} width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 10">
            <circle cx="50" cy="50" r="46" />
        </svg>
    );
}

/* ── Step progress indicator ── */
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300
                ${done ? 'bg-brand-lime border-brand-lime text-brand-blue' :
                    active ? 'border-brand-lime text-brand-lime bg-brand-lime/10' :
                        'border-white/20 text-white/30 bg-transparent'}`}>
                {done ? '✓' : active ? '●' : '○'}
            </div>
            <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors duration-300
                ${done || active ? 'text-white/60' : 'text-white/20'}`}>{label}</span>
        </div>
    );
}

export const ClientDataForm: React.FC<ClientDataFormProps> = ({ contractId, clientName }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        cpf: '',
        dob: '',
        phone: '',
        email: '',
        cep: '',
        address: '',
        city: '',
        state: '',
        paymentPreference: 'unico' as 'unico' | 'parcelado'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [introState, setIntroState] = useState<'entering' | 'visible' | 'text-leaving' | 'bg-leaving' | 'done'>('entering');
    const scrollProgress = useScrollProgress();

    const firstName = clientName.trim().split(' ')[0];

    useEffect(() => {
        const existing = localStorage.getItem(`contract_client_data_${contractId}`);
        if (existing) setAlreadySubmitted(true);
    }, [contractId]);

    useEffect(() => {
        const t1 = setTimeout(() => setIntroState('visible'), 120);
        const t2 = setTimeout(() => setIntroState('text-leaving'), 2100);
        const t3 = setTimeout(() => setIntroState('bg-leaving'), 2900);
        const t4 = setTimeout(() => { setIntroState('done'); setMounted(true); }, 3900);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, []);

    // Auto-fill address from CEP
    const handleCepChange = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, cep }));
        if (cleanCep.length === 8) {
            setCepLoading(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        address: `${data.logradouro}${data.complemento ? ', ' + data.complemento : ''}, ${data.bairro}`,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (_) { }
            setCepLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            const submission = {
                contractId,
                clientName,
                data: formData,
                submittedAt: new Date().toISOString()
            };
            localStorage.setItem(`contract_client_data_${contractId}`, JSON.stringify(submission));
            const existingNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
            existingNotifs.unshift({
                id: Date.now(),
                type: 'contract_data',
                text: `✅ ${firstName} preencheu os dados e escolheu ${formData.paymentPreference === 'unico' ? 'Pagamento À Vista' : 'Parcelamento'} — Contrato #${contractId} pronto!`,
                time: 'Agora mesmo',
                read: false,
                contractId
            });
            localStorage.setItem('admin_notifications', JSON.stringify(existingNotifs));
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    // ── Already submitted ──
    if (alreadySubmitted) {
        return (
            <div className="min-h-screen bg-brand-gray flex items-center justify-center p-6 font-sans">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-blue/20">
                        <CheckCircle size={44} className="text-brand-blue" strokeWidth={1.5} />
                    </div>
                    <p className="text-brand-blue text-xs font-bold uppercase tracking-widest mb-3">Dados Registrados</p>
                    <h1 className="text-3xl font-bold text-brand-blue mb-3">Tudo certo, {firstName}!</h1>
                    <p className="text-gray-500 leading-relaxed">Seus dados já foram recebidos com sucesso. Em breve você receberá o contrato digital para assinatura.</p>
                </div>
            </div>
        );
    }

    // ── Success screen ──
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-brand-blue flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
                <StarDoodle className="absolute top-16 right-12 text-brand-lime opacity-30 animate-float hidden sm:block" />
                <CircleDoodle className="absolute bottom-12 left-10 text-brand-lime opacity-15 animate-spin-slow hidden md:block" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-lime rounded-full blur-[120px] opacity-10 pointer-events-none" />

                <div className="text-center max-w-lg relative z-10">
                    <div className="w-24 h-24 rounded-full bg-brand-lime/20 border-2 border-brand-lime flex items-center justify-center mx-auto mb-8">
                        <CheckCircle size={44} className="text-brand-lime" strokeWidth={1.5} />
                    </div>
                    <p className="text-brand-lime text-xs font-bold uppercase tracking-widest mb-4">Formulário enviado com sucesso</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tighter">
                        Obrigada,<br /><span className="text-brand-lime">{formData.fullName.split(' ')[0] || firstName}!</span>
                    </h1>
                    <p className="text-white/70 text-base leading-relaxed mb-10">
                        Seus dados chegaram até mim. Já vou elaborar seu contrato personalizado e você receberá via WhatsApp em breve. 🚀
                    </p>
                    <div className="bg-white/[0.06] border border-white/10 rounded-[2rem] p-6 text-left">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4">Próximos passos</p>
                        <div className="space-y-3">
                            {[
                                'Elaboração do contrato personalizado',
                                'Envio via WhatsApp para sua assinatura',
                                'Assinatura digital com 1 clique',
                                'Início do projeto confirmado!'
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-brand-lime flex items-center justify-center text-brand-blue font-bold text-[10px] shrink-0">{i + 1}</div>
                                    <span className="text-sm text-white/70">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
                    .animate-float { animation: float 5s ease-in-out infinite; }
                    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                    .animate-spin-slow { animation: spin 14s linear infinite; }
                `}</style>
            </div>
        );
    }

    const inputClass = "w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:shadow-lg focus:shadow-brand-blue/5 text-sm transition-all duration-200";
    const inputWithIconClass = "w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-700 placeholder-gray-400 focus:border-brand-blue focus:outline-none focus:shadow-lg focus:shadow-brand-blue/5 text-sm transition-all duration-200";
    const labelClass = "text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2";

    return (
        <div className="min-h-screen bg-brand-gray text-gray-700 font-sans overflow-x-hidden selection:bg-brand-lime selection:text-brand-blue">

            {/* ── Intro Animation Overlay ── */}
            {introState !== 'done' && (
                <div
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-brand-blue text-white pointer-events-none"
                    style={{
                        opacity: introState === 'bg-leaving' ? 0 : 1,
                        transition: introState === 'bg-leaving' ? 'opacity 0.9s ease' : 'none',
                    }}
                >
                    <StarDoodle className="absolute top-16 left-10 text-brand-lime opacity-30 animate-float hidden sm:block" />
                    <CircleDoodle className="absolute bottom-16 right-10 text-brand-lime opacity-20 animate-spin-slow hidden md:block" />

                    <div
                        style={{
                            transition: 'opacity 0.65s ease, transform 0.65s ease',
                            opacity: introState === 'entering' ? 0 : introState === 'visible' ? 1 : 0,
                            transform:
                                introState === 'entering' ? 'translateY(24px)' :
                                    introState === 'visible' ? 'translateY(0px)' :
                                        'translateY(-24px) scale(0.96)',
                        }}
                        className="text-center px-6"
                    >
                        <p className="text-white/50 text-sm uppercase tracking-[0.35em] font-bold mb-4">Formulário Contratual</p>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-4 text-white">
                            Olá, <span className="text-brand-lime">{firstName}</span>.
                        </h1>
                        <p className="text-xl md:text-2xl text-white/50 font-light">
                            Vamos formalizar a sua parceria.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Scroll Progress Bar ── */}
            <div className="fixed top-0 left-0 z-[100] h-[3px] bg-brand-blue transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />

            {/* ── Nav ── */}
            <nav className="fixed top-[3px] left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span className="font-bold text-base tracking-tighter text-brand-blue">
                        E<span className="text-brand-blue">.</span>Celina
                    </span>
                    <div className="flex items-center gap-2 bg-brand-blue/5 border border-brand-blue/15 text-brand-blue text-[10px] font-bold px-3 py-1.5 rounded-full">
                        <Lock size={10} />
                        Seguro · LGPD
                    </div>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-brand-blue text-white pt-14">
                <StarDoodle className="absolute top-24 left-8 text-brand-lime animate-float opacity-70 hidden sm:block" />
                <CircleDoodle className="absolute bottom-20 right-10 text-brand-lime opacity-40 animate-spin-slow hidden md:block" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-lime rounded-full blur-[100px] opacity-15 pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center py-16">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-brand-lime/30 text-brand-lime text-[10px] font-bold uppercase tracking-widest mb-8"
                        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)', transition: 'all 0.65s ease 0s' }}
                    >
                        <Sparkles size={11} className="fill-current" /> Dados para Contrato · Exclusivo para {firstName}
                    </div>

                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.65s ease 0.15s' }}>
                        <p className="text-white/70 text-lg md:text-xl mb-3">Olá, <span className="text-white font-black">{firstName}</span> 👋</p>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6 text-white">
                            Último passo para<br />
                            <span className="relative inline-block text-brand-lime">
                                oficializar
                                <svg className="absolute -bottom-1.5 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none">
                                    <path d="M2 8 Q50 0 100 6 Q150 12 198 4" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
                                </svg>
                            </span>
                            <br />nossa parceria.
                        </h1>
                    </div>

                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.65s ease 0.3s' }}>
                        <p className="text-white/50 text-sm md:text-base max-w-md mx-auto mb-8">
                            Preencha os dados abaixo para que eu elabore seu contrato personalizado. <strong className="text-white/80">Leva menos de 2 minutos.</strong>
                        </p>
                        <button
                            onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group inline-flex items-center gap-3 bg-white text-brand-blue font-black px-8 py-4 rounded-full hover:bg-brand-lime transition-all duration-300 shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                        >
                            Preencher Agora
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
                        <path d="M0 60L1440 60L1440 20C1200 60 900 0 720 20C540 40 240 0 0 20L0 60Z" fill="#f5f5f5" />
                    </svg>
                </div>
            </section>

            {/* ═══ FORM SECTION ═══ */}
            <section id="form-section" className="py-20 px-6 bg-brand-gray">
                <div className="max-w-2xl mx-auto">

                    {/* Steps indicator */}
                    <Reveal>
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Formulário</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-brand-blue">Preencha seus <span className="text-brand-blue">dados</span></h2>
                        </div>
                    </Reveal>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ── Bloco 1: Identificação ── */}
                        <Reveal>
                            <div className="rounded-[2.5rem] bg-white border-2 border-white shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-xs font-bold text-white shrink-0">01</div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">Identificação</p>
                                        <p className="text-[10px] text-gray-400">Dados pessoais conforme documento</p>
                                    </div>
                                    <User size={16} className="text-brand-blue ml-auto" />
                                </div>
                                <div className="p-7 space-y-5">
                                    <div>
                                        <label className={labelClass}>Nome Completo *</label>
                                        <input
                                            required type="text"
                                            placeholder="Seu nome completo conforme documento"
                                            className={inputClass}
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>CPF / CNPJ *</label>
                                            <div className="relative">
                                                <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    required type="text"
                                                    placeholder="000.000.000-00"
                                                    className={inputWithIconClass}
                                                    value={formData.cpf}
                                                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Data de Nascimento *</label>
                                            <div className="relative">
                                                <Cake size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    required type="date"
                                                    className={inputWithIconClass}
                                                    value={formData.dob}
                                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* ── Bloco 2: Contato ── */}
                        <Reveal delay={60}>
                            <div className="rounded-[2.5rem] bg-white border-2 border-white shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-xs font-bold text-white shrink-0">02</div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">Contato</p>
                                        <p className="text-[10px] text-gray-400">Para envio do contrato e comunicação</p>
                                    </div>
                                    <Phone size={16} className="text-brand-blue ml-auto" />
                                </div>
                                <div className="p-7">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>WhatsApp *</label>
                                            <div className="relative">
                                                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    required type="tel"
                                                    placeholder="(00) 00000-0000"
                                                    className={inputWithIconClass}
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>E-mail *</label>
                                            <div className="relative">
                                                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    required type="email"
                                                    placeholder="seu@email.com"
                                                    className={inputWithIconClass}
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* ── Bloco 3: Endereço ── */}
                        <Reveal delay={120}>
                            <div className="rounded-[2.5rem] bg-white border-2 border-white shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-xs font-bold text-white shrink-0">03</div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">Endereço</p>
                                        <p className="text-[10px] text-gray-400">Para fins contratuais · preenchimento automático pelo CEP</p>
                                    </div>
                                    <MapPin size={16} className="text-brand-blue ml-auto" />
                                </div>
                                <div className="p-7 space-y-5">
                                    <div>
                                        <label className={labelClass}>CEP *</label>
                                        <div className="relative">
                                            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required type="text"
                                                placeholder="00000-000"
                                                maxLength={9}
                                                className={inputWithIconClass}
                                                value={formData.cep}
                                                onChange={e => handleCepChange(e.target.value)}
                                            />
                                            {cepLoading && (
                                                <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-blue animate-spin" />
                                            )}
                                        </div>
                                        {!cepLoading && formData.city && (
                                            <p className="text-[10px] text-brand-blue mt-1.5 flex items-center gap-1 font-bold">
                                                ✓ CEP encontrado — endereço preenchido automaticamente!
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Endereço completo *</label>
                                        <input
                                            required type="text"
                                            placeholder="Rua, número, complemento, bairro"
                                            className={inputClass}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Cidade *</label>
                                            <input
                                                required type="text"
                                                placeholder="Ex: Manaus"
                                                className={inputClass}
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Estado *</label>
                                            <input
                                                required type="text"
                                                placeholder="AM"
                                                maxLength={2}
                                                className={`${inputClass} uppercase`}
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* ── Bloco 4: Forma de Pagamento ── */}
                        <Reveal delay={150}>
                            <div className="rounded-[2.5rem] bg-white border-2 border-white shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
                                    <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-xs font-bold text-white shrink-0">04</div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">Forma de Pagamento</p>
                                        <p className="text-[10px] text-gray-400">Escolha como prefere iniciar seu projeto</p>
                                    </div>
                                    <Sparkles size={16} className="text-brand-blue ml-auto" />
                                </div>
                                <div className="p-7 space-y-4">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, paymentPreference: 'unico' }))}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${formData.paymentPreference === 'unico' ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentPreference === 'unico' ? 'border-brand-blue bg-brand-blue' : 'border-gray-300'}`}>
                                            {formData.paymentPreference === 'unico' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-700">100% do Valor da Proposta</p>
                                            <p className="text-xs text-gray-500">Pagamento integral antecipado para início imediato do projeto.</p>
                                        </div>
                                        <CheckCircle size={18} className={formData.paymentPreference === 'unico' ? 'text-brand-blue' : 'text-gray-200'} />
                                    </div>

                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, paymentPreference: 'parcelado' }))}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${formData.paymentPreference === 'parcelado' ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentPreference === 'parcelado' ? 'border-brand-blue bg-brand-blue' : 'border-gray-300'}`}>
                                            {formData.paymentPreference === 'parcelado' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-700">Pagamento Parcelado</p>
                                            <p className="text-xs text-gray-500">50% de entrada para início + 50% na entrega final (conforme proposta).</p>
                                        </div>
                                        <Sparkles size={18} className={formData.paymentPreference === 'parcelado' ? 'text-brand-blue' : 'text-gray-200'} />
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* ── LGPD Note ── */}
                        <Reveal delay={180}>
                            <div className="flex items-start gap-3 p-5 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
                                <Shield size={16} className="text-brand-blue mt-0.5 shrink-0" />
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Seus dados são utilizados <strong className="text-gray-700">exclusivamente</strong> para elaboração do contrato de prestação de serviços, protegidos pela <strong className="text-gray-700">Lei Geral de Proteção de Dados (LGPD)</strong>.
                                </p>
                            </div>
                        </Reveal>

                        {/* ── Submit ── */}
                        <Reveal delay={180}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full bg-brand-blue text-white font-bold py-5 rounded-full hover:bg-brand-lime hover:text-brand-blue transition-all duration-300 flex items-center justify-center gap-3 text-base shadow-xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Enviando os dados...
                                    </>
                                ) : (
                                    <>
                                        Enviar Meus Dados
                                        <div className="bg-white rounded-full p-1 group-hover:bg-brand-blue group-hover:text-white transition-colors"><ArrowRight size={14} /></div>
                                    </>
                                )}
                            </button>
                        </Reveal>
                    </form>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-brand-black py-8 px-6 text-center">
                <p className="text-xs text-white/25">© {new Date().getFullYear()} <span className="text-white/40 font-semibold">Elizabeth Celina</span> · Soluções Digitais & CX</p>
                <p className="text-xs text-white/10 mt-1">Formulário enviado exclusivamente para {clientName}.</p>
            </footer>

            <style>{`
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
                .animate-float { animation: float 5s ease-in-out infinite; }
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .animate-spin-slow { animation: spin 14s linear infinite; }
            `}</style>
        </div>
    );
};
