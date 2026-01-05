
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { socialPlatforms as initialPlatforms } from '../data/social';

interface CustomPlatform {
  id: string;
  name: string;
}

export default function MidiaSocial() {
    const navigate = useNavigate();
    const [socialPlatforms, setSocialPlatforms] = useState(initialPlatforms);
    const [customPlatforms, setCustomPlatforms] = useState<CustomPlatform[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState('');

    const handleToggleConnection = (id: string) => {
        setSocialPlatforms(socialPlatforms.map(p =>
            p.id === id ? { ...p, connected: !p.connected } : p
        ));
    };

    const handleAddCustomPlatform = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlatformName.trim()) return;
        const newPlatform: CustomPlatform = {
            id: crypto.randomUUID(),
            name: newPlatformName,
        };
        setCustomPlatforms([...customPlatforms, newPlatform]);
        setNewPlatformName('');
        setIsModalOpen(false);
    };

    const handleRemoveCustomPlatform = (id: string) => {
        setCustomPlatforms(customPlatforms.filter(p => p.id !== id));
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Conexões de Mídia Social</h2>
                        <p className="text-slate-400">Gerencie suas contas para postagens automatizadas pelo Jabuti.</p>
                    </div>
                </div>

                <div className="space-y-6">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plataformas Principais</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {socialPlatforms.map(p => (
                            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${p.connected ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                        {p.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{p.name}</p>
                                        <p className={`text-xs font-bold ${p.connected ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {p.connected ? 'Conectado' : 'Desconectado'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleToggleConnection(p.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${p.connected ? 'bg-slate-800 hover:bg-red-500/20 hover:text-red-400' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                                    {p.connected ? 'Desconectar' : 'Conectar'}
                                </button>
                            </div>
                        ))}
                     </div>
                </div>
                
                <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conexões Personalizadas (Webhooks)</h3>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors">
                            <Icons.Plus />
                            Adicionar Conexão
                        </button>
                     </div>
                     {customPlatforms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {customPlatforms.map(p => (
                                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-slate-800 text-slate-500"><Icons.Link /></div>
                                        <div>
                                            <p className="font-bold text-white">{p.name}</p>
                                            <p className="text-xs font-bold text-emerald-400">Conectado</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveCustomPlatform(p.id)} className="px-4 py-2 rounded-lg text-xs font-bold transition-colors bg-slate-800 hover:bg-red-500/20 hover:text-red-400">
                                        Remover
                                    </button>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                            <p className="text-slate-500 text-sm">Nenhuma conexão personalizada adicionada.</p>
                        </div>
                     )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-8 text-center">
                     <h3 className="text-xl font-bold text-white mb-2">Estrategista de Mídia Jabuti</h3>
                     <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                        Após criar seu conteúdo, vá para a seção "Exportação" para preparar e publicar seu vídeo final nas plataformas conectadas.
                     </p>
                     <button 
                        onClick={() => navigate('/exportacao')}
                        className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto"
                    >
                        <Icons.Export />
                        Ir para Exportação
                    </button>
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-6">Adicionar Nova Conexão</h3>
                        <form onSubmit={handleAddCustomPlatform} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Plataforma ou Site</label>
                                <input
                                    required
                                    value={newPlatformName}
                                    onChange={e => setNewPlatformName(e.target.value)}
                                    placeholder="ex: Meu Blog WordPress"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chave de API (Simulado)</label>
                                <input
                                    type="password"
                                    placeholder="************************"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <p className="text-xs text-slate-600 mt-2">Para conexões reais, você inseriria sua chave de API ou usaria OAuth aqui.</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    Conectar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
