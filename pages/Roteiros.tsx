
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Story, Character, Scene, ScriptLine } from '../types';
import { Icons, INITIAL_SERIES, INITIAL_STORIES, VISUAL_STYLES } from '../constants';
import { extractCharacters, generateStructuredScript } from '../services/geminiService';
import Storyboard from '../components/Storyboard/Storyboard';
import ScriptTimeline from '../components/Roteiro/ScriptTimeline';

export default function Roteiros() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  
  const [story, setStory] = useState<Story | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'timeline'>('editor');

  useEffect(() => {
    if (!storyId) return;
    const allProjects: Story[] = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
    let storyData = allProjects.find(s => s.id === storyId);
    
    if (!storyData) {
      const allInitialStories = [...INITIAL_SERIES.flatMap(s => s.stories), ...INITIAL_STORIES];
      storyData = allInitialStories.find(s => s.id === storyId);
    }
    setStory(storyData || null);
    if (storyData?.scriptLines && storyData.scriptLines.length > 0) {
      setViewMode('timeline');
    } else {
      setViewMode('editor');
    }
  }, [storyId]);

  useEffect(() => {
    if (story && storyId) {
      const allProjects: Story[] = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
      const projectIndex = allProjects.findIndex(p => p.id === storyId);
      const updatedProject = { ...story };
      if (viewMode === 'editor' && updatedProject.scriptLines) {
        // Não salva a timeline se estiver no modo editor puro
        // delete updatedProject.scriptLines;
      }
      
      let updatedProjects = projectIndex > -1 
        ? allProjects.map(p => p.id === storyId ? updatedProject : p)
        : [updatedProject, ...allProjects.filter(p => p.id !== storyId)];
      
      localStorage.setItem('nexora_custom_projects_v1', JSON.stringify(updatedProjects));
      window.dispatchEvent(new Event('nexora_projects_updated'));
    }
  }, [story]);

  const handleUpdateStory = (updates: Partial<Story>) => setStory(s => s ? { ...s, ...updates } : null);

  const handleAnalyzeScript = async () => {
    if (!story?.description) return;
    setIsAnalyzing(true);
    try {
      const lines = await generateStructuredScript(story.description);
      handleUpdateStory({ scriptLines: lines });
      setViewMode('timeline');
    } catch(e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleExtractCharacters = async () => {
    if (!story?.description) return;
    setIsExtracting(true);
    try {
      const newChars = await extractCharacters(story.description);
      if (newChars.length > 0) {
        setStory(s => {
          if (!s) return null;
          const existingNames = new Set((s.characters || []).map(c => c.name));
          const trulyNewChars = newChars.filter(nc => !existingNames.has(nc.name));
          alert(`${trulyNewChars.length} novos personagens foram extraídos e adicionados ao elenco do projeto.`);
          return { ...s, characters: [...(s.characters || []), ...trulyNewChars] };
        });
      } else {
        alert("Nenhum novo personagem encontrado no roteiro.");
      }
    } catch (e) {
      console.error("Erro ao extrair personagens:", e);
      alert("O Jabuti não conseguiu extrair os personagens. Tente refinar o roteiro.");
    } finally {
      setIsExtracting(false);
    }
  };

  const addSceneFromLine = (line: ScriptLine) => {
    if (!story) return;
    const newScene: Scene = {
      id: crypto.randomUUID(),
      title: line.character ? `Diálogo: ${line.character}` : 'Nova Cena de Ação',
      description: line.content,
      order: (story.scenes?.length || 0) + 1,
      scriptLines: []
    };
    handleUpdateStory({ scenes: [...(story.scenes || []), newScene] });
  };
  
  const handleScenesChange = (newScenes: Scene[]) => {
    handleUpdateStory({ scenes: newScenes });
  };

  if (!story) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Carregando Projeto...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">{story.title}</h2>
          <p className="text-slate-400">Debata com o Jabuti, extraia personagens e visualize seu storyboard.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <label htmlFor="visual-style-select" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 text-right">Estilo Visual</label>
            <select
              id="visual-style-select"
              value={story.visualStyleId || ''}
              onChange={(e) => handleUpdateStory({ visualStyleId: e.target.value })}
              className="bg-slate-800 text-sm text-white border border-slate-700 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none w-full max-w-[200px]"
            >
              {VISUAL_STYLES.map(style => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>
          <button onClick={() => navigate('/projetos')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold transition-all text-white self-end">Voltar</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {viewMode === 'editor' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 min-h-[600px] shadow-2xl flex flex-col">
              <textarea 
                value={story.description}
                onChange={(e) => handleUpdateStory({ description: e.target.value })}
                className="w-full flex-1 bg-transparent border-none focus:ring-0 text-lg text-slate-300 leading-relaxed font-serif resize-none custom-scrollbar"
                placeholder="Comece a escrever a história aqui..."
                style={{ fontFamily: '"Courier Prime", Courier, monospace' }}
              />
              <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-4">
                <button onClick={handleExtractCharacters} disabled={isExtracting || !story.description} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-xl text-white text-xs uppercase tracking-widest disabled:opacity-50">
                  {isExtracting ? 'Extraindo...' : 'Extrair Personagens'}
                </button>
                <button onClick={handleAnalyzeScript} disabled={isAnalyzing || !story.description} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-xl text-white text-xs uppercase tracking-widest disabled:opacity-50">
                  {isAnalyzing ? 'Analisando...' : 'Analisar Roteiro'}
                </button>
              </div>
            </div>
          ) : (
            <ScriptTimeline 
              lines={story.scriptLines || []}
              onAddScene={addSceneFromLine}
              onReset={() => setViewMode('editor')}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl sticky top-10">
            <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6">Elenco do Projeto</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {story.characters && story.characters.length > 0 ? (
                story.characters.map(char => (
                  <div key={char.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-700 flex-shrink-0"><Icons.Brain /></div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{char.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{char.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Nenhum personagem.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-slate-800/50">
        <h2 className="text-2xl font-bold text-white">Storyboard Visual</h2>
        <Storyboard
          scenes={story.scenes || []}
          characters={story.characters || []}
          visualStyleId={story.visualStyleId}
          onScenesChange={handleScenesChange}
          onAnimateScene={(scene) => navigate('/video', { state: { initialPrompt: scene.description, sceneImage: scene.imageUrl } })}
        />
      </div>
    </div>
  );
}
