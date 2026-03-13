import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { SectionId } from '../types';

export const Hero: React.FC = () => {
  const scrollToContact = () => {
    document.getElementById(SectionId.CONTACT)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id={SectionId.HERO} className="relative min-h-[95vh] flex items-center bg-brand-blue pt-32 pb-12 md:pt-20 overflow-hidden bg-mesh">
      {/* Dynamic Overlay for better readability */}
      <div className="absolute inset-0 bg-brand-blue/40 backdrop-blur-[2px] z-0"></div>

      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-lime/30 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse hidden md:block z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/20 rounded-full mix-blend-overlay filter blur-[150px] opacity-30 animate-pulse hidden md:block z-0 pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Decorative Doodles */}
      <div className="hidden sm:block absolute top-32 left-10 text-brand-lime animate-float opacity-40 z-10">
        <svg width="60" height="60" viewBox="0 0 50 50" fill="currentColor">
          <path d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20Z" />
        </svg>
      </div>

      <div className="absolute bottom-20 right-20 text-brand-lime animate-spin-slow opacity-30 hidden md:block z-10">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M50 0C60 20 80 40 100 50C80 60 60 80 50 100C40 80 20 60 0 50C20 40 40 20 50 0Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="flex flex-col items-center justify-center gap-12 lg:gap-16">

          <div className="w-full max-w-5xl text-center flex flex-col items-center">
            {/* Premium Tag */}
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card border border-white/10 shadow-[0_0_30px_rgba(204,255,0,0.15)] mb-8 md:mb-12 fade-scale d-200 hover:border-brand-lime/50 transition-all duration-500 cursor-default group">
              <Sparkles size={16} className="text-brand-lime animate-pulse" />
              <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase text-white/90 group-hover:text-brand-lime transition-colors">Social Media • Funis • Sistemas</span>
            </div>

            {/* Headline */}
            <div className="relative inline-block text-center w-full">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white mb-8 md:mb-12 leading-[0.85] md:leading-[0.8] relative">
                {/* Floating Star */}
                <div className="absolute -top-16 -left-8 md:-left-20 fade-scale d-800 text-brand-lime hidden lg:block">
                  <svg className="w-16 h-16 animate-[spin_15s_linear_infinite] drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
                  </svg>
                </div>

                <div className="mask-container pb-4 w-full">
                  <div className="mask-element d-300">Do Post ao</div>
                </div>

                <div className="mask-container pb-4 relative z-10 w-full">
                  <div className="mask-element d-400 relative inline-block text-brand-lime">
                    Contrato,
                    {/* SVG Underline */}
                    <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-6 md:h-8 draw-line d-800 z-[-1]" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path d="M0,8 Q50,-2 100,6" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" pathLength="100" />
                    </svg>
                  </div>
                </div>

                <div className="mask-container pb-4 w-full">
                  <div className="mask-element d-500">Tudo</div>
                </div>
                <div className="mask-container pb-4 w-full">
                  <div className="mask-element d-600 outline-text text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', textStroke: '1px rgba(255,255,255,0.4)' }}>Conectado.</div>
                </div>
              </h1>
            </div>

            {/* Subtext */}
            <div className="mask-container w-full max-w-3xl mx-auto">
              <p className="mask-element d-800 mt-4 md:mt-8 text-lg sm:text-xl md:text-3xl text-white/70 font-light leading-relaxed mb-10 md:mb-14 text-center max-w-3xl mx-auto">
                Desenvolvo a <span className="text-white font-medium italic underline decoration-brand-lime/50 underline-offset-4">estratégia narrativa</span> que atrai e o <span className="text-white font-medium italic underline decoration-brand-lime/50 underline-offset-4">sistema técnico</span> que fecha a venda.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto fade-scale d-1000 mt-4">
              <Button onClick={scrollToContact} variant="primary" className="!h-16 !px-10 !bg-white !text-brand-blue hover:!bg-brand-lime hover:!text-brand-blue w-full sm:w-auto justify-center mx-auto shadow-[0_20px_40px_rgba(255,255,255,0.15)] hover:shadow-[0_20px_60px_rgba(204,255,0,0.4)] group text-xl font-black">
                Escalar Agora
                <div className="bg-brand-black rounded-full p-2 ml-3 text-white group-hover:bg-brand-blue group-hover:translate-x-2 transition-all">
                  <ArrowRight size={18} />
                </div>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};