import React, { useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, Calendar, User, Code2, Layers } from 'lucide-react';

export interface ProjectDetails {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  // Detailed fields
  fullDescription: string;
  challenge: string;
  solution: string;
  client?: string;
  year?: string;
  results: string[];
}

interface ProjectModalProps {
  project: ProjectDetails;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-black/90 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content - Sheet on mobile, Card on Desktop */}
      <div 
        className="bg-brand-white w-full max-w-6xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col" 
        style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}
      >
        
        {/* Header / Image Area */}
        <div className="relative h-56 md:h-80 shrink-0">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 to-transparent"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-lime hover:text-brand-black transition-all border border-white/20 z-20"
            aria-label="Fechar"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>

          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-12 max-w-3xl z-10 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime text-brand-blue text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
               {project.category}
            </div>
            <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 leading-tight">
              {project.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="p-6 md:p-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    
                    {/* Main Content */}
                    <div className="lg:w-2/3 space-y-8 md:space-y-12">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-brand-black mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 bg-brand-blue rounded-full"></span>
                                O Contexto
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                                {project.fullDescription}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            <div className="bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100">
                                <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
                                    <Layers className="text-red-500" size={20} />
                                    O Desafio
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {project.challenge}
                                </p>
                            </div>
                            <div className="bg-brand-blue/5 p-6 md:p-8 rounded-3xl border border-brand-blue/10">
                                <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
                                    <Code2 className="text-brand-blue" size={20} />
                                    A Solução
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {project.solution}
                                </p>
                            </div>
                        </div>

                        <div>
                             <h3 className="text-xl md:text-2xl font-bold text-brand-black mb-6">Impacto & Resultados</h3>
                             <div className="grid sm:grid-cols-2 gap-4">
                                {project.results.map((result, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-brand-lime shrink-0 mt-1 fill-brand-blue" size={20} />
                                        <span className="text-gray-700 font-medium text-sm md:text-base">{result}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="bg-brand-black text-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 lg:sticky lg:top-0">
                            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-4">Ficha Técnica</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-brand-lime mb-1 text-xs md:text-sm font-bold uppercase tracking-wider">
                                        <User size={14} /> Cliente
                                    </div>
                                    <p className="text-base md:text-lg">{project.client || "Confidencial"}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-brand-lime mb-1 text-xs md:text-sm font-bold uppercase tracking-wider">
                                        <Calendar size={14} /> Ano
                                    </div>
                                    <p className="text-base md:text-lg">{project.year || "2024"}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-brand-lime mb-3 text-xs md:text-sm font-bold uppercase tracking-wider">
                                        <Code2 size={14} /> Tecnologias
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/10 rounded-lg text-xs md:text-sm border border-white/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 md:mt-10 pt-8 border-t border-white/20">
                                <button onClick={onClose} className="w-full bg-brand-lime text-brand-blue font-bold py-3 md:py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white transition-colors text-sm md:text-base">
                                    Fechar Detalhes
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(100px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0035C5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};