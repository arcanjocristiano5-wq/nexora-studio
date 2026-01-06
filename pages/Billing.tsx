
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../constants';
import { SystemSettings } from '../types';

const BILLING_STORAGE_KEY = 'nexora_billing_limits_v2';
const API_KEYS_STORAGE_KEY = 'nexora_api_keys_v1';

type ProviderId = 'gemini' | 'openai';

interface Provider {
  id: ProviderId;
  name: string;
  icon: React.ReactNode;
  billingUrl: string;
}

const PROVIDERS: Provider[] = [
  { id: 'gemini', name: 'Google Gemini', icon: <Icons.Sparkles />, billingUrl: 'https://ai.google.dev/gemini-api/docs/billing' },
  { id: 'openai', name: 'OpenAI (GPT)', icon: <Icons.OpenAI />, billingUrl: 'https://platform.openai.com/account/billing' },
];

const initialUsage = {
  gemini: { text: 1250000, image: 450, video: 120 },
  openai: { prompt: 800000, completion: 400000, image: 250 },
};

export default function Billing() {
  const [activeProvider, setActiveProvider] = useState<ProviderId>('gemini');
  const [limits, setLimits] = useState<Record<ProviderId, number>>(() => {
    const saved = localStorage.getItem(BILLING_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { gemini: 100, openai: 100 };
  });

  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>(() => {
    const saved = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { gemini: '', openai: '' };
  });

  const [newLimitInput, setNewLimitInput] = useState<string>(limits[activeProvider].toString());
  const [newApiKeyInput, setNewApiKeyInput] = useState<string>(apiKeys[activeProvider]);
  const [usage, setUsage] = useState(initialUsage);

  useEffect(() => {
    setNewLimitInput(limits[activeProvider].toString());
    setNewApiKeyInput(apiKeys[activeProvider]);
  }, [activeProvider, limits, apiKeys]);

  const handleSaveKey = () => {
      const newKeys = { ...apiKeys, [activeProvider]: newApiKeyInput };
      setApiKeys(newKeys);
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(newKeys));

      // Atualiza a chave nos modelos de nuvem
      const settingsRaw = localStorage.getItem('nexora_system_settings_v4');
      if(settingsRaw) {
        const settings: SystemSettings = JSON.parse(settingsRaw);
        const updatedModels = settings.activeModels.map(m => {
          if (m.provider === 'cloud') { // Assumindo que todos os cloud são gemini por enquanto
            return { ...m, apiKey: newApiKeyInput };
          }
          return m;
        });
        const updatedSettings = { ...settings, activeModels: updatedModels };
        localStorage.setItem('nexora_system_settings_v4', JSON.stringify(updatedSettings));
        window.dispatchEvent(new Event('storage'));
      }

      alert("Chave API salva com sucesso!");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(prev => ({
        gemini: {
          text: prev.gemini.text + Math.floor(Math.random() * 10000),
          image: prev.gemini.image + Math.floor(Math.random() * 3),
          video: prev.gemini.video + Math.floor(Math.random() * 5),
        },
        openai: {
          prompt: prev.openai.prompt + Math.floor(Math.random() * 8000),
          completion: prev.openai.completion + Math.floor(Math.random() * 4000),
          image: prev.openai.image + Math.floor(Math.random() * 2),
        }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const costs = useMemo(() => {
    const geminiCost = (usage.gemini.text / 1000000) * 0.7 + usage.gemini.image * 0.02 + (usage.gemini.video / 60) * 0.10;
    const openaiCost = (usage.openai.prompt / 1000000) * 1.5 + (usage.openai.completion / 1000000) * 2.0 + usage.openai.image * 0.04;
    return { gemini: geminiCost, openai: openaiCost };
  }, [usage]);

  const totalUsage = costs[activeProvider];
  const limit = limits[activeProvider];
  const usagePercentage = Math.min((totalUsage / limit) * 100, 100);
  const activeProviderData = PROVIDERS.find(p => p.id === activeProvider)!;

  const handleSetLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLimit = parseFloat(newLimitInput);
    if (!isNaN(newLimit) && newLimit > 0) {
      const newLimits = { ...limits, [activeProvider]: newLimit };
      setLimits(newLimits);
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(newLimits));
    }
  };
  
  const getUsageColor = () => {
      if (usagePercentage > 90) return 'bg-red-500';
      if (usagePercentage > 70) return 'bg-amber-500';
      return 'bg-blue-500';
  }

  const renderUsageDetails = () => {
      if (activeProvider === 'gemini') {
          return (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-slate-300 mb-2">Texto (Flash & Pro)</h4>
                <p className="text-2xl font-black text-white">{ (usage.gemini.text / 1000000).toFixed(2) }M <span className="text-sm font-medium text-slate-500">tokens</span></p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-slate-300 mb-2">Imagem (Flash Image)</h4>
                <p className="text-2xl font-black text-white">{ usage.gemini.image } <span className="text-sm font-medium text-slate-500">imagens</span></p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-slate-300 mb-2">Vídeo (Veo)</h4>
                <p className="text-2xl font-black text-white">{ usage.gemini.video } <span className="text-sm font-medium text-slate-500">segundos</span></p>
              </div>
            </>
          );
      }
      if (activeProvider === 'openai') {
          return (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-slate-300 mb-2">Entrada (Prompt)</h4>
                <p className="text-2xl font-black text-white">{ (usage.openai.prompt / 1000000).toFixed(2) }M <span className="text-sm font-medium text-slate-500">tokens</span></p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-slate-300 mb-2">Saída (Completion)</h4>
                <p className="text-2xl font-black text-white">{ (usage.openai.completion / 1000000).toFixed(2) }M <span className="text-sm font-medium text-slate-500">tokens</span></p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-slate-300 mb-2">Imagem (DALL-E)</h4>
                <p className="text-2xl font-black text-white">{ usage.openai.image } <span className="text-sm font-medium text-slate-500">imagens</span></p>
              </div>
            </>
          )
      }
      return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-white">Controle de Faturamento (Nuvem)</h2>
        <p className="text-slate-400">Monitore seus gastos estimados com IA e defina limites para evitar surpresas.</p>
      </div>
      
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner max-w-md">
        {PROVIDERS.map(p => (
            <button
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeProvider === p.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
                {p.icon} {p.name}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">Estimativa de Uso Mensal</h3>
                        <p className="text-xs text-slate-500">Ciclo renova em 15 dias.</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">USD ($)</span>
                </div>

                <div className="flex items-end gap-4 mb-6">
                    <span className="text-5xl font-black text-white">${totalUsage.toFixed(2)}</span>
                    <span className="text-xl font-bold text-slate-500 -mb-1">/ ${limit.toFixed(2)}</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-700/50 shadow-inner overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-lg ${getUsageColor()}`} 
                        style={{ width: `${usagePercentage}%`}}
                    />
                </div>
                {usagePercentage > 85 && (
                    <p className="text-xs text-center mt-2 text-red-400 font-bold">Atenção: Você atingiu {Math.round(usagePercentage)}% do seu limite de gastos.</p>
                )}
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className="font-bold text-white mb-4">Gerenciamento de Chaves API</h3>
                <div className="space-y-3">
                    <div className="relative">
                        <input
                            type="password"
                            value={newApiKeyInput}
                            onChange={e => setNewApiKeyInput(e.target.value)}
                            placeholder={`Cole sua chave ${activeProviderData.name} aqui`}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button onClick={handleSaveKey} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors">
                        Salvar Chave
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderUsageDetails()}
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="font-bold text-white mb-4">Definir Limite de Gastos</h3>
                <form onSubmit={handleSetLimit} className="space-y-3">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">$</span>
                        <input
                            type="number"
                            value={newLimitInput}
                            onChange={e => setNewLimitInput(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            min="1"
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors">
                        Salvar Limite
                    </button>
                </form>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-3 text-amber-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="font-bold text-white">Fonte da Verdade</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    Este painel é uma **estimativa**. Para dados precisos, sempre consulte o painel oficial do seu provedor de IA.
                </p>
                <a 
                    href={activeProviderData.billingUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                    Acessar Painel do {activeProviderData.name}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}
