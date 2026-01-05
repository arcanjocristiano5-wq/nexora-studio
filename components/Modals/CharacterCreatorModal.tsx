
import React, { useState } from 'react';
import { Character } from '../../types';
import { Icons } from '../../constants';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Omit<Character, 'id' | 'scope'>) => void;
}

const AngleGenerator: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  
  useState(() => {
    const timer = setTimeout(() => setIsGenerating(false), 2500);
    return () => clearTimeout(timer);
  });

  return (
    <div className="mt-4">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Folha de Referência (IA)</label>
        <div className="grid grid-cols-3 gap-3">
            {(['Frente', 'Perfil', 'Costas']).map(angle => (
                 <div key={angle} className="aspect-square bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <img src={imageUrl} className="w-full h-full object-cover rounded-lg" />
                    )}
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-2">{angle}</span>
                 </div>
            ))}
        </div>
    </div>
  );
};

const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [description, setDescription] = useState('');
    const [visualTraits, setVisualTraits] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);

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
        // Reset state
        setName(''); setRole(''); setDescription(''); setVisualTraits(''); setReferenceImage(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Criar Novo Personagem</h3>
                    <p className="text-sm text-slate-400">Adicione um novo membro ao seu elenco com detalhes e referências visuais.</p>
                </div>
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Personagem" className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700" required/>
                            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Papel na Trama (Ex: Protagonista)" className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700" required/>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição e biografia..." className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 h-24 resize-none" required/>
                            <textarea value={visualTraits} onChange={e => setVisualTraits(e.target.value)} placeholder="Características visuais (roupas, cicatrizes, etc)..." className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 h-24 resize-none" required/>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Referência Visual</label>
                            <div className="aspect-video bg-slate-800 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center" onClick={() => document.getElementById('char-ref-upload')?.click()}>
                                {referenceImage ? <img src={referenceImage} className="w-full h-full object-cover rounded-md"/> : <span className="text-sm text-slate-500">Clique para fazer upload</span>}
                                <input id="char-ref-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                            {referenceImage && <AngleGenerator imageUrl={referenceImage} />}
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold">Cancelar</button>
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold">Salvar Personagem</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CharacterCreatorModal;
