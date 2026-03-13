import React, { useEffect, useState, useRef } from 'react';
import { SectionId } from '../types';
import { TrendingUp, Award, Zap, ArrowUpRight } from 'lucide-react';

// Hook para detectar quando o elemento entra na tela
const useOnScreen = (ref: React.RefObject<Element>, rootMargin = '0px') => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.disconnect(); // Anima apenas uma vez
                }
            },
            { rootMargin }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, rootMargin]);
    return isIntersecting;
};

// Componente para animar números
const Counter = ({ end, duration = 2000, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const onScreen = useOnScreen(ref);

    useEffect(() => {
        if (!onScreen) return;

        let startTime: number;
        let animationFrame: number;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            }
        };

        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [onScreen, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

export const Results: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(sectionRef, '-100px');

    return (
        <section id={SectionId.RESULTS} ref={sectionRef} className="py-32 bg-brand-gray relative overflow-hidden bg-grid-pattern">

            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white to-transparent opacity-50 pointer-events-none" />

            {/* Ambient Glows for premium feel */}
            <div className="absolute -left-40 top-20 w-80 h-80 bg-brand-lime opacity-10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-brand-blue opacity-5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className={`text-center mb-20 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Métricas Reais</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-brand-black mb-6 leading-tight">
                        Resultados que geram <br />
                        <span className="text-brand-blue relative inline-block">
                            Crescimento
                            <svg className="absolute -bottom-2 left-0 w-full opacity-30" height="12" viewBox="0 0 100 12" fill="none">
                                <path d="M0 6Q50 12 100 6" stroke="#0035C5" strokeWidth="4" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
                        Não é mágica, é engenharia de processos. Veja o impacto quantitativo de implementar um ecossistema digital inteligente.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Card 1: Revenue Growth */}
                    <div className={`bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-brand-blue/5 border border-white hover:border-brand-blue/20 transition-all duration-700 transform hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,53,197,0.15)] group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-20'}`}>
                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent translate-x-[-150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-[1.5s]"></div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-brand-gray rounded-2xl group-hover:bg-brand-blue/10 transition-colors">
                                <TrendingUp size={24} className="text-brand-black group-hover:text-brand-blue transition-colors" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400 font-medium">Receita</p>
                                <p className="text-xs text-brand-lime font-bold">+3 Meses</p>
                            </div>
                        </div>

                        <div className="mb-10 h-48 flex items-end justify-between px-2 gap-4 relative">
                            {/* Backdrop Grid lines */}
                            <div className="absolute inset-x-0 inset-y-4 flex flex-col justify-between">
                                <div className="border-t border-gray-200/60 border-dashed w-full h-[1px]"></div>
                                <div className="border-t border-gray-200/60 border-dashed w-full h-[1px]"></div>
                                <div className="border-t border-gray-200/60 border-dashed w-full h-[1px]"></div>
                                <div className="border-t border-gray-200 w-full h-[1px]"></div>
                            </div>

                            {/* Animated Bars */}
                            {[35, 55, 45, 70, 100].map((height, idx) => (
                                <div key={idx} className="w-full relative group/bar z-10 flex justify-center h-full items-end">
                                    <div
                                        className="w-full max-w-[40px] bg-brand-gray rounded-t-xl transition-all duration-1000 ease-out group-hover/bar:bg-brand-blue/5 overflow-hidden"
                                        style={{ height: isVisible ? `${height}%` : '0%' }}
                                    >
                                        <div
                                            className={`w-full bg-gradient-to-t from-brand-blue to-brand-blue/80 rounded-t-xl absolute bottom-0 transition-all duration-1000 ease-out delay-${idx * 100} shadow-[0_5px_15px_rgba(0,53,197,0.2)] group-hover/bar:from-brand-lime group-hover/bar:to-brand-lime/90`}
                                            style={{ height: isVisible ? `${height * 0.8}%` : '0%' }}
                                        ></div>
                                    </div>

                                    {/* Hover Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-black text-white text-xs py-1.5 px-3 rounded-xl font-bold opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-2 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                                        +{(height * 0.4).toFixed(0)}%
                                    </div>

                                    {/* Static Top Label for last bar */}
                                    {idx === 4 && (
                                        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-brand-blue text-xs font-bold transition-all duration-500 delay-1000 pointer-events-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} group-hover/bar:opacity-0`}>
                                            Top
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-5xl font-black text-brand-black mb-2 tracking-tighter drop-shadow-sm flex items-center gap-1">
                                <Counter end={40} suffix="%" />
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Aumento médio de receita após a implementação do Funil de Vendas Automatizado.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Conversion/Highlights */}
                    <div className={`bg-brand-blue rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,53,197,0.3)] hover:shadow-[0_20px_60px_rgba(0,53,197,0.5)] text-white relative overflow-hidden group ${isVisible ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-20'} transition-all duration-700 transform hover:-translate-y-2`}>
                        {/* Abstract animated background */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-lime opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <Award size={16} className="text-brand-lime drop-shadow-md" />
                                    <span className="text-xs font-bold tracking-wide">High Ticket</span>
                                </div>
                                <ArrowUpRight size={28} className="text-brand-lime opacity-0 group-hover:opacity-100 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 drop-shadow-lg" />
                            </div>

                            <div className="mt-8 relative">
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-40 h-40 bg-brand-lime opacity-30 blur-[60px] rounded-full pointer-events-none group-hover:opacity-40 transition-opacity duration-700"></div>
                                <div className="text-[5.5rem] md:text-[6rem] font-black leading-none mb-4 text-white tracking-tighter drop-shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 origin-left">
                                    <Counter end={25} suffix="%" />
                                </div>
                                <div className="h-1.5 w-24 bg-brand-lime rounded-full mb-6 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200 shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>
                                <p className="text-white/90 font-medium text-lg md:text-xl leading-snug">
                                    Taxa de conversão em leads qualificados (SQLs) através de automação.
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" className="w-10 h-10 rounded-full border-2 border-brand-blue object-cover" alt="" />
                                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&q=80" className="w-10 h-10 rounded-full border-2 border-brand-blue object-cover" alt="" />
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&q=80" className="w-10 h-10 rounded-full border-2 border-brand-blue object-cover" alt="" />
                                </div>
                                <p className="text-xs font-bold text-brand-lime uppercase tracking-wider">
                                    +100 Projetos <br /> Entregues
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Speed/Efficiency */}
                    <div className={`bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-brand-blue/5 border border-white hover:border-brand-lime/30 transition-all duration-700 transform hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(204,255,0,0.2)] group relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-20'}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent translate-x-[-150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-[1.5s] delay-100"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-brand-gray rounded-2xl group-hover:bg-brand-lime/20 transition-colors">
                                <Zap size={24} className="text-brand-black group-hover:text-brand-blue transition-colors" />
                            </div>
                            <span className="text-xs font-bold bg-brand-lime/20 text-brand-blue px-3 py-1 rounded-full">
                                Eficiência
                            </span>
                        </div>

                        <div className="flex items-center justify-center mb-10 relative py-4">
                            {/* Animated Circle */}
                            <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                                <defs>
                                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ccff00" />
                                        <stop offset="100%" stopColor="#99cc00" />
                                    </linearGradient>
                                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {/* Base track */}
                                <circle cx="50" cy="50" r="44" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                                {/* Animated stroke */}
                                <circle
                                    cx="50" cy="50" r="44"
                                    fill="none"
                                    stroke="url(#glowGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray="276"
                                    strokeDashoffset={isVisible ? "40" : "276"} // 276 is approx circumference of r=44
                                    className="transition-all duration-[2000ms] ease-out delay-500"
                                    filter="url(#neonGlow)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-5xl font-black text-brand-black flex items-baseline tracking-tighter drop-shadow-sm">
                                    <Counter end={3} duration={1500} />
                                    <span className="text-3xl text-brand-blue ml-1 drop-shadow-md">x</span>
                                </span>
                                <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest mt-1 bg-brand-lime/20 px-3 py-1 rounded-full border border-brand-lime/30">Mais Rápido</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-brand-black mb-3">Velocidade de Processo</h3>
                            <p className="text-gray-500 text-sm">
                                Redução drástica no tempo de resposta ao cliente, triplicando a eficiência da equipe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};