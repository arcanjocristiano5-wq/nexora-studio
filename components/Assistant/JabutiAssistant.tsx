
import React, { useState, useEffect, useRef } from 'react';
import { talkToJabuti } from '../../services/geminiService';
import { Icons } from '../../constants';
import Jabuti from '../Brand/Jabuti';

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
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
      
      recognitionRef.current.onresult = async (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.toLowerCase();
        const wakeWord = settings.wakeWord?.toLowerCase() || 'jabuti';
        
        if (text.includes(wakeWord)) {
          console.log(`Jabuti: Wake Word detectada.`);
          setIsListening(true);
          const userPrompt = text.split(wakeWord).pop()?.trim();
          if (userPrompt) {
            handleAutoSend(userPrompt);
          }
        }
      };
      
      try {
        recognitionRef.current.start();
      } catch(e) {}
    }
    return () => recognitionRef.current?.stop();
  }, []);

  const handleAutoSend = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    try {
      const response = await talkToJabuti(text, true); // True ativa o TTS
      setActiveEngine(response.engine);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text, engine: response.engine }]);
    } finally {
      setIsTyping(false);
      setIsListening(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const currentInput = input;
    setInput('');
    handleAutoSend(currentInput);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/90 backdrop-blur-2xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12">
            <Jabuti state={isListening ? 'listening' : isTyping ? 'thinking' : 'idle'} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-tighter">DIRETOR JABUTI</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {isListening ? 'Escutando você...' : activeEngine ? `Ativo: ${activeEngine}` : 'Sistema Híbrido v3.0'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"><Icons.Trash /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-xs shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5'}`}>
              {m.content}
              {m.engine && <div className="mt-3 pt-3 border-t border-white/5 text-[8px] font-black uppercase opacity-40">Processado via {m.engine}</div>}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center text-[9px] font-black text-blue-500 uppercase animate-pulse">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
            Orquestrando Voz e Pensamento...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-900/50 border-t border-white/5">
        <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner group focus-within:border-blue-500/50 transition-all">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Fale "${JSON.parse(localStorage.getItem('nexora_system_settings') || '{}').wakeWord || 'Jabuti'}" ou digite...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder:text-slate-700 px-4"
          />
          <button type="submit" className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-lg transition-all active:scale-95">
             <Icons.Plus />
          </button>
        </div>
      </form>
    </div>
  );
}
