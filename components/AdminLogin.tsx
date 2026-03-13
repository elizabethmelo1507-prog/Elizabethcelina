import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AdminLoginProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setStatus('success');
        setTimeout(() => {
          onLoginSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-brand-black flex items-center justify-center animate-fadeIn">
        <div className="text-center">
          <div className="w-24 h-24 bg-brand-lime rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(204,255,0,0.3)]">
            <ShieldCheck size={48} className="text-brand-blue" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Acesso Permitido</h2>
          <p className="text-gray-400">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-black/95 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-brand-black border border-white/10 rounded-3xl p-8 shadow-2xl animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 text-brand-lime">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Área Administrativa</h2>
          <p className="text-gray-500 text-sm mt-2">Acesso restrito para Elizabeth Celina.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-lime transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                placeholder="elizabethmelo1507@gmail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-lime transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              Credenciais inválidas. Tente novamente.
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-brand-lime text-brand-blue font-bold py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {status === 'loading' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Entrar no Sistema
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
            animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};