import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../../constants';

interface CloneVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCloned: (voiceName: string) => void;
}

const CloneVoiceModal: React.FC<CloneVoiceModalProps> = ({ isOpen, onClose, onVoiceCloned }) => {
  const [voiceName, setVoiceName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setVoiceName('');
      setIsRecording(false);
      setAudioBlob(null);
      setFileName('');
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setAudioBlob(blob);
            setFileName('Gravação.wav');
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        alert("Não foi possível acessar o microfone.");
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file){
        setAudioBlob(file);
        setFileName(file.name);
    }
  };
  
  const handleSave = async () => {
    if (voiceName.trim() && audioBlob) {
      setIsAnalyzing(true);
      await new Promise(res => setTimeout(res, 2000));
      setIsAnalyzing(false);
      onVoiceCloned(voiceName);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">Clonar uma Nova Voz</h3>
          <p className="text-sm text-slate-400">Adicione uma voz personalizada ao seu elenco gravando ou fazendo upload de uma amostra de áudio.</p>
        </div>

        <div className="flex-1 p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Perfil de Voz</label>
            <input
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="Ex: Herói Cansado"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-slate-700"></div>
            <span className="text-xs font-bold text-slate-500">AMOSTRA DE VOZ</span>
            <div className="flex-1 border-t border-slate-700"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${isRecording ? 'bg-red-500/10 border-red-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}
             >
                <Icons.Music />
                <span className="text-xs font-bold">{isRecording ? 'Parar Gravação' : 'Gravar Amostra'}</span>
             </button>
             <button
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-slate-700 hover:border-slate-600 bg-slate-800 transition-all"
             >
                <Icons.Folder />
                <span className="text-xs font-bold">Upload de Áudio</span>
                <input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
             </button>
          </div>

          {fileName && (
            <div className="p-4 bg-emerald-500/10 text-emerald-300 rounded-xl text-center text-sm font-medium border border-emerald-500/20">
              Amostra carregada: {fileName}
            </div>
          )}
          
          {isAnalyzing && (
            <div className="p-4 bg-indigo-500/10 text-indigo-300 rounded-xl text-center text-sm font-medium border border-indigo-500/20 animate-pulse">
              Analisando prosódia e emoção da amostra...
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all text-white"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!voiceName.trim() || !audioBlob || isAnalyzing}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-white"
          >
            {isAnalyzing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isAnalyzing ? 'Processando...' : 'Salvar Voz Clonada'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloneVoiceModal;