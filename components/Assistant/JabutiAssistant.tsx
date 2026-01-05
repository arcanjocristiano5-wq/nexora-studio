
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { decodeAudio, decodeAudioData, createPcmBlob } from '../../services/audioUtils';
import { talkToJabuti } from '../../services/geminiService';
import { Icons } from '../../constants';
import Jabuti from '../Brand/Jabuti';
import { SystemSettings, AIConfiguration } from '../../types';

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [input, setInput] = useState('');
  
  const [settings, setSettings] = useState<SystemSettings | null>(() => {
    const saved = localStorage.getItem('nexora_system_settings_v4');
    return saved ? JSON.parse(saved) : null;
  });

  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);

  // Escuta atualizações de cérebro master
  useEffect(() => {
    const handleStorage = () => {
        const saved = localStorage.getItem('nexora_system_settings_v4');
        if (saved) setSettings(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const currentBrain = settings?.activeModels.find(m => m.id === settings.primaryBrainId) || 
                     settings?.activeModels[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const result = await talkToJabuti(input);
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: result.text, 
            engine: result.engine,
            sources: result.sources 
        }]);
    } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Houve uma interferência na minha rede de pesquisa. Tente novamente, Diretor.", engine: "System Error" }]);
    } finally {
        setIsTyping(false);
    }
  };

  const connectLive = async () => {
    if (isLive || isConnecting) return;
    setIsConnecting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      // Sempre usa a chave do cérebro primário se existir
      const ai = new GoogleGenAI({ apiKey: currentBrain?.apiKey || process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `Você é o Jabuti, Diretor Criativo da NEXORA. Use o cérebro: ${currentBrain?.name}.`,
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                sessionPromise.then(session => session.sendRealtimeInput({ media: createPcmBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextsRef.current) {
                const { output } = audioContextsRef.current;
                const audioBuffer = await decodeAudioData(decodeAudio(base64Audio), output, 24000, 1);
                const source = output.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(output.destination);
                source.start();
            }
          },
          onerror: () => { setIsLive(false); setIsConnecting(false); },
          onclose: () => { setIsLive(false); }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setIsConnecting(false); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/95 backdrop-blur-3xl border-l border-white/5 shadow-[-20px_0_100px_rgba(0,0,0,0.9)] overflow-hidden relative">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Jabuti state={isLive ? 'speaking' : isConnecting ? 'thinking' : 'idle'} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-tighter leading-none mb-1">JABUTI CORE</h3>
            <div className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                MASTER: {currentBrain?.name || 'SYNC'}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
            <button 
              onClick={isLive ? () => sessionRef.current?.close() : connectLive}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isLive ? 'bg-red-500/10 text-red-500' : 'bg-blue-600 text-white shadow-xl'}`}
            >
                {isConnecting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isLive ? <Icons.Trash /> : <Icons.Plus />)}
            </button>
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

      <div className="p-4 bg-slate-900/50 border-t border-white/5">
        <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/10">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isLive ? "Escutando..." : "Orquestrar do Roteiro ao Export..."}
            className="flex-1 bg-transparent border-none text-[11px] text-white px-3 outline-none"
          />
          <button type="submit" disabled={isTyping} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white">
             <Icons.Plus />
          </button>
        </form>
      </div>
    </div>
  );
}
