
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { analyzeChannelPostPattern, upscaleTo8K } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

type Resolution = '1080p' | '4K' | '8K';

export default function Export() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [resolution, setResolution] = useState<Resolution>('1080p');

  const handleSmartSchedule = async () => {
    setIsSyncing(true);
    try {
      const result = await analyzeChannelPostPattern("https://youtube.com/@MistériosIA");
      setSchedule(result);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinalExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    await upscaleTo8K("video_url", (p) => setExportProgress(p));
    setIsExporting(false);
    alert(`Master Finalizado em ${resolution} e Exportado com Sucesso!`);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Exportação & Postagem</h2>
          <p className="text-slate-400 font-medium">O Jabuti sincroniza o enxame para o render final e agenda seu sucesso.</p>
        </div>
        <div className="w-16 h-16">
          <Jabuti state={isExporting ? 'thinking' : 'idle'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase">Growth Scheduler</h3>
                <button onClick={handleSmartSchedule} disabled={isSyncing} className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                    {isSyncing ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Icons.Analytics />}
                </button>
            </div>

            {schedule ? (
                <div className="space-y-6 animate-in slide-in-from-top-4">
                    <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Última Postagem Detectada</p>
                        <p className="text-lg font-bold text-white">{schedule.lastPostDate}</p>
                    </div>
                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Próximo Slot de Ouro Sugerido</p>
                        <p className="text-2xl font-black text-white">{schedule.suggestedNextPost}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Estratégia Jabuti</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic">"{schedule.frequencyRecommendation}"</p>
                    </div>
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-xl">Confirmar Agendamento Automático</button>
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[32px]">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Aguardando Análise de Canal...</p>
                </div>
            )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
            <h3 className="text-xl font-black text-white uppercase">Render Swarm Sinc</h3>
            <div className="space-y-4">
                <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-white">Master Local (Até 8K)</p>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Usa GPU Platina + Swarm Workers</p>
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {(['1080p', '4K', '8K'] as Resolution[]).map(res => (
                           <button key={res} onClick={() => setResolution(res)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${resolution === res ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>{res}</button>
                        ))}
                    </div>
                    <button onClick={handleFinalExport} disabled={isExporting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black text-white uppercase text-[10px] tracking-widest shadow-lg">
                        {isExporting ? `Renderizando... ${exportProgress}%` : `Iniciar Export em ${resolution}`}
                    </button>
                </div>
                {isExporting && (
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${exportProgress}%` }} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
