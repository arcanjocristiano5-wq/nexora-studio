
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import JabutiAssistant from '../components/Assistant/JabutiAssistant';
import './sidebar.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="layout overflow-hidden">
      <Sidebar onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)} />
      
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
    </div>
  );
};

export default MainLayout;
