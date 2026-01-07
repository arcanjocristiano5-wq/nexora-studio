import React from 'react';
import { Scene, Character } from '../../types';
import SceneBlock from './SceneBlock';
import { Icons } from '../../constants';

interface StoryboardProps {
  scenes: Scene[];
  characters: Character[];
  visualStyleId?: string;
  onScenesChange: (scenes: Scene[]) => void;
  onAnimateScene: (scene: Scene) => void;
}

const Storyboard: React.FC<StoryboardProps> = ({ scenes, characters, visualStyleId, onScenesChange, onAnimateScene }) => {
  const addScene = () => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      title: 'Nova Cena',
      description: '',
      order: (scenes.length > 0 ? Math.max(...scenes.map(s => s.order)) : 0) + 1,
      scriptLines: []
    };
    onScenesChange([...scenes, newScene]);
  };

  const deleteScene = (id: string) => {
    onScenesChange(scenes.filter(s => s.id !== id));
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    onScenesChange(scenes.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveScene = (id: string, direction: 'up' | 'down') => {
    const sorted = [...scenes].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(s => s.id === id);
    
    if (direction === 'up' && index > 0) {
      const newScenes = [...sorted];
      const prevOrder = newScenes[index - 1].order;
      const currOrder = newScenes[index].order;
      
      newScenes[index - 1] = { ...newScenes[index - 1], order: currOrder };
      newScenes[index] = { ...newScenes[index], order: prevOrder };
      onScenesChange(newScenes);
    } else if (direction === 'down' && index < sorted.length - 1) {
      const newScenes = [...sorted];
      const nextOrder = newScenes[index + 1].order;
      const currOrder = newScenes[index].order;
      
      newScenes[index + 1] = { ...newScenes[index + 1], order: currOrder };
      newScenes[index] = { ...newScenes[index], order: nextOrder };
      onScenesChange(newScenes);
    }
  };

  const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedScenes.map((scene, index) => (
        <SceneBlock
          key={scene.id}
          scene={scene}
          characters={characters}
          visualStyleId={visualStyleId}
          onDelete={deleteScene}
          onUpdate={updateScene}
          onAnimate={onAnimateScene}
          onMoveUp={() => moveScene(scene.id, 'up')}
          onMoveDown={() => moveScene(scene.id, 'down')}
          isFirst={index === 0}
          isLast={index === sortedScenes.length - 1}
        />
      ))}
      <button
        onClick={addScene}
        className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-blue-400 transition-all bg-slate-800/20 min-h-[300px]"
      >
        <Icons.Plus />
        <span className="font-medium">Adicionar Nova Cena</span>
      </button>
    </div>
  );
};

export default Storyboard;