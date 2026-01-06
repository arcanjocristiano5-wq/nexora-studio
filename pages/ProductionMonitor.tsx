
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Story, Scene } from '../types';
import { startFullAutoProduction } from '../services/geminiService';
import { Icons } from '../constants';
import Jabuti from '../components/Brand/Jabuti';

type AssetStatus = 'pending' | 'progress' | 'done' | 'error';
interface SceneProgress {
  art: AssetStatus;
  audio: AssetStatus;
  video: AssetStatus;
}

const getAssetIcon = (status: AssetStatus) => {
  switch (status) {
    case 'pending': return <div className="w-2 h-2 rounded-full bg-slate-600" />;
    case 'progress': return <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
    case 'done': return <div className="w-2 h-2 rounded-full bg-emerald-500" />;
    case 'error': return <div className="w-2 h-2 rounded-full bg-red-500" />;
  }
};

export default function ProductionMonitor() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [statusMessage, setStatusMessage] = useState('Inicializando o enxame de produção...');
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!storyId) return;

    const allProjects: Story[] = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
    const project = allProjects.find(p => p.id === storyId);
    
    if (project) {
      setStory(project);
      
      const handleProgress = (update: { message: string, story: Story, overallProgress: number }) => {
        setStatusMessage(update.message);
        setStory(update.story);
        setOverallProgress(update.overallProgress);
        
        const currentProjects: Story[] = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
        const updatedProjects = currentProjects.map(p => p.id === storyId ? update.story : p);
        localStorage.setItem('nexora_custom_projects_v1', JSON.stringify(updatedProjects));
        window.dispatchEvent(new Event('nexora_projects_updated'));

        if (update.overallProgress >= 100) {
          setIsComplete(true);
        }
      };
      
      startFullAutoProduction(project, handleProgress);

    } else {
      navigate('/projetos');
    }
  }, [storyId, navigate]);

  if (!story) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Produção Automática: {story.title}</h2>
        <p className="text-slate-400">{statusMessage}</p>
        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-6 overflow-hidden">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="mt-8 flex justify-center gap-4">
            {!isComplete && (
                <button 
                  onClick={() => navigate(`/roteiro/${story.id}`)} 
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-2xl font-bold text-white shadow-lg"
                >
                    Pausar e Assumir Controle Manual
                </button>
            )}
            {isComplete && (
                <button onClick={() => navigate(`/roteiro/${story.id}`)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-white shadow-lg">
                    Produção Concluída! Revisar no Estúdio
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {story.scenes.map(scene => (
          <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="aspect-video bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden">
                {scene.imageUrl ? 
                  <img src={scene.imageUrl} className="w-full h-full object-cover" /> :
                  <Jabuti state={overallProgress > 10 ? 'thinking' : 'idle'} />
                }
                {scene.videoUrl && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Icons.Video />
                    </div>
                )}
            </div>
            <p className="text-xs font-bold text-slate-300 truncate">{scene.title}</p>
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest bg-slate-950 p-2 rounded-lg">
                <div className="flex items-center gap-2" title="Arte Conceitual">{getAssetIcon(scene.imageUrl ? 'done' : 'pending')} Arte</div>
                <div className="flex items-center gap-2" title="Áudio do Diálogo">{getAssetIcon(scene.dialogueAudioUrl ? 'done' : 'pending')} Áudio</div>
                <div className="flex items-center gap-2" title="Vídeo Renderizado">{getAssetIcon(scene.videoUrl ? 'done' : 'pending')} Vídeo</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}