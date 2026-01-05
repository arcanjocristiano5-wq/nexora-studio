
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { SystemSettings, HardwareStatus, AIConfiguration } from '../types';
import { performHardwareBenchmark } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

export default function Settings() {
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('nexora_system_settings');
        return saved ? JSON.parse(saved) : { 
          primaryEngine: 'cloud', 
          fallbackEnabled: true,
          voiceActivation: true,
          voiceOutput: true,
          wakeWord: 'Jabuti',
          maxResolution: '4K',
          autoSchedule: true,
          activeModels: [
            { id: '1', name: 'Jabuti Cloud Master', provider: 'cloud', modelName: 'gemini-3-pro-preview', priority: 1, isActive: true, capabilities: ['text', 'video'] },
            { id: '2', name: 'Cérebro Local', provider: 'local', modelName: 'WebLLM-Llama3', priority: 2, isActive: true, capabilities: ['text'] },
          ]
        };
    });

    const [hw, setHw] = useState<HardwareStatus | null>(null);
    const [newModel, setNewModel] = useState({ name: '', model: '', key: '', provider: 'cloud' as any });

    useEffect(() => {
        localStorage.setItem('nexora_system_settings', JSON.stringify(settings));
        performHardwareBenchmark().then(setHw);
    }, [settings]);

    const addModel = () => {
        if (!newModel.name || !newModel.model) return;
        const config: AIConfiguration = {
            id: crypto.randomUUID(),
            name: newModel.name,
            provider: newModel.provider,
            modelName: newModel.model,
            apiKey: newModel.key,
            priority: settings.activeModels.length + 1,
            isActive: false,
            capabilities: ['text']
        };
        setSettings({...settings, activeModels: [...settings.activeModels, config]});
        setNewModel({ name: '', model: '', key: '', provider: 'cloud' });
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Cockpit de IA</h2>
                    <p className="text-slate-400 font-medium">Gerencie seu enxame de inteligências e as funções de voz do Jabuti.</p>
                </div>
                <div className="w-16 h-16">
                    <Jabuti state="idle" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* VOZ E ACIONAMENTO */}
                <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-8">
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Controle de Voz</h3>
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Palavra-Chave (Wake Word)</label>
                            <input value={settings.wakeWord} onChange={e => setSettings({...settings, wakeWord: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                            <p className="text-[9px] text-slate-600 uppercase font-black">Chame "{settings.wakeWord}" para ativar o assistente.</p>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-slate-400">Escuta Ativa (Microfone)</span>
                            <button onClick={() => setSettings({...settings, voiceActivation: !settings.voiceActivation})} className={`w-12 h-6 rounded-full relative transition-all ${settings.voiceActivation ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.voiceActivation ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-slate-400">Resposta Vocal (Falar)</span>
                            <button onClick={() => setSettings({...settings, voiceOutput: !settings.voiceOutput})} className={`w-12 h-6 rounded-full relative transition-all ${settings.voiceOutput ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.voiceOutput ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ADICIONAR NOVA IA */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Adicionar IA ao Enxame</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Amigável</label>
                            <input value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: Cérebro Local" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID do Modelo</label>
                            <input value={newModel.model} onChange={e => setNewModel({...newModel, model: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Ex: gemini-3-pro-preview" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">API Key (Opcional se Local)</label>
                            <input type="password" value={newModel.key} onChange={e => setNewModel({...newModel, key: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="Sua chave secreta..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Provedor</label>
                            <select value={newModel.provider} onChange={e => setNewModel({...newModel, provider: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none">
                                <option value="cloud">Nuvem (Gemini/OpenAI)</option>
                                <option value="local">Local (WebGPU/window.ai)</option>
                                <option value="custom_api">API Customizada</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={addModel} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-xl transition-all">
                        Integrar ao Cérebro do Jabuti
                    </button>
                </div>

                {/* LISTA DE MODELOS ATIVOS */}
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-4">Enxame Ativo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {settings.activeModels.map(m => (
                            <div key={m.id} className={`p-6 bg-slate-900 border rounded-3xl flex justify-between items-center transition-all ${m.isActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 opacity-60'}`}>
                                <div>
                                    <p className="font-bold text-white">{m.name}</p>
                                    <p className="text-[9px] text-slate-500 uppercase font-black">{m.provider} • {m.modelName}</p>
                                </div>
                                <button onClick={() => setSettings({...settings, activeModels: settings.activeModels.map(am => am.id === m.id ? {...am, isActive: !am.isActive} : am)})} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${m.isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}>
                                    <Icons.Sparkles />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
