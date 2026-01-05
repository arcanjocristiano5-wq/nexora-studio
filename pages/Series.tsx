
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { learnChannelTone } from '../services/geminiService';
import { Channel } from '../types';
import Jabuti from '../components/Brand/Jabuti';

export default function Series() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('nexora_channels_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<Channel>>({ 
    name: '', 
    url: '', 
    platform: 'youtube', 
    guidelines: '', 
    toneProfile: '',
    authMethod: 'oauth',
    credentials: {}
  });

  useEffect(() => {
    localStorage.setItem('nexora_channels_v3', JSON.stringify(channels));
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
    const finalChannel = { ...newChannel, id: crypto.randomUUID() } as Channel;
    setChannels([...channels, finalChannel]);
    setIsCreating(false);
    setNewChannel({ name: '', url: '', platform: 'youtube', guidelines: '', toneProfile: '', authMethod: 'oauth', credentials: {} });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Canais de Postagem</h2>
          <p className="text-slate-400 font-medium">Vincule suas contas para que o Jabuti possa postar automaticamente.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white shadow-2xl flex items-center gap-3 transition-all active:scale-95 uppercase text-xs"
        >
          <Icons.Plus /> Conectar Canal Master
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {channels.map(channel => (
          <div key={channel.id} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl group hover:border-blue-500 transition-all relative">
            <button onClick={() => setChannels(channels.filter(c => c.id !== channel.id))} className="absolute top-6 right-6 p-2 text-slate-700 hover:text-red-500 transition-colors">
               <Icons.Trash />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-slate-800 rounded-2xl text-blue-400">
                {channel.platform === 'youtube' ? <Icons.Series /> : channel.platform === 'website' ? <Icons.Link /> : <Icons.Social />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{channel.name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{channel.platform} • {channel.authMethod}</p>
              </div>
            </div>

            <div className="space-y-3">
               <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Acesso do Jabuti</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{channel.credentials?.username || channel.credentials?.webhookUrl || 'Autorizado via OAuth'}</p>
               </div>
               <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <p className="text-[10px] text-emerald-500 font-black uppercase">Pronto para Publish</p>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4" onClick={() => setIsCreating(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Vincular Novo Destino</h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white"><Icons.Trash /></button>
             </div>

             <form onSubmit={handleAddChannel} className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome do Canal</label>
                    <input required value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none" placeholder="Ex: Central de Mistérios" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Plataforma</label>
                    <select value={newChannel.platform} onChange={e => setNewChannel({...newChannel, platform: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white outline-none">
                      <option value="youtube">YouTube (API)</option>
                      <option value="tiktok">TikTok (Mobile Sync)</option>
                      <option value="website">Site WordPress / Blog</option>
                      <option value="custom">Página Customizada</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Método de Acesso</label>
                  <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button type="button" onClick={() => setNewChannel({...newChannel, authMethod: 'oauth'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newChannel.authMethod === 'oauth' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Cloud OAuth</button>
                    <button type="button" onClick={() => setNewChannel({...newChannel, authMethod: 'login'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newChannel.authMethod === 'login' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Login Direto</button>
                    <button type="button" onClick={() => setNewChannel({...newChannel, authMethod: 'webhook'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newChannel.authMethod === 'webhook' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Webhook / API</button>
                  </div>
                </div>

                {newChannel.authMethod === 'login' && (
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-950 rounded-3xl border border-slate-800 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Usuário / Email</label>
                      <input 
                        value={newChannel.credentials?.username} 
                        onChange={e => setNewChannel({...newChannel, credentials: {...newChannel.credentials, username: e.target.value}})} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Senha</label>
                      <input 
                        type="password"
                        value={newChannel.credentials?.password} 
                        onChange={e => setNewChannel({...newChannel, credentials: {...newChannel.credentials, password: e.target.value}})} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none" 
                      />
                    </div>
                  </div>
                )}

                {newChannel.authMethod === 'webhook' && (
                  <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">URL de Destino / Webhook</label>
                    <input 
                      value={newChannel.credentials?.webhookUrl} 
                      onChange={e => setNewChannel({...newChannel, credentials: {...newChannel.credentials, webhookUrl: e.target.value}})} 
                      placeholder="https://seu-site.com/api/post"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mt-2 text-white outline-none" 
                    />
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                   <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-white uppercase text-xs">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs shadow-2xl">Confirmar Vínculo</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
