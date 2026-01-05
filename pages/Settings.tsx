
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { SystemSettings, HardwareStatus, AIConfiguration, LocalModelDeployment, AICapability } from '../types';
import { performHardwareBenchmark, downloadLocalModel } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const INITIAL_LOCAL_MODELS: LocalModelDeployment[] = [
  { id: 'l1', name: 'Jabuti Nano (Llama 3 8B)', size: '4.7GB', status: 'ready', progress: 100, type: 'core', capability: 'text', vramRequiredGb: 5.5 },
];

export default function Settings() {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('nexora_system_settings_v3');
        return saved ? JSON.parse(saved) : { 
          primaryEngine: 'cloud', 
          fallbackEnabled: true,
          voiceActivation: true,
          voiceOutput: true,
          wakeWord: 'Jabuti',
          maxResolution: '4K',
          autoSchedule: true,
          activeModels: [
            { id: '1', name: 'Jabuti Cloud Master', provider: 'cloud', modelName: 'gemini-3-pro-preview', priority: 1, isActive: true, capabilities: ['text', 'video'], inputCostPer1M: 0.50, outputCostPer1M: 1.50 },
            { id: '2', name: 'Stable Diffusion Cloud', provider: 'cloud', modelName: 'imagen-3', priority: 2, isActive: true, capabilities: ['image'], inputCostPer1M: 1.00, outputCostPer1M: 2.50 },
          ],
          localModels: INITIAL_LOCAL_MODELS
        };
    });

    const [hw, setHw] = useState<HardwareStatus | null>(null);
    const [isInjecting, setIsInjecting] = useState(false);
    const [searchModel, setSearchModel] = useState('');
    const [activeTab, setActiveTab] = useState<'economics' | 'swarm'>('economics');

    useEffect(() => {
        localStorage.setItem('nexora_system_settings_v3', JSON.stringify(settings));
        performHardwareBenchmark().then(setHw);
    }, [settings]);

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

    const handleAutoInject = () => {
        if (!searchModel) return;
        setIsInjecting(true);
        
        // Simulação do Jabuti buscando nos repositórios (HuggingFace/Github)
        setTimeout(() => {
            const newModel: LocalModelDeployment = {
                id: crypto.randomUUID(),
                name: searchModel,
                size: `${(Math.random() * 10 + 1).toFixed(1)}GB`,
                status: 'not_installed',
                progress: 0,
                type: 'specialized',
                capability: 'text',
                vramRequiredGb: Math.floor(Math.random() * 8) + 2
            };
            setSettings(prev => ({...prev, localModels: [...prev.localModels, newModel]}));
            setIsInjecting(false);
            setSearchModel('');
            handleModelDownload(newModel.id);
        }, 1500);
    };

    const updateCost = (id: string, field: 'inputCostPer1M' | 'outputCostPer1M', val: number) => {
        setSettings(prev => ({
            ...prev,
            activeModels: prev.activeModels.map(m => m.id === id ? { ...m, [field]: val } : m)
        }));
    };

    const vramActive = settings.localModels
        .filter(m => m.status === 'ready')
        .reduce((acc, curr) => acc + curr.vramRequiredGb, 0);

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Command Cockpit</h2>
                    <p className="text-slate-400 font-medium">Controle financeiro e expansão neural do Jabuti.</p>
                </div>
                <div className="w-16 h-16">
                    <Jabuti state={isInjecting ? 'thinking' : 'idle'} subState={isInjecting ? 'web-search' : undefined} />
                </div>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 w-fit">
                <button onClick={() => setActiveTab('economics')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'economics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Token Economics</button>
                <button onClick={() => setActiveTab('swarm')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'swarm' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Swarm Fleet</button>
            </div>

            {activeTab === 'economics' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left-4">
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8 shadow-2xl">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gerenciamento de Custos de Cloud</h3>
                        <div className="space-y-4">
                            {settings.activeModels.map(model => (
                                <div key={model.id} className="p-6 bg-slate-950 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    <div>
                                        <p className="font-bold text-white">{model.name}</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-black">{model.modelName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-600 uppercase">Input / 1M</label>
                                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                                            <span className="text-slate-500 font-bold">$</span>
                                            <input type="number" step="0.01" value={model.inputCostPer1M} onChange={e => updateCost(model.id, 'inputCostPer1M', parseFloat(e.target.value))} className="bg-transparent text-white font-bold text-xs outline-none w-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-600 uppercase">Output / 1M</label>
                                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                                            <span className="text-slate-500 font-bold">$</span>
                                            <input type="number" step="0.01" value={model.outputCostPer1M} onChange={e => updateCost(model.id, 'outputCostPer1M', parseFloat(e.target.value))} className="bg-transparent text-white font-bold text-xs outline-none w-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 h-fit space-y-6">
                        <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Relatório de ROI</h3>
                        <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 text-center">
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Com base nos custos definidos, o Jabuti otimiza o uso de tokens para que cada vídeo produzido custe menos de $0.50 em processamento cloud.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Swarm Fleet (Modelos Locais)</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Injete novos workers e monitore a VRAM</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <input 
                                    value={searchModel}
                                    onChange={e => setSearchModel(e.target.value)}
                                    placeholder="Nome do Modelo (Ex: Flux.1, Llama 3.1...)" 
                                    className="flex-1 md:w-64 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:ring-1 focus:ring-purple-500" 
                                />
                                <button 
                                    onClick={handleAutoInject}
                                    disabled={isInjecting || !searchModel}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded-2xl font-black text-white uppercase text-[10px] tracking-widest transition-all"
                                >
                                    {isInjecting ? 'Buscando...' : 'Injetar & Baixar'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-8 bg-slate-950 rounded-[32px] border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase">VRAM Ativa</span>
                                <h4 className={`text-4xl font-black italic ${vramActive > (hw?.vramTotalGb || 0) ? 'text-red-500' : 'text-purple-400'}`}>
                                    {vramActive.toFixed(1)}GB
                                </h4>
                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">CAPACIDADE: {hw?.vramEstimate || 'Detectando...'}</p>
                            </div>

                            {settings.localModels.map(model => (
                                <div key={model.id} className={`p-6 bg-slate-950 rounded-[32px] border transition-all ${model.status === 'ready' ? 'border-purple-500/30' : 'border-slate-800'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-white text-sm">{model.name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase font-black">{model.size} • {model.vramRequiredGb}GB VRAM</p>
                                        </div>
                                        <button onClick={() => setSettings({...settings, localModels: settings.localModels.filter(m => m.id !== model.id)})} className="text-slate-700 hover:text-red-500">
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                    {model.status === 'downloading' ? (
                                        <div className="space-y-2">
                                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${model.progress}%` }} />
                                            </div>
                                            <p className="text-[8px] text-purple-500 font-black text-right">{model.progress}%</p>
                                        </div>
                                    ) : model.status === 'ready' ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-[9px] font-black uppercase justify-center">
                                            Operational
                                        </div>
                                    ) : (
                                        <button onClick={() => handleModelDownload(model.id)} className="w-full py-2 bg-slate-900 hover:bg-purple-600 border border-slate-800 rounded-xl font-black text-white text-[9px] uppercase transition-all">
                                            Deploy
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
