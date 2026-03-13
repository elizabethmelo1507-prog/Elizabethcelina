import React, { useState } from 'react';
import { Mail, Phone, User, Briefcase, Send, CheckCircle2, ArrowRight, Loader2, Target, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

export const PublicContactLead: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        niche: '',
        revenue: '',
        growthGoal: '',
        estimatedBudget: '',
        bottleneck: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const { error } = await supabase.from('leads').insert({
                name: formData.name,
                company_name: formData.company,
                email: formData.email,
                phone: formData.phone,
                status: 'Novo Lead',
                niche: formData.niche,
                revenue: formData.revenue,
                growth_goal: formData.growthGoal,
                estimated_budget: formData.estimatedBudget,
                bottleneck: formData.bottleneck,
                history: [{
                    id: Date.now(),
                    date: new Date().toLocaleDateString('pt-BR'),
                    text: `Lead qualificado via formulário rápido. Interesse: ${formData.service}. Mensagem: ${formData.message}`,
                    type: 'system'
                }]
            });

            if (error) throw error;
            setStatus('success');
        } catch (err) {
            console.error('Error submitting lead:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center animate-fadeIn shadow-[0_0_50px_rgba(204,255,0,0.05)]">
                    <div className="w-20 h-20 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-brand-lime" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Estratégia Recebida!</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Excelente! Já recebi seus dados e comecei a analisar o perfil da sua empresa. Entrarei em contato em breve para agendarmos nosso diagnóstico estratégico.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-lime transition-all duration-300 shadow-lg"
                    >
                        Página Inicial <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-brand-lime selection:text-black relative overflow-x-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-lime/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_20px_rgba(204,255,0,0.1)]">
                        <Sparkles size={12} /> Diagnóstico Estratégico
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                        Sua próxima fase de <br />
                        <span className="text-brand-lime italic">escala começa aqui.</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Preencha os dados abaixo para que eu possa entender o momento atual do seu negócio e preparar uma solução sob medida.
                    </p>
                </div>

                <div className="bg-[#111113] border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden group">
                    {/* Glassmorphism border effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none"></div>
                    
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        {/* Seção 1: Identificação */}
                        <div>
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-6 h-[1px] bg-brand-lime/30"></span> Identificação
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <div className="relative group/input">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input required type="text" placeholder="Seu nome"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                    <div className="relative group/input">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input required type="email" placeholder="voce@empresa.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Negócio */}
                        <div>
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-6 h-[1px] bg-brand-lime/30"></span> Sobre o Negócio
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Empresa / Projeto</label>
                                    <div className="relative group/input">
                                        <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input required type="text" placeholder="Nome do seu negócio"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                                    <div className="relative group/input">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input required type="tel" placeholder="(00) 00000-0000"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nicho de Mercado</label>
                                    <div className="relative group/input">
                                        <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input type="text" placeholder="Ex: E-commerce, Infoprodutos..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.niche} onChange={(e) => setFormData({...formData, niche: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Faturamento Mensal</label>
                                    <div className="relative group/input">
                                        <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all appearance-none"
                                            value={formData.revenue} onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                                        >
                                            <option value="" disabled className="bg-[#111113]">Selecione uma faixa...</option>
                                            <option value="Até R$ 10k" className="bg-[#111113]">Até R$ 10k</option>
                                            <option value="R$ 10k - R$ 50k" className="bg-[#111113]">R$ 10k - R$ 50k</option>
                                            <option value="R$ 50k - R$ 100k" className="bg-[#111113]">R$ 50k - R$ 100k</option>
                                            <option value="Mais de R$ 100k" className="bg-[#111113]">Mais de R$ 100k</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Desafios */}
                        <div>
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-6 h-[1px] bg-brand-lime/30"></span> Objetivos e Desafios
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Meta de Crescimento</label>
                                    <div className="relative group/input">
                                        <TrendingUp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input type="text" placeholder="Ex: Dobrar as vendas..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.growthGoal} onChange={(e) => setFormData({...formData, growthGoal: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maior Gargalo Atual</label>
                                    <div className="relative group/input">
                                        <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-brand-lime transition-colors" />
                                        <input type="text" placeholder="O que mais te trava hoje?"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all"
                                            value={formData.bottleneck} onChange={(e) => setFormData({...formData, bottleneck: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem ou Detalhes Adicionais</label>
                                <textarea rows={4} placeholder="Conte um pouco mais sobre o que você busca..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-brand-lime/50 focus:bg-white/[0.08] transition-all resize-none"
                                    value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" disabled={status === 'submitting'}
                                className="w-full bg-brand-lime text-black font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-white transition-all duration-500 shadow-[0_20px_40px_rgba(204,255,0,0.15)] disabled:opacity-50 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <span className="relative z-10 flex items-center gap-3">
                                    {status === 'submitting' ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            SOLICITAR ANÁLISE ESTRATÉGICA
                                            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                        {status === 'error' && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-bold animate-shake">
                                Ops! Ocorreu um erro técnico. Por favor, tente novamente ou fale comigo via WhatsApp.
                            </div>
                        )}
                    </form>
                </div>
                
                <div className="mt-16 text-center">
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.4em] mb-4">Desenvolvido por</p>
                    <span className="text-xl font-bold text-white">Elizabeth<span className="text-brand-lime">.</span></span>
                    <p className="text-gray-600 text-[9px] mt-4 uppercase tracking-[0.2em]">© 2024 Todos os direitos reservados.</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 1s ease-out forwards;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}} />
        </div>
    );
};
