
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { SystemSettings, HardwareStatus, AIConfiguration, LocalModelDeployment, AICapability } from '../types';
import { performHardwareBenchmark, downloadLocalModel, checkKey, openKeySelection } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const INITIAL_LOCAL_MODELS: LocalModelDeployment[] = [
  { id: 'l1', name: 'Jabuti Brain (Llama 3.1 8B)', size: '4.8GB', status: 'ready', progress: 100, type: 'core', capability: 'text', vramRequiredGb: 6.0 },
];

export default function Settings() {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('nexora_system_settings_v4');
        return saved ? JSON.parse(saved) : { 
          primaryEngine: 'cloud', 
          primaryBrainId: '1',
          activeModels: [
            { id: '1', name: 'Cloud Master', provider: 'cloud', modelName: 'gemini-3-pro-preview', priority: 1, isActive: true, capabilities: ['text', 'video'], inputCostPer1M: 0.50, outputCostPer1M: 1.50 },
          ],
          localModels: INITIAL_LOCAL_MODELS
        };
    });

    const [hw, setHw] = useState<HardwareStatus | null>(null);
    const [activeTab, setActiveTab] = useState<'cloud' | 'local' | 'economics'>('cloud');
    const [isForgeOpen, setIsForgeOpen] = useState(false);
    
    // Estados para novos modelos
    const [newCloudModel, setNewCloudModel] = useState({ name: '', modelName: '', apiKey: '' });
    const [newLocalModel, setNewLocalModel] = useState({ name: '', size: '', vram: 4 });

    useEffect(() => {
        localStorage.setItem('nexora_system_settings_v4', JSON.stringify(settings));
        performHardwareBenchmark().then(setHw);
    }, [settings]);

    const handleSetPrimaryBrain = (id: string) => {
        setSettings({ ...settings, primaryBrainId: id });
    };

    const handleAddCloudModel = () => {
        if (!newCloudModel.modelName || !newCloudModel.name) return;
        const model: AIConfiguration = {
            id: crypto.randomUUID(),
            name: newCloudModel.name,
            provider: 'cloud',
            modelName: newCloudModel.modelName,
            apiKey: newCloudModel.apiKey,
            priority: settings.activeModels.length + 1,
            isActive: true,
            capabilities: ['text'],
            inputCostPer1M: 0.1,
            outputCostPer1M: 0.2
        };
        setSettings(prev => ({ ...prev, activeModels: [...prev.activeModels, model] }));
        setNewCloudModel({ name: '', modelName: '', apiKey: '' });
        setIsForgeOpen(false);
    };

    const handleAddLocalModel = () => {
        const model: LocalModelDeployment = {
            id: crypto.randomUUID(),
            name: newLocalModel.name,
            size: newLocalModel.size,
            status: 'not_installed',
            progress: 0,
            type: 'specialized',
            capability: 'text',
            vramRequiredGb: newLocalModel.vram
        };
        setSettings(prev => ({ ...prev, localModels: [...prev.localModels, model] }));
        setNewLocalModel({ name: '', size: '', vram: 4 });
        setIsForgeOpen(false);
    };

    const handleModelDownload = async (modelId: string) => {
        setSettings(prev => ({
            ...prev,
            localModels: prev.localModels.map(m => m.id === modelId ? { ...m, status: 'downloading', progress: 0 } : m)
        }));
        await downloadLocalModel(modelId, (p) => {
            setSettings(prev => ({
                ...prev,
                localModels: prev.localModels.map(m => m.id === modelId ? { ...m, progress: p } : m)
            }));
        });
        setSettings(prev => ({
            ...prev,
            localModels: prev.localModels.map(m => m.id === modelId ? { ...m, status: 'ready', progress: 100 } : m)
        }));
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Command Cockpit</h2>
                    <p className="text-slate-400 font-medium">Orquestração de modelos em nuvem e Workers locais.</p>
                </div>
                <button 
                    onClick={() => setIsForgeOpen(true)}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3"
                >
                    <Icons.Plus /> Injetar Novo Modelo
                </button>
            </div>

            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
                <button onClick={() => setActiveTab('cloud')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'cloud' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Cloud Swarm</button>
                <button onClick={() => setActiveTab('local')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>Local Workers</button>
                <button onClick={() => setActiveTab('economics')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'economics' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Finanças</button>
            </div>

            {activeTab === 'cloud' ? (
                <div className="space-y-6">
                    {settings.activeModels.map(model => (
                        <div key={model.id} className={`p-6 bg-slate-900 border rounded-3xl flex items-center justify-between group transition-all ${settings.primaryBrainId === model.id ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-800'}`}>
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${settings.primaryBrainId === model.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-500'}`}>
                                    <Icons.Brain />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">{model.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">{model.modelName} {settings.primaryBrainId === model.id ? '• CÉREBRO ATIVO' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {settings.primaryBrainId !== model.id && (
                                    <button onClick={() => handleSetPrimaryBrain(model.id)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black text-white uppercase transition-all">Definir como Cérebro</button>
                                )}
                                <button onClick={() => setSettings({...settings, activeModels: settings.activeModels.filter(m => m.id !== model.id)})} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all"><Icons.Trash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'local' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settings.localModels.map(model => (
                        <div key={model.id} className={`p-8 bg-slate-900 border rounded-[32px] space-y-6 transition-all ${settings.primaryBrainId === model.id ? 'border-purple-500 ring-1 ring-purple-500/20' : 'border-slate-800'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white text-lg">{model.name}</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-black">{model.size} • {model.vramRequiredGb}GB VRAM</p>
                                </div>
                                <div className={`${settings.primaryBrainId === model.id ? 'text-purple-500' : 'text-slate-700'}`}>
                                    <Icons.BrainCircuit />
                                </div>
                            </div>
                            {model.status === 'downloading' ? (
                                <div className="space-y-2">
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500" style={{ width: `${model.progress}%` }} />
                                    </div>
                                    <p className="text-[9px] text-purple-400 font-black uppercase">Instalando Swarm... {model.progress}%</p>
                                </div>
                            ) : model.status === 'ready' ? (
                                <div className="space-y-4">
                                    <div className="py-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase text-center rounded-xl">Operational</div>
                                    {settings.primaryBrainId !== model.id && (
                                        <button onClick={() => handleSetPrimaryBrain(model.id)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase">Definir como Cérebro</button>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => handleModelDownload(model.id)} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-[10px] uppercase">Baixar IA Local</button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 text-center opacity-50">
                    <p className="font-black text-slate-500 uppercase tracking-widest">Módulo de ROI em desenvolvimento pelo Jabuti.</p>
                </div>
            )}

            {/* MODAL MODEL FORGE */}
            {isForgeOpen && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setIsForgeOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-2xl shadow-2xl p-10 space-y-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Model Forge</h3>
                            <button onClick={() => setIsForgeOpen(false)} className="text-slate-500 hover:text-white"><Icons.Trash /></button>
                        </div>

                        <div className="space-y-10">
                            {/* CLOUD SECTION */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Novo Modelo Cloud (API)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input value={newCloudModel.name} onChange={e => setNewCloudModel({...newCloudModel, name: e.target.value})} placeholder="Nome (Ex: Meu Gemini Pro)" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                    <input value={newCloudModel.modelName} onChange={e => setNewCloudModel({...newCloudModel, modelName: e.target.value})} placeholder="ID Modelo (ex: gemini-1.5-pro)" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                </div>
                                <input value={newCloudModel.apiKey} onChange={e => setNewCloudModel({...newCloudModel, apiKey: e.target.value})} type="password" placeholder="Chave API (Opcional se usar Global)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                <button onClick={handleAddCloudModel} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase">Registrar na Nuvem</button>
                            </div>

                            <div className="border-t border-slate-800" />

                            {/* LOCAL SECTION */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Novo Modelo Local (Ollama/PyTorch)</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <input value={newLocalModel.name} onChange={e => setNewLocalModel({...newLocalModel, name: e.target.value})} placeholder="Nome IA" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                    <input value={newLocalModel.size} onChange={e => setNewLocalModel({...newLocalModel, size: e.target.value})} placeholder="Peso (ex: 4.5GB)" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                    <input value={newLocalModel.vram} onChange={e => setNewLocalModel({...newLocalModel, vram: parseInt(e.target.value)})} type="number" placeholder="VRAM (GB)" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                                </div>
                                <button onClick={handleAddLocalModel} className="w-full py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase">Adicionar à Fila de Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
