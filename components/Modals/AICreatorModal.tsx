
import React, { useState } from 'react';
import { Icons } from '../../constants';

interface AICreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (prompt: string) => Promise<void>;
  projectType: 'story' | 'series';
}

const AICreatorModal: React.FC<AICreatorModalProps> = ({ isOpen, onClose, onCreate, projectType }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      await onCreate(prompt);
    } catch (error) {
      console.error("Failed to create project with AI", error);
      alert("Ocorreu um erro ao criar o projeto. Tente novamente.");
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  if (!isOpen) return null;

  const titleText = projectType === 'series' ? 'Criar Nova Mini-Série com IA' : 'Criar Nova História com IA';
  const placeholderText = projectType === 'series' 
    ? "Ex: Uma série sobre uma IA que se torna consciente em uma estação espacial abandonada..."
    : "Ex: Uma história sobre um detetive que precisa resolver um crime em um mundo onde as memórias podem ser compradas e vendidas...";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-[40px] w-full max-w-2xl shadow-2xl p-10 animate-in zoom-in-95 duration-300" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{titleText}</h3>
        <p className="text-sm text-slate-400 mb-8">Dê uma ideia inicial para o Jabuti e ele irá gerar o conceito do seu projeto.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white text-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none custom-scrollbar"
            disabled={isLoading}
          />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-slate-400 uppercase text-xs tracking-widest transition-all">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !prompt.trim()}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest shadow-xl flex items-center gap-3 transition-all disabled:opacity-50"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isLoading ? 'Gerando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AICreatorModal;
