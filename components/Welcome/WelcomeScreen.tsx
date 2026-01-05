
import React, { useState, useEffect } from 'react';
import Logo from '../Brand/Logo';

interface SetupScreenProps {
  onComplete: () => void;
}

type SetupStage = 'analyzing' | 'downloading' | 'configuring' | 'complete';

const stageMessages: Record<SetupStage, string> = {
  analyzing: 'Analisando seu hardware para otimizar a performance...',
  downloading: 'Baixando motor de IA recomendado (Jabuti-Pro)...',
  configuring: 'Configurando diretórios e otimizando o ambiente de produção...',
  complete: 'Tudo pronto! Bem-vindo ao futuro da criação.'
};

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<SetupStage>('analyzing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const runSetup = async () => {
      // Fase 1: Análise
      setStage('analyzing');
      setProgress(0);
      await new Promise(res => setTimeout(res, 2000));
      setProgress(100);

      // Fase 2: Download
      await new Promise(res => setTimeout(res, 500));
      setStage('downloading');
      setProgress(0);
      const downloadInterval = setInterval(() => {
        setProgress(p => {
          const nextP = p + Math.random() * 15;
          if (nextP >= 100) {
            clearInterval(downloadInterval);
            return 100;
          }
          return nextP;
        });
      }, 300);
      await new Promise(res => setTimeout(res, 3500));

      // Fase 3: Configuração
      await new Promise(res => setTimeout(res, 500));
      setStage('configuring');
      setProgress(0);
      await new Promise(res => setTimeout(res, 500));
      setProgress(50);
      await new Promise(res => setTimeout(res, 1500));
      setProgress(100);
      
      // Fase 4: Conclusão
      await new Promise(res => setTimeout(res, 500));
      setStage('complete');
    };

    runSetup();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-8 animate-in fade-in duration-1000">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Logo size={24} />
        <span className="font-bold text-slate-600 text-sm">NEXORA SETUP</span>
      </div>

      <div className="w-full max-w-xl">
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tighter">
          Preparando seu estúdio criativo...
        </h1>
        <p className="text-lg text-slate-400 mt-4 leading-relaxed font-mono">
          <span className="text-blue-500">&gt; </span> 
          {stageMessages[stage]}
          <span className="inline-block w-2 h-5 bg-blue-500 ml-1 -mb-1 blinking-cursor" />
        </p>

        <div className="mt-12 space-y-3">
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-linear"
              style={{ width: `${progress}%`}}
            />
          </div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest text-right">
            {stage}
          </div>
        </div>

        <div className="mt-12">
          <button
            onClick={onComplete}
            disabled={stage !== 'complete'}
            className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-white shadow-2xl shadow-blue-900/40 transition-all active:scale-95 text-lg disabled:opacity-50 disabled:cursor-wait"
          >
            {stage === 'complete' ? 'Iniciar Produção' : 'Aguarde...'}
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-xs font-mono text-slate-700 tracking-widest">
        NEXORA SUITE // INSTALAÇÃO AUTOMATIZADA
      </div>
    </div>
  );
};

export default SetupScreen;
