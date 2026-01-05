
import React, { useState } from 'react';
import { Icons } from '../constants';
import { generateMarketingSwarm } from '../services/geminiService';
import { MarketingPackage, MarketingVariant } from '../types';
import Jabuti from '../components/Brand/Jabuti';

export default function MarketingStudio() {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'instagram'>('youtube');
    const [isGenerating, setIsGenerating] = useState(false);
    const [pkg, setPkg] = useState<MarketingPackage | null>(null);
    const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!title || !desc) return;
        setIsGenerating(true);
        try {
            const result = await generateMarketingSwarm(title, desc, platform);
            setPkg(result);
            setActiveVariantId(result.selectedVariantId || null);
        } finally {
            setIsGenerating(false);
        }
    };

    const activeVariant = pkg?.variants.find(v => v.id === activeVariantId);

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Neural A/B Studio</h2>
                    <p className="text-slate-400 font-medium">O Jabuti cria 3 versões de marketing adaptadas para cada rede social.</p>
                </div>
                <div className="w-16 h-16">
                    <Jabuti state={isGenerating ? 'thinking' : 'idle'} />
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título Base</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: O Segredo da Floresta" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contexto Visual para Capas</label>
                            <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Uma luz azul saindo de uma árvore antiga à noite" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plataforma Alvo</label>
                        <div className="flex flex-col gap-2">
                            {['youtube', 'tiktok', 'instagram'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => setPlatform(p as any)}
                                    className={`w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${platform === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                >
                                    {p} ({p === 'youtube' ? '16:9' : '9:16'})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !title}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-[24px] font-black text-white uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 transition-all"
                >
                    {isGenerating ? 'Jabuti Gerando Materiais...' : <><Icons.Sparkles /> Gerar Pack A/B (3 Versões)</>}
                </button>
            </div>

            {pkg && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4">Variantes Disponíveis</h3>
                        <div className="space-y-4">
                            {pkg.variants.map((v, i) => (
                                <button 
                                    key={v.id}
                                    onClick={() => setActiveVariantId(v.id)}
                                    className={`w-full p-6 rounded-[32px] border text-left transition-all ${activeVariantId === v.id ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Opção #0{i+1}</span>
                                        <span className="text-xl font-black text-white">{v.score}%</span>
                                    </div>
                                    <img src={v.coverUrl} className={`w-full ${v.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'} object-cover rounded-2xl mb-4`} />
                                    <h4 className="font-bold text-white text-sm truncate">{v.title}</h4>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {activeVariant && (
                            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8 animate-in slide-in-from-right-10 duration-500 sticky top-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ativos Prontos</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Formato {activeVariant.aspectRatio} • {platform}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl max-w-xs">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Dica do Jabuti</p>
                                        <p className="text-[10px] text-slate-300 italic leading-tight">"{activeVariant.reasoning}"</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Título Sugerido</label>
                                            <p className="text-lg font-black text-white">{activeVariant.title}</p>
                                        </div>
                                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Descrição</label>
                                            <p className="text-xs text-slate-400 leading-relaxed">{activeVariant.description}</p>
                                        </div>
                                    </div>
                                    <img src={activeVariant.coverUrl} className={`w-full ${activeVariant.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'} object-cover rounded-[32px] border border-slate-800 shadow-2xl`} />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                        <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 block">Hashtags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {activeVariant.hashtags.map(h => <span key={h} className="text-[10px] font-bold text-white bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">{h}</span>)}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 block">Tags SEO</label>
                                        <div className="flex flex-wrap gap-2">
                                            {activeVariant.tags.map(t => <span key={t} className="text-[10px] font-bold text-white bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">{t}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800 flex gap-4">
                                    <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-lg">Copiar Metadados</button>
                                    <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-xl">Publicar em {platform}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
