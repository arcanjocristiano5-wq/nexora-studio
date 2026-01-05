
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Story } from '../types';
import { Icons, INITIAL_STORIES } from '../constants';
import CoverGeneratorModal from '../components/Modals/CoverGeneratorModal';
import { generateProfessionalLaunchKit } from '../services/geminiService';

type ProjectType = 'story' | 'series';

export default function Projetos() {
    const [activeTab, setActiveTab] = useState<ProjectType>('story');
    const [stories, setStories] = useState<(Story & { isMiniSeries?: boolean })[]>(() => 
        INITIAL_STORIES.map(s => ({ ...s }))
    );
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isGeneratingKit, setIsGeneratingKit] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleCreateProject = (type: ProjectType) => {
        const newProject: any = {
            id: `proj-${crypto.randomUUID()}`,
            title: type === 'series' ? 'Nova Mini-Série' : 'Nova História',
            description: 'Defina a premissa deste novo projeto para que o Jabuti possa orquestrar as cenas.',
            status: 'draft',
            scenes: [],
            characters: [],
            subtitleStyleId: 'cinematic',
            isMiniSeries: type === 'series'
        };
        setStories(prev => [newProject, ...prev]);
    };

    const handleQuickLaunchKit = async (project: any) => {
        setIsGeneratingKit(project.id);
        try {
            const kit = await generateProfessionalLaunchKit(project.title, project.description, 'cloud');
            console.log("Kit de Lançamento:", kit);
            alert(`Estratégia Viral Gerada para: ${project.title}\nTítulos: ${kit.viralTitles[0]}\nVer detalhes na seção de Exportação.`);
        } finally {
            setIsGeneratingKit(null);
        }
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
                            <div className="flex gap-2 mb-3">
                                <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${project.isMiniSeries ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    {project.isMiniSeries ? 'Mini-Série' : 'Longa'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors text-white mb-2">{project.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-3 mb-6">{project.description}</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                                <span>{project.scenes.length} CENAS</span>
                                <button 
                                    onClick={() => handleQuickLaunchKit(project)}
                                    disabled={isGeneratingKit === project.id}
                                    className="text-blue-400 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    {isGeneratingKit === project.id ? 'PROCESSANDO...' : <><Icons.Sparkles /> ESTRATÉGIA VIRAL</>}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link to={`/roteiro/${project.id}`} className="py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold text-white transition-colors">EDITAR</Link>
                                <button onClick={() => navigate('/exportacao')} className="py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-colors">EXPORTAR 4K</button>
                            </div>
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={() => handleCreateProject(activeTab)}
                    className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-blue-400 transition-all bg-slate-900/20 min-h-[340px]"
                >
                    <div className="p-4 bg-slate-800/50 rounded-full"><Icons.Plus /></div>
                    <span className="font-bold uppercase text-[10px] tracking-widest text-slate-500">Novo Projeto</span>
                </button>
            </div>

            {isMetaModalOpen && selectedProject && (
                <CoverGeneratorModal 
                    isOpen={isMetaModalOpen}
                    onClose={() => setIsMetaModalOpen(false)}
                    title={selectedProject.title}
                    promptText={selectedProject.description}
                    genre={selectedProject.isMiniSeries ? 'Série' : 'Cinema'}
                    creativeBrief={selectedProject.description}
                />
            )}
        </div>
    );
}
