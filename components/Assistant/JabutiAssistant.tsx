import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { decodeAudio, decodeAudioData, createPcmBlob } from '../../services/audioUtils';
import { talkToJabuti, createProjectWithAI, generateDialogue } from '../../services/geminiService';
import { Icons } from '../../constants';
import Jabuti from '../Brand/Jabuti';
import { SystemSettings, AIConfiguration, LocalModelDeployment, Story } from '../../types';

// FIX: Add global declaration for SpeechRecognition to fix TypeScript errors in browsers.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [confirmation, setConfirmation] = useState<{ prompt: string } | null>(null);
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<SystemSettings | null>(() => {
    const saved = localStorage.getItem('nexora_system_settings_v4');
    return saved ? JSON.parse(saved) : null;
  });
  
  // FIX: Use 'any' for simplicity as SpeechRecognition might not be in default TS types.
  const recognitionRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);


  useEffect(() => {
    const handleStorage = () => {
        const saved = localStorage.getItem('nexora_system_settings_v4');
        if (saved) setSettings(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const allModels: (AIConfiguration | LocalModelDeployment)[] = [...(settings?.activeModels || []), ...(settings?.localModels || [])];
  const currentBrain = allModels.find(m => m.id === settings?.primaryBrainId) || settings?.activeModels[0];
  
  const speak = async (text: string) => {
    if (currentSourceRef.current) currentSourceRef.current.stop();
    
    const base64Audio = await generateDialogue(text);
    if (base64Audio) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioBuffer = await decodeAudioData(decodeAudio(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      currentSourceRef.current = source;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || confirmation) return;

    const lowerInput = input.toLowerCase();
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (isListening) toggleListen();

    const allCreationTriggers = [
        "faça todo o processo", "produção automática", "crie o filme completo", "faça o filme",
        "crie a história", "crie uma história", "crie um projeto", "crie uma série", "nova história sobre", "novo projeto sobre"
    ];
    const creationTrigger = allCreationTriggers.find(p => lowerInput.includes(p));

    if (creationTrigger) {
      const idea = input.substring(lowerInput.indexOf(creationTrigger) + creationTrigger.length).replace(/^de\s/i, '').replace(/^sobre\s/i, '').trim();
      setConfirmation({ prompt: idea || 'uma história de ficção científica' });
      const confirmationText = `Confirmação necessária. Iniciar produção automática completa para "${idea}"? Este processo é intensivo.`;
      speak(confirmationText);
      return;
    }
    
    setIsTyping(true);
    try {
        const result = await talkToJabuti(input);
        const assistantMsg = { 
            role: 'assistant', 
            content: result.text, 
            engine: result.engine,
            sources: result.sources 
        };
        setMessages(prev => [...prev, assistantMsg]);
        speak(result.text);
    } catch (err) {
        const errorMsg = "Houve uma interferência na minha rede de pesquisa. Tente novamente, Diretor.";
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, engine: "System Error" }]);
        speak(errorMsg);
    } finally {
        setIsTyping(false);
    }
  };

  const handleConfirmProduction = async () => {
    if (!confirmation) return;
    setIsTyping(true);
    setConfirmation(null);
    speak(`Entendido, Diretor. Iniciando produção para "${confirmation.prompt}".`);
    
    try {
      const isSeries = confirmation.prompt.toLowerCase().includes('série');
      const { title, description } = await createProjectWithAI(confirmation.prompt, isSeries ? 'series' : 'story');

      const newProject: Story = {
        id: `proj-${crypto.randomUUID()}`,
        title,
        description,
        status: 'draft',
        scenes: [],
        characters: [],
        subtitleStyleId: 'cinematic',
        visualStyleId: 'realistic-2.0',
        isMiniSeries: isSeries
      };
      
      const currentProjects: Story[] = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
      localStorage.setItem('nexora_custom_projects_v1', JSON.stringify([newProject, ...currentProjects]));
      window.dispatchEvent(new Event('nexora_projects_updated'));

      navigate(`/producao-automatica/${newProject.id}`);
      onClose();

    } catch(e) {
      const errorMsg = "O Jabuti não conseguiu iniciar a produção. Verifique sua conexão e tente novamente.";
      alert(errorMsg);
      speak(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // FIX: window.SpeechRecognition is now available due to global declaration.
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let final_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          }
        }
        if (final_transcript) {
          setInput(prev => prev + final_transcript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/95 backdrop-blur-3xl border-l border-white/5 shadow-[-20px_0_100px_rgba(0,0,0,0.9)] overflow-hidden relative">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Jabuti state={isTyping ? 'thinking' : (isListening ? 'speaking' : 'idle')} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-tighter leading-none mb-1">JABUTI CORE</h3>
            <div className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                MASTER: {currentBrain?.name || 'SYNC'}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all text-slate-500"><Icons.Trash /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5'}`}>
              {m.content}
              {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                      {m.sources.map((s: any, idx: number) => (
                          <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="bg-slate-950/50 hover:bg-slate-950 px-2 py-1 rounded text-[8px] text-slate-400 hover:text-white transition-all truncate max-w-[120px]">
                              {s.title}
                          </a>
                      ))}
                  </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
             <div className="flex justify-start"><div className="bg-slate-900 p-3 rounded-2xl animate-pulse text-[10px] text-slate-500 uppercase font-black">Jabuti Pensando...</div></div>
        )}
      </div>

      {confirmation ? (
        <div className="p-4 bg-slate-900/50 border-t border-white/5 space-y-3">
          <p className="text-center text-[10px] font-bold text-amber-400 uppercase tracking-widest">Confirmação Necessária</p>
          <p className="text-center text-xs text-slate-300">Iniciar produção automática completa para <strong className="text-white">"{confirmation.prompt}"</strong>? Este processo é intensivo.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmation(null)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg">Cancelar</button>
            <button onClick={handleConfirmProduction} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg">Confirmar e Iniciar</button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/50 border-t border-white/5">
          <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/10">
            <button 
              type="button" 
              onClick={toggleListen}
              className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-400'}`}
            >
              <Icons.Music />
            </button>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isListening ? "Escutando..." : "Orquestrar do Roteiro ao Export..."}
              className="flex-1 bg-transparent border-none text-[11px] text-white px-3 outline-none"
            />
            <button type="submit" disabled={isTyping || !input.trim()} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white disabled:opacity-50">
               <Icons.Plus />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}