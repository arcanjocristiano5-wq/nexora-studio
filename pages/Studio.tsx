
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icons } from '../constants';
import { generateVideoContent, checkKey, openKeySelection } from '../services/geminiService';
import { VideoItem } from '../types';
import Jabuti from '../components/Brand/Jabuti';

export default function VideoLab() {
  const location = useLocation();
  const initialData = location.state?.story || null;
  const initialImage = location.state?.sceneImage || null;
  const initialPrompt = location.state?.initialPrompt || '';
  
  const [prompt, setPrompt] = useState(initialPrompt || initialData?.description || '');
  const [refImage, setRefImage] = useState<string | null>(initialImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [hasKey, setHasKey] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  useEffect(() => {
    checkKey().then(setHasKey);
  }, []);

  const handleGenerate = async () => {
    if (!hasKey) {
      await openKeySelection();
      setHasKey(true);
      return;
    }
    
    setIsGenerating(true);
    setProgressMsg('Jabuti orquestrando motores Veo...');
    
    const newJob: VideoItem = {
      id: crypto.randomUUID(),
      prompt,
      videoUrl: '',
      status: 'pending',
      timestamp: new Date()
    };
    
    setVideoList(prev => [newJob, ...prev]);

    try {
      const videoUrl = await generateVideoContent(prompt, refImage || undefined, aspectRatio, (msg) => setProgressMsg(msg));
      setVideoList(prev => prev.map(v => v.id === newJob.id ? { ...v, videoUrl, status: 'completed' } : v));
    } catch (error) {
      setVideoList(prev => prev.map(v => v.id === newJob.id ? { ...v, status: 'failed' } : v));
    } finally {
      setIsGenerating(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Renderizador Master</h2>
          <p className="text-slate-400 font-medium">O Jabuti utiliza o modelo Veo 3.1 para animar seus quadros com fluidez neural.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
            <div className="w-12 h-12">
                <Jabuti state={isGenerating ? 'thinking' : 'idle'} />
            </div>
            <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Orquestrador Ativo</p>
                <p className="text-xs text-white font-bold">{isGenerating ? 'Trabalhando...' : 'Aguardando Direção'}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 shadow-2xl space-y-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Direção de Cena</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Câmera lenta acompanhando o personagem na chuva de neon..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 min-h-[220px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-700 text-lg shadow-inner"
              />
            </div>
            <div className="w-full md:w-64 space-y-4">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Frame Master</label>
               <div className="aspect-square bg-slate-950/50 rounded-3xl border-2 border-dashed border-slate-800 overflow-hidden flex items-center justify-center relative group shadow-inner">
                  {refImage ? (
                    <img src={refImage} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Icons.Camera />
                        <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Frame</span>
                    </div>
                  )}
                  {refImage && (
                    <button onClick={() => setRefImage(null)} className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-all backdrop-blur-sm uppercase">Remover</button>
                  )}
               </div>
               <p className="text-[9px] text-slate-500 text-center font-bold uppercase">A imagem servirá como o 1º frame do vídeo.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-10 border-t border-slate-800">
            <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
              {['16:9', '9:16', '1:1'].map((r: any) => (
                <button 
                    key={r} 
                    onClick={() => setAspectRatio(r)} 
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all ${aspectRatio === r ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                >
                    {r}
                </button>
              ))}
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="px-14 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-[24px] font-black text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] flex items-center gap-4 transition-all active:scale-95 uppercase text-xs tracking-tighter"
            >
              {isGenerating ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.Video />}
              {refImage ? 'Animar Quadro Master' : 'Gerar do Zero'}
            </button>
          </div>
          
          {isGenerating && (
            <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest animate-pulse">{progressMsg}</span>
                <span className="text-[11px] font-mono text-slate-500">Mastering Neural ativo</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-[progress_20s_linear_infinite]" style={{ width: '60%' }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">Timeline de Render</h3>
          <div className="space-y-8 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
            {videoList.map(v => (
              <div key={v.id} className="bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl group hover:border-blue-500/50 transition-all backdrop-blur-md">
                <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
                  {v.status === 'completed' ? (
                    <video src={v.videoUrl} controls className="w-full h-full object-cover" />
                  ) : v.status === 'failed' ? (
                    <div className="text-center p-6">
                        <span className="text-red-500 text-[11px] font-black uppercase tracking-widest">Render Falhou</span>
                        <p className="text-[9px] text-slate-600 mt-2">Limite de quota excedido ou prompt bloqueado.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-500 rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Processando...</span>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-slate-800/50 bg-slate-950/20">
                   <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed italic font-medium">"{v.prompt}"</p>
                </div>
              </div>
            ))}
            {videoList.length === 0 && (
                <div className="text-center py-24 bg-slate-900/10 rounded-[40px] border-2 border-dashed border-slate-800">
                    <Icons.Video />
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest mt-4">Nenhum vídeo na fila</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
