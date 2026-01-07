import React, { useState, useEffect, useRef } from 'react';
import Jabuti from '../Brand/Jabuti';
import { SystemSettings, AIConfiguration, LocalModelDeployment } from '../../types';
import { getUserPreference } from '../../services/geminiService';

interface FloatingJabutiProps {
  onToggleChat: () => void;
  onActivateDirector: () => void;
  isListeningForWakeWord?: boolean;
}

const FloatingJabuti: React.FC<FloatingJabutiProps> = ({ onToggleChat, onActivateDirector, isListeningForWakeWord }) => {
  const [settings, setSettings] = useState<SystemSettings>(getUserPreference());
  const [isHovered, setIsHovered] = useState(false);
  const pressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    const handleSettings = () => setSettings(getUserPreference());
    window.addEventListener('storage', handleSettings);
    return () => window.removeEventListener('storage', handleSettings);
  }, []);

  const handleMouseDown = () => {
    longPressTriggered.current = false;
    pressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      onActivateDirector();
    }, 700);
  };

  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };
  
  const handleClick = () => {
    if (!longPressTriggered.current) {
      onToggleChat();
    }
  };

  const allModels: (AIConfiguration | LocalModelDeployment)[] = [
    ...(settings.activeModels || []), 
    ...(settings.localModels || [])
  ];
  const currentBrain = allModels.find(m => m.id === settings.primaryBrainId);

  return (
    <div 
      className="fixed bottom-8 right-8 z-[100] group cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <div 
          className={`absolute bottom-full right-0 mb-4 px-4 py-2 bg-slate-900 border border-slate-700 rounded-2xl text-center shadow-2xl transition-all duration-300 transform-gpu ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
        >
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Assistente Jabuti</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase">{currentBrain?.name || 'Cérebro Padrão'}</p>
        </div>
        <div className="w-24 h-24 transition-transform duration-300 group-hover:scale-110 relative">
            <Jabuti state="idle" />
            {isListeningForWakeWord && (
              <div className="absolute inset-[-8px] border-2 border-blue-500/50 rounded-full animate-[pulse-ring_3s_ease-in-out_infinite]" />
            )}
        </div>
    </div>
  );
};

export default FloatingJabuti;