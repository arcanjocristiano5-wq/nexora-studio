
import React, { useState, useRef, useEffect } from 'react';
import { generateText, checkHardwareCapability } from '../services/geminiService';
import { Icons } from '../constants';
import Jabuti from '../components/Brand/Jabuti';

export default function Mensagens() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Diretor de Inteligência Jabuti online. Meus sistemas de auditoria estão escaneando seus canais conectados para otimizar nossa próxima produção.', engine: 'v3.1' }
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
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await generateText(input, "Você é o estrategista chefe. Responda como se estivesse em uma sala de comando cinematográfica.");
      setMessages(prev => [...prev, { role: 'assistant', content: result.text, engine: 'cloud', timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-700">
      {/* PAINEL DE COMANDO (CHAT) */}
      <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Icons.Brain />
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tighter">CENTRAL JABUTI</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Orquestrador de Crescimento Ativo</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase">Neural Sync OK</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[32px] shadow-2xl relative ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none backdrop-blur-sm'}`}>
                <p className="text-sm leading-relaxed font-medium">{m.content}</p>
                {m.engine && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Mastering via {m.engine}</span>
                    <Icons.Sparkles />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="w-16 h-10 bg-slate-800 animate-pulse rounded-full flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
          <div className="flex gap-4 bg-slate-950 p-3 rounded-3xl border border-slate-800 focus-within:border-blue-500/50 transition-all">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Envie uma diretriz de produção ou peça uma auditoria..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 text-white placeholder:text-slate-700"
            />
            <button type="submit" className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all shadow-xl active:scale-95">
              <Icons.Plus />
            </button>
          </div>
        </form>
      </div>

      {/* PAINEL LATERAL DE STATUS (LEARNING MONITOR) */}
      <div className="w-full lg:w-[320px] space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl overflow-hidden relative group">
           <div className="absolute inset-0 bg-blue-600/5 opacity-20 group-hover:opacity-40 transition-opacity" />
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-40 h-40 mb-4">
                <Jabuti state={isTyping ? 'thinking' : 'idle'} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Monitor Jabuti</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6 text-center">IA Direcional v3.1</p>
              
              <div className="w-full space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                       <span>Aprendizado de Canais</span>
                       <span className="text-blue-500">88%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 animate-[progress_5s_infinite]" style={{ width: '88%' }} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                       <span>Compliance de Diretrizes</span>
                       <span className="text-emerald-500">100%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8">
           <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Últimas Auditorias</h3>
           <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                 <div className="text-blue-500"><Icons.Series /></div>
                 <div>
                    <p className="text-[11px] font-bold text-white uppercase">YouTube Master</p>
                    <p className="text-[9px] text-slate-500">DNA extraído há 2h</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                 <div className="text-purple-500"><Icons.Stories /></div>
                 <div>
                    <p className="text-[11px] font-bold text-white uppercase">TikTok Stories</p>
                    <p className="text-[9px] text-slate-500">Aguardando auditoria</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
