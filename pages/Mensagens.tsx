
import React, { useState, useRef, useEffect } from 'react';
import { talkToJabuti, checkHardwareCapability } from '../services/geminiService';
import { Icons } from '../constants';
import Jabuti from '../components/Brand/Jabuti';

export default function Mensagens() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Diretor de Inteligência Jabuti online. Meus sistemas de auditoria e pesquisa web estão ativos. O que vamos orquestrar hoje?', engine: 'v3.5 (Grounding Active)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hw, setHw] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkHardwareCapability().then(setHw);
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await talkToJabuti(input);
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.text, 
          engine: result.engine, 
          sources: result.sources,
          timestamp: new Date() 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Minha conexão com o banco de dados global falhou. Tente novamente.", engine: "System" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Icons.Brain />
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tighter">CENTRAL JABUTI</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Orquestrador Grounded v3.5</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Web Search Active
             </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[32px] shadow-2xl relative ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none backdrop-blur-sm'}`}>
                <p className="text-sm leading-relaxed font-medium">{m.content}</p>
                
                {m.sources && m.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Icons.Sparkles /> Fontes Verificadas pela IA
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {m.sources.map((s: any, idx: number) => (
                                <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                    <div className="text-blue-500"><Icons.Link /></div>
                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-white truncate">{s.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {m.engine && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Processamento: {m.engine}</span>
                    {m.sources && <div className="text-emerald-500 flex items-center gap-1 text-[8px] font-black uppercase"><Icons.Sparkles /> Verificado</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="px-6 py-4 bg-slate-900/50 rounded-full border border-blue-500/20 animate-pulse flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Jabuti Consultando a Rede Global...</span>
               </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
          <div className="flex gap-4 bg-slate-950 p-3 rounded-3xl border border-slate-800 focus-within:border-blue-500/50 transition-all">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Peça uma pesquisa de mercado ou diretrizes estratégicas..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 text-white placeholder:text-slate-700"
            />
            <button type="submit" disabled={isTyping} className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all shadow-xl active:scale-95 disabled:opacity-50">
              <Icons.Plus />
            </button>
          </div>
        </form>
      </div>

      <div className="w-full lg:w-[320px] space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl overflow-hidden relative group">
           <div className="absolute inset-0 bg-blue-600/5 opacity-20 group-hover:opacity-40 transition-opacity" />
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-40 h-40 mb-4">
                <Jabuti state={isTyping ? 'thinking' : 'idle'} subState={isTyping ? 'web-search' : undefined} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Monitor Jabuti</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6 text-center">IA de Grounding v3.5</p>
              
              <div className="w-full space-y-4">
                 <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Status de Conexão</p>
                    <p className="text-[10px] text-white font-bold">Pesquisa Web: ATIVA</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
