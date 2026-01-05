
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Story } from '../types';
import { Icons, INITIAL_STORIES } from '../constants';

export default function Historias() {
    const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
    const navigate = useNavigate();

    const handleCreateStory = () => {
        const newStory: Story = {
            id: `story-${crypto.randomUUID()}`,
            title: 'Nova História Sem Título',
            description: 'Comece a escrever a premissa da sua próxima grande ideia aqui.',
            status: 'draft',
            scenes: [],
            characters: [],
            subtitleStyleId: 'cinematic'
        };
        setStories(prev => [newStory, ...prev]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Histórias Independentes</h2>
                    <p className="text-slate-400">Desenvolva curtas, contos ou ideias únicas que não pertencem a uma série.</p>
                </div>
                <button 
                    onClick={handleCreateStory}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 text-white"
                >
                    <Icons.Plus /> Nova História
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map(story => (
                    <div key={story.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group flex flex-col justify-between min-h-[280px]">
                        <Link to={`/roteiro/${story.id}`} className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors text-white">{story.title}</h3>
                                <span className="text-[10px] font-black uppercase tracking-tighter bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">
                                    {story.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-3 mb-4">{story.description}</p>
                        </Link>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-4 mt-auto">
                                <div className="flex items-center gap-2">
                                    <Icons.Stories />
                                    <span>{story.scenes.length} Cenas</span>
                                </div>
                                <span className="font-mono opacity-50">#{story.id.substring(0, 8)}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <Link 
                                    to={`/roteiro/${story.id}`}
                                    className="flex items-center justify-center gap-2 text-xs font-bold py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                >
                                    Editar Roteiro
                                </Link>
                                <button 
                                    onClick={() => navigate('/canais')} 
                                    className="flex items-center justify-center gap-2 text-xs font-bold py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
                                >
                                    Painel do Canal
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                 <button 
                    onClick={handleCreateStory}
                    className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-blue-400 transition-all bg-slate-900/20 min-h-[280px]"
                >
                    <div className="p-4 bg-slate-800/50 rounded-full">
                        <Icons.Plus />
                    </div>
                    <span className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Criar Nova História</span>
                </button>
            </div>
        </div>
    );
}
