import React from 'react';
import { SectionId } from '../types';
import { Plus } from 'lucide-react';

export const Process: React.FC = () => {
    const steps = [
        { num: '01', title: 'Imersão & Diagnóstico', desc: 'Mergulho na sua operação. Analiso sua presença digital, processos de vendas e gargalos atuais.' },
        { num: '02', title: 'Arquitetura & Conteúdo', desc: 'Defino a linha editorial para atrair leads e desenho a engenharia do funil que irá recebê-los.' },
        { num: '03', title: 'Construção do Ecossistema', desc: 'Desenvolvimento das páginas, automações e setup do CRM. Tudo conectado e pronto para converter.' },
        { num: '04', title: 'Go-Live & CX', desc: 'Entrega final com treinamento. Implementamos os processos de Experiência do Cliente para garantir retenção.' },
    ];

    return (
        <section id={SectionId.PROCESS} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-32">
                            <div className="inline-block mb-4">
                                <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                                    <circle cx="25" cy="25" r="25" fill="#f5f5f5" />
                                    <path d="M25 10L25 40M10 25L40 25" stroke="#0035C5" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h2 className="text-4xl font-bold text-brand-black mb-6 leading-tight">
                                Metodologia que gera <span className="text-brand-blue">tração</span>.
                            </h2>
                            <p className="text-gray-500 mb-8">
                                Não acredito em sorte. Acredito em processos replicáveis. Minha metodologia garante que a atração (conteúdo) alimente a conversão (vendas) de forma previsível.
                            </p>
                            <button className="bg-brand-black text-white px-8 py-4 rounded-full font-bold hover:bg-brand-blue hover:shadow-[0_10px_30px_rgba(0,53,197,0.3)] hover:-translate-y-1 transition-all duration-300">
                                Entender Metodologia
                            </button>
                        </div>
                    </div>

                    <div className="md:w-2/3">
                        <div className="divide-y divide-gray-100">
                            {steps.map((step, idx) => (
                                <div key={idx} className="py-10 group cursor-pointer relative transition-all duration-500 rounded-3xl px-6 hover:bg-brand-gray/50 overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-lime scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top rounded-full"></div>
                                    <div className="flex items-start gap-6 relative z-10">
                                        <span className="text-xl font-bold font-mono text-brand-blue/20 group-hover:text-brand-blue transition-colors duration-500 mt-1">{step.num}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-2xl font-bold text-brand-black group-hover:text-brand-blue transition-colors duration-300">{step.title}</h3>
                                                <Plus className="text-gray-300 group-hover:text-brand-lime group-hover:rotate-90 transition-all duration-500" />
                                            </div>
                                            <p className="text-gray-500 max-w-md group-hover:text-gray-700 transition-colors duration-300">{step.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};