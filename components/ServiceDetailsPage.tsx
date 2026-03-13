import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { ServiceItem, SectionId } from '../types';

interface ServiceDetailsPageProps {
    service: ServiceItem;
    onClose: () => void;
}

export const ServiceDetailsPage: React.FC<ServiceDetailsPageProps> = ({ service, onClose }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden'; // Hide main page scrollbar
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleContactClick = () => {
        onClose();
        setTimeout(() => {
            document.getElementById(SectionId.CONTACT)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const content = (
        <div className="fixed inset-0 z-[100] bg-brand-white text-brand-black overflow-y-auto overscroll-contain animate-fadeIn bg-grid-pattern">
            {/* Navigation Bar inside the Page */}
            <nav className="fixed top-0 w-full z-[110] bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-brand-blue font-bold hover:text-brand-lime transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center group-hover:bg-brand-blue transition-colors">
                            <ArrowLeft size={20} className="group-hover:text-brand-lime" />
                        </div>
                        <span className="hidden sm:inline">Voltar ao início</span>
                    </button>
                    <button
                        onClick={handleContactClick}
                        className="bg-brand-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-brand-lime hover:text-brand-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(204,255,0,0.3)]"
                    >
                        Quero Contratar
                    </button>
                </div>
            </nav>

            <main className="pt-32 pb-24 relative z-[105]">
                {/* Hero Header for Service */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-brand-blue rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(0,53,197,0.2)] mb-16">
                        {/* Decorative background */}
                        <div className="absolute top-[-20%] right-[-10%] p-10 opacity-10 mix-blend-screen animate-pulse pointer-events-none">
                            <svg width="600" height="600" viewBox="0 0 100 100" fill="currentColor">
                                <circle cx="50" cy="50" r="50" />
                            </svg>
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="w-24 h-24 rounded-3xl bg-brand-lime text-brand-blue flex flex-shrink-0 items-center justify-center shadow-[0_10px_30px_rgba(204,255,0,0.3)]">
                                {React.cloneElement(service.icon as React.ReactElement<any>, { size: 48 })}
                            </div>
                            <div>
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-lime text-xs font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                                    Visão Detalhada
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-4 tracking-tight">{service.title}</h1>
                                <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl leading-relaxed">{service.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Content Column */}
                        <div className="lg:col-span-2 space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-brand-blue/5 border border-white hover:border-brand-blue/10 transition-colors">
                                <h2 className="text-3xl lg:text-4xl font-bold text-brand-black mb-8 flex items-center gap-4">
                                    <div className="p-3 bg-brand-blue/10 rounded-2xl">
                                        <Zap className="text-brand-blue" size={28} />
                                    </div>
                                    A Estratégia
                                </h2>
                                <div className="prose prose-lg text-gray-600 prose-p:leading-relaxed max-w-none">
                                    {service.fullDescription.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-6 whitespace-pre-line text-lg">{paragraph}</p>
                                    ))}
                                </div>
                            </section>

                            {service.painPoints && (
                                <section>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-brand-black mb-6 flex items-center gap-3">
                                        <AlertCircle className="text-red-500" size={28} />
                                        O Problema que resolvemos
                                    </h2>
                                    <div className="bg-red-50/80 rounded-[2.5rem] p-8 md:p-10 border border-red-100 shadow-inner">
                                        <ul className="space-y-5">
                                            {service.painPoints.map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-4 text-gray-800 text-lg bg-white p-4 rounded-2xl shadow-sm border border-red-100/50">
                                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 font-bold">
                                                        !
                                                    </div>
                                                    <span className="mt-0.5">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Sidebar Column */}
                        <div className="lg:col-span-1 space-y-8">
                            {service.deliverables && (
                                <div className="bg-brand-gray rounded-[2.5rem] p-8 border border-gray-200 shadow-lg shadow-gray-100">
                                    <h3 className="text-xl font-bold text-brand-black mb-6 flex items-center gap-2">
                                        <CheckCircle2 className="text-brand-lime fill-brand-blue" size={24} />
                                        O que está incluso
                                    </h3>
                                    <ul className="space-y-4">
                                        {service.deliverables.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-4 group">
                                                <span className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-brand-lime transition-colors">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
                                                </span>
                                                <span className="text-gray-700 font-medium leading-relaxed mt-1 group-hover:text-brand-blue transition-colors">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="bg-brand-black text-white rounded-[2.5rem] p-8 shadow-2xl shadow-brand-black/20 sticky top-32">
                                <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
                                <p className="text-gray-400 mb-8 text-sm leading-relaxed">Não perca mais tempo. Clique abaixo e vamos agendar uma reunião de diagnóstico para sua empresa.</p>
                                <button
                                    onClick={handleContactClick}
                                    className="w-full bg-brand-lime text-brand-black hover:bg-white hover:text-brand-blue font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(204,255,0,0.2)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 group"
                                >
                                    {service.ctaText || "Solicitar Orçamento"}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer to give a complete page feel */}
            <footer className="bg-brand-gray py-8 mt-12 border-t border-gray-200 text-center text-sm text-gray-500 relative z-[105]">
                <p>© {new Date().getFullYear()} Elizabeth Celina. Todos os direitos reservados.</p>
            </footer>

            <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
        </div>
    );

    return createPortal(content, document.body);
};
