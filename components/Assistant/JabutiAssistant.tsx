
import React, { useState, useEffect, useRef } from 'react';
import { talkToJabuti } from '../../services/geminiService';
import { Icons } from '../../constants';
import Jabuti from '../Brand/Jabuti';

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('nexora_system_settings') || '{}');
    if (!settings.voiceActivation) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';
      
      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.toLowerCase();
        
        const wakeWord = settings.wakeWord?.toLowerCase() || 'jabuti';
        if (text.includes(wakeWord)) {
          console.log(`Wake-word "${wakeWord}" detectada!`);
          // Aqui poderíamos acionar uma animação visual de escuta
        }
      };
      
      try {
        recognitionRef.current.start();
      } catch(e) { console.warn("Reconhecimento de voz já ativo."); }
    }
    return () => recognitionRef.current?.stop();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await talkToJabuti(input);
      setActiveEngine(response.engine);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text, engine: response.engine }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro no Enxame: ${err.message}`, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/80 backdrop-blur-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12"><Jabuti state={isTyping ? 'thinking' : 'idle'} /></div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-tighter">COMANDANTE JABUTI</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {activeEngine ? `Ativo: ${activeEngine}` : 'Swarm Controller v2.6'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><Icons.Trash /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-xs shadow-xl ${m.role === 'user' ? 'bg-blue-600 text-white' : m.isError ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-slate-900 text-slate-300'}`}>
              {m.content}
              {m.engine && <div className="mt-2 pt-2 border-t border-white/5 text-[8px] font-black uppercase opacity-40">Processado via {m.engine}</div>}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center text-[9px] font-black text-blue-500 uppercase animate-pulse">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
            Orquestrando Enxame Híbrido...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-900/40 border-t border-white/5">
        <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Diretriz para o Cérebro..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder:text-slate-700"
          />
          <button type="submit" className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-lg transition-all active:scale-95"><Icons.Plus /></button>
        </div>
      </form>
    </div>
  );
}
