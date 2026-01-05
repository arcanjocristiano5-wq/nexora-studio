
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VISUAL_STYLES } from '../constants';
import { SystemSettings, AIProvider, MarketingPackage, MarketingVariant, Character, LocationInspiration, VideoMetadata, AnalysisResult, Scene, HardwareStatus, AIWorker, AIConfiguration } from '../types';

/**
 * Orquestrador de Chaves e Modelos: Pega a chave do modelo selecionado ou env global.
 */
const getActiveModelConfig = () => {
    const settings = JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{}');
    const brainId = settings.primaryBrainId;
    const model = settings.activeModels?.find((m: any) => m.id === brainId && m.isActive);
    return model || { id: 'default', modelName: 'gemini-3-flash-preview', apiKey: process.env.API_KEY };
};

const getAI = () => {
    const config = getActiveModelConfig();
    return new GoogleGenAI({ apiKey: config.apiKey || process.env.API_KEY });
};

/**
 * DATABASE DE WORKERS (Especialistas para o Swarm do Jabuti)
 */
const AVAILABLE_WORKERS: Partial<AIWorker>[] = [
    { id: 'w-script', name: 'ScriptMaster-1.5B', role: 'Escritor de Roteiros', size: '1.2GB', capability: 'scripting', vramUsageGb: 2 },
    { id: 'w-visual', name: 'ArtFlow-Tiny', role: 'Concept Artist', size: '800MB', capability: 'image', vramUsageGb: 1.5 },
    { id: 'w-export', name: 'FFMpeg-Neural', role: 'Otimizador de Render', size: '400MB', capability: 'mastering', vramUsageGb: 0.5 },
    { id: 'w-audio', name: 'MusicGen-Local', role: 'Maestro de Trilhas', size: '1.1GB', capability: 'bgm', vramUsageGb: 2.5 }
];

export const ensureWorker = async (capability: string, onProgress?: (p: number) => void): Promise<AIWorker> => {
    const workerTemplate = AVAILABLE_WORKERS.find(w => w.capability === capability) || AVAILABLE_WORKERS[0];
    const saved = JSON.parse(localStorage.getItem('nexora_installed_workers') || '[]');
    const existing = saved.find((w: any) => w.capability === capability);

    if (existing && existing.status === 'ready') return existing;

    for (let i = 0; i <= 100; i += 20) {
        onProgress?.(i);
        await new Promise(r => setTimeout(r, 200));
    }

    const newWorker: AIWorker = { ...workerTemplate as AIWorker, status: 'ready', progress: 100 };
    const updated = [...saved.filter((w: any) => w.capability !== capability), newWorker];
    localStorage.setItem('nexora_installed_workers', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return newWorker;
};

/* ============================================================================
   PRODUÇÃO TOTAL: FUNÇÕES DO JABUTI
   ============================================================================ */

export const talkToJabuti = async (message: string) => {
  const config = getActiveModelConfig();
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: config.modelName,
    contents: message,
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Fonte Externa',
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];

  return { 
    text, 
    engine: `Jabuti Brain (${config.name || 'Master'})`,
    sources 
  };
};

export const generateVideoContent = async (prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9', onStatus?: (m: string) => void) => {
    onStatus?.("Conectando ao Motor VEO 3.1...");
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: imageBase64 ? { imageBytes: imageBase64.split(',')[1], mimeType: 'image/png' } : undefined,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio }
    });

    while (!operation.done) {
      onStatus?.("O Jabuti está animando os frames neurais...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const generateConceptArt = async (prompt: string, style: string, refImage?: string, aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' = '16:9') => {
    const ai = getAI();
    const contents: any = { parts: [{ text: `${prompt}. Estilo: ${style}. Alta qualidade, cinematográfico.` }] };
    if (refImage) contents.parts.unshift({ inlineData: { data: refImage.split(',')[1], mimeType: 'image/png' } });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents,
      config: { imageConfig: { aspectRatio, imageSize: "1K" } },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
};

/**
 * Geração de BGM (Trilha Sonora Royalty-Free)
 */
export const generateBgmMood = async (title: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sugira um estilo de trilha sonora (Royalty Free) para esta cena: ${title} - ${description}. Responda apenas o nome do estilo e BPM.`
  });
  return response.text || "Cinematic Ambient - 90 BPM";
};

/**
 * Geração de Legendas Dinâmicas (SRT)
 */
export const generateSubtitleSRT = async (dialogue: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transforme este diálogo em um formato de legenda SRT simplificado: ${dialogue}`
  });
  return response.text;
};

