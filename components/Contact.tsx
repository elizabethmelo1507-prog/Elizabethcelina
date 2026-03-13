import React, { useState } from 'react';
import { SectionId } from '../types';
import { Mail, Linkedin, Instagram, ArrowRight, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContactProps {
    onOpenAdmin?: () => void;
    onNewLead: (leadData: {
        name: string;
        email: string;
        whatsapp: string;
        service: string;
        message: string;
        niche: string;
        revenue: string;
        growthGoal: string;
        bottleneck: string;
        estimatedBudget: string;
    }) => void;
}

export const Contact: React.FC<ContactProps> = ({ onNewLead, onOpenAdmin }) => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        whatsapp: '',
        service: '',
        message: '',
        niche: '',
        revenue: '',
        growthGoal: '',
        bottleneck: '',
        estimatedBudget: ''
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulating backend call & Integration
        setTimeout(() => {
            // Pass data up to App.tsx to add to CRM
            onNewLead(formState);

            setStatus('success');
            setFormState({
                name: '', email: '', whatsapp: '', service: '', message: '',
                niche: '', revenue: '', growthGoal: '', bottleneck: '', estimatedBudget: ''
            });
        }, 1500);
    };

    return (
        <footer id={SectionId.CONTACT} className="bg-brand-black pt-24 pb-12 border-t border-white/10 relative overflow-hidden">

            {/* Background Gradient */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-blue/10 to-transparent pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="flex flex-col lg:flex-row gap-16 mb-24">

                    {/* Left Column: Copy & Direct Contacts */}
                    <div className="lg:w-5/12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></span>
                            Agenda Aberta
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Vamos desenhar sua <br />
                            <span className="text-brand-lime">Estratégia de Escala?</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                            Você já tem o produto. Agora precisa do processo. Preencha o formulário para agendarmos um diagnóstico da sua operação comercial e presença digital.
                        </p>

                        <div className="space-y-6">
                            <a href="mailto:elizabethcelina.comercial@gmail.com" className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-brand-lime group-hover:text-brand-black transition-all">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Email</p>
                                    <p className="text-white font-medium">elizabethcelina.comercial@gmail.com</p>
                                </div>
                            </a>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">WhatsApp</p>
                                    <p className="text-white font-medium">(92) 98203-1507</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:w-7/12">
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                            {status === 'success' ? (
                                <div className="absolute inset-0 z-20 bg-brand-black flex flex-col items-center justify-center text-center p-8 animate-fadeIn">
                                    <div className="w-20 h-20 bg-brand-lime rounded-full flex items-center justify-center text-brand-blue mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Mensagem Recebida!</h3>
                                    <p className="text-gray-400 max-w-md">
                                        Obrigado pelo contato, {formState.name}. Seus dados já foram adicionados ao nosso CRM. Entrarei em contato via WhatsApp ou Email em até 24 horas.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-8 text-brand-lime font-bold text-sm uppercase tracking-wider hover:text-white transition-colors"
                                    >
                                        Enviar nova mensagem
                                    </button>
                                </div>
                            ) : null}

                            <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-300 ${status === 'success' ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Nome Completo</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formState.name}
                                            onChange={handleChange}
                                            placeholder="Seu nome"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">WhatsApp</label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            required
                                            value={formState.whatsapp}
                                            onChange={handleChange}
                                            placeholder="(DDD) 99999-9999"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Email Corporativo</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formState.email}
                                            onChange={handleChange}
                                            placeholder="seu@email.com"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Interesse Principal</label>
                                        <div className="relative">
                                            <select
                                                name="service"
                                                required
                                                value={formState.service}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white appearance-none focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all cursor-pointer"
                                            >
                                                <option value="" disabled className="bg-brand-black text-gray-500">Selecione uma opção</option>
                                                <option value="Estratégia Completa (360º)" className="bg-brand-black">Estratégia Completa (360º)</option>
                                                <option value="Implementação de CRM" className="bg-brand-black">Implementação de CRM</option>
                                                <option value="Funil de Vendas" className="bg-brand-black">Funil de Vendas</option>
                                                <option value="Gestão de Social Media" className="bg-brand-black">Gestão de Social Media</option>
                                                <option value="Site / Landing Page" className="bg-brand-black">Site / Landing Page</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Qualification Fields */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Nicho de Mercado</label>
                                        <input
                                            type="text"
                                            name="niche"
                                            value={formState.niche}
                                            onChange={handleChange}
                                            placeholder="Ex: E-commerce de Joias"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Faturamento Atual</label>
                                        <input
                                            type="text"
                                            name="revenue"
                                            value={formState.revenue}
                                            onChange={handleChange}
                                            placeholder="Ex: R$ 50k - R$ 100k"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Meta de Crescimento</label>
                                        <input
                                            type="text"
                                            name="growthGoal"
                                            value={formState.growthGoal}
                                            onChange={handleChange}
                                            placeholder="Ex: Dobrar faturamento"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400 ml-2">Orçamento Aproximado</label>
                                        <input
                                            type="text"
                                            name="estimatedBudget"
                                            value={formState.estimatedBudget}
                                            onChange={handleChange}
                                            placeholder="Ex: R$ 5k - R$ 10k"
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 ml-2">Maior Gargalo Hoje</label>
                                    <input
                                        type="text"
                                        name="bottleneck"
                                        value={formState.bottleneck}
                                        onChange={handleChange}
                                        placeholder="O que mais impede seu crescimento hoje?"
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 ml-2">Sobre o Projeto</label>
                                    <textarea
                                        name="message"
                                        required
                                        value={formState.message}
                                        onChange={handleChange}
                                        placeholder="Conte um pouco sobre seu momento atual e objetivos..."
                                        rows={4}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full bg-white text-brand-black font-bold py-5 rounded-full hover:bg-brand-lime hover:shadow-[0_10px_40px_rgba(204,255,0,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {status === 'submitting' ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            Solicitar Diagnóstico
                                            <div className="bg-black text-white p-1 rounded-full group-hover:bg-brand-blue transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/10 pt-16">
                    <div className="col-span-2 md:col-span-1">
                        <span className="text-2xl font-bold text-white">Elizabeth<span className="text-brand-lime">.</span></span>
                        <p className="text-gray-500 mt-4 text-sm">
                            Soluções digitais de alta performance para empresas que querem vender mais. Do post ao contrato.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Serviços</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><a href="#" className="hover:text-brand-lime transition-colors">Sistemas Web & Apps</a></li>
                            <li><a href="#" className="hover:text-brand-lime transition-colors">Social Media Strategy</a></li>
                            <li><a href="#" className="hover:text-brand-lime transition-colors">Consultoria de CX</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Links Úteis</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><a href="#" className="hover:text-brand-lime transition-colors">Portfólio</a></li>
                            <li><a href="#" className="hover:text-brand-lime transition-colors">Sobre Mim</a></li>
                            <li><a href="#" className="hover:text-brand-lime transition-colors">Diagnóstico Gratuito</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Redes</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-brand-lime hover:border-brand-lime hover:text-brand-black transition-all">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-brand-lime hover:border-brand-lime hover:text-brand-black transition-all">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600">
                    <p 
                        className="cursor-pointer select-none animate-pulse-subtle relative z-50 pointer-events-auto"
                        onDoubleClick={() => {
                            if (onOpenAdmin) {
                                console.log('Admin triggered via copyright double-click');
                                onOpenAdmin();
                            }
                        }}
                    >
                        © {new Date().getFullYear()} Elizabeth Celina. Todos os direitos reservados.
                    </p>
                    <p>Feito com estratégia & código.</p>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes pulse-subtle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .animate-pulse-subtle:hover {
            animation: pulse-subtle 2s infinite ease-in-out;
        }
      `}</style>
        </footer>
    );
};