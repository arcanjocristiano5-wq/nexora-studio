
import React from 'react';
import { AIModel, SubtitleStyle, VisualStyle, Series, Story } from './types';

export const VISUAL_STYLES: VisualStyle[] = [
  { 
    id: 'disney-2.1', 
    name: 'Disney 2.1', 
    category: '3D',
    promptModifier: 'Disney animation style, 3D render, cute features, expressive eyes, vibrant colors, Pixar-like quality, high detail, masterpiece, whimsical lighting',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=200&h=200&auto=format&fit=crop' 
  },
  { 
    id: 'realistic-2.0', 
    name: 'Realista 2.0', 
    category: 'Realista',
    promptModifier: 'Photorealistic, cinematic lighting, 8k resolution, shot on 35mm lens, depth of field, natural textures, hyper-detailed, professional color grading',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 'pixar-3d', 
    name: 'Pixar 3D', 
    category: '3D',
    promptModifier: 'Pixar style, 3D animation, soft subsurface scattering, detailed character design, cinematic bounce lighting, clean edges, expressive face',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559131397-f94da358f7ca?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 'ghibli', 
    name: 'Studio Ghibli', 
    category: '2D',
    promptModifier: 'Studio Ghibli hand-drawn style, Spirited Away aesthetic, painterly backgrounds, soft color palette, traditional Japanese animation, serene and magical atmosphere',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632738980-43318b5c9470?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 'gta-v', 
    name: 'GTA Style', 
    category: 'Artístico',
    promptModifier: 'Grand Theft Auto V loading screen art style, digital painting, thick outlines, high contrast shadows, saturated colors, pop art illustration',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk', 
    category: 'Realista',
    promptModifier: 'Cyberpunk 2077 aesthetic, neon lights, rainy city streets, futuristic technology, high contrast, teal and orange color palette, cinematic sci-fi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 'claymation', 
    name: 'Argila (Clay)', 
    category: 'Artístico',
    promptModifier: 'Claymation style, stop-motion animation, Wallace and Gromit aesthetic, finger prints on clay surface, tactile textures, studio lighting, handcrafted look',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576089172869-4f5f6f315620?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 'anime-retro', 
    name: 'Anime Retrô', 
    category: '2D',
    promptModifier: '90s retro anime style, Sailor Moon and Akira aesthetic, film grain, slightly muted colors, hand-painted cel animation look, nostalgic atmosphere',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=200&h=200&auto=format&fit=crop'
  }
];

export const SUBTITLE_STYLES: SubtitleStyle[] = [
  { id: 'cinematic', name: 'Cinematográfico (Clean)', font: 'Inter', color: '#FFFFFF', position: 'bottom', animation: 'none' },
  { id: 'dynamic', name: 'Dinâmico (Social)', font: 'Inter Bold', color: '#FCD34D', position: 'center', animation: 'pop' },
  { id: 'classic', name: 'Clássico (Netflix)', font: 'Arial', color: '#FFFFFF', position: 'bottom', animation: 'none' }
];

export const INITIAL_MODELS: AIModel[] = [
  { 
    id: 'gemini-3-flash', 
    name: 'Gemini 3 Flash', 
    provider: 'cloud', 
    enabled: true, 
    status: 'ready', 
    capabilities: ['text', 'subtitles'],
    description: 'Ultra-rápido para brainstorming e roteiros.',
    version: 'v3.0-preview'
  },
  { 
    id: 'gemini-3-pro', 
    name: 'Gemini 3 Pro', 
    provider: 'cloud', 
    enabled: true, 
    status: 'ready', 
    capabilities: ['text', 'video', 'image'],
    description: 'Raciocínio complexo e análise cinematográfica.',
    version: 'v3.0-preview'
  },
  { 
    id: 'jabuti-audio-local', 
    name: 'Jabuti Audio (MusicGen)', 
    provider: 'local', 
    enabled: true, 
    status: 'ready', 
    capabilities: ['audio'],
    description: 'Gerador de trilhas sonoras locais.',
    version: 'v1.0'
  }
];

export const Icons = {
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  OpenAI: () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor">
        <path d="M22.2819 9.82132C22.2819 9.5226 22.1325 9.23499 21.8916 9.04356L18.4984 6.40499C18.159 6.13806 17.6803 6.13806 17.3409 6.40499L13.9477 9.04356C13.7068 9.23499 13.5574 9.5226 13.5574 9.82132V14.1787C13.5574 14.4774 13.7068 14.765 13.9477 14.9564L17.3409 17.595C17.6803 17.862 18.159 17.862 18.4984 17.595L21.8916 14.9564C22.1325 14.765 22.2819 14.4774 22.2819 14.1787V9.82132ZM17.9197 15.8112L15.2891 13.7405V10.2595L17.9197 8.18881L20.5492 10.2595V13.7405L17.9197 15.8112Z" /><path d="M12.2158 9.94436C12.3364 9.4237 12.246 8.87299 11.9868 8.40718L10.3931 5.5623C10.0426 4.93173 9.35102 4.54436 8.58801 4.54436H5.41199C4.64898 4.54436 3.95742 4.93173 3.6069 5.5623L1.98317 8.40718C1.72399 8.87299 1.63456 9.4237 1.75517 9.94436L2.68953 14.0416C2.92147 14.9912 3.79383 15.6983 4.79383 15.6983H9.20617C10.2062 15.6983 11.0785 14.9912 11.3105 14.0416L12.2158 9.94436ZM6.32185 10.2394L5.75317 12.502H4.13317L4.70185 10.2394H6.32185ZM5.23456 8.40718L6.82824 5.5623L7.39692 6.4718L6.82824 8.40718H5.23456ZM8.41199 13.7606H7.33824L7.90692 11.4983H9.52692L10.0956 13.7606H8.99192L8.70756 12.502H7.62256L7.33824 13.7606H8.41199ZM9.65256 9.40718H7.93388L7.36521 7.14457L7.93388 5.5623L9.52756 8.40718L9.65256 9.40718Z" /><path d="M10.2342 17.523C10.1136 18.0437 10.203 18.5944 10.4622 19.0602L12.0559 21.9051C12.4064 22.5356 13.098 22.923 13.861 22.923H17.037C17.7999 22.923 18.4915 22.5356 18.842 21.9051L20.4657 19.0602C20.7249 18.5944 20.8144 18.0437 20.6938 17.523L19.7594 13.4258C19.5275 12.4761 18.6551 11.769 17.6551 11.769H13.2428C12.2428 11.769 11.3705 12.4761 11.1385 13.4258L10.2342 17.523ZM15.4269 17.502H16.4806L16.2072 16.2394H15.1222L14.8488 17.502H15.4269ZM16.0342 13.4258H17.6542L17.0855 15.6883H15.4655L16.0342 13.4258ZM13.861 19.0602L12.2673 21.9051L12.836 20.9955L13.4047 19.0602H13.861ZM12.3847 16.5944L12.9534 14.3318L13.5221 12.4258L14.0908 14.3318L14.6595 16.5944H12.3847Z" />
    </svg>
  ),
  Billing: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Series: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Stories: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Messages: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  Video: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Music: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  Captions: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  ArrowUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  ArrowDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    </svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    </svg>
  ),
  Social: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
  ),
  Export: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Metadata: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  Folder: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Clone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Star: ({ filled = false, className = "w-4 h-4" }: { filled?: boolean, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Branding: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Link: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  BrainCircuit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6a2 2 0 012 2v2M9 3a2 2 0 00-2 2v2m0 0H5a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0V9m0 0h10m0 0v10m0 0h2a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 21h6a2 2 0 002-2v-2M9 21a2 2 0 01-2-2v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  ),
};

export const socialPlatforms = [
  { id: 'yt', name: 'YouTube', icon: <Icons.Series />, connected: true },
  { id: 'tt', name: 'TikTok', icon: <Icons.Stories />, connected: false },
  { id: 'ig', name: 'Instagram', icon: <Icons.Video />, connected: false },
];

export const INITIAL_STORIES: Story[] = [
  { 
    id: 'story-1', 
    title: 'O Último Farol', 
    description: 'Um guardião de farol em um mundo de névoa eterna.', 
    status: 'draft', 
    scenes: [], 
    characters: [], 
    subtitleStyleId: 'cinematic', 
    visualStyleId: 'disney-2.1' 
  }
];

export const INITIAL_SERIES: Series[] = [
  { 
    id: '1', 
    title: 'Sombras de Neon', 
    genre: 'Cyberpunk Noir', 
    creativeBrief: 'Estética escura, chuva, luzes neon.', 
    linkedSocialPlatformId: 'yt', 
    // FIX: Added required missing property 'fixedCharacters'
    fixedCharacters: [],
    stories: [
        { 
            id: 'neon-1', 
            title: 'Chuva Ácida', 
            description: 'Uma investigação no submundo cibernético.', 
            status: 'draft', 
            scenes: [], 
            characters: [], 
            subtitleStyleId: 'cinematic', 
            visualStyleId: 'cyberpunk' 
        }
    ], 
    visualStyleId: 'cyberpunk' 
  }
];