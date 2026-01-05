
import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { Icons } from '../constants';
import { extractCharactersFromScript } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

export default function Casting() {
  const [fixedCharacters, setFixedCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('nexora_fixed_chars');
    return saved ? JSON.parse(saved) : [];
  });
  const [storyCharacters, setStoryCharacters] = useState<Character[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [scriptInput, setScriptInput] = useState('');

  useEffect(() => {
    localStorage.setItem('nexora_fixed_chars', JSON.stringify(fixedCharacters));
    // Dispara evento customizado para o assistente atualizar
    window.dispatchEvent(new Event('storage'));
  }, [fixedCharacters]);

  const handleExtract = async () => {
    if (!scriptInput.trim()) return;
    setIsExtracting(true);
    try {
      const extracted = await extractCharactersFromScript(scriptInput);
      setStoryCharacters(extracted.filter(c => !c.isFixed));
    } finally {
      setIsExtracting(false);
    }
  };

  const promoteToFixed = (char: Character) => {
    setFixedCharacters([...fixedCharacters, { ...char, isFixed: true, id: crypto.randomUUID() }]);
    setStoryCharacters(storyCharacters.filter(c => c.name !== char.name));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Elenco e Memória</h2>
          <p className="text-slate-400 font-medium">O Jabuti reconhecerá estes atores fixos em qualquer conversa ou roteiro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Extração Inteligente</h3>
            <textarea 
              value={scriptInput}
              onChange={e => setScriptInput(e.target.value)}
              placeholder="Cole o roteiro aqui. O Jabuti vai identificar quem é novo e quem já é do elenco fixo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white min-h-[200px] outline-none mb-6"
            />
            <button 
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-white uppercase text-xs"
            >
              {isExtracting ? 'Jabuti Consultando Memória...' : 'Auditar Elenco'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {storyCharacters.map((char, i) => (
               <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h4 className="text-lg font-bold text-white">{char.name}</h4>
                        <p className="text-[10px] font-black text-blue-500 uppercase">{char.role}</p>
                     </div>
                     <button onClick={() => promoteToFixed(char)} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <Icons.Plus />
                     </button>
                  </div>
                  <p className="text-xs text-slate-400">{char.description}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8">
           <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Elenco Fixo</h3>
           <div className="space-y-4">
              {fixedCharacters.map(char => (
                <div key={char.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                   <div>
                      <p className="font-bold text-white text-sm">{char.name}</p>
                      <p className="text-[9px] text-emerald-500 uppercase font-black">Em Memória</p>
                   </div>
                   <button onClick={() => setFixedCharacters(fixedCharacters.filter(c => c.id !== char.id))} className="text-slate-700 hover:text-red-500">
                      <Icons.Trash />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
