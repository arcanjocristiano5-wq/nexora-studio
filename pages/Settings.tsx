
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { SystemSettings, AIConfiguration, LocalModelDeployment, AIWorker } from '../types';
import { checkHardwareCapability, downloadLocalModel } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const INITIAL_CLOUD_MODELS: AIConfiguration[] = [
  { id: 'g1', name: 'Jabuti Flash (Padrão)', provider: 'cloud', modelName: 'gemini-3-flash-preview', isActive: true, priority: 1, capabilities: ['text', 'scripting'] },
  { id: 'g2', name: 'Jabuti Pro (Analítico)', provider: 'cloud', modelName: 'gemini-3-pro-preview', isActive: true, priority: 2, capabilities: ['text', 'video', 'image', 'analytics'] },
];

const INITIAL_LOCAL_MODELS: LocalModelDeployment[] = [
  { id: 'l1', name: 'Jabuti Local (Llama 3)', size: '4.8GB', status: 'ready', progress: 100, type: 'core', capability: 'text', vramRequiredGb: 6.0 },
  { id: 'l2', name: 'ArtFlow Local', size: '2.1GB', status: 'not_installed', progress: 0, type: 'specialized', capability: 'image', vramRequiredGb: 4.0 },
];

export default function Settings() {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('nexora_system_settings_v4');
        const workers = JSON.parse(localStorage.getItem('nexora_installed_workers') || '[]');
        return saved ? { ...JSON.parse(saved), installedWorkers: workers } : { 
          primaryBrainId: 'g1',
          autoDownloadWorkers: true,
          activeModels: INITIAL_CLOUD_MODELS,
          localModels: INITIAL_LOCAL_MODELS,
          installedWorkers: workers,
          voiceActivation: false
        };
    });

    const [activeTab, setActiveTab] = useState<'cloud' | 'local' | 'swarm'>('cloud');
    const [isForgeOpen, setIsForgeOpen] = useState(false);
    const [newModel, setNewModel] = useState<Partial<AIConfiguration>>({ name: '', modelName: '', provider: 'cloud', apiKey: '' });

    useEffect(() => {
        localStorage.setItem('nexora_system_settings_v4', JSON.stringify(settings));
        window.dispatchEvent(new Event('storage'));
    }, [settings]);

    const handleAddModel = () => {
        if (!newModel.name || !newModel.modelName) return;
        const model: AIConfiguration = {
            id: crypto.randomUUID(),
            name: newModel.name!,
            modelName: newModel.modelName!,
            provider: newModel.provider!,
            apiKey: newModel.apiKey,
            isActive: true,
            priority: settings.activeModels.length + 1,
            capabilities: ['text']
        };
        setSettings({ ...settings, activeModels: [...settings.activeModels, model] });
        setIsForgeOpen(false);
        setNewModel({ name: '', modelName: '', provider: 'cloud', apiKey: '' });
    };

    const toggleModel = (id: string) => {
        setSettings({
            ...settings,
            activeModels: settings.activeModels.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m)
        });
    };

    const deleteModel = (id: string) => {
        setSettings({
            ...settings,
            activeModels: settings.activeModels.filter(m => m.id !== id)
        });
    };

    const downloadLocal = async (id: string) => {
        setSettings(prev => ({
            ...prev,
            localModels: prev.localModels.map(m => m.id === id ? { ...m, status: 'downloading', progress: 0 } : m)
        }));
        await downloadLocalModel(id, (p) => {
            setSettings(prev => ({
                ...prev,
                localModels: prev.localModels.map(m => m.id === id ? { ...m, progress: p } : m)
            }));
        });
        setSettings(prev => ({
            ...prev,
            localModels: prev.localModels.map(m => m.id === id ? { ...m, status: 'ready', progress: 100 } : m)
        }));
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Command Cockpit</h2>
                    <p className="text-slate-400 font-medium">Orquestre os cérebros do Jabuti e gerencie seu enxame local.</p>
                </div>
                <button 
                  onClick={() => setIsForgeOpen(true)}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white shadow-2xl flex items-center gap-3 transition-all active:scale-95 uppercase text-xs"
                >
                  <Icons.Plus /> IA Forge
                </button>
            </div>

            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
                <button onClick={() => setActiveTab('cloud')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'cloud' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Cloud Engine</button>
                <button onClick={() => setActiveTab('local')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>Local Engine</button>
                <button onClick={() => setActiveTab('swarm')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'swarm' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Active Swarm</button>
            </div>

            {activeTab === 'cloud' ? (
                <div className="space-y-6">
                    {settings.activeModels.map(model => (
                        <div key={model.id} className={`p-8 bg-slate-900 border rounded-[32px] flex items-center justify-between transition-all ${settings.primaryBrainId === model.id ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 opacity-60'} ${!model.isActive && 'grayscale blur-[1px]'}`}>
                            <div className="flex items-center gap-6">
                                <div className={`p-5 rounded-2xl ${model.isActive ? 'bg-blue-600/10 text-blue-500' : 'bg-slate-800 text-slate-600'}`}>
                                    <Icons.Sparkles />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">{model.name}</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{model.modelName} • {model.provider}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {model.isActive && (
                                    <button onClick={() => setSettings({...settings, primaryBrainId: model.id})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.primaryBrainId === model.id ? 'bg-blue-600 text-white shadow-blue-500/50 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                        {settings.primaryBrainId === model.id ? 'CÉREBRO MASTER' : 'DEFINIR MASTER'}
                                    </button>
                                )}
                                <button onClick={() => toggleModel(model.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${model.isActive ? 'text-red-500 hover:bg-red-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
                                    {model.isActive ? 'DESATIVAR' : 'ATIVAR'}
                                </button>
                                {model.id !== 'g1' && model.id !== 'g2' && (
                                    <button onClick={() => deleteModel(model.id)} className="p-2 text-slate-700 hover:text-red-500"><Icons.Trash /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'local' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {settings.localModels.map(model => (
                        <div key={model.id} className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xl font-bold text-white">{model.name}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{model.size} • {model.vramRequiredGb}GB VRAM</p>
                                </div>
                                <div className="text-purple-500"><Icons.BrainCircuit /></div>
                            </div>
                            {model.status === 'ready' ? (
                                <button onClick={() => setSettings({...settings, primaryBrainId: model.id})} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${settings.primaryBrainId === model.id ? 'bg-purple-600 text-white shadow-xl' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                    {settings.primaryBrainId === model.id ? 'CÉREBRO LOCAL ATIVO' : 'ATIVAR LOCAL MASTER'}
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <button onClick={() => downloadLocal(model.id)} disabled={model.status === 'downloading'} className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                                        {model.status === 'downloading' ? `Baixando IA... ${model.progress}%` : 'Baixar e Instalar Localmente'}
                                    </button>
                                    <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest">Requer WebGPU Ativo</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settings.installedWorkers.map(worker => (
                        <div key={worker.id} className="p-6 bg-slate-900 border border-emerald-500/20 rounded-[32px] space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Icons.Sparkles /></div>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{worker.size}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-base">{worker.name}</h4>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{worker.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isForgeOpen && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4" onClick={() => setIsForgeOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">IA Forge</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da IA</label>
                                <input value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none" placeholder="Ex: Jabuti Custom Master" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID do Modelo (ex: gemini-3-pro)</label>
                                <input value={newModel.modelName} onChange={e => setNewModel({...newModel, modelName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none" placeholder="gemini-3-pro-preview" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chave API (Opcional)</label>
                                <input value={newModel.apiKey} onChange={e => setNewModel({...newModel, apiKey: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none" type="password" placeholder="••••••••••••" />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button onClick={() => setIsForgeOpen(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white uppercase text-xs">Cancelar</button>
                                <button onClick={handleAddModel} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs shadow-2xl">Salvar IA</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
