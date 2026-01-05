
import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { Icons } from '../constants';
import CharacterCreatorModal from '../components/Modals/CharacterCreatorModal';

export default function Casting() {
  const [fixedCharacters, setFixedCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('nexora_fixed_chars');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [temporaryCharacters, setTemporaryCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('nexora_temp_chars');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  useEffect(() => {
    localStorage.setItem('nexora_fixed_chars', JSON.stringify(fixedCharacters));
    localStorage.setItem('nexora_temp_chars', JSON.stringify(temporaryCharacters));
    window.dispatchEvent(new Event('storage'));
  }, [fixedCharacters, temporaryCharacters]);

  const handleSaveCharacter = (charData: any) => {
    if (editingCharacter) {
      // Editar existente
      if (editingCharacter.isFixed) {
        setFixedCharacters(prev => prev.map(c => c.id === editingCharacter.id ? { ...c, ...charData } : c));
      } else {
        setTemporaryCharacters(prev => prev.map(c => c.id === editingCharacter.id ? { ...c, ...charData } : c));
      }
    } else {
      // Criar novo (por padrão temporário)
      const newChar: Character = {
        ...charData,
        id: crypto.randomUUID(),
        isFixed: false
      };
      setTemporaryCharacters(prev => [newChar, ...prev]);
    }
    setIsModalOpen(false);
    setEditingCharacter(null);
  };

  const promoteToFixed = (char: Character) => {
    setFixedCharacters([...fixedCharacters, { ...char, isFixed: true }]);
    setTemporaryCharacters(temporaryCharacters.filter(c => c.id !== char.id));
  };

  const demoteFromFixed = (char: Character) => {
    setTemporaryCharacters([...temporaryCharacters, { ...char, isFixed: false }]);
    setFixedCharacters(fixedCharacters.filter(c => c.id !== char.id));
  };

  const deleteCharacter = (id: string, isFixed: boolean) => {
    if (isFixed) {
        setFixedCharacters(prev => prev.filter(c => c.id !== id));
    } else {
        setTemporaryCharacters(prev => prev.filter(c => c.id !== id));
    }
  };

  const openEdit = (char: Character) => {
    setEditingCharacter(char);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Personagens & Elenco</h2>
          <p className="text-slate-400 font-medium">Gerencie a alma das suas histórias. O Jabuti manterá a consistência visual de cada um.</p>
        </div>
        <button 
          onClick={() => { setEditingCharacter(null); setIsModalOpen(true); }}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white shadow-2xl flex items-center gap-3 transition-all active:scale-95 uppercase text-xs"
        >
          <Icons.Plus /> Criar Personagem
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ELENCO FIXO */}
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">Elenco Fixo (Memória Global)</h3>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">{fixedCharacters.length} ATORES</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {fixedCharacters.map(char => (
                    <div key={char.id} className="bg-slate-900 border border-blue-500/30 rounded-3xl p-5 flex items-center gap-6 group hover:border-blue-500 transition-all shadow-xl">
                        <div className="w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/5 relative">
                            {char.referenceImageUrl ? (
                                <img src={char.referenceImageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700"><Icons.Camera /></div>
                            )}
                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-lg truncate">{char.name}</h4>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{char.role}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{char.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => openEdit(char)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"><Icons.Settings /></button>
                            <button onClick={() => demoteFromFixed(char)} title="Mover para temporários" className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-amber-500 transition-all"><Icons.ArrowDown /></button>
                            <button onClick={() => deleteCharacter(char.id, true)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-700 hover:text-red-500 transition-all"><Icons.Trash /></button>
                        </div>
                    </div>
                ))}
                {fixedCharacters.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nenhum personagem fixo na memória.</p>
                    </div>
                )}
            </div>
        </section>

        {/* PERSONAGENS TEMPORÁRIOS */}
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Personagens de Projeto (Temporários)</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">{temporaryCharacters.length} EXTRAS</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {temporaryCharacters.map(char => (
                    <div key={char.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 flex items-center gap-6 group hover:border-slate-700 transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-slate-950 overflow-hidden flex-shrink-0 border border-white/5">
                            {char.referenceImageUrl ? <img src={char.referenceImageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><Icons.Camera /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-200 text-base truncate">{char.name}</h4>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{char.role}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openEdit(char)} className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-all"><Icons.Settings /></button>
                            <button onClick={() => promoteToFixed(char)} title="Promover a Elenco Fixo" className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Icons.Plus /></button>
                            <button onClick={() => deleteCharacter(char.id, false)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-700 hover:text-red-500 transition-all"><Icons.Trash /></button>
                        </div>
                    </div>
                ))}
                {temporaryCharacters.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-slate-900 rounded-3xl text-center">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Lista de temporários vazia.</p>
                    </div>
                )}
            </div>
        </section>
      </div>

      <CharacterCreatorModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCharacter(null); }} 
        onSave={handleSaveCharacter}
        initialData={editingCharacter || undefined}
      />
    </div>
  );
}
