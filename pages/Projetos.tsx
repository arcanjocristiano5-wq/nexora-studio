
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Story } from '../types';
import { Icons, INITIAL_STORIES, INITIAL_SERIES } from '../constants';
import AICreatorModal from '../components/Modals/AICreatorModal';
import { createProjectWithAI } from '../services/geminiService';

type ProjectType = 'story' | 'series';

export default function Projetos() {
    const [activeTab, setActiveTab] = useState<ProjectType>('story');
    const [stories, setStories] = useState<(Story & { isMiniSeries?: boolean })[]>([]);
    const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);
    const [projectTypeToCreate, setProjectTypeToCreate] = useState<'story' | 'series'>('story');
    const navigate = useNavigate();

    const loadProjects = () => {
        const saved: (Story & { isMiniSeries?: boolean })[] = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
        const allInitialStories = [
          ...INITIAL_STORIES.map(s => ({ ...s, isMiniSeries: false })), 
          ...INITIAL_SERIES.flatMap(s => s.stories).map(s => ({ ...s, isMiniSeries: true }))
        ];
        const initialNotInSaved = allInitialStories.filter(is => !saved.some(s => s.id === is.id));
        setStories([...saved, ...initialNotInSaved]);
    };

    useEffect(() => {
        loadProjects();
        window.addEventListener('nexora_projects_updated', loadProjects);
        window.addEventListener('storage', loadProjects);
        return () => {
          window.removeEventListener('nexora_projects_updated', loadProjects);
          window.removeEventListener('storage', loadProjects);
        };
    }, []);

    const handleOpenAICreator = (type: ProjectType) => {
        setProjectTypeToCreate(type);
        setIsAICreatorOpen(true);
    };

    const handleCreateWithAI = async (prompt: string) => {
        const { title, description } = await createProjectWithAI(prompt, projectTypeToCreate);
        if (title.includes('Erro')) {
            setIsAICreatorOpen(false);
            return;
        }

        const newProject: Story & { isMiniSeries?: boolean } = {
            id: `proj-${crypto.randomUUID()}`,
            title,
            description,
            status: 'draft',
            scenes: [],
            characters: [],
            isMiniSeries: projectTypeToCreate === 'series'
        };

        const current = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
        localStorage.setItem('nexora_custom_projects_v1', JSON.stringify([newProject, ...current]));
        window.dispatchEvent(new Event('nexora_projects_updated'));
        setIsAICreatorOpen(false);
    };

    const filteredProjects = stories.filter(p => activeTab === 'series' ? p.isMiniSeries : !p.isMiniSeries);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Central de Projetos</h2>
                    <p className="text-slate-400">Orquestre suas produções independentes e seriadas.</p>
                </div>
                
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
                    <button onClick={() => setActiveTab('story')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'story' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Histórias</button>
                    <button onClick={() => setActiveTab('series')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'series' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Séries</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group flex flex-col shadow-xl min-h-[340px]">
                        <div className="flex-1">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${project.isMiniSeries ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                {project.isMiniSeries ? 'Mini-Série' : 'Longa'}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2 mt-3">{project.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-3 mb-6">{project.description}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                            <Link to={`/roteiro/${project.id}`} className="block w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold text-white transition-colors">ABRIR ESTÚDIO</Link>
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={() => handleOpenAICreator(activeTab)}
                    className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-blue-400 transition-all bg-slate-900/20 min-h-[340px]"
                >
                    <div className="p-4 bg-slate-800/50 rounded-full"><Icons.Plus /></div>
                    <span className="font-bold uppercase text-[10px] tracking-widest text-slate-500">Criar {activeTab === 'series' ? 'Série' : 'História'} com IA</span>
                </button>
            </div>

            <AICreatorModal
                isOpen={isAICreatorOpen}
                onClose={() => setIsAICreatorOpen(false)}
                onCreate={handleCreateWithAI}
                projectType={projectTypeToCreate}
            />
        </div>
    );
}
