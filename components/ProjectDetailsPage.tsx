import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Calendar, User, Code2, Layers, Target } from 'lucide-react';
import { SectionId } from '../types';

export interface ProjectDetails {
    id: number;
    title: string;
    category: string;
    image: string;
    description: string;
    tags: string[];
    fullDescription: string;
    challenge: string;
    solution: string;
    client?: string;
    year?: string;
    results: string[];
}

interface ProjectDetailsPageProps {
    project: ProjectDetails;
    onClose: () => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ project, onClose }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
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
                        <span className="hidden sm:inline">Voltar ao portfólio</span>
                    </button>
                    <button
                        onClick={handleContactClick}
                        className="bg-brand-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-brand-lime hover:text-brand-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(204,255,0,0.3)]"
                    >
                        Quero um projeto assim
                    </button>
                </div>
            </nav>

            <main className="pt-24 pb-24 relative z-[105]">
                {/* Banner Hero */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="relative h-[40vh] md:h-[60vh] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,53,197,0.15)] group">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                        />
                        {/* Elegant overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/40 to-transparent"></div>

                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col justify-end">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-lime text-brand-blue text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(204,255,0,0.3)] w-max">
                                {project.category}
                            </div>
                            <h1 className="text-4xl md:text-6xl text-white font-bold leading-tight mb-4 tracking-tight drop-shadow-md">
                                {project.title}
                            </h1>
                            <p className="text-lg md:text-2xl text-white/90 font-light max-w-3xl drop-shadow-sm">
                                {project.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Left Content Column */}
                        <div className="lg:col-span-2 space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-brand-blue/5 border border-white hover:border-brand-blue/10 transition-colors">
                                <h2 className="text-3xl lg:text-4xl font-bold text-brand-black mb-6 flex items-center gap-4">
                                    <div className="p-3 bg-brand-blue/10 rounded-2xl">
                                        <Target className="text-brand-blue" size={28} />
                                    </div>
                                    O Contexto
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed font-light">
                                    {project.fullDescription}
                                </p>
                            </section>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-red-50/80 rounded-[2.5rem] p-8 md:p-10 border border-red-100 shadow-inner group transition-colors hover:bg-red-50">
                                    <h3 className="font-bold text-brand-black mb-6 flex items-center gap-3 text-xl">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <Layers className="text-red-500" size={20} />
                                        </div>
                                        O Desafio
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {project.challenge}
                                    </p>
                                </div>

                                <div className="bg-brand-blue/5 rounded-[2.5rem] p-8 md:p-10 border border-brand-blue/10 shadow-inner group transition-colors hover:bg-brand-blue/10">
                                    <h3 className="font-bold text-brand-black mb-6 flex items-center gap-3 text-xl">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-brand-blue/10">
                                            <Code2 className="text-brand-blue" size={20} />
                                        </div>
                                        A Solução
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {project.solution}
                                    </p>
                                </div>
                            </div>

                            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-brand-blue/5 border border-white hover:border-brand-blue/10 transition-colors">
                                <h2 className="text-2xl lg:text-3xl font-bold text-brand-black mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-brand-lime/20 rounded-xl">
                                        <CheckCircle2 className="text-brand-lime fill-brand-blue" size={28} />
                                    </div>
                                    Impacto & Resultados
                                </h2>
                                <div className="space-y-6">
                                    {project.results.map((result, idx) => (
                                        <div key={idx} className="flex items-start gap-5 p-5 bg-brand-gray/50 rounded-2xl border border-gray-100 hover:border-brand-lime/50 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-200 group-hover:border-brand-lime transition-all">
                                                <span className="text-brand-blue font-bold text-sm">{idx + 1}</span>
                                            </div>
                                            <span className="text-gray-800 text-lg font-medium tracking-tight mt-0.5">{result}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Sidebar Column */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-brand-black text-white rounded-[2.5rem] p-8 lg:sticky lg:top-32 shadow-2xl shadow-brand-black/20">
                                <h3 className="text-2xl font-bold mb-8 border-b border-white/10 pb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-brand-lime rounded-full block"></span>
                                    Ficha Técnica
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm font-bold uppercase tracking-wider">
                                            <User size={16} className="text-brand-lime" /> Cliente
                                        </div>
                                        <p className="text-xl font-medium">{project.client || "Confidencial"}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm font-bold uppercase tracking-wider">
                                            <Calendar size={16} className="text-brand-lime" /> Ano
                                        </div>
                                        <p className="text-xl font-medium">{project.year || "2024"}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-gray-400 mb-4 text-sm font-bold uppercase tracking-wider">
                                            <Code2 size={16} className="text-brand-lime" /> Tecnologias Utilizadas
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl text-sm border border-white/10 font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/10">
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">Gostou dos resultados alcançados neste case? Vamos desenhar uma estratégia para o seu negócio.</p>
                                    <button
                                        onClick={handleContactClick}
                                        className="w-full bg-brand-lime text-brand-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:text-brand-blue transition-all shadow-[0_10px_30px_rgba(204,255,0,0.2)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.4)] group"
                                    >
                                        Iniciar meu projeto
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

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
