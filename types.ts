
import React from 'react';

export type AIProvider = 'cloud' | 'local';
export type AIStatus = 'ready' | 'not_installed' | 'error' | 'downloading' | 'optimizing';
export type AICapability = 'text' | 'image' | 'video' | 'audio' | 'subtitles' | 'mastering';

export interface AIConfiguration {
  id: string;
  name: string;
  provider: AIProvider;
  modelName: string;
  priority: number;
  isActive: boolean;
}

export interface SystemSettings {
  primaryEngine: AIProvider;
  fallbackEnabled: boolean;
  voiceActivation: boolean;
  wakeWord: string;
  maxResolution: string;
  autoSchedule: boolean;
  activeModels: AIConfiguration[];
}

export interface HardwareStatus {
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina';
  score: number;
  vramEstimate: string;
  gpuName: string;
  webGpuActive: boolean;
  recommendedEngine: AIProvider;
}

export interface MarketingVariant {
  id: string;
  title: string;
  coverUrl: string;
  description: string;
  tags: string[];
  hashtags: string[];
  score: number;
  reasoning: string;
}

export interface MarketingPackage {
  projectId: string;
  variants: MarketingVariant[];
  selectedVariantId?: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  visualTraits: string;
  voiceProfileName?: string;
  isFixed: boolean;
  referenceImageUrl?: string;
  metadata?: any;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
  scriptLines: any[];
  bgmUrl?: string;
  bgmMood?: string;
  script?: string;
  videoUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  status: 'draft' | 'production' | 'completed';
  characters: Character[];
  visualStyleId?: string;
  subtitleStyleId?: string;
}

export interface Series {
  id: string;
  title: string;
  genre: string;
  stories: Story[];
  fixedCharacters: Character[];
  creativeBrief?: string;
  linkedSocialPlatformId?: string;
  visualStyleId?: string;
}

// Fixed missing types: VisualStyle, SubtitleStyle, AIModel, VideoItem, LocationInspiration, VoiceProfile, VideoMetadata, AnalysisResult

export interface VisualStyle {
  id: string;
  name: string;
  category: string;
  promptModifier: string;
  thumbnailUrl: string;
}

export interface SubtitleStyle {
  id: string;
  name: string;
  font: string;
  color: string;
  position: 'top' | 'center' | 'bottom';
  animation: 'none' | 'pop' | 'fade';
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  enabled: boolean;
  status: AIStatus;
  capabilities: AICapability[];
  description: string;
  version: string;
}

export interface VideoItem {
  id: string;
  prompt: string;
  videoUrl: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface LocationInspiration {
  title: string;
  uri: string;
  snippet?: string;
}

export interface VoiceProfile {
  name: string;
  apiName: string;
  gender: 'Feminino' | 'Masculino';
  tone: string;
  type: 'prebuilt' | 'cloned';
  isFavorite: boolean;
}

export interface VideoMetadata {
  titles: string[];
  description: string;
  tags: string[];
}

export interface AnalysisResult {
  bestTitle: string;
  bestCoverIndex: number;
  bestPlatform: string;
  reasoning: string;
}
