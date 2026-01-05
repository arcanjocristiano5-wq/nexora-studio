
import React from 'react';

export type AIProvider = 'cloud' | 'local' | 'custom_api';
export type AIStatus = 'ready' | 'not_installed' | 'error' | 'downloading' | 'optimizing';
export type AICapability = 'text' | 'image' | 'video' | 'audio' | 'subtitles' | 'mastering' | 'voice_out';

export interface LocalModelDeployment {
  id: string;
  name: string;
  size: string;
  status: AIStatus;
  progress: number;
  type: 'core' | 'specialized';
  capability: AICapability;
  vramRequiredGb: number;
}

export interface AIConfiguration {
  id: string;
  name: string;
  provider: AIProvider;
  modelName: string;
  apiKey?: string;
  priority: number;
  isActive: boolean;
  capabilities: AICapability[];
  inputCostPer1M: number;
  outputCostPer1M: number;
}

export interface SystemSettings {
  primaryEngine: AIProvider;
  fallbackEnabled: boolean;
  voiceActivation: boolean;
  voiceOutput: boolean;
  wakeWord: string;
  maxResolution: string;
  autoSchedule: boolean;
  activeModels: AIConfiguration[];
  localModels: LocalModelDeployment[];
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'website' | 'custom';
  guidelines: string;
  toneProfile: string;
  authMethod: 'oauth' | 'login' | 'webhook';
  credentials?: {
    username?: string;
    password?: string;
    webhookUrl?: string;
    token?: string;
    siteUrl?: string;
  };
}

export interface HardwareStatus {
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  score: number;
  vramEstimate: string;
  vramTotalGb: number;
  gpuName: string;
  webGpuActive: boolean;
  recommendedEngine: AIProvider;
}

// Re-exportando interfaces de suporte
export interface MarketingVariant { id: string; title: string; coverUrl: string; description: string; tags: string[]; hashtags: string[]; score: number; reasoning: string; aspectRatio: '16:9' | '9:16'; }
export interface MarketingPackage { projectId: string; platform: 'youtube' | 'tiktok' | 'instagram'; variants: MarketingVariant[]; selectedVariantId?: string; }
export interface Character { id: string; name: string; role: string; description: string; visualTraits: string; voiceProfileName?: string; isFixed: boolean; referenceImageUrl?: string; metadata?: any; }
export interface Scene { id: string; title: string; description: string; imageUrl?: string; order: number; scriptLines: any[]; bgmUrl?: string; bgmMood?: string; script?: string; videoUrl?: string; }
export interface Story { id: string; title: string; description: string; scenes: Scene[]; status: 'draft' | 'production' | 'completed'; characters: Character[]; visualStyleId?: string; subtitleStyleId?: string; }
export interface Series { id: string; title: string; genre: string; stories: Story[]; fixedCharacters: Character[]; creativeBrief?: string; linkedSocialPlatformId?: string; visualStyleId?: string; }
export interface VisualStyle { id: string; name: string; category: string; promptModifier: string; thumbnailUrl: string; }
export interface SubtitleStyle { id: string; name: string; font: string; color: string; position: 'bottom' | 'center' | 'top'; animation: 'none' | 'pop' | 'fade'; }
export interface AIModel { id: string; name: string; provider: AIProvider; enabled: boolean; status: AIStatus; capabilities: AICapability[]; description: string; version: string; }
export interface VideoItem { id: string; prompt: string; videoUrl: string; status: 'pending' | 'completed' | 'failed'; timestamp: Date; }
export interface LocationInspiration { title: string; uri: string; snippet?: string; }
export interface VoiceProfile { name: string; apiName: string; gender: string; tone: string; type: 'prebuilt' | 'cloned'; isFavorite: boolean; }
export interface AnalysisResult { bestTitle: string; bestPlatform: string; bestCoverIndex: number; reasoning: string; }
export interface VideoMetadata { titles: string[]; description: string; }
