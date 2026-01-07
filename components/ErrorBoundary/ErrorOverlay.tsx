import React, { useState, useEffect } from 'react';
import Jabuti from '../Brand/Jabuti';

interface ErrorOverlayProps {
  error: Error;
  resetErrorBoundary: () => void;
}

type AnalysisState = 'analyzing' | 'failed' | 'fixing';
type JabutiErrorState = 'thinking' | 'idle' | 'error';

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ error, resetErrorBoundary }) => {
    const [analysisState, setAnalysisState] = useState<AnalysisState>('analyzing');
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const analyze = setTimeout(() => {
            setAnalysisState('failed');
        }, 3000);

        return () => clearTimeout(analyze);
    }, []);

    const getStatusMessage = () => {
        switch (analysisState) {
            case 'analyzing':
                return 'Jabuti, o Diretor de IA, está analisando o problema...';
            case 'failed':
                return 'Análise completa. A anomalia requer intervenção manual.';
            case 'fixing':
                return 'Análise completa. Jabuti tentará uma correção automática...';
        }
    };
    
    const getJabutiState = (): JabutiErrorState => {
        switch (analysisState) {
            case 'analyzing':
                return 'thinking';
            case 'failed':
                return 'error';
            default:
                return 'idle';
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-8">
            <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-2xl shadow-2xl shadow-red-900/20 animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Anomalia no Fluxo de Produção</h3>
                        <p className="text-sm text-slate-400">Ocorreu um erro inesperado na aplicação.</p>
                    </div>
                </div>

                <div className="p-8 space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="w-24 h-24 -ml-4 -my-4">
                          <Jabuti state={getJabutiState()} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-300">{getStatusMessage()}</p>
                            {analysisState === 'analyzing' && <div className="w-full bg-slate-700 rounded-full h-1 mt-2 overflow-hidden"><div className="bg-blue-500 h-1 rounded-full animate-pulse w-1/3"></div></div>}
                        </div>
                    </div>

                    {analysisState === 'failed' && (
                        <div className="animate-in fade-in duration-500">
                            <button onClick={() => setShowDetails(!showDetails)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white">
                                {showDetails ? 'Ocultar Detalhes Técnicos' : 'Mostrar Detalhes Técnicos'}
                            </button>
                            {showDetails && (
                                <pre className="mt-4 bg-slate-950/50 p-4 rounded-lg border border-slate-700 text-xs text-red-300 overflow-auto max-h-48 font-mono select-text">
                                    <code>
                                        {error.toString()}
                                    </code>
                                </pre>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={resetErrorBoundary}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-all"
                    >
                        Recarregar Aplicação
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorOverlay;