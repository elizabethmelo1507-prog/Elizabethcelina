import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Clock, Loader2, ArrowRight, Sparkles, Shield, Rocket, Award, CheckCircle, ChevronDown, Zap, TrendingUp } from 'lucide-react';
import { Proposal } from '../types';

interface PublicProposalViewerProps {
    proposal: Proposal;
    onApprove: (proposalId: number | string) => void;
}

/* ═══ HOOKS ═══ */
function useScrollY() {
    const [y, setY] = useState(0);
    useEffect(() => {
        const fn = () => setY(window.scrollY);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);
    return y;
}

function useWindowSize() {
    const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
        const fn = () => setSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return size;
}

function useInView(threshold = 0.15) {
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

/* ═══ SCROLL-DRIVEN TEXT REVEAL ═══ */
function ScrollRevealText({ text, className = '' }: { text: string; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fn = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const start = window.innerHeight * 0.85;
            const end = window.innerHeight * 0.3;
            const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
            setProgress(p);
        };
        window.addEventListener('scroll', fn, { passive: true });
        fn();
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const words = text.split(' ');
    return (
        <div ref={ref} className={className}>
            {words.map((word, i) => {
                const wordProgress = Math.max(0, Math.min(1, (progress * words.length - i) * 1.5));
                return (
                    <span key={i} className="inline-block mr-[0.3em]" style={{
                        opacity: 0.08 + wordProgress * 0.92,
                        filter: `blur(${(1 - wordProgress) * 3}px)`,
                        transition: 'opacity 0.1s, filter 0.1s',
                    }}>{word}</span>
                );
            })}
        </div>
    );
}

/* ═══ PARALLAX WRAPPER ═══ */
function Parallax({ children, speed = 0.3, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const fn = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            setOffset(center * speed);
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, [speed]);
    return (
        <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}>
            {children}
        </div>
    );
}

/* ═══ STAGGER REVEAL ═══ */
function Reveal({ children, delay = 0, className = '', direction = 'up', ...rest }: { children: React.ReactNode; delay?: number; className?: string; direction?: 'up' | 'left' | 'right' | 'scale';[key: string]: any }) {
    const { ref, inView } = useInView();
    const transforms: Record<string, string> = {
        up: 'translateY(60px)',
        left: 'translateX(-60px)',
        right: 'translateX(60px)',
        scale: 'scale(0.85)',
    };
    return (
        <div ref={ref} className={className} style={{
            transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : transforms[direction],
            filter: inView ? 'blur(0)' : 'blur(6px)',
        }}>
            {children}
        </div>
    );
}

/* ═══ MAGNETIC BUTTON ═══ */
function MagneticButton({ children, onClick, disabled, className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
    const ref = useRef<HTMLButtonElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const handleMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.15, y: (e.clientY - rect.top - rect.height / 2) * 0.15 });
    }, []);
    const handleLeave = () => setPos({ x: 0, y: 0 });
    return (
        <button ref={ref} onClick={onClick} disabled={disabled} onMouseMove={handleMove} onMouseLeave={handleLeave}
            className={className} style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.3s cubic-bezier(0.33,1,0.68,1)' }}>
            {children}
        </button>
    );
}

/* ═══ ANIMATED COUNTER ═══ */
function AnimNum({ raw }: { raw: string }) {
    const { ref, inView } = useInView(0.3);
    const [val, setVal] = useState('0');
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    useEffect(() => {
        if (!inView || isNaN(num)) { setVal(raw); return; }
        let start = 0;
        const dur = 1800;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const e = 1 - Math.pow(1 - p, 5);
            setVal(Math.floor(e * num).toLocaleString('pt-BR'));
            if (p < 1) requestAnimationFrame(step);
            else setVal(num.toLocaleString('pt-BR'));
        };
        requestAnimationFrame(step);
    }, [inView, num, raw]);
    return <span ref={ref}>{val}</span>;
}

