
import React, { useState } from 'react';
import { Icons, VISUAL_STYLES } from '../constants';
import { analyzeCompetitors } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

export default function Analytics() {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ text: string, sources: any[] } | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setIsLoading(true);
    try {
      const result = await analyzeCompetitors(niche, platform);
      setAnalysisResult(result);
    } catch (error) {
      alert("Jabuti encontrou um bloqueio na rede de pesquisa. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Auditoria de Mercado</h2>
          <p className="text-slate-400 font-medium">O Jabuti analisa seus concorrentes em tempo real para criar estratégias de superação.</p>
        </div>
        <div className="w-16 h-16">
          <Jabuti state={isLoading ? 'thinking' : 'idle'} subState={isLoading ? 'web-search' : undefined} />
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
        <form onSubmit={handleAnalyze} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nicho ou Concorrente Específico</label>
              <input 
                required 
                value={niche} 
                onChange={e => setNiche(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-700" 
                placeholder="Ex: Canais de True Crime ou @MrBeast" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plataforma de Destino</label>
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 h-[60px]">
                 {['youtube', 'tiktok', 'instagram'].map(p => (
                   <button 
                    key={p} 
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platform === p ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                   >
                     {p}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !niche.trim()} 
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-[24px] font-black text-white shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 uppercase text-sm tracking-tighter"
          >
            {isLoading ? 'Jabuti está Auditando a Rede...' : <><Icons.Sparkles /> Iniciar Espionagem Estratégica</>}
          </button>
        </form>
      </div>

      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-10 duration-700">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 border-b border-slate-800 pb-4">Relatório Jabuti: Plano de Ataque</h3>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-6 text-sm">
                {analysisResult.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Fontes de Grounding</h3>
              <div className="space-y-4">
                {analysisResult.sources.map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-blue-500 transition-all group"
                  >
                    <div className="text-blue-500 group-hover:scale-110 transition-transform">
                      <Icons.Link />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white truncate">{src.title}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-8">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Dica do Gerente:</p>
               <p className="text-xs text-slate-300 italic leading-relaxed">"O nicho de {niche} está saturado de ganchos longos. Se você reduzir o tempo do hook para 1.5s e usar o estilo {VISUAL_STYLES[1].name}, nosso canal terá 40% mais retenção."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
