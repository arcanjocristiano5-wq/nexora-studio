
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, GenerateContentResponse } from '@google/genai';
import { decodeAudio, decodeAudioData, createPcmBlob } from '../../services/audioUtils';
import { Icons } from '../../constants';
import Jabuti from '../Brand/Jabuti';
import { SystemSettings, AIConfiguration, LocalModelDeployment } from '../../types';

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [input, setInput] = useState('');
  const [showBrainSelector, setShowBrainSelector] = useState(false);
  
  // Estados para transcrição em tempo real
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');

  // Carregar configurações do sistema
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('nexora_system_settings_v4');
    return saved ? JSON.parse(saved) : null;
  });

  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentBrain = settings?.activeModels.find(m => m.id === settings.primaryBrainId) || 
                     settings?.localModels.find(m => m.id === settings.primaryBrainId) || 
                     settings?.activeModels[0];

  const connectLive = async () => {
    if (isLive || isConnecting) return;
    setIsConnecting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {}, 
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: 'Você é o Jabuti, Diretor Criativo Executivo da NEXORA. Responda sempre em português brasileiro de forma inspiradora.',
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                setCurrentInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
                setCurrentOutputTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
                setMessages(prev => [
                    ...prev, 
                    { role: 'user', content: currentInputTranscription || "(Voz Detectada)" },
                    { role: 'assistant', content: currentOutputTranscription, engine: 'Live Neural' }
                ]);
                setCurrentInputTranscription('');
                setCurrentOutputTranscription('');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextsRef.current) {
                const { output } = audioContextsRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
                const audioBuffer = await decodeAudioData(decodeAudio(base64Audio), output, 24000, 1);
                const source = output.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(output.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: (e) => { setIsLive(false); setIsConnecting(false); },
          onclose: () => { setIsLive(false); }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { setIsConnecting(false); }
  };

  /**
   * Terminates the active live session and releases audio resources.
   */
  const disconnectLive = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
      audioContextsRef.current = null;
    }
    setIsLive(false);
    nextStartTimeRef.current = 0;
    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source already stopped or not started
      }
    });
    sourcesRef.current.clear();
  };

  const handleBrainChange = (id: string) => {
    const updated = { ...settings, primaryBrainId: id };
    setSettings(updated as SystemSettings);
    localStorage.setItem('nexora_system_settings_v4', JSON.stringify(updated));
    setShowBrainSelector(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);
    // Simulação de roteamento baseado no cérebro escolhido
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const res: GenerateContentResponse = await ai.models.generateContent({
            model: (currentBrain as AIConfiguration)?.modelName || 'gemini-3-flash-preview',
            contents: userMsg,
            config: { systemInstruction: 'Você é o Jabuti, Diretor Criativo da NEXORA.' }
        });
        setMessages(prev => [...prev, { role: 'assistant', content: res.text, engine: currentBrain?.name }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950/90 backdrop-blur-2xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
      
      {/* Brain Selector Popover */}
      {showBrainSelector && (
        <div className="absolute top-20 left-6 right-6 z-[60] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-top-4">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 px-2">Escolha o Cérebro Ativo</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] font-black text-slate-600 uppercase px-2">Cloud Models</p>
                {settings?.activeModels.map(m => (
                    <button 
                        key={m.id} 
                        onClick={() => handleBrainChange(m.id)}
                        className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${settings.primaryBrainId === m.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        {m.name}
                        <span className="text-[8px] opacity-50 uppercase">{m.modelName}</span>
                    </button>
                ))}
                <div className="border-t border-slate-800 my-2 pt-2">
                    <p className="text-[9px] font-black text-slate-600 uppercase px-2">Local Workers</p>
                    {settings?.localModels.filter(m => m.status === 'ready').map(m => (
                        <button 
                            key={m.id} 
                            onClick={() => handleBrainChange(m.id)}
                            className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${settings.primaryBrainId === m.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                        >
                            {m.name}
                            <span className="text-[8px] opacity-50 uppercase">Local GPU</span>
                        </button>
                    ))}
                    {settings?.localModels.filter(m => m.status !== 'ready').map(m => (
                        <div key={m.id} className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-700 italic">
                            {m.name}
                            <span className="text-[8px] uppercase">Não Instalado</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12">
            <Jabuti state={isLive ? 'speaking' : isConnecting ? 'thinking' : 'idle'} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-tighter">DIRETOR JABUTI</h3>
            <button 
                onClick={() => setShowBrainSelector(!showBrainSelector)}
                className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-all"
            >
              Cérebro: {currentBrain?.name || 'Selecione'}
              <Icons.ArrowDown />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={isLive ? disconnectLive : connectLive}
              className={`p-3 rounded-xl transition-all ${isLive ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white shadow-lg'}`}
            >
                {isConnecting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isLive ? <Icons.Trash /> : <Icons.Plus />)}
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"><Icons.Trash /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-xs shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5'}`}>
              {m.content}
              {m.engine && <div className="mt-3 pt-3 border-t border-white/5 text-[8px] font-black uppercase opacity-40">Via {m.engine}</div>}
            </div>
          </div>
        ))}
        {currentInputTranscription && (
            <div className="flex justify-end animate-pulse"><div className="max-w-[85%] p-5 rounded-3xl text-xs bg-blue-900/40 text-blue-100 italic">{currentInputTranscription}</div></div>
        )}
        {currentOutputTranscription && (
            <div className="flex justify-start"><div className="max-w-[85%] p-5 rounded-3xl text-xs bg-slate-800 text-slate-300 italic border border-blue-500/20">{currentOutputTranscription}</div></div>
        )}
        {isTyping && (
          <div className="flex gap-2 items-center text-[9px] font-black text-blue-500 uppercase animate-pulse">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
            Orquestrando via {currentBrain?.name}...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-slate-900/50 border-t border-white/5">
        <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isLive ? "Escutando..." : "Envie um comando..."}
            className="flex-1 bg-transparent border-none text-xs text-white px-4 outline-none"
          />
          <button type="submit" className="p-3 bg-blue-600 rounded-xl text-white">
             <Icons.Plus />
          </button>
        </div>
      </form>
    </div>
  );
}
