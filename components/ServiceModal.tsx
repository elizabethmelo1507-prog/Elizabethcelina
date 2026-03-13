import React, { useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { ServiceItem, SectionId } from '../types';

interface ServiceModalProps {
  service: ServiceItem;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose }) => {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleContactClick = () => {
    onClose();
    setTimeout(() => {
      document.getElementById(SectionId.CONTACT)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-black/90 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div 
        className="bg-brand-white w-full max-w-5xl h-[90vh] sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col md:flex-row animate-fadeInUp"
      >
        {/* Close Button Mobile */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/10 rounded-full md:hidden"
        >
            <X size={24} />
        </button>

        {/* Left Sidebar (Header) */}
        <div className="bg-brand-blue text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden shrink-0">
            {/* Abstract Background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
                 </svg>
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-lime text-brand-blue flex items-center justify-center mb-8 shadow-lg shadow-brand-black/20">
                    {React.cloneElement(service.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{service.title}</h2>
                <p className="text-white/80 text-lg leading-relaxed">{service.description}</p>
            </div>

            <div className="relative z-10 mt-8 md:mt-0 hidden md:block">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-lime mb-2">Para quem é isso?</p>
                    <p className="text-sm">Empresas que querem profissionalizar sua operação e parar de perder vendas por falta de processo.</p>
                 </div>
            </div>
        </div>

        {/* Right Content (Details) */}
        <div className="flex-1 overflow-y-auto bg-white p-8 md:p-12">
            
            {/* Pain Points Section */}
            {service.painPoints && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-brand-black mb-6 flex items-center gap-2">
                        <AlertCircle className="text-red-500" size={20} />
                        O Problema que resolvemos
                    </h3>
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                        <ul className="space-y-3">
                            {service.painPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Main Description */}
            <div className="mb-10">
                 <h3 className="text-xl font-bold text-brand-black mb-4 flex items-center gap-2">
                    <Zap className="text-brand-blue" size={20} />
                    A Estratégia
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {service.fullDescription}
                </p>
            </div>

            {/* Deliverables */}
            {service.deliverables && (
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-brand-black mb-6 flex items-center gap-2">
                        <CheckCircle2 className="text-brand-lime fill-brand-blue" size={20} />
                        O que está incluso
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {service.deliverables.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-blue/30 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-white border border-brand-lime flex items-center justify-center shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="border-t border-gray-100 pt-8 mt-auto">
                <button 
                    onClick={handleContactClick}
                    className="w-full md:w-auto bg-brand-black text-white hover:bg-brand-lime hover:text-brand-black font-bold py-4 px-8 rounded-full transition-all flex items-center justify-center gap-3 shadow-xl group"
                >
                    {service.ctaText || "Solicitar Orçamento Personalizado"}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            
            {/* Close Button Desktop (Bottom) */}
             <button 
                onClick={onClose}
                className="mt-4 w-full md:w-auto text-gray-400 hover:text-brand-blue text-sm font-medium py-2 flex items-center justify-center md:justify-start gap-2 md:hidden"
            >
                <X size={14} /> Fechar
            </button>
        </div>

      </div>
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(50px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp {
            animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};