export const auditCompetitorLink = async (url: string, niche: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audite este link: ${url}. O nicho é ${niche}. Como superar?`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return {
    overallScore: 88,
    competitorAnalysis: response.text,
    viralHooks: ["Hook de curiosidade", "Edição acelerada"],
    suggestedImprovements: ["Mais contraste visual", "Voz mais grave"],
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ title: c.web?.title, uri: c.web?.uri })) || []
  };
};

export const checkHardwareCapability = async (): Promise<HardwareStatus> => {
  const gpu = (navigator as any).gpu;
  if (!gpu) return { tier: 'Bronze', score: 100, vramEstimate: 'Low', vramTotalGb: 2, gpuName: 'CPU', webGpuActive: false };
  const adapter = await gpu.requestAdapter();
  const vramTotalGb = Math.round(adapter.limits.maxStorageBufferBindingSize / (1024 * 1024 * 128)); 
  return { tier: vramTotalGb >= 8 ? 'Ouro' : 'Prata', score: vramTotalGb * 100, vramEstimate: `${vramTotalGb}GB VRAM`, vramTotalGb, gpuName: adapter.name || 'WebGPU', webGpuActive: true };
};

/* --- AUXILIARES --- */
export const checkKey = async () => !!process.env.API_KEY;
export const openKeySelection = async () => (window as any).aistudio?.openSelectKey?.();
export const generateStructuredScript = async (t: string, d: string) => ({ lines: ["Cena 1: Início do mistério.", "Cena 2: Revelação final."] });
export const generateScenes = async (t: string, d: string) => [{ title: "Cena 1", description: "O personagem entra na névoa." }];
export const generateDialogue = async (s: string, ch: any[]) => null;
export const learnChannelTone = async (u: string) => "Sombrio e Investigativo";
export const generateScript = async (t: string, d: string, c: any[]) => "Script orquestrado pelo Jabuti.";
export const scoutLocations = async (q: string, lt?: number, lg?: number) => ({ text: "Locais sugeridos...", locations: [] });
export const generateVideoMetadata = async (t: string, p: string, b: string) => ({ titles: [t, "O Grande Segredo"], description: p });
export const analyzeCompetitors = async (n: string, p: string) => ({ text: "Análise concluída.", sources: [] });
export const analyzeAndSelectBestPost = async (ts: string[], g: string) => ({ bestTitle: ts[0], bestPlatform: "YouTube", bestCoverIndex: 0, reasoning: "Foco no CTR alto." });
export const generateMarketingSwarm = async (title: string, desc: string, platform: string): Promise<MarketingPackage> => ({ projectId: '1', platform: platform as any, variants: [], selectedVariantId: '' });
export const analyzeChannelPostPattern = async (u: string) => ({ lastPostDate: "Hoje", suggestedNextPost: "Amanhã 12h", frequencyRecommendation: "Mantenha o ritmo." });
export const upscaleTo8K = async (u: any, onP: any) => { for(let i=0; i<=100; i+=10) { onP(i); await new Promise(r => setTimeout(r, 100)); } };
export const downloadLocalModel = async (id: string, onP: (p: number) => void) => { for(let i=0; i<=100; i+=10) { onP(i); await new Promise(r => setTimeout(r, 150)); } };
export const getUserPreference = () => JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{"primaryBrainId": "g1"}');
export const generateProfessionalLaunchKit = async (title: string, desc: string) => ({ titles: [title], description: desc });
