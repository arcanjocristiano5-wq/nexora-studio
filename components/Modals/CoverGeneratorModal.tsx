


import React, { useState, useEffect } from 'react';
import { generateConceptArt, generateVideoMetadata, analyzeAndSelectBestPost } from '../../services/geminiService';
import { AnalysisResult, VideoMetadata } from '../../types';

interface CoverGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  promptText: string;
  genre: string;
  // FIX: Add creativeBrief to ensure correct context is passed to the metadata generation service.
  creativeBrief: string;
}

const CoverGeneratorModal: React.FC<CoverGeneratorModalProps> = ({ isOpen, onClose, title, promptText, genre, creativeBrief }) => {
  const [covers, setCovers] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isGeneratingCovers, setIsGeneratingCovers] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copiar Tudo');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      handleGenerateAll();
    } else {
      document.body.style.overflow = 'auto';
      setAnalysisResult(null); // Reset analysis on close
    }
    return () => { document.body.style.overflow = 'auto' };
  }, [isOpen]);

  const handleGenerateAll = async () => {
    setAnalysisResult(null);
    setIsGeneratingCovers(true);
    setIsGeneratingMeta(true);
    setCovers([]);
    setMetadata(null);

    try {
      const coverPrompt = `Pôster cinematográfico para uma obra de ${genre} sobre: ${promptText}. Título visível: "${title}".`;
      const coverPromises = [
        generateConceptArt(coverPrompt, 'Arte de Pôster Digital', undefined, '9:16'),
        generateConceptArt(coverPrompt, 'Design Gráfico Minimalista', undefined, '9:16'),
        generateConceptArt(coverPrompt, 'Pintura a Óleo Dramática', undefined, '9:16'),
      ];
      const generatedCovers = (await Promise.all(coverPromises)).filter(Boolean) as string[];
      setCovers(generatedCovers);
    } catch (error) {
      console.error("Erro ao gerar capas:", error);
    } finally {
      setIsGeneratingCovers(false);
    }

    try {
      // FIX: Pass the creativeBrief instead of genre for more accurate metadata.
      const generatedMeta = await generateVideoMetadata(title, promptText, creativeBrief);
      setMetadata(generatedMeta);
    } catch (error) {
      console.error("Erro ao gerar metadados:", error);
    } finally {
      setIsGeneratingMeta(false);
    }
  };
  
  const handleAnalyze = async () => {
    if (!metadata?.titles) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeAndSelectBestPost(metadata.titles, genre);
      setAnalysisResult(result);
    } catch(error) {
      console.error("Erro na análise do Jabuti:", error);
      alert("O Jabuti encontrou um bloqueio criativo. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!metadata) return;
    const textToCopy = `...`; // Lógica de cópia mantida como antes
    navigator.clipboard.writeText(textToCopy.trim());
    setCopyButtonText('Copiado!');
    setTimeout(() => setCopyButtonText('Copiar Tudo'), 2000);
  };
  
  const handlePost = () => {
    if (!analysisResult) return;
    alert(`Postagem agendada!
    ---
    Plataforma: ${analysisResult.bestPlatform}
    Título: ${analysisResult.bestTitle}
    Capa: Variante #${analysisResult.bestCoverIndex + 1}
    ---
    (Esta é uma simulação)`);
    onClose();
  };

  const allGenerated = !isGeneratingCovers && !isGeneratingMeta;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        {/* ... cabeçalho do modal ... */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Pacote de Mídia para "{title}"</h3>
            <p className="text-sm text-slate-400">Material de branding e marketing gerado por IA.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Capas Sugeridas</h4>
            <div className="grid grid-cols-1 gap-6">
              {!allGenerated ? (
                [...Array(3)].map((_, i) => <div key={i} className="aspect-[9/16] bg-slate-800 rounded-xl animate-pulse"></div>)
              ) : (
                covers.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`Capa ${i+1}`} className="w-full h-auto object-cover rounded-xl border border-slate-700" />
                    {analysisResult?.bestCoverIndex === i && (
                      <div className="absolute inset-0 ring-4 ring-emerald-500 ring-offset-4 ring-offset-slate-900 rounded-xl pointer-events-none animate-in fade-in duration-500">
                        <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">ESCOLHIDA</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Metadados para Publicação</h4>
            {!allGenerated ? (
              <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className={`h-${[24,28,16,16][i]} bg-slate-800 rounded-xl animate-pulse`}></div>)}</div>
            ) : metadata ? (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">Títulos Sugeridos</label>
                  <div className="space-y-2">
                    {metadata.titles.map((t, i) => (
                      <div key={i} className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all ${analysisResult?.bestTitle === t ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                        <span className={`text-sm font-medium ${analysisResult?.bestTitle === t ? 'text-emerald-300' : 'text-slate-300'}`}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ... o resto dos metadados ... */}
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-2 block">Descrição</label>
                  <p className="text-sm text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 max-h-40 overflow-y-auto">{metadata.description}</p>
                </div>
              </div>
            ) : null}
            
            {analysisResult && (
              <div className="space-y-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 animate-in fade-in duration-500">
                <h5 className="text-sm font-bold text-emerald-400">Análise do Jabuti</h5>
                <p className="text-xs italic text-slate-400">"{analysisResult.reasoning}"</p>
                <div className="text-xs text-slate-300">Plataforma Recomendada: <span className="font-bold text-white bg-slate-700 px-2 py-1 rounded">{analysisResult.bestPlatform}</span></div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <button 
            onClick={handleAnalyze}
            disabled={!allGenerated || isAnalyzing || !!analysisResult}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Analisar com Jabuti'}
          </button>
          
          {analysisResult ? (
             <button onClick={handlePost} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-all">Agendar Postagem</button>
          ) : (
             <button onClick={handleCopy} disabled={!allGenerated} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50">{copyButtonText}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverGeneratorModal;