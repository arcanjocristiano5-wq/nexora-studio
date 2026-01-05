
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Story, Scene } from '../types';
import { Icons, INITIAL_SERIES, INITIAL_STORIES, SUBTITLE_STYLES } from '../constants';
import { generateStructuredScript, generateBgmMood, generateScenes } from '../services/geminiService';
import SceneBlock from '../components/Storyboard/SceneBlock';

export default function Roteiros() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  
  const [story, setStory] = useState<Story | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'visual'>('script');

  useEffect(() => {
    const allStories = [...INITIAL_SERIES.flatMap(s => s.stories), ...INITIAL_STORIES];
    const storyData = allStories.find(s => s.id === storyId);
    if (storyData) setStory(storyData);
  }, [storyId]);

  const handleAutoPipeline = async () => {
    if (!story) return;
    setIsProcessing(true);
    try {
      const scriptRes = await generateStructuredScript(story.title, story.description);
      const scenesRes = await generateScenes(story.title, story.description);
      
      const newScenes: Scene[] = scenesRes.map((s: any, idx: number) => ({
        id: crypto.randomUUID(),
        title: s.title,
        description: s.description,
        order: idx + 1,
        scriptLines: scriptRes.lines?.slice(idx * 2, (idx + 1) * 2) || []
      }));

      setStory({ ...story, scenes: newScenes });
      setActiveTab('visual');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnimateScene = (scene: Scene) => {
    navigate('/video', { state: { story, sceneImage: scene.imageUrl, initialPrompt: scene.description } });
  };

  if (!story) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Carregando Projeto...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">{story.title}</h2>
          <div className="flex gap-6">
              <button onClick={() => setActiveTab('script')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'script' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500'}`}>Roteiro</button>
              <button onClick={() => setActiveTab('visual')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'visual' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500'}`}>Storyboard</button>
          </div>
        </div>
        <div className="flex gap-3">
            <button onClick={handleAutoPipeline} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all shadow-lg text-white">
                {isProcessing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.Sparkles />}
                Orquestrar via IA
            </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[600px] shadow-2xl">
          {activeTab === 'script' ? (
              <div className="max-w-3xl mx-auto space-y-12 py-10">
                  <textarea 
                    value={story.description}
                    onChange={(e) => setStory({...story, description: e.target.value})}
                    className="w-full bg-transparent border-none focus:ring-0 text-xl text-slate-300 leading-relaxed font-serif min-h-[400px] resize-none"
                    placeholder="Escreva a premissa ou roteiro aqui..."
                  />
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {story.scenes.map((scene, idx) => (
                    <SceneBlock 
                        key={scene.id}
                        scene={scene}
                        characters={[]}
                        onAnimate={handleAnimateScene}
                        onUpdate={(id, up) => setStory({...story, scenes: story.scenes.map(s => s.id === id ? {...s, ...up} : s)})}
                        onDelete={(id) => setStory({...story, scenes: story.scenes.filter(s => s.id !== id)})}
                        onMoveUp={() => {}}
                        onMoveDown={() => {}}
                        isFirst={idx === 0}
                        isLast={idx === story.scenes.length - 1}
                    />
                  ))}
                  <button onClick={() => {}} className="border-2 border-dashed border-slate-800 rounded-2xl aspect-video flex flex-col items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-500 transition-all">
                    <Icons.Plus />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">Nova Cena</span>
                  </button>
              </div>
          )}
      </div>
    </div>
  );
}
