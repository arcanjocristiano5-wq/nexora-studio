
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { generateDialogue, checkHardwareCapability } from '../services/geminiService';
import { decodeAudio, decodeAudioData } from '../services/audioUtils';
import { VoiceProfile } from '../types';
import { Icons } from '../constants';
import CloneVoiceModal from '../components/Modals/CloneVoiceModal';
import { initialVoices } from '../data/voices';

const emotions = ["Padrão", "Dramático", "Feliz", "Zangado", "Sussurrado", "Animado"];

export default function DialogueLab() {
  const [script, setScript] = useState('PROTAGONISTA: Este é o lugar?\nCOADJUVANTE: É o que o mapa diz. Não parece grande coisa.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voices, setVoices] = useState<VoiceProfile[]>(initialVoices);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('Padrão');
  
  const [engine, setEngine] = useState<'local' | 'cloud'>('local');
  const [hardware, setHardware] = useState<any>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    checkHardwareCapability().then(setHardware);
  }, []);

  const handleTableRead = async () => {
    if (!script.trim() || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const characters = [
        { name: 'PROTAGONISTA', voice: voices.find(v => v.type === 'prebuilt')?.apiName || 'Puck' },
        { name: 'COADJUVANTE', voice: voices.filter(v => v.type === 'prebuilt')[1]?.apiName || 'Kore' }
      ];

      if (engine === 'local') {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(script);
          utterance.lang = 'pt-BR';
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => { setIsPlaying(false); setIsGenerating(false); };
          window.speechSynthesis.speak(utterance);
          return;
      }

      // FIX: Changed 4th argument from 'cloud' to false to satisfy boolean parameter requirement
      const base64Audio = await generateDialogue(
          script, 
          characters, 
          selectedEmotion === 'Padrão' ? undefined : selectedEmotion.toLowerCase(),
          false
      );

      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioBuffer = await decodeAudioData(
          decodeAudio(base64Audio),
          audioContextRef.current,
          24000,
          1
        );
        
        if (currentSourceRef.current) currentSourceRef.current.stop();
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        
        setIsPlaying(true);
        source.start(0);
        currentSourceRef.current = source;
      }
    } catch (error) {
      console.error("Falha na geração de áudio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stopPlayback = () => {
    if (engine === 'local') {
        window.speechSynthesis.cancel();
    } else if (currentSourceRef.current) {
      currentSourceRef.current.stop();
    }
    setIsPlaying(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2">Lab de Diálogo</h2>
          <p className="text-slate-400">Teste o roteiro com voz local ou processamento Cloud master.</p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setEngine('local')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${engine === 'local' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>IA LOCAL</button>
          <button onClick={() => setEngine('cloud')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${engine === 'cloud' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>IA CLOUD</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-[500px]">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg leading-relaxed font-mono placeholder:text-slate-700 resize-none"
              style={{ fontFamily: '"Courier Prime", Courier, monospace' }}
            />
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                <select value={selectedEmotion} onChange={(e) => setSelectedEmotion(e.target.value)} className="bg-slate-800 text-xs text-white border-slate-700 rounded-lg p-2">
                    {emotions.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <button onClick={isPlaying ? stopPlayback : handleTableRead} disabled={isGenerating} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all ${isPlaying ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                    {isGenerating ? 'Processando...' : isPlaying ? 'Parar Leitura' : 'Iniciar Leitura'}
                </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Vozes do Elenco</h3>
            <div className="space-y-2">
              {voices.map(v => (
                <div key={v.name} className="p-3 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{v.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{v.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
