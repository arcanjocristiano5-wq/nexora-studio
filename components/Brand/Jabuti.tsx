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
          <radialGradient id="shell-grad-3d" cx="50%" cy="40%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
          <radialGradient id="body-grad-3d" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <filter id="jabuti-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        <g className="jabuti-main-group" filter="url(#jabuti-shadow)">
          <ellipse cx="110" cy="240" rx="18" ry="8" fill="url(#body-grad-3d)" />
          <ellipse cx="190" cy="240" rx="18" ry="8" fill="url(#body-grad-3d)" />
          <ellipse cx="150" cy="195" rx="55" ry="60" fill="url(#body-grad-3d)" />
          
          <path 
            d="M 90 195 C 90 130, 210 130, 210 195 A 60 65 0 0 1 90 195 Z"
            fill="url(#shell-grad-3d)"
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