
import React, { useState, useEffect } from 'react';
import { Character } from '../../types';
import { Icons } from '../../constants';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Partial<Character>) => void;
  initialData?: Character;
}

const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [description, setDescription] = useState('');
    const [visualTraits, setVisualTraits] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setRole(initialData.role);
            setDescription(initialData.description);
            setVisualTraits(initialData.visualTraits);
            setReferenceImage(initialData.referenceImageUrl || null);
        } else {
            setName(''); setRole(''); setDescription(''); setVisualTraits(''); setReferenceImage(null);
        }
    }, [initialData, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setReferenceImage(reader.result as string);
          reader.readAsDataURL(file);
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name, role, description, visualTraits, referenceImageUrl: referenceImage || undefined
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{initialData ? 'Ajustar Personagem' : 'Laboratório de Personagem'}</h3>
                        <p className="text-sm text-slate-500 font-medium">Defina a essência visual e narrativa para o Jabuti.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all">
                        <Icons.Trash />
                    </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identidade do Ator</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Personagem" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" required/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Papel na Trama</label>
                                <input value={role} onChange={e => setRole(e.target.value)} placeholder="Ex: Detetive Recluso" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" required/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Biografia Curta</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve história de origem..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 resize-none" required/>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Traços Visuais Detalhados</label>
                                <textarea value={visualTraits} onChange={e => setVisualTraits(e.target.value)} placeholder="Cabelo, olhos, estilo de roupa, cicatrizes... (Importante para IA)" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 resize-none" required/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Referência Visual Principal</label>
                                <div className="aspect-video bg-slate-950 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden relative group" onClick={() => document.getElementById('char-ref-upload-modal')?.click()}>
                                    {referenceImage ? (
                                        <img src={referenceImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Icons.Camera />
                                            <span className="text-[10px] font-black uppercase">Upload de Frame</span>
                                        </div>
                                    )}
                                    <input id="char-ref-upload-modal" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    {referenceImage && <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">Trocar Imagem</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-slate-400 hover:text-white uppercase text-[10px] tracking-widest transition-all">Cancelar</button>
                    <button onClick={handleSave} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95">
                        {initialData ? 'Atualizar Ator' : 'Salvar no Elenco'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreatorModal;
