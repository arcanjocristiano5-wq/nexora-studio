
import React, { useState } from 'react';
import { Icons } from '../constants';
import { generateMarketingSwarm } from '../services/geminiService';
import { MarketingPackage, MarketingVariant } from '../types';
import Jabuti from '../components/Brand/Jabuti';

export default function MarketingStudio() {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [pkg, setPkg] = useState<MarketingPackage | null>(null);
    const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!title || !desc) return;
        setIsGenerating(true);
        try {
            const result = await generateMarketingSwarm(title, desc);
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
                    <p className="text-slate-400 font-medium">O Jabuti cria 3 versões de tudo e escolhe a melhor para o seu YouTube.</p>
                </div>
                <div className="w-16 h-16">
                    <Jabuti state={isGenerating ? 'thinking' : 'idle'} />
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título Base da História</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: O Mistério da Ilha" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Premissa para Capas</label>
                        <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Um farol abandonado sob uma tempestade roxa" />
                    </div>
                </div>
                <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !title}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-[24px] font-black text-white uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-4 transition-all"
                >
                    {isGenerating ? 'Jabuti Criando Variantes...' : <><Icons.Sparkles /> Gerar Pack A/B (3 Versões)</>}
                </button>
            </div>

            {pkg && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* SELETOR DE VARIANTES */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4">Escolha a Versão Ativa</h3>
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
                                    <img src={v.coverUrl} className="w-full aspect-video object-cover rounded-2xl mb-4" />
                                    <h4 className="font-bold text-white text-sm line-clamp-1">{v.title}</h4>
                                    <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase">Predição Jabuti: {v.score > 80 ? 'Viral Potencial' : 'Crescimento Estável'}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DETALHES DA VARIANTE SELECIONADA */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeVariant && (
                            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8 animate-in slide-in-from-right-10 duration-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Configuração de Postagem</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Variante Otimizada pelo Jabuti</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Auditoria Jabuti</p>
                                        <p className="text-[10px] text-slate-300 italic max-w-xs leading-tight">"{activeVariant.reasoning}"</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Título Viral</label>
                                        <p className="text-xl font-black text-white">{activeVariant.title}</p>
                                    </div>

                                    <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Descrição Otimizada</label>
                                        <p className="text-xs text-slate-400 leading-relaxed">{activeVariant.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                            <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 block">Hashtags</label>
                                            <div className="flex flex-wrap gap-2">
                                                {activeVariant.hashtags.map(h => <span key={h} className="text-[10px] font-bold text-white bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">{h}</span>)}
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 block">Tags de Busca</label>
                                            <div className="flex flex-wrap gap-2">
                                                {activeVariant.tags.map(t => <span key={t} className="text-[10px] font-bold text-white bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">{t}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800 flex gap-4">
                                    <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white uppercase text-xs tracking-widest">Copiar Tudo</button>
                                    <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-xl">Postar Agora (YouTube)</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
