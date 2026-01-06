
import React, { useState, memo } from 'react';
import { Scene } from '../../types';
import { generateConceptArt, generateScript, generateDialogue } from '../../services/geminiService';
import { Icons, VISUAL_STYLES } from '../../constants';

interface SceneBlockProps {
  scene: Scene;
  characters: any[];
  visualStyleId?: string;
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
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const styleName = VISUAL_STYLES.find(s => s.id === visualStyleId)?.name || 'Digital Art';
      const url = await generateConceptArt(`${scene.title}: ${scene.description}`, styleName);
      if (url) onUpdate(scene.id, { imageUrl: url });
    } catch (error) {
      console.error("Erro ao gerar imagem", error);
    } finally {
      setIsGeneratingImg(false);
    }
  };
  
  const handleGenerateAudio = async () => {
      setIsGeneratingAudio(true);
      try {
        const audioUrl = await generateDialogue(scene.description);
        if(audioUrl) onUpdate(scene.id, { dialogueAudioUrl: audioUrl });
      } catch (error) {
          console.error("Erro ao gerar áudio", error);
      } finally {
          setIsGeneratingAudio(false);
      }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors group relative shadow-lg flex flex-col">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
        {scene.imageUrl ? (
          <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImg}
              className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            >
              {isGeneratingImg ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Icons.Sparkles />}
              {isGeneratingImg ? 'Visualizando...' : 'Gerar Imagem'}
            </button>
          </div>
        )}
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          {scene.imageUrl && (
            <button 
              onClick={() => onAnimate(scene)}
              className="px-3 py-2 bg-blue-600 rounded-lg hover:scale-110 shadow-lg flex items-center gap-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icons.Video /> Animar
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex justify-between items-center gap-2">
          <input
            value={scene.title}
            onChange={(e) => onUpdate(scene.id, { title: e.target.value })}
            className="bg-transparent font-semibold text-base focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 flex-1 text-white"
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
          className="bg-transparent text-sm text-slate-400 w-full resize-none focus:outline-none h-20 px-1 flex-1"
          placeholder="Descrição da cena, diálogo..."
        />
        <div className="pt-3 border-t border-slate-800/50">
          {scene.dialogueAudioUrl ? (
             <audio src={scene.dialogueAudioUrl} controls className="w-full h-8" />
          ) : (
            <button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="w-full text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 text-white uppercase tracking-widest">
              {isGeneratingAudio ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Icons.Music />}
              {isGeneratingAudio ? 'Gerando...' : 'Gerar Áudio da Cena'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(SceneBlock);
