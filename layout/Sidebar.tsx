
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import Logo from '../components/Brand/Logo';
import { Icons } from '../constants';
import { checkHardwareCapability, getUserPreference } from '../services/geminiService';
import { SystemSettings, AIConfiguration, LocalModelDeployment } from '../types';
import "./sidebar.css";

export default function Sidebar() {
  const [hw, setHw] = useState<any>(null);
  const [settings, setSettings] = useState<SystemSettings>(getUserPreference());

  useEffect(() => {
    checkHardwareCapability().then(setHw);
    
    const handleSettings = () => setSettings(getUserPreference());
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
        <NavLink to="/cronograma" className={getLinkClass}>
           <Icons.Calendar /> Cronograma
        </NavLink>
        <NavLink to="/personagens" className={getLinkClass}>
           <Icons.Brain /> Personagens
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

      <div className="mt-auto pt-6 px-2">
         {/* O botão do assistente foi removido daqui e substituído pelo FloatingJabuti */}
      </div>
    </aside>
  );
}