/* ═══ COUNTDOWN ═══ */
function Countdown({ validUntil }: { validUntil: string }) {
    const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
    useEffect(() => {
        const parts = validUntil.split('/');
        if (parts.length !== 3) return;
        const target = new Date(+parts[2], +parts[1] - 1, +parts[0], 23, 59, 59).getTime();
        const tick = () => {
            const diff = target - Date.now();
            if (diff <= 0) return;
            setLeft({ d: Math.floor(diff / 86400000), h: Math.floor(diff % 86400000 / 3600000), m: Math.floor(diff % 3600000 / 60000), s: Math.floor(diff % 60000 / 1000) });
        };
        tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
    }, [validUntil]);
    const labels = ['Dias', 'Horas', 'Min', 'Seg'] as const;
    const values = [left.d, left.h, left.m, left.s];
    return (
        <div className="flex items-center gap-2 md:gap-3">
            {values.map((v, i) => (
                <React.Fragment key={i}>
                    <div className="text-center">
                        <div className="ppv-countdown-cell">
                            <span className="text-2xl md:text-4xl font-black tabular-nums">{String(v).padStart(2, '0')}</span>
                        </div>
                        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white/25 mt-2 block font-semibold">{labels[i]}</span>
                    </div>
                    {i < 3 && <span className="text-white/15 text-2xl font-thin mb-4">:</span>}
                </React.Fragment>
            ))}
        </div>
    );
}




