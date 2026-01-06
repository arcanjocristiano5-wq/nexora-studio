
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import JabutiAssistant from '../components/Assistant/JabutiAssistant';
import FloatingJabuti from '../components/Assistant/FloatingJabuti';
import DirectorOverlay from '../components/LiveDirector/DirectorOverlay';
import './sidebar.css';
import { useWakeWord } from '../hooks/useWakeWord';
import { getUserPreference } from '../services/geminiService';
import { SystemSettings } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isDirectorActive, setIsDirectorActive] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(getUserPreference());

  useEffect(() => {
    const handleSettings = () => setSettings(getUserPreference());
    window.addEventListener('storage', handleSettings);
    return () => window.removeEventListener('storage', handleSettings);
  }, []);
  
  const handleToggleAssistant = () => setIsAssistantOpen(prev => !prev);
  
  const handleActivateDirector = () => {
    if (isDirectorActive) return;
    setIsDirectorActive(true);
  };

  const handleCloseDirector = () => setIsDirectorActive(false);

  const { isListening: isListeningForWakeWord } = useWakeWord({
    wakeWord: 'jabuti',
    onWakeWord: handleActivateDirector,
    enabled: settings.voiceActivation,
  });

  return (
    <div className="layout overflow-hidden">
      <Sidebar />
      
      <main className="content relative flex">
        <div className={`flex-1 transition-all duration-500 ${isAssistantOpen ? 'mr-[400px]' : 'mr-0'}`}>
          <div className="max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </div>

        {/* JABUTI GLOBAL ASSISTANT - A GAVETA DE COMANDO */}
        <div className={`fixed top-[32px] bottom-0 right-0 w-[400px] bg-slate-900 border-l border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 z-[50] ${isAssistantOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <JabutiAssistant onClose={() => setIsAssistantOpen(false)} />
        </div>
      </main>

      <FloatingJabuti 
        onToggleChat={handleToggleAssistant} 
        onActivateDirector={handleActivateDirector}
        isListeningForWakeWord={isListeningForWakeWord}
      />
      
      {isDirectorActive && <DirectorOverlay onClose={handleCloseDirector} />}
    </div>
  );
};

export default MainLayout;
