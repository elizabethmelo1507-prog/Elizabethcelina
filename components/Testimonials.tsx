import React from 'react';
import { SectionId } from '../types';
import { Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
    return (
        <section id={SectionId.TESTIMONIALS} className="py-24 bg-white relative bg-grid-pattern">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-brand-blue font-bold tracking-widest uppercase text-sm mb-2">Depoimentos</h2>
                        <h3 className="text-4xl font-bold text-brand-black">O que dizem meus parceiros</h3>
                    </div>
                    <div className="flex gap-2">
                        {/* Visual controls meant to look like a slider */}
                        <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-black hover:text-white transition-colors">←</button>
                        <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-black hover:text-white transition-colors">→</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Featured Testimonial Image */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-lime rounded-[3rem] transform rotate-3 translate-x-2 translate-y-2"></div>
                        <div className="relative bg-gray-200 rounded-[3rem] overflow-hidden aspect-[4/3] group">
                            <img
                                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000"
                                alt="Cliente Satisfeita"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl">
                                <p className="font-bold text-brand-black">Brenda C.</p>
                                <p className="text-xs text-gray-500">CEO, TechStart</p>
                            </div>
                        </div>
                    </div>

                    {/* Quote Content */}
                    <div className="relative">
                        <Quote size={60} className="text-brand-blue/10 absolute -top-10 -left-6" />

                        <h4 className="text-2xl md:text-4xl font-bold text-brand-black leading-tight mb-8">
                            "Os insights baseados em dados da Elizabeth e as automações implementadas aumentaram a confiança dos nossos agentes de vendas."
                        </h4>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-brand-blue/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,53,197,0.08)] transition-all duration-500 cursor-default">
                                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-brand-blue/10" />
                                <div>
                                    <p className="text-sm font-bold text-brand-black">Carlos M.</p>
                                    <p className="text-xs text-brand-blue font-semibold uppercase tracking-wider mb-2">Diretor Comercial</p>
                                    <p className="text-gray-600 text-sm italic leading-relaxed">"O CRM personalizado mudou nossa operação da água para o vinho. Tudo organizado."</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-brand-blue/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,53,197,0.08)] transition-all duration-500 cursor-default">
                                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-brand-blue/10" />
                                <div>
                                    <p className="text-sm font-bold text-brand-black">Ricardo S.</p>
                                    <p className="text-xs text-brand-blue font-semibold uppercase tracking-wider mb-2">Fundador, ScaleUp</p>
                                    <p className="text-gray-600 text-sm italic leading-relaxed">"A landing page converte 3x mais que a anterior. Design e copy impecáveis."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};