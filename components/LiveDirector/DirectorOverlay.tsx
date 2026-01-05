
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createPcmBlob, decodeAudio, decodeAudioData } from '../../services/audioUtils';

const DirectorOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      // Initialize GoogleGenAI with API key from environment exclusively
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: 'Você é o Diretor Criativo Executivo da NEXORA. Você está ajudando o usuário a fazer um debate criativo sobre cenas, tramas e estilos visuais para seus filmes ou séries. Seja carismático, perspicaz e cinematográfico. Forneça feedback profissional sempre em português brasileiro.',
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              // Guidelines: Ensure data is streamed only after the session promise resolves
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
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
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Erro na conexão Live:", e);
            setError("Conexão perdida. Por favor, tente novamente.");
            setIsActive(false);
          },
          onclose: () => {
            setIsActive(false);
            onClose();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || "Falha ao acessar o microfone.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextsRef.current) {
        audioContextsRef.current.input.close();
        audioContextsRef.current.output.close();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg p-12 text-center">
        <div className="mb-12 relative">
          <div className={`w-32 h-32 rounded-full border-4 border-blue-500/30 mx-auto flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : ''}`}>
            {isActive ? (
              <div className="flex gap-1.5 items-end h-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : (
              <svg className={`w-12 h-12 ${isConnecting ? 'animate-pulse text-slate-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
          {isActive && (
            <div className="absolute -top-4 -right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter animate-pulse">
              Ao Vivo
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold mb-4 text-white">
          {isConnecting ? 'Inicializando Diretor...' : isActive ? 'O Diretor está ouvindo' : 'Conectando...'}
        </h3>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          {error || 'Discuta tramas, personagens e visuais naturalmente através da conversa por voz.'}
        </p>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all border border-slate-700 text-white"
        >
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

export default DirectorOverlay;
