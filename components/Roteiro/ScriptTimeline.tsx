
import React from 'react';
import { ScriptLine } from '../../types';
import { Icons } from '../../constants';

interface ScriptTimelineProps {
  lines: ScriptLine[];
  onAddScene: (line: ScriptLine) => void;
  onReset: () => void;
}

const ScriptTimeline: React.FC<ScriptTimelineProps> = ({ lines, onAddScene, onReset }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 min-h-[600px] shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Linha do Tempo do Roteiro</h3>
        <button onClick={onReset} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Voltar ao Editor</button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4 -mr-4">
        {lines.map(line => (
          <div key={line.id} className="grid grid-cols-[auto,1fr,auto] items-center gap-4 p-4 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
            <div className="text-blue-500">
              {line.type === 'dialogue' ? <Icons.Messages /> : <Icons.Camera />}
            </div>
            <div className="text-slate-300 font-serif">
              {line.type === 'dialogue' && <strong className="text-white font-sans font-bold uppercase">{line.character}: </strong>}
              {line.content}
            </div>
            <button onClick={() => onAddScene(line)} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              + Criar Cena
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScriptTimeline;
