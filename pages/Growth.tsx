
import React, { useState } from 'react';
import { Icons } from '../constants';
import { auditCompetitorLink } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

export default function GrowthReport() {
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    try {
      const data = await auditCompetitorLink(url, niche);
      setReport(data);
    } catch (error) {
      alert("Jabuti não conseguiu acessar o link. Verifique se a URL é válida.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Growth Intelligence</h2>
          <p className="text-slate-400 font-medium">Insira um link para o Jabuti auditar e aprender como crescer seu canal.</p>
        </div>
      </div>

      {/* URL INPUT SCANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
        <form onSubmit={handleAudit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link do Concorrente ou Referência</label>
              <input 
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nicho / Objetivo</label>
              <input 
                value={niche}
                onChange={e => setNiche(e.target.value)}
                placeholder="Ex: Mistérios, Documentário, Curiosidades"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isLoading || !url}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4 transition-all"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.Sparkles />}
            {isLoading ? 'Jabuti está Escaneando a Rede...' : 'Auditar e Aprender com este Link'}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center py-20 gap-6">
           <div className="w-48 h-48">
              <Jabuti state="thinking" subState="web-search" />
           </div>
           <p className="text-lg font-bold text-blue-500 animate-pulse uppercase tracking-widest">Extraindo DNA Viral...</p>
        </div>
      )}

      {report && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Relatório de Auditoria</h3>
                    <div className="text-5xl font-black text-blue-500">{report.overallScore}%</div>
                 </div>
                 <div className="prose prose-invert max-w-none text-slate-300">
                    <p className="text-lg leading-relaxed italic">"{report.competitorAnalysis}"</p>
                 </div>
                 
                 <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Ganchos (Hooks) de Retenção</p>
                       <ul className="space-y-3">
                          {report.viralHooks.map((h: string, i: number) => (
                             <li key={i} className="text-xs text-slate-400 flex gap-3">
                                <span className="text-emerald-500 font-bold">#0{i+1}</span> {h}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Estratégia de Superação</p>
                       <ul className="space-y-3">
                          {report.suggestedImprovements.map((s: string, i: number) => (
                             <li key={i} className="text-xs text-slate-400 flex gap-3">
                                <span className="text-blue-500 font-bold">→</span> {s}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Fontes Auditadas</h3>
                 <div className="space-y-4">
                    {report.sources.map((src: any, i: number) => (
                       <a key={i} href={src.uri} target="_blank" className="block p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-blue-500 transition-all group">
                          <p className="text-xs font-bold text-slate-400 group-hover:text-white truncate">{src.title}</p>
                          <p className="text-[10px] text-blue-500 truncate">{src.uri}</p>
                       </a>
                    ))}
                 </div>
              </div>
              <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-3xl font-black text-white uppercase text-xs tracking-widest shadow-2xl transition-all">
                 Salvar DNA para Próxima Produção
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
