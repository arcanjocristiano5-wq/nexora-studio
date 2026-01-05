
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
      >
        <defs>
          <linearGradient id="logo-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="logo-grad-accent" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <filter id="3d-depth" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="5"
              specularConstant="0.75"
              specularExponent="20"
              lightingColor="#white"
              result="specOut"
            >
              <fePointLight x="-5000" y="-10000" z="20000" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>

        {/* Outer Ring / Portal */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#logo-grad-main)"
          strokeWidth="1.5"
          strokeDasharray="10 5"
          className="animate-[spin_20s_linear_infinite]"
        />

        {/* 3D "X" Nexus Shape */}
        <g filter="url(#3d-depth)">
          <path
            d="M30 30 L70 70 M70 30 L30 70"
            stroke="url(#logo-grad-main)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M35 30 L65 70"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ opacity: 0.4 }}
          />
          <path
            d="M50 50 L75 25"
            stroke="url(#logo-grad-accent)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>

        {/* Center Core Glow */}
        <circle cx="50" cy="50" r="5" fill="white" className="animate-pulse">
            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

export default Logo;