/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export const PublicProposalViewer: React.FC<PublicProposalViewerProps> = ({ proposal, onApprove }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [hasApproved, setHasApproved] = useState(proposal.status === 'Aprovada');
    const [mounted, setMounted] = useState(false);
    const [introPhase, setIntroPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
    const scrollY = useScrollY();
    const { h: wh } = useWindowSize();

    const scrollProgress = typeof document !== 'undefined'
        ? Math.min(1, scrollY / (document.documentElement.scrollHeight - wh))
        : 0;

    useEffect(() => {
        const t1 = setTimeout(() => setIntroPhase(1), 100);
        const t2 = setTimeout(() => setIntroPhase(2), 2200);
        const t3 = setTimeout(() => setIntroPhase(3), 3000);
        const t4 = setTimeout(() => { setIntroPhase(4); setMounted(true); }, 3800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, []);

    const handleApprove = () => {
        if (confirm('Ao confirmar, você aprova formalmente esta proposta e concorda com todos os termos.')) {
            setIsApproving(true);
            setTimeout(() => { onApprove(proposal.id); setHasApproved(true); setIsApproving(false); }, 1300);
        }
    };

    const firstName = proposal.client.trim().split(' ')[0];


    return (
        <div className="ppv-root">

            {/* ══ INTRO ══ */}
            {introPhase < 4 && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-blue text-white overflow-hidden pointer-events-none" style={{
                    opacity: introPhase >= 3 ? 0 : 1,
                    transition: introPhase >= 3 ? 'opacity 1s cubic-bezier(.4,0,.6,1)' : 'none',
                }}>

                    {/* ambient blobs */}
                    <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-lime/10 blur-[100px]" />
                    <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/5 blur-[80px]" />

                    {/* SVG doodles */}
                    <svg width="44" height="44" viewBox="0 0 40 40" fill="none" stroke="#ccff00" strokeWidth="2.5" className="absolute top-16 left-12 opacity-50" style={{ animation: 'float 5.5s ease-in-out infinite' }}>
                        <path d="M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15Z" />
                    </svg>
                    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" className="absolute bottom-16 right-12 opacity-20" style={{ animation: 'spin-slow 16s linear infinite' }}>
                        <circle cx="45" cy="45" r="36" stroke="#ccff00" strokeWidth="2" strokeDasharray="12 8" />
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2" className="absolute top-1/3 right-[18%] opacity-30">
                        <path d="M12 2v20M2 12h20" />
                    </svg>

                    <div className="text-center px-8"
                        style={{
                            transition: 'opacity .65s ease, transform .65s ease',
                            opacity: introPhase === 0 ? 0 : introPhase <= 1 ? 1 : 0,
                            transform: introPhase === 0 ? 'translateY(30px)' : introPhase <= 1 ? 'none' : 'translateY(-20px) scale(.97)',
                        }}>
                        <p className="text-brand-lime/70 text-[10px] font-black uppercase tracking-[0.4em] mb-5">Proposta Exclusiva · {proposal.client}</p>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.88] mb-5 text-white">
                            Olá,<br /><span className="text-brand-lime">{firstName}.</span>
                        </h1>
                        <p className="text-white/50 text-lg md:text-xl font-light">Preparamos algo especial para você.</p>
                    </div>
                </div>
            )}

            {/* ══ PROGRESS BAR ══ */}
            <div className="fixed top-0 left-0 z-[100] h-[2px] ppv-progress-bar" style={{ width: `${scrollProgress * 100}%` }} />

            {/* ══ NAV ══ */}
            <nav className="fixed top-[2px] left-0 right-0 z-50 transition-all duration-500" style={{
                background: scrollY > 100 ? 'rgba(0,16,64,0.9)' : 'transparent',
                backdropFilter: scrollY > 100 ? 'blur(20px) saturate(180%)' : 'none',
                borderBottom: scrollY > 100 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}>
                <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                    <span className="font-black text-lg tracking-[-0.03em]">E<span className="ppv-lime-glow">.</span>Celina</span>
                    <div className="flex items-center gap-5">
                        <span className="text-[11px] text-white/30 hidden md:block tracking-wide">Proposta para <span className="text-white/70 font-semibold">{proposal.client}</span></span>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm ${hasApproved || proposal.status === 'Aprovada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-lime/5 text-brand-lime border-brand-lime/20'}`}>
                            {hasApproved || proposal.status === 'Aprovada' ? '✓ Aprovada' : proposal.status}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════
                HERO — BRAND-ALIGNED
            ═══════════════════════════════ */}
            <section className="relative min-h-[90vh] flex items-center bg-brand-blue pt-24 pb-16 md:pt-20 overflow-hidden">
                {/* Doodle decorations — same as landing page */}
                <div className="hidden sm:block absolute top-32 left-10 text-brand-lime animate-float opacity-80 pointer-events-none">
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="currentColor"><path d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20Z" /></svg>
                </div>
                <div className="absolute bottom-20 right-20 text-brand-lime animate-spin-slow opacity-50 hidden md:block pointer-events-none">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M50 0C60 20 80 40 100 50C80 60 60 80 50 100C40 80 20 60 0 50C20 40 40 20 50 0Z" /></svg>
                </div>
                <div className="absolute top-1/4 right-[12%] hidden lg:block pointer-events-none">
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="#ccff00" strokeWidth="3" strokeDasharray="10 10"><circle cx="50" cy="50" r="48" /></svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

                        {/* Left: Text */}
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-brand-lime/30 text-white mb-8"
                                style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(-12px)', transition: 'all 0.7s ease 0s' }}
                            >
                                <Sparkles size={12} className="text-brand-lime" />
                                <span className="text-[9px] md:text-xs font-bold tracking-widest uppercase text-brand-lime">{proposal.title}</span>
                            </div>

                            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease 0.1s' }}>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-[0.95]">
                                    Olá, {firstName}.<br />
                                    <span className="relative inline-block">
                                        Preparamos
                                        <svg className="absolute -bottom-1 left-0 w-full" height="12" viewBox="0 0 200 15" fill="none">
                                            <path d="M2 12C50 2 150 2 198 12" stroke="#ccff00" strokeWidth="4" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                    <br />
                                    <span className="text-brand-lime">algo especial.</span>
                                </h1>
                            </div>

                            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease 0.2s' }}>
                                <p className="mt-2 md:mt-4 text-sm sm:text-lg md:text-xl text-white/80 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed mb-8">
                                    Esta proposta foi desenvolvida exclusivamente para <strong className="text-white font-semibold">{proposal.client}</strong>. Cada detalhe foi pensado para transformar seu negócio.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.7s ease 0.35s' }}>
                                <button
                                    onClick={() => document.getElementById('ppv-diagnosis')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="group inline-flex items-center gap-2 bg-white text-brand-blue font-bold px-7 py-4 rounded-full hover:bg-brand-lime transition-all duration-300 shadow-xl hover:-translate-y-1"
                                >
                                    Ver Proposta Completa
                                    <div className="bg-brand-black rounded-full p-1 text-white group-hover:bg-brand-blue transition-colors">
                                        <ArrowRight size={14} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Right: Countdown Card */}
                        <div className="lg:w-1/2 relative w-full px-4 md:px-0 mt-8 lg:mt-0" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px)', transition: 'all 0.8s ease 0.3s' }}>
                            <div className="relative max-w-sm md:max-w-md mx-auto">
                                {/* Glow background */}
                                <div className="absolute inset-0 bg-brand-lime rounded-full opacity-15 blur-3xl transform translate-x-8 translate-y-8 pointer-events-none" />

                                {/* Card */}
                                <div className="relative z-10 bg-white/[0.08] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border-2 border-white/[0.12] shadow-2xl">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-2">Proposta válida por</p>
                                        <Countdown validUntil={proposal.validUntil} />
                                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mt-3 flex items-center justify-center gap-1.5"><Clock size={9} /> até {proposal.validUntil}</p>

                                        <div className="mt-8 pt-6 border-t border-white/[0.06]">
                                            <div className="flex items-center justify-between text-left">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Cliente</p>
                                                    <p className="text-white font-bold text-sm mt-0.5">{proposal.client}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Status</p>
                                                    <div className={`inline-flex items-center gap-1.5 mt-0.5 ${hasApproved || proposal.status === 'Aprovada' ? 'text-emerald-400' : 'text-brand-lime'}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        <span className="text-sm font-bold">{hasApproved || proposal.status === 'Aprovada' ? 'Aprovada' : proposal.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* "360° Funil Completo" style badge */}
                                        <div className="absolute -bottom-4 -left-4 md:-bottom-5 md:-left-5 bg-brand-lime text-brand-blue px-4 py-3 md:px-5 md:py-3 rounded-2xl shadow-xl font-bold flex items-center gap-2">
                                            <Sparkles size={18} />
                                            <div className="flex flex-col text-[10px] md:text-xs leading-none uppercase tracking-wide">
                                                <span>Proposta</span>
                                                <span>Exclusiva</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══ DIAGNÓSTICO — LIGHT SECTION ═══ */}
            {proposal.context && (
                <section id="ppv-diagnosis" className="py-20 md:py-32 bg-brand-gray relative">
                    <div className="absolute top-10 right-10 hidden md:block pointer-events-none">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#0035C5" strokeWidth="3"><path d="M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15Z" /></svg>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Reveal>
                            <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                                        <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Diagnóstico</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-brand-blue leading-tight">
                                        Entendemos o seu <br /><span className="text-brand-blue relative">cenário atual
                                            <svg className="absolute -bottom-2 left-0 w-full opacity-30" height="12" viewBox="0 0 100 12" fill="none"><path d="M0 6Q50 12 100 6" stroke="#0035C5" strokeWidth="4" /></svg>
                                        </span>
                                    </h2>
                                </div>
                                <div className="w-20 md:w-32 h-2 bg-brand-blue rounded-full" />
                            </div>
                        </Reveal>
                        <Reveal delay={100}>
                            <p className="text-gray-500 text-lg max-w-2xl font-light leading-relaxed mb-12">{proposal.context.diagnosis}</p>
                        </Reveal>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Reveal delay={0} direction="left">
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 h-full border-2 border-white hover:border-red-200 shadow-xl shadow-red-500/5 transition-all duration-300 hover:-translate-y-2">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-red-50 rounded-2xl"><Zap size={20} className="text-red-500" /></div>
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Gargalos Identificados</span>
                                    </div>
                                    <ul className="space-y-5">
                                        {proposal.context.bottlenecks.map((b, i) => (
                                            <li key={i} className="flex items-start gap-4 group">
                                                <span className="w-8 h-8 rounded-xl bg-red-50 text-red-500 font-black text-xs flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-all">{String(i + 1).padStart(2, '0')}</span>
                                                <span className="text-gray-600 text-sm leading-relaxed pt-1.5">{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                            <Reveal delay={150} direction="right">
                                <div className="bg-brand-blue rounded-[2.5rem] p-8 md:p-10 h-full text-white border-2 border-brand-blue shadow-2xl relative overflow-hidden">
                                    <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-lime opacity-15 blur-[60px]" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20"><TrendingUp size={20} className="text-brand-lime" /></div>
                                            <span className="text-xs font-bold text-brand-lime uppercase tracking-wider">A Oportunidade</span>
                                        </div>
                                        <p className="text-white/80 leading-relaxed text-sm mb-8">{proposal.context.opportunity}</p>
                                        <div className="pt-6 border-t border-white/10">
                                            <p className="text-xs uppercase tracking-wider text-brand-lime font-bold mb-2">Impacto Atual</p>
                                            <p className="text-sm text-white/70 leading-relaxed">{proposal.context.impact}</p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ SOLUÇÃO — BLUE SECTION ═══ */}
            {proposal.solution && (
                <section className="py-20 md:py-32 bg-brand-blue relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-lime opacity-10 blur-[80px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <Reveal>
                            <div className="mb-12 md:mb-16">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                                    <Sparkles size={14} className="text-brand-lime" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Solução</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{proposal.solution.name}</h2>
                                <p className="text-white/70 text-lg max-w-2xl font-light leading-relaxed italic">"{proposal.solution.strategicDescription}"</p>
                            </div>
                        </Reveal>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3 space-y-3">
                                {proposal.solution.whatWillBeBuilt.map((item, i) => (
                                    <Reveal key={i} delay={i * 70}>
                                        <div className="flex items-center gap-4 p-5 bg-white/[0.06] border border-white/[0.08] rounded-2xl hover:bg-white/[0.1] hover:border-brand-lime/30 transition-all duration-300 group cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-brand-lime/10 border border-brand-lime/20 text-brand-lime font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-brand-lime group-hover:text-brand-blue transition-all duration-500">{String(i + 1).padStart(2, '0')}</div>
                                            <span className="text-sm text-white/70 group-hover:text-white transition-colors leading-relaxed">{item}</span>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                            <div className="lg:col-span-2 space-y-5">
                                <Reveal delay={100} direction="right">
                                    <div className="bg-white rounded-[2rem] p-7 shadow-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center border border-brand-blue/10"><Zap size={18} /></div>
                                            <h4 className="font-bold text-sm text-gray-700">Como resolve</h4>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{proposal.solution.howItSolves}</p>
                                    </div>
                                </Reveal>
                                <Reveal delay={200} direction="right">
                                    <div className="bg-white rounded-[2rem] p-7 shadow-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-lime/20 text-brand-blue flex items-center justify-center border border-brand-lime/30"><TrendingUp size={18} /></div>
                                            <h4 className="font-bold text-sm text-brand-blue">Impacto Esperado</h4>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{proposal.solution.expectedImpact}</p>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ ESCOPO — LIGHT SECTION ═══ */}
            {proposal.scope && proposal.scope.length > 0 && (
                <section className="py-20 md:py-32 bg-brand-gray relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Reveal>
                            <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                                        <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Escopo</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-brand-blue leading-tight">
                                        Tudo que está <br /><span className="text-brand-blue">incluso.</span>
                                    </h2>
                                </div>
                                <div className="w-20 md:w-32 h-2 bg-brand-lime rounded-full" />
                            </div>
                        </Reveal>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {proposal.scope.map((item, i) => (
                                <Reveal key={i} delay={(i % 3) * 80}>
                                    <div className="bg-white rounded-[2.5rem] p-8 h-full border-2 border-white hover:border-brand-blue shadow-xl shadow-brand-blue/5 transition-all duration-300 hover:-translate-y-2 group">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-brand-lime flex items-center justify-center group-hover:shadow-lg group-hover:scale-110 transition-all duration-500">
                                                <Check size={20} strokeWidth={3} className="text-brand-blue" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-brand-blue/50 uppercase tracking-wider font-bold block mb-1">Item {String(i + 1).padStart(2, '0')}</span>
                                                <span className="text-gray-700 text-sm leading-relaxed font-medium">{item}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ CRONOGRAMA — BLUE SECTION ═══ */}
            {proposal.schedule && proposal.schedule.length > 0 && (
                <section className="py-20 md:py-32 bg-brand-blue relative overflow-hidden">
                    <div className="absolute bottom-10 left-10 text-brand-lime opacity-40 hidden md:block pointer-events-none">
                        <svg width="60" height="60" viewBox="0 0 50 50" fill="currentColor"><path d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20Z" /></svg>
                    </div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <Reveal>
                            <div className="mb-12 md:mb-16">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                                    <Clock size={14} className="text-brand-lime" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Cronograma</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                                    Linha do <span className="text-brand-lime">tempo.</span>
                                </h2>
                            </div>
                        </Reveal>
                        <div className="relative pl-10 md:pl-14">
                            <div className="absolute left-[15px] md:left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-lime via-brand-lime/30 to-transparent" />
                            <div className="space-y-5">
                                {proposal.schedule.map((item, i) => (
                                    <Reveal key={i} delay={i * 80} direction="left">
                                        <div className="relative">
                                            <div className="absolute -left-[33px] md:-left-[37px] top-6 w-3 h-3 rounded-full bg-brand-lime border-[3px] border-brand-blue shadow-[0_0_10px_rgba(204,255,0,0.4)]" />
                                            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.1] hover:border-brand-lime/30 transition-all duration-300 group cursor-default">
                                                <span className="text-xs font-bold text-brand-lime uppercase tracking-wider block mb-2">{item.week}</span>
                                                <p className="text-sm text-white/70 group-hover:text-white leading-relaxed transition-colors">{item.task}</p>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ INVESTIMENTO — LIGHT SECTION ═══ */}
            <section className="py-20 md:py-32 bg-brand-gray relative">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Reveal>
                        <div className="text-center mb-12 md:mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                                <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Investimento</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-brand-blue leading-tight">
                                O valor da <span className="text-brand-blue relative">transformação
                                    <svg className="absolute -bottom-2 left-0 w-full opacity-30" height="12" viewBox="0 0 100 12" fill="none"><path d="M0 6Q50 12 100 6" stroke="#0035C5" strokeWidth="4" /></svg>
                                </span>
                            </h2>
                        </div>
                    </Reveal>
                    <Reveal direction="scale">
                        <div className="bg-brand-blue rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-lime opacity-15 blur-[80px] pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-bold mb-8">Investimento Total</p>
                                <div className="inline-block bg-brand-lime px-10 py-5 rounded-2xl shadow-xl mb-6">
                                    <span className="text-brand-blue text-4xl md:text-[5rem] font-black leading-none">R$ <AnimNum raw={proposal.value} /></span>
                                </div>
                                {proposal.paymentTerms && (
                                    <p className="text-white/60 text-sm mt-4"><span className="text-white font-semibold">Condições: </span>{proposal.paymentTerms}</p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14">
                                    {[
                                        { icon: <Shield size={22} />, title: 'Garantia Total', desc: 'Escopo 100% garantido' },
                                        { icon: <Rocket size={22} />, title: 'Início Imediato', desc: 'Após aprovação' },
                                        { icon: <Award size={22} />, title: 'Suporte VIP', desc: 'Acompanhamento dedicado' },
                                    ].map((it, i) => (
                                        <Reveal key={i} delay={i * 100}>
                                            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-6 text-center hover:bg-white/[0.1] hover:border-brand-lime/30 transition-all duration-300 hover:-translate-y-2 group">
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 text-brand-lime flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-lime group-hover:text-brand-blue transition-all duration-500 border border-white/[0.1]">{it.icon}</div>
                                                <h4 className="text-xs font-bold text-white mb-1">{it.title}</h4>
                                                <p className="text-[11px] text-white/50">{it.desc}</p>
                                            </div>
                                        </Reveal>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══ APROVAÇÃO ═══ */}
            <section id="section-approval" className="py-20 md:py-32 bg-brand-blue relative overflow-hidden">
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-lime opacity-10 blur-[80px] pointer-events-none" />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <Reveal direction="scale">
                        {hasApproved || proposal.status === 'Aprovada' ? (
                            <div>
                                <div className="w-24 h-24 rounded-full bg-brand-lime/20 border-2 border-brand-lime/40 flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle size={44} className="text-brand-lime" strokeWidth={1.5} />
                                </div>
                                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-5">Aprovada! 🎉</h2>
                                <p className="text-white/70 text-lg font-light">Obrigada, <strong className="text-brand-lime font-semibold">{firstName}</strong>! Entraremos em contato.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
                                    <Sparkles size={14} className="text-brand-lime" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Próximo Passo</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight mb-6">
                                    Pronto para<br /><span className="text-brand-lime">começar?</span>
                                </h2>
                                {proposal.nextSteps && (
                                    <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed font-light">{proposal.nextSteps}</p>
                                )}
                                <MagneticButton onClick={handleApprove} disabled={isApproving}
                                    className="group inline-flex items-center gap-3 bg-white text-brand-blue font-bold px-10 py-5 rounded-full text-lg hover:bg-brand-lime transition-all duration-300 shadow-xl hover:-translate-y-1 disabled:opacity-50">
                                    <span className="flex items-center gap-3">
                                        {isApproving ? (
                                            <><Loader2 size={20} className="animate-spin" /> Processando...</>
                                        ) : (
                                            <><Check size={20} strokeWidth={3} /> Aprovar Proposta <div className="bg-brand-black rounded-full p-1 text-white group-hover:bg-brand-blue transition-colors"><ArrowRight size={14} /></div></>
                                        )}
                                    </span>
                                </MagneticButton>
                                <p className="text-[10px] text-white/25 mt-8 tracking-wide">Ao clicar, você concorda com o escopo e os termos desta proposta.</p>
                            </div>
                        )}
                    </Reveal>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-brand-black py-10 px-8 text-center">
                <p className="text-[11px] text-white/25 tracking-wide">© {new Date().getFullYear()} <span className="text-white/40 font-semibold">Elizabeth Celina</span> · Soluções Digitais & CX</p>
                <p className="text-[10px] text-white/10 mt-1.5">Proposta confidencial · {proposal.client}</p>
            </footer>

            {/* ═══ ALL STYLES ═══ */}
            <style>{`
                .ppv-root{min-height:100vh;background:#f5f5f5;color:#111;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
                .ppv-root ::selection{background:#ccff00;color:#0035C5}

                .ppv-intro-bg{background:linear-gradient(160deg,#010a20 0%,#0035C5 40%,#001040 100%)}
                .ppv-intro-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,black,transparent)}
                .ppv-intro-line{width:40px;height:1px;background:linear-gradient(90deg,transparent,rgba(204,255,0,0.5),transparent)}
                .ppv-intro-label{animation:ppvFadeUp 1s ease 0.3s both}

                .ppv-lime-glow{color:#ccff00;text-shadow:0 0 40px rgba(204,255,0,0.3)}
                .ppv-progress-bar{background:linear-gradient(90deg,#ccff00,#0035C5);box-shadow:0 0 15px rgba(204,255,0,0.5)}

                .ppv-hero-mesh{background:radial-gradient(circle at 20% 50%,rgba(0,53,197,0.4) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(204,255,0,0.06) 0%,transparent 40%),radial-gradient(circle at 50% 80%,rgba(0,53,197,0.3) 0%,transparent 50%);background-color:#001040}
                .ppv-section-blue{background:linear-gradient(175deg,#001040 0%,#0025a0 50%,#001a6e 100%)}
                .ppv-section-dark-blue{background:linear-gradient(175deg,#001a6e 0%,#001040 50%,#0025a0 100%)}
                .ppv-hero-highlight{background:linear-gradient(135deg,#ccff00 0%,#e6ff66 50%,#ccff00 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 30px rgba(204,255,0,0.25))}

                @keyframes ppvFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.05)}}
                @keyframes ppvFloatAlt{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(20px) scale(0.95)}}
                .ppv-float-orb{animation:ppvFloat 10s ease-in-out infinite}
                .ppv-float-orb-alt{animation:ppvFloatAlt 12s ease-in-out infinite}

                .ppv-countdown-cell{width:56px;height:64px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);color:#ccff00;transition:all 0.4s cubic-bezier(0.16,1,0.3,1)}
                .ppv-countdown-cell:hover{border-color:rgba(204,255,0,0.2);background:rgba(204,255,0,0.04);box-shadow:0 0 30px rgba(204,255,0,0.08)}

                @keyframes ppvBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
                .ppv-bounce{animation:ppvBounce 2s ease-in-out infinite}
                .ppv-scroll-indicator{cursor:pointer;display:flex;flex-direction:column;align-items:center;background:none;border:none;padding:8px}

                .ppv-glass-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:24px;backdrop-filter:blur(10px);transition:all 0.5s cubic-bezier(0.16,1,0.3,1)}
                .ppv-glass-card:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.08);transform:translateY(-3px);box-shadow:0 20px 60px rgba(0,0,0,0.3)}
                .ppv-glass-red{border-color:rgba(239,68,68,0.08)}
                .ppv-glass-red:hover{border-color:rgba(239,68,68,0.15);box-shadow:0 20px 60px rgba(239,68,68,0.05)}
                .ppv-glass-lime{border-color:rgba(204,255,0,0.08)}
                .ppv-glass-lime:hover{border-color:rgba(204,255,0,0.2);box-shadow:0 20px 60px rgba(204,255,0,0.05)}

                .ppv-solution-bg{background:linear-gradient(170deg,#001040 0%,#0035C5 40%,#001a6e 100%);position:relative}
                .ppv-solution-bg::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 100%,rgba(204,255,0,0.05),transparent)}

                .ppv-build-item{display:flex;align-items:center;gap:16px;padding:18px 20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);cursor:default}
                .ppv-build-item:hover{background:rgba(255,255,255,0.07);border-color:rgba(204,255,0,0.25);transform:translateX(6px)}
                .ppv-build-num{width:40px;height:40px;border-radius:12px;background:rgba(204,255,0,0.08);border:1px solid rgba(204,255,0,0.15);color:#ccff00;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.4s}
                .ppv-build-item:hover .ppv-build-num{background:#ccff00;color:#0035C5;border-color:#ccff00;box-shadow:0 0 20px rgba(204,255,0,0.3)}

                .ppv-scope-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:24px;backdrop-filter:blur(8px);transition:all 0.4s cubic-bezier(0.16,1,0.3,1);height:100%}
                .ppv-scope-card:hover{background:rgba(255,255,255,0.07);border-color:rgba(204,255,0,0.2);box-shadow:0 10px 40px rgba(0,0,0,0.2);transform:translateY(-3px)}

                .ppv-timeline-line{background:linear-gradient(to bottom,#0035C5,rgba(204,255,0,0.2),transparent)}
                .ppv-timeline-dot{position:absolute;left:-33px;top:24px;width:12px;height:12px;border-radius:50%;background:#0035C5;border:3px solid #ccff00;box-shadow:0 0 15px rgba(204,255,0,0.3),0 0 30px rgba(0,53,197,0.3)}

                .ppv-investment-card{background:linear-gradient(145deg,#0a1628 0%,#0035C5 50%,#001040 100%);border:1px solid rgba(255,255,255,0.06)}
                .ppv-investment-card::before{content:'';position:absolute;inset:0;border-radius:2rem;background:radial-gradient(circle at 30% 0%,rgba(204,255,0,0.1),transparent 50%);pointer-events:none}
                .ppv-price-tag{background:#ccff00;padding:16px 40px;border-radius:20px;box-shadow:0 0 80px rgba(204,255,0,0.3),inset 0 1px 0 rgba(255,255,255,0.3)}
                .ppv-guarantee-card{text-align:center;padding:24px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:20px;transition:all 0.4s}
                .ppv-guarantee-card:hover{background:rgba(255,255,255,0.06);border-color:rgba(204,255,0,0.15);transform:translateY(-4px)}

                .ppv-approval-bg{background:linear-gradient(170deg,#001040 0%,#0035C5 50%,#001a6e 100%);position:relative}
                .ppv-approval-bg::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 20%,rgba(204,255,0,0.08),transparent 60%)}

                .ppv-cta-main{background:#ccff00;color:#0035C5;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);box-shadow:0 0 60px rgba(204,255,0,0.3),0 0 120px rgba(204,255,0,0.1)}
                .ppv-cta-main:hover{background:#fff;box-shadow:0 0 80px rgba(255,255,255,0.3),0 0 160px rgba(204,255,0,0.15);transform:translateY(-3px) !important}
                .ppv-cta-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.4) 50%,transparent 60%);background-size:250% 100%;animation:ppvShine 4s ease-in-out infinite}
                @keyframes ppvShine{0%,100%{background-position:250% 0}50%{background-position:-50% 0}}

                .ppv-pulse-ring{animation:ppvPulse 2s ease-in-out infinite}
                @keyframes ppvPulse{0%,100%{box-shadow:0 0 0 0 rgba(204,255,0,0.15)}50%{box-shadow:0 0 0 20px rgba(204,255,0,0)}}

                @keyframes ppvFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

                @media(max-width:768px){
                    .ppv-countdown-cell{width:50px;height:56px}
                    .ppv-price-tag{padding:12px 24px}
                    .ppv-price-tag span{font-size:2.5rem !important}
                }
            `}</style>
        </div>
    );
};
