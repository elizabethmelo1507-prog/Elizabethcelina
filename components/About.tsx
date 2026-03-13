import React from 'react';
import { SectionId } from '../types';
import { Check, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
    const skills = [
        "Estratégia de Conteúdo (Social)",
        "Funis de Vendas Automatizados",
        "Arquitetura de CRM",
        "Landing Pages de Alta Conversão",
        "Customer Experience (CX)",
        "Automação de Processos"
    ];

    return (
        <section id={SectionId.ABOUT} className="py-24 md:py-40 bg-brand-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-lime/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24 transition-all duration-1000">
                    <div className="inline-flex items-center gap-2 mb-8 bg-brand-blue/5 px-4 py-2 rounded-full border border-brand-blue/10">
                        <Sparkles className="text-brand-blue animate-pulse" size={20} />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-blue/80">Estratégia & Tecnologia</span>
                        <Sparkles className="text-brand-lime animate-pulse" size={16} />
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black text-brand-black mb-10 leading-[0.9] tracking-tighter">
                        Muito além do sistema. <br />
                        Eu domino <span className="text-brand-blue italic underline decoration-brand-lime decoration-8 underline-offset-4">toda a jornada</span>.
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light max-w-3xl mx-auto italic">
                        "Viralizar sem vender é ego. Vender sem reter é prejuízo. Eu unifico o conteúdo que atrai com a engenharia que converte."
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-brand-blue text-white rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-[0_40px_80px_rgba(0,53,197,0.3)] group hover:shadow-[0_40px_100px_rgba(0,53,197,0.5)] transition-all duration-700">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-150%] skew-x-[-45deg] group-hover:translate-x-[150%] transition-transform duration-[2s]"></div>
                        
                        <div className="absolute top-0 right-0 p-10 opacity-10 mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                            <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
                                <circle cx="50" cy="50" r="50" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-5xl font-black mb-16 flex items-center gap-6 tracking-tight">
                                <span className="w-4 h-14 bg-brand-lime rounded-full block shadow-[0_0_20px_rgba(204,255,0,0.5)]"></span>
                                Arsenal Estratégico
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                {skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-6 group/item">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 group-hover/item:bg-brand-lime group-hover/item:border-brand-lime flex items-center justify-center shrink-0 transition-all duration-500 shadow-xl">
                                            <Check size={24} className="text-brand-lime group-hover/item:text-brand-blue stroke-[3] transition-colors" />
                                        </div>
                                        <span className="font-bold text-xl md:text-2xl text-white/90 group-hover/item:text-white transition-colors tracking-tight">{skill}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-20 p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl relative z-10 group/quote">
                                <div className="absolute -top-6 left-10 bg-brand-lime text-brand-blue px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">Visão 360º</div>
                                <p className="text-xl md:text-2xl text-white/95 leading-relaxed font-light italic">
                                    "Meu trabalho começa no primeiro post e termina quando o cliente vira um fã apaixonado. Eu fecho o ciclo de ponta a ponta, criando uma máquina de vendas previsível e automatizada."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};