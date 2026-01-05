
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { SystemSettings, HardwareStatus, AIConfiguration } from '../types';
import { performHardwareBenchmark } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const DEFAULT_MODELS: AIConfiguration[] = [
  { id: '1', name: 'Jabuti Master', provider: 'cloud', modelName: 'gemini-3-pro-preview', priority: 1, isActive: true },
  { id: '2', name: 'Jabuti Speed', provider: 'cloud', modelName: 'gemini-3-flash-preview', priority: 2, isActive: false },
  { id: '3', name: 'Cérebro Local', provider: 'local', modelName: 'WebLLM-Llama3', priority: 1, isActive: true },
];

export default function Settings() {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('nexora_system_settings');
        return saved ? JSON.parse(saved) : { 
          primaryEngine: 'cloud', 
          fallbackEnabled: true,
          voiceActivation: true, 
          wakeWord: 'Jabuti',
          maxResolution: '4K',
          autoSchedule: true,
          activeModels: DEFAULT_MODELS
        };
    });

    const [hw, setHw] = useState<HardwareStatus | null>(null);
    const [isBenchmarking, setIsBenchmarking] = useState(false);

    useEffect(() => {
        localStorage.setItem('nexora_system_settings', JSON.stringify(settings));
        performHardwareBenchmark().then(setHw);
    }, [settings]);

    const toggleModel = (id: string) => {
        setSettings(prev => ({
            ...prev,
            activeModels: prev.activeModels.map(m => 
                m.id === id ? { ...m, isActive: !m.isActive } : m
            )
        }));
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Cockpit de Inteligência</h2>
                    <p className="text-slate-400 font-medium">Configure o cérebro híbrido do Jabuti e seus operários locais.</p>
                </div>
                <div className="w-20 h-20">
                    <Jabuti state={isBenchmarking ? 'thinking' : 'idle'} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ENGINE SELECTOR */}
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-8">
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Motor Primário</h3>
                    <div className="space-y-4">
                        <button 
                            onClick={() => setSettings({...settings, primaryEngine: 'cloud'})}
                            className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center justify-between ${settings.primaryEngine === 'cloud' ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'bg-slate-950 border-slate-800'}`}
                        >
                            <div>
                                <p className="font-bold text-white">IA na Nuvem</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black">Máximo Poder • Requer Internet</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${settings.primaryEngine === 'cloud' ? 'bg-blue-500 border-blue-400' : 'border-slate-700'}`} />
                        </button>

                        <button 
                            onClick={() => setSettings({...settings, primaryEngine: 'local'})}
                            className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center justify-between ${settings.primaryEngine === 'local' ? 'bg-purple-600/10 border-purple-500 shadow-xl' : 'bg-slate-950 border-slate-800'}`}
                        >
                            <div>
                                <p className="font-bold text-white">IA Local (Cérebro)</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black">Privacidade Total • Processamento GPU</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${settings.primaryEngine === 'local' ? 'bg-purple-500 border-purple-400' : 'border-slate-700'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        <div>
                            <p className="text-xs font-bold text-white">Failover Híbrido</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Mudar para Nuvem se o Local falhar</p>
                        </div>
                        <button 
                            onClick={() => setSettings({...settings, fallbackEnabled: !settings.fallbackEnabled})}
                            className={`w-12 h-6 rounded-full transition-all relative ${settings.fallbackEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.fallbackEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* HARDWARE GRADE */}
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-6">
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Status de Hardware</h3>
                    <div className="flex flex-col items-center py-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                        <span className="text-[10px] font-bold text-slate-600 uppercase mb-2">Potência Detectada</span>
                        <h4 className={`text-5xl font-black italic ${hw?.tier === 'Platina' ? 'text-indigo-400' : 'text-amber-500'}`}>{hw?.tier || '...'}</h4>
                        <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase">{hw?.gpuName}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black">
                            <span className="text-slate-500 uppercase">Estimativa VRAM</span>
                            <span className="text-white">{hw?.vramEstimate}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black">
                            <span className="text-slate-500 uppercase">Motor Recomendado</span>
                            <span className="text-blue-500 uppercase">{hw?.recommendedEngine}</span>
                        </div>
                    </div>
                </div>

                {/* VOICE ACTIVATION */}
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-6">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Comando por Voz</h3>
                    <div className="space-y-4">
                         <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Palavra de Ativação</label>
                            <div className="flex gap-4">
                                <input 
                                    value={settings.wakeWord}
                                    onChange={e => setSettings({...settings, wakeWord: e.target.value})}
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-bold outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                    <Icons.Messages />
                                </div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-slate-400">Escuta Contínua Ativa</span>
                            <button 
                                onClick={() => setSettings({...settings, voiceActivation: !settings.voiceActivation})}
                                className={`w-12 h-6 rounded-full transition-all relative ${settings.voiceActivation ? 'bg-amber-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.voiceActivation ? 'left-7' : 'left-1'}`} />
                            </button>
                         </div>
                    </div>
                </div>

                {/* CLOUD MODEL MANAGEMENT */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Modelos Cloud (Neural Hub)</h3>
                        <button className="px-6 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Adicionar Provedor</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {settings.activeModels.map(model => (
                            <div key={model.id} className={`p-6 bg-slate-950 rounded-3xl border transition-all ${model.isActive ? 'border-blue-500/40 shadow-lg' : 'border-slate-800 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-white">{model.name}</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-black">{model.provider} • {model.modelName}</p>
                                    </div>
                                    <button onClick={() => toggleModel(model.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${model.isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        <Icons.Sparkles />
                                    </button>
                                </div>
                                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-600 uppercase">Prioridade: {model.priority}</span>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${model.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                        {model.isActive ? 'Ativo' : 'Standby'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
