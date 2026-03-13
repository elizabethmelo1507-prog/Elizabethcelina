import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SectionId } from '../types';

interface NavbarProps {
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Início', id: SectionId.HERO },
    { label: 'Sobre', id: SectionId.ABOUT },
    { label: 'Serviços', id: SectionId.SERVICES },
    { label: 'Processo', id: SectionId.PROCESS },
    { label: 'Portfólio', id: SectionId.WORK },
    { label: 'Resultados', id: SectionId.RESULTS },
    { label: 'Consultoria AI', id: SectionId.AI_CONSULTANT },
  ];

  return (
    <nav className={`fixed w-full z-50 fade-scale d-100 transition-all duration-500 ${scrolled || isOpen ? 'bg-brand-blue/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,53,197,0.2)] py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer relative z-50 select-none"
            onClick={() => scrollToSection(SectionId.HERO)}
            title="Elizabeth Celina"
          >
            <span className="text-2xl font-extrabold tracking-tighter text-white hover:text-brand-lime transition-colors duration-300">
              Elizabeth<span className="text-brand-lime">.</span>
            </span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-white/90 hover:text-brand-lime transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollToSection(SectionId.CONTACT)}
                className="bg-brand-lime text-brand-blue px-7 py-2.5 rounded-full font-bold text-sm hover:bg-white hover:text-brand-black hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all duration-300"
              >
                Contratar
              </button>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden relative z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-white/10 p-2 rounded-full text-white hover:text-brand-lime focus:outline-none backdrop-blur-sm"
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-brand-blue/95 backdrop-blur-xl flex flex-col pt-24 px-4 pb-6 overflow-y-auto animate-fadeIn">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-white hover:text-brand-lime block px-3 py-4 rounded-xl text-xl font-bold w-full text-left border-b border-white/5 hover:bg-white/5 transition-all"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection(SectionId.CONTACT)}
              className="w-full mt-8 bg-brand-lime text-brand-blue font-bold px-3 py-5 rounded-full text-lg shadow-xl shadow-brand-lime/20"
            >
              Falar com Elizabeth
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};