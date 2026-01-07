import React, { useState, useEffect, useRef } from 'react';
import { talkToJabuti, generateDialogue } from '../../services/geminiService';
import { Icons } from '../../constants';
import Jabuti from '../Brand/Jabuti';
import { SystemSettings } from '../../types';
import { decodeAudio, decodeAudioData } from '../../services/audioUtils';

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [engineType, setEngineType] = useState<'cloud' | 'local'>('cloud');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const settingsRaw = localStorage.getItem('nexora_system_settings_v4');
    if (settingsRaw) {
        const settings: SystemSettings = JSON.parse(settingsRaw);
        if (settings.primaryBrainId?.startsWith('l')) {
            setEngineType('local');
        } else {
            setEngineType('cloud');
        }
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping, input]);

  const speak = async (text: string) => {
    if (engineType === 'local') {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
        return;
    }

    try {
        const base64Audio = await generateDialogue(text);
        if (base64Audio) {
            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioData = decodeAudio(base64Audio.replace('data:audio/pcm;base64,', ''));
            const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
            
            if (currentSourceRef.current) currentSourceRef.current.stop();
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
            currentSourceRef.current = source;
        }
    } catch (e) {
        console.error("Erro ao tocar áudio da API:", e);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const result = await talkToJabuti(textToSend);
        const assistantMsg = { 
            role: 'assistant', 
            content: result.text, 
            engine: result.engine,
            sources: result.sources 
        };
        setMessages(prev => [...prev, assistantMsg]);
        await speak(result.text);
    } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Erro na conexão.", engine: "System" }]);
    } finally {
        setIsTyping(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      handleSendMessage(input);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return alert("Voz não suportada.");
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.onresult = (e: any) => {
          const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
          setInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10"><Jabuti state={isTyping ? 'thinking' : (isListening ? 'listening' : 'idle')} /></div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Jabuti Assistant</h3>
            <p className="text-[8px] font-bold text-blue-500 uppercase">{engineType === 'local' ? 'Engine Local WebGPU' : 'Cloud Neural'}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><Icons.Trash /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isListening && input && (
            <div className="flex justify-end opacity-50">
                <div className="bg-blue-900/30 p-3 rounded-2xl text-[10px] text-blue-400 italic">Escutando: {input}...</div>
            </div>
        )}
        {isTyping && <div className="text-[10px] text-slate-600 font-black uppercase animate-pulse">Jabuti está processando...</div>}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
        <form onSubmit={e => { e.preventDefault(); handleSendMessage(input); }} className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <button type="button" onClick={toggleListen} className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}><Icons.Music /></button>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={isListening ? "Escutando Diretor..." : "Fale ou digite um comando..."} className="flex-1 bg-transparent border-none text-xs text-white focus:ring-0 outline-none" />
          <button type="submit" disabled={isTyping || !input.trim()} className="p-3 bg-blue-600 rounded-xl text-white disabled:opacity-50"><Icons.Plus /></button>
        </form>
      </div>
    </div>
  );
}