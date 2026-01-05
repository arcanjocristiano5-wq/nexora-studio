
import React, { useState, useMemo } from 'react';
import { generateConceptArt } from '../services/geminiService';
import { Icons, VISUAL_STYLES } from '../constants';

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3";
type Quality = "Rascunho" | "Produção";
type CategoryFilter = 'Todos' | '3D' | '2D' | 'Realista' | 'Artístico';

export default function Visuais() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<{ url: string; prompt: string; styleName: string }[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Todos');
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quality, setQuality] = useState<Quality>("Produção");
  const [selectedStyleId, setSelectedStyleId] = useState<string>(VISUAL_STYLES[0].id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedStyle = useMemo(() => 
    VISUAL_STYLES.find(s => s.id === selectedStyleId) || VISUAL_STYLES[0],
    [selectedStyleId]
  );

  const filteredStyles = useMemo(() => {
    return VISUAL_STYLES.filter(style => {
      const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || style.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const finalPrompt = quality === "Produção" 
        ? `${prompt}. 8k, uhd, highly detailed, photorealistic.` 
        : prompt;
      
      const url = await generateConceptArt(
        finalPrompt, 
        selectedStyle.name, 
        referenceImage || undefined, 
        aspectRatio, 
        selectedStyleId
      );

      if (url) {
        setHistory([{ 
          url, 
          prompt: finalPrompt, 
          styleName: selectedStyle.name 
        }, ...history]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Laboratório de Desenvolvimento Visual</h2>
          <p className="text-slate-400">Crie a identidade visual da sua produção com arte conceitual, texturas e análise de estilo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Direção de Arte (Prompt)</label>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Estilo Ativo: {selectedStyle.name}</span>
                        </div>
                        <textarea 
                          value={prompt} 
                          onChange={(e) => setPrompt(e.target.value)} 
                          placeholder="Descreva a iluminação, ambiente e clima visual desejado..." 
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[160px] resize-none text-lg placeholder:text-slate-600 text-white" 
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Formato de Tela</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["16:9", "9:16", "1:1", "4:3"] as AspectRatio[]).map(ratio => (
                                    <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`p-2 rounded-xl border-2 text-center transition-all ${aspectRatio === ratio ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                                        <span className="font-bold text-white font-mono">{ratio}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Qualidade</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["Rascunho", "Produção"] as Quality[]).map(q => (
                                    <button key={q} onClick={() => setQuality(q)} className={`p-3 rounded-xl border-2 text-center transition-all ${quality === q ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                                        <span className="font-bold text-white text-sm">{q}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                    <div className="flex items-center gap-4">
                        <button className={`relative w-32 h-20 bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden transition-all ${referenceImage ? 'border-blue-500' : 'hover:border-slate-500'}`} onClick={() => document.getElementById('file-upload')?.click()}>
                            {referenceImage ? <img src={referenceImage} className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-slate-500 uppercase">Referência</span>}
                        </button>
                        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        {referenceImage && <button onClick={() => setReferenceImage(null)} className="text-[10px] text-red-400 font-bold uppercase hover:text-red-300">Remover</button>}
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-900/20">
                        {isGenerating ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.Camera />}
                        <span>Gerar Preview Visual</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Galeria de Histórico</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {history.map((item, i) => (
                        <div key={i} className="group relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                            <img src={item.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <span className="text-[10px] font-bold text-blue-400 uppercase mb-1">{item.styleName}</span>
                                <p className="text-[10px] text-white font-mono line-clamp-2">{item.prompt}</p>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                            <Icons.Camera />
                            <p className="text-slate-600 mt-4">Nenhum rascunho visual gerado ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6 flex flex-col h-full overflow-hidden">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Diretório de Estilos</h3>
            
            <div className="px-2 space-y-4">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar estilo..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {(['Todos', '3D', '2D', 'Realista', 'Artístico'] as CategoryFilter[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto flex-1 pr-2 custom-scrollbar pb-20">
                {filteredStyles.map(style => (
                    <button 
                        key={style.id} 
                        onClick={() => setSelectedStyleId(style.id)}
                        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all p-3 text-center ${selectedStyleId === style.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800'}`}
                    >
                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                            <img src={style.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className={`text-sm font-bold truncate w-full ${selectedStyleId === style.id ? 'text-white' : 'text-slate-400'}`}>{style.name}</span>
                        <span className="text-[9px] text-slate-600 uppercase font-black mt-1">{style.category}</span>
                        {selectedStyleId === style.id && (
                             <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                             </div>
                        )}
                    </button>
                ))}
                {filteredStyles.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-xs text-slate-600">Nenhum estilo encontrado.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
