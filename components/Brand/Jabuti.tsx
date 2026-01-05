
import React from 'react';
import './Jabuti.css';

interface JabutiProps {
  state?: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';
  subState?: 'web-search';
}

const Jabuti: React.FC<JabutiProps> = ({ state = 'idle', subState }) => {
  const finalStateClass = subState ? `substate--${subState}` : '';
  return (
    <div className={`jabuti-container state--${state} ${finalStateClass}`}>
      <svg viewBox="0 0 300 300" className="jabuti-svg">
        <defs>
          <radialGradient id="shell-grad-disney" cx="50%" cy="50%" r="60%" fx="35%" fy="35%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <radialGradient id="body-grad-disney" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
        </defs>

        {/* CENA DO NOTEBOOK */}
        <g className="jabuti-laptop-scene">
            <rect x="70" y="240" width="160" height="20" rx="5" fill="#1e293b" />
            <rect x="80" y="150" width="140" height="90" rx="5" fill="#475569" />
            <rect x="85" y="155" width="130" height="80" rx="3" fill="#0f172a" className="laptop-screen" />
        </g>
        
        {/* JABUTI PADRÃO */}
        <g className="jabuti-main-group">
          <ellipse cx="110" cy="240" rx="18" ry="8" fill="url(#body-grad-disney)" />
          <ellipse cx="190" cy="240" rx="18" ry="8" fill="url(#body-grad-disney)" />
          <ellipse cx="150" cy="195" rx="55" ry="60" fill="url(#body-grad-disney)" />
          
          <path 
            d="M 90 195 C 90 130, 210 130, 210 195 A 60 65 0 0 1 90 195 Z"
            fill="url(#shell-grad-disney)"
            className="jabuti-shell"
          />

          <g className="jabuti-head-group">
            <circle cx="150" cy="150" r="42" fill="#34d399" stroke="#059669" strokeWidth="3" />
            <g className="jabuti-eyes">
              <ellipse cx="130" cy="142" rx="10" ry="14" fill="white" />
              <circle cx="130" cy="146" r="6" fill="#2d3748" />
              <ellipse cx="170" cy="142" rx="10" ry="14" fill="white" />
              <circle cx="170" cy="146" r="6" fill="#2d3748" />
            </g>
            <path className="jabuti-mouth--smile" d="M 142 170 Q 150 180, 158 170" stroke="#047857" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Jabuti;
