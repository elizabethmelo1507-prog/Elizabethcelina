import React, { useState, useRef, useEffect } from 'react';
import { SectionId, ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Sparkles, Send, Loader2, User, CornerRightDown } from 'lucide-react';
import { Button } from './Button';

export const AiConsultant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Olá! Sou a IA da Elizabeth. Como posso ajudar a otimizar sua empresa hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const responseText = await sendMessageToGemini(history, userMsg.text);
        
        const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id={SectionId.AI_CONSULTANT} className="py-24 bg-brand-black text-white relative overflow-hidden">
      
      {/* Decorative */}
      <div className="absolute top-10 right-10 text-brand-lime">
        <Sparkles size={48} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
            
            <div className="lg:w-1/3">
                <h2 className="text-5xl font-bold mb-6 flex items-start gap-2">
                    Dúvida
                    <CornerRightDown className="text-brand-lime mt-2" size={40} />
                </h2>
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Como começar?</h3>
                    <p className="text-gray-400 text-sm">Use o chat ao lado para entender como posso transformar seu negócio agora mesmo.</p>
                </div>
            </div>

            <div className="lg:w-2/3">
                <h2 className="text-5xl font-bold mb-6 flex items-start gap-2 justify-end text-right">
                    <div className="flex gap-2 text-brand-lime">
                        <Sparkles size={20} />
                        <span className="w-4 h-4 rounded-full bg-brand-blue block mt-2"></span>
                    </div>
                    Solução
                </h2>

                <div className="bg-brand-blue rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
                  {/* Chat Window */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
                  >
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${msg.role === 'user' ? 'bg-brand-lime border-brand-lime text-brand-blue' : 'bg-black border-white/20 text-white'}`}>
                            {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                          </div>
                          <div>
                              <div className={`p-6 rounded-[2rem] text-base leading-relaxed ${
                                msg.role === 'user' 
                                  ? 'bg-white text-brand-black rounded-tr-none' 
                                  : 'bg-black/40 text-white rounded-tl-none border border-white/10 backdrop-blur-sm'
                              }`}>
                                {msg.text}
                              </div>
                              <span className="text-xs text-white/30 mt-2 block px-2">
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                         <div className="flex max-w-[80%] gap-4">
                          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 border border-white/20">
                            <Sparkles size={20} className="text-brand-lime" />
                          </div>
                          <div className="bg-black/40 p-6 rounded-[2rem] rounded-tl-none border border-white/10 flex items-center gap-3">
                            <Loader2 size={20} className="animate-spin text-brand-lime" />
                            <span className="text-white/60">Analisando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 bg-black/20 backdrop-blur-md border-t border-white/10">
                    <div className="flex gap-3 bg-white/10 p-2 rounded-full border border-white/10 focus-within:bg-white/20 focus-within:border-brand-lime transition-all">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Pergunte sobre CRMs, Funis ou Vendas..."
                        className="flex-1 bg-transparent px-6 text-white placeholder-white/40 focus:outline-none"
                      />
                      <button 
                        onClick={handleSend} 
                        disabled={isLoading} 
                        className="w-12 h-12 bg-brand-lime rounded-full flex items-center justify-center text-brand-blue hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Send size={20} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};