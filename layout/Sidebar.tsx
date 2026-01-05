
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import Logo from '../components/Brand/Logo';
import Jabuti from '../components/Brand/Jabuti';
import { Icons } from '../constants';
import { checkHardwareCapability, getUserPreference } from '../services/geminiService';
import "./sidebar.css";

interface SidebarProps {
  onToggleAssistant: () => void;
}

export default function Sidebar({ onToggleAssistant }: SidebarProps) {
  const [hw, setHw] = useState<any>(null);
  const [pref, setPref] = useState(getUserPreference());

  useEffect(() => {
    checkHardwareCapability().then(setHw);
    
    // Escuta mudanças de settings
    const handleSettings = () => setPref(getUserPreference());
    window.addEventListener('storage', handleSettings);
    return () => window.removeEventListener('storage', handleSettings);
  }, []);

  const getLinkClass = ({ isActive }: { isActive: boolean }) => isActive ? "active" : "";

  return (
    <aside className="sidebar border-r border-slate-800">
      <div className="logo flex flex-col items-center gap-2 mb-10 pt-4">
        <Logo size={32} />
        <span className="font-black tracking-tighter text-white text-xl">NEXORA</span>
      </div>

      <nav className="custom-scrollbar px-2 flex-1">
        <p className="section-title">Produção</p>
        <NavLink to="/canais" className={getLinkClass}>
           <Icons.Series /> Workspace
        </NavLink>
        <NavLink to="/projetos" className={getLinkClass}>
           <Icons.Stories /> Projetos
        </NavLink>
        <NavLink to="/relatorio-growth" className={getLinkClass}>
           <Icons.Analytics /> Growth
        </NavLink>

        <p className="section-title">Visual & Direção</p>
        <NavLink to="/visuais" className={getLinkClass}>
           <Icons.Camera /> Arte
        </NavLink>
        <NavLink to="/video" className={getLinkClass}>
           <Icons.Video /> Render
        </NavLink>
        <NavLink to="/marketing" className={getLinkClass}>
           <Icons.Social /> Marketing A/B
        </NavLink>

        <p className="section-title">Sistema</p>
        <NavLink to="/configuracoes" className={getLinkClass}>
           <Icons.Settings /> Cockpit IA
        </NavLink>
      </nav>

      {/* JABUTI STATUS / TOGGLE BOTÃO */}
      <div className="mt-auto pt-6 px-2">
        <div className="mb-4 px-4 flex items-center justify-between">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Engine Ativo</span>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${pref.engine === 'cloud' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {pref.engine}
            </span>
        </div>
        <button 
          onClick={onToggleAssistant}
          className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-4 hover:border-blue-500 transition-all group"
        >
          <div className="w-10 h-10 shrink-0">
            <Jabuti state="idle" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Abrir Assistente</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase">
              {pref.voiceActivation ? 'Escuta Ativa' : 'Diretor Online'}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}
