
import React, { useState, memo } from 'react';
import { Scene } from '../../types';
// Fixed: generateSceneVisual was not exported, using generateConceptArt instead.
import { generateConceptArt, generateScript } from '../../services/geminiService';
import { Icons, VISUAL_STYLES } from '../../constants';

interface SceneBlockProps {
  scene: Scene;
  characters: any[];
  visualStyleId?: string; // Estilo visual do projeto
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
  onAnimate: (scene: Scene) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SceneBlock: React.FC<SceneBlockProps> = ({ 
  scene, 
  characters, 
  visualStyleId,
  onDelete, 
  onUpdate, 
  onAnimate, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      // Fixed: generateSceneVisual replaced with generateConceptArt. 
      // We look up the style name from VISUAL_STYLES using visualStyleId.
      const styleName = VISUAL_STYLES.find(s => s.id === visualStyleId)?.name || 'Digital Art';
      const url = await generateConceptArt(`${scene.title}: ${scene.description}`, styleName);
      if (url) onUpdate(scene.id, { imageUrl: url });
    } catch (error) {
      console.error("Erro ao gerar imagem", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async () => {
    setIsWriting(true);
    try {
      const scriptText = await generateScript(scene.title, scene.description, characters);
      onUpdate(scene.id, { script: scriptText });
      setShowScript(true);
    } catch (error) {
      console.error("Erro ao gerar roteiro", error);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors group relative shadow-lg">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
        {scene.imageUrl ? (
          <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <p className="text-sm text-slate-500">Sem representação visual</p>
            <button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-all flex items-center gap-2 text-white"
            >
              {isGenerating ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icons.Sparkles />
              )}
              {isGenerating ? 'Visualizando...' : 'Gerar Imagem via IA'}
            </button>
          </div>
        )}
        
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          {scene.imageUrl && (
            <button 
              onClick={() => onAnimate(scene)}
              className="p-2 bg-blue-600 rounded-lg hover:scale-110 shadow-lg flex items-center gap-2 text-xs font-bold text-white"
            >
              <Icons.Video />
              Animar
            </button>
          )}
          <button 
            onClick={scene.script ? () => setShowScript(true) : handleGenerateScript}
            disabled={isWriting}
            className="p-2 bg-slate-700 rounded-lg hover:scale-110 shadow-lg flex items-center gap-2 text-xs font-bold border border-slate-600 text-white"
          >
            {isWriting ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icons.Plus />
            )}
            {scene.script ? 'Ver Roteiro' : 'Escrever Roteiro'}
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-center gap-2">
          <input
            value={scene.title}
            onChange={(e) => onUpdate(scene.id, { title: e.target.value })}
            className="bg-transparent font-semibold text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 flex-1 text-white"
          />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onMoveUp} disabled={isFirst} className={`p-1.5 rounded-md ${isFirst ? 'text-slate-700' : 'text-slate-400 hover:text-white'}`}><Icons.ArrowUp /></button>
            <button onClick={onMoveDown} disabled={isLast} className={`p-1.5 rounded-md ${isLast ? 'text-slate-700' : 'text-slate-400 hover:text-white'}`}><Icons.ArrowDown /></button>
            <button onClick={() => onDelete(scene.id)} className="p-1.5 text-slate-500 hover:text-red-400"><Icons.Trash /></button>
          </div>
        </div>
        <textarea
          value={scene.description}
          onChange={(e) => onUpdate(scene.id, { description: e.target.value })}
          className="bg-transparent text-sm text-slate-300 w-full resize-none focus:outline-none h-20 px-1"
          placeholder="Descreva a cena..."
        />
      </div>

      {showScript && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" onClick={() => setShowScript(false)}>
          <div className="bg-white text-slate-900 w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h4 className="font-bold font-mono text-xs uppercase text-slate-500">Roteiro: {scene.title}</h4>
              <button onClick={() => setShowScript(false)} className="text-slate-400 hover:text-slate-600"><Icons.Trash /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 font-serif text-lg leading-relaxed whitespace-pre-wrap select-text bg-[#fdfdfd]" style={{ fontFamily: '"Courier Prime", Courier, monospace' }}>
              {scene.script}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SceneBlock);
