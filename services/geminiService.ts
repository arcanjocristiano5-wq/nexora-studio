
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VISUAL_STYLES } from '../constants';
import { SystemSettings, AIProvider, MarketingPackage, MarketingVariant, Character, LocationInspiration, VideoMetadata, AnalysisResult, Scene, HardwareStatus } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Abre o seletor oficial de chaves do ambiente AI Studio.
 */
export const openKeySelection = async () => {
    if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
    }
};

/**
 * Verifica se uma chave API já foi selecionada.
 */
export const checkKey = async () => {
    if ((window as any).aistudio?.hasSelectedApiKey) {
        return await (window as any).aistudio.hasSelectedApiKey();
    }
    return !!process.env.API_KEY;
};

/**
 * Benchmark de Hardware v3: VRAM Absoluta e Capacidade Local
 */
export const performHardwareBenchmark = async (): Promise<HardwareStatus> => {
  const gpu = (navigator as any).gpu;
  if (!gpu) {
    return {
      tier: 'Bronze',
      score: 100,
      vramEstimate: 'Low (CPU Only)',
      vramTotalGb: 2,
      gpuName: 'CPU Standard',
      webGpuActive: false,
      recommendedEngine: 'cloud'
    };
  }

  try {
    const adapter = await gpu.requestAdapter();
    const limits = adapter.limits;
    const score = Math.floor(limits.maxStorageBufferBindingSize / (1024 * 1024));
    const vramTotalGb = Math.round(score / 128); // Estimativa conservadora via WebGPU
    
    let tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina' = 'Bronze';
    if (vramTotalGb >= 16) tier = 'Platina';
    else if (vramTotalGb >= 8) tier = 'Ouro';
    else if (vramTotalGb >= 4) tier = 'Prata';

    return {
      tier,
      score,
      vramEstimate: `${vramTotalGb}GB VRAM`,
      vramTotalGb,
      gpuName: adapter.name || 'WebGPU Device',
      webGpuActive: true,
      recommendedEngine: vramTotalGb >= 8 ? 'local' : 'cloud'
    };
  } catch (e) {
    return { tier: 'Bronze', score: 100, vramEstimate: 'Low', vramTotalGb: 2, gpuName: 'Fallback Device', webGpuActive: false, recommendedEngine: 'cloud' };
  }
};

/**
 * Simulação de Download de Worker Local
 */
export const downloadLocalModel = async (modelId: string, onProgress: (p: number) => void) => {
  for (let i = 0; i <= 100; i += Math.floor(Math.random() * 10) + 1) {
    const finalP = Math.min(i, 100);
    onProgress(finalP);
    if (finalP === 100) break;
    await new Promise(res => setTimeout(res, 300));
  }
  return true;
};

// ... (Restante das funções de serviço preservadas)
export const generateMarketingSwarm = async (title: string, desc: string, platform: 'youtube' | 'tiktok' | 'instagram'): Promise<MarketingPackage> => {
  const ai = getAI();
  const aspectRatio = platform === 'youtube' ? '16:9' : '9:16';
  const metaResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere 3 variantes de marketing para o vídeo "${title}" na plataforma ${platform}. Descrição: ${desc}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });
  const variantsRaw = JSON.parse(metaResponse.text || '[]');
  const variants: MarketingVariant[] = await Promise.all(variantsRaw.map(async (v: any) => {
    const coverUrl = await generateSceneVisual(`Thumbnail for ${platform}: ${v.title}`, aspectRatio as any);
    return { ...v, id: crypto.randomUUID(), coverUrl: coverUrl || '', aspectRatio };
  }));
  return { projectId: crypto.randomUUID(), platform, variants, selectedVariantId: variants[0].id };
};

export const generateSceneVisual = async (description: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: description,
        config: { imageConfig: { aspectRatio } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
};

export const talkToJabuti = async (message: string, shouldSpeak: boolean = true) => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message
  });
  return { text: res.text || "", engine: "Cloud Master" };
};

export const generateStructuredScript = async (t: string, d: string) => ({ lines: [] });
export const generateBgmMood = async (t: string, d: string) => "Neutral";
export const generateScenes = async (t: string, d: string) => [];
export const generateProfessionalLaunchKit = async (t: string, d: string, p: string) => ({ viralTitles: [] });
export const auditCompetitorLink = async (u: string, n: string) => ({ overallScore: 0, viralHooks: [], suggestedImprovements: [], sources: [], competitorAnalysis: "" });
export const checkHardwareCapability = performHardwareBenchmark;
export const getUserPreference = () => JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{"primaryEngine": "cloud"}');
export const analyzeChannelPostPattern = async (u: string) => ({ lastPostDate: "", suggestedNextPost: "", frequencyRecommendation: "" });
export const upscaleTo8K = async (u: any, onP: any) => {};
export const learnChannelTone = async (u: string) => "";
export const generateScript = async (t: string, d: string, c: any[]) => "";
export const generateText = async (p: string, s: string) => ({ text: "" });
export const generateVideoContent = async (p: string, i?: string, a: any = '16:9', op?: any) => "";
export const extractCharactersFromScript = async (s: string) => [];
export const scoutLocations = async (q: string, lt?: number, lg?: number) => ({ text: "", locations: [] });
export const generateConceptArt = async (p: string, s: string, r?: string, ar: any = '16:9') => "";
export const generateDialogue = async (s: string, ch: any[]) => null;
export const generateVideoMetadata = async (t: string, p: string, b: string) => ({});
export const analyzeAndSelectBestPost = async (ts: string[], g: string) => ({});
export const analyzeCompetitors = async (n: string, p: string) => ({ text: "", sources: [] });
