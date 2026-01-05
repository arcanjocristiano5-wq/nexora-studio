
import React, { useState, useEffect } from 'react';
import { Icons, VISUAL_STYLES } from '../constants';
import { learnChannelTone } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

export default function Series() {
  const [channels, setChannels] = useState<any[]>(() => {
    const saved = localStorage.getItem('nexora_channels_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [newChannel, setNewChannel] = useState({ 
    name: '', 
    url: '', 
    platform: 'youtube', 
    guidelines: '', 
    toneProfile: '' 
  });

  useEffect(() => {
    localStorage.setItem('nexora_channels_v2', JSON.stringify(channels));
  }, [channels]);

  const handleLearnTone = async () => {
    if (!newChannel.url) return;
    setIsLearning(true);
    try {
      const tone = await learnChannelTone(newChannel.url);
      setNewChannel({ ...newChannel, toneProfile: tone || '' });
    } catch (error) {
      alert("Jabuti não conseguiu acessar a URL. Verifique se o canal é público.");
    } finally {
      setIsLearning(false);
    }
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    setChannels([...channels, { ...newChannel, id: crypto.randomUUID() }]);
    setIsCreating(false);
    setNewChannel({ name: '', url: '', platform: 'youtube', guidelines: '', toneProfile: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Gerência de Contas</h2>
          <p className="text-slate-400 font-medium">Conecte seus canais e defina as diretrizes que o Jabuti deve seguir.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white shadow-2xl flex items-center gap-3 transition-all active:scale-95 uppercase text-xs"
        >
          <Icons.Plus /> Adicionar Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {channels.map(channel => (
          <div key={channel.id} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl group hover:border-blue-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
               <button onClick={() => setChannels(channels.filter(c => c.id !== channel.id))} className="text-red-500 hover:text-red-400">
                  <Icons.Trash />
               </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-slate-800 rounded-2xl text-blue-400">
                {channel.platform === 'youtube' ? <Icons.Series /> : channel.platform === 'tiktok' ? <Icons.Stories /> : <Icons.Video />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{channel.name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{channel.platform}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Perfil de Tom (Aprendido)</p>
                <p className="text-xs text-slate-400 line-clamp-2 italic">{channel.toneProfile || 'Aguardando treinamento do Jabuti...'}</p>
              </div>
              
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Diretrizes de Compliance</p>
                <p className="text-xs text-slate-400 line-clamp-2">{channel.guidelines || 'Padrão da Comunidade Nexora Ativo.'}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-600 uppercase">Status: Ativo</span>
               <button className="text-[10px] font-black text-blue-400 hover:text-white uppercase tracking-widest">Acessar Workspace</button>
            </div>
          </div>
        ))}

        {channels.length === 0 && (
          <button 
            onClick={() => setIsCreating(true)}
            className="col-span-full py-24 border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-900/10 flex flex-col items-center gap-4 group hover:border-blue-500/50 transition-all"
          >
            <div className="p-6 bg-slate-800/50 rounded-full group-hover:scale-110 transition-transform">
              <Icons.Plus />
            </div>
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Nenhuma conta conectada</p>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4" onClick={() => setIsCreating(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
             <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Conectar Novo Canal</h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white"><Icons.Trash /></button>
             </div>

             <form onSubmit={handleAddChannel} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                    <input required value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Canal de Mistérios" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plataforma</label>
                    <select value={newChannel.platform} onChange={e => setNewChannel({...newChannel, platform: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none">
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">URL do Canal (Para Aprendizado)</label>
                    {isLearning && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <div className="flex gap-4">
                    <input value={newChannel.url} onChange={e => setNewChannel({...newChannel, url: e.target.value})} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white outline-none" placeholder="https://youtube.com/@seu_canal" />
                    <button type="button" onClick={handleLearnTone} disabled={isLearning || !newChannel.url} className="px-6 py-3 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">Treinar Jabuti</button>
                  </div>
                  {newChannel.toneProfile && (
                    <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">Tom Detectado:</p>
                      <p className="text-xs text-slate-400 italic line-clamp-3 leading-relaxed">{newChannel.toneProfile}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Diretrizes Específicas do Canal</label>
                    <textarea value={newChannel.guidelines} onChange={e => setNewChannel({...newChannel, guidelines: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Não usar palavras agressivas, manter tom educacional, focar em mistério..." />
                </div>

                <div className="pt-4 flex gap-4">
                   <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white uppercase text-xs">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs shadow-2xl shadow-blue-900/30">Conectar Canal</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
