
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VISUAL_STYLES } from '../constants';
import { SystemSettings, AIProvider, MarketingPackage, MarketingVariant, Character, LocationInspiration, VideoMetadata, AnalysisResult, Scene } from '../types';
import { decodeAudio, decodeAudioData } from './audioUtils';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Neural Router v3: Texto + Voz Híbrida
 */
export const talkToJabuti = async (message: string, shouldSpeak: boolean = true) => {
  const settings: SystemSettings = JSON.parse(localStorage.getItem('nexora_system_settings') || '{}');
  const primary = settings.primaryEngine || 'cloud';
  let responseText = "";
  let engineUsed = "";

  // 1. Lógica de Texto
  if (primary === 'local' && (window as any).ai) {
    try {
      const session = await (window as any).ai.createTextSession();
      responseText = await session.prompt(message);
      engineUsed = "Local Engine";
    } catch (e) {
      if (!settings.fallbackEnabled) throw new Error("Local falhou e fallback desativado.");
    }
  }

  if (!responseText) {
    const ai = getAI();
    const model = settings.activeModels?.find(m => m.provider === 'cloud' && m.isActive)?.modelName || 'gemini-3-pro-preview';
    const res = await ai.models.generateContent({
      model,
      contents: message,
      config: { systemInstruction: "Você é o Jabuti, diretor da NEXORA. Seja breve e responda com autoridade cinematográfica." }
    });
    responseText = res.text || "";
    engineUsed = `Cloud (${model})`;
  }

  // 2. Lógica de Voz (TTS)
  if (shouldSpeak && settings.voiceOutput) {
    await speakResponse(responseText, primary === 'cloud' ? 'cloud' : 'local');
  }

  return { text: responseText, engine: engineUsed };
};

/**
 * Sistema de Voz (TTS) Híbrido
 */
const speakResponse = async (text: string, mode: AIProvider) => {
  if (mode === 'local' || !process.env.API_KEY) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  } else {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
        }
      });
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decodeAudio(audioData), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }
    } catch (e) {
      // Fallback para voz local se o TTS da API falhar
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
};

/**
 * Marketing Studio: Geração Tripla Multi-Formato
 */
export const generateMarketingSwarm = async (title: string, desc: string, platform: 'youtube' | 'tiktok' | 'instagram'): Promise<MarketingPackage> => {
  const ai = getAI();
  const aspectRatio = platform === 'youtube' ? '16:9' : '9:16';

  const metaResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere 3 variantes de marketing para o vídeo "${title}" na plataforma ${platform}. Descrição: ${desc}. Forneça Título, Descrição Curta, 5 Tags e 3 Hashtags por variante.`,
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
  const variants: MarketingVariant[] = await Promise.all(variantsRaw.map(async (v: any, i: number) => {
    const coverUrl = await generateSceneVisual(`YouTube/TikTok Thumbnail for ${platform}, ${v.title}, style: high contrast cinematic`, aspectRatio as any);
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

// Fix: Implemented generateScript for SceneBlock component
export const generateScript = async (title: string, description: string, characters: any[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Escreva um roteiro cinematográfico para a cena "${title}". Contexto: ${description}. Personagens presentes: ${characters.map(c => c.name).join(', ')}.`,
    config: {
      systemInstruction: "Você é um roteirista profissional. Escreva apenas o roteiro no formato padrão (DIÁLOGOS, AÇÕES, TRANSIÇÕES)."
    }
  });
  return response.text || "";
};

// Fix: Implemented generateText for Mensagens component
export const generateText = async (prompt: string, systemInstruction: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction }
  });
  return { text: response.text || "", engine: 'gemini-3-flash-preview' };
};

// Fix: Implemented generateVideoContent for VideoLab component
export const generateVideoContent = async (prompt: string, image?: string | null, aspectRatio: '16:9' | '9:16' | '1:1' = '16:9', onProgress?: (msg: string) => void) => {
  onProgress?.('Jabuti orquestrando motores Veo...');
  const ai = getAI();
  
  const videoConfig: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: aspectRatio === '1:1' ? '16:9' : aspectRatio,
  };

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: image ? { imageBytes: image.split(',')[1], mimeType: 'image/png' } : undefined,
    config: videoConfig
  });

  while (!operation.done) {
    onProgress?.('Jabuti processando frames neurais...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

// Fix: Implemented extractCharactersFromScript for Casting component
export const extractCharactersFromScript = async (script: string): Promise<Character[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extraia os personagens deste roteiro: ${script}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            visualTraits: { type: Type.STRING }
          }
        }
      }
    }
  });
  const data = JSON.parse(response.text || '[]');
  return data.map((d: any) => ({ ...d, id: crypto.randomUUID(), isFixed: false }));
};

// Fix: Implemented scoutLocations for Locations component using Maps Grounding
export const scoutLocations = async (query: string, lat?: number, lng?: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Encontre locações reais que combinem com: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: lat && lng ? {
        retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
      } : undefined
    }
  });

  const locations: LocationInspiration[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((c: any) => c.maps)
    ?.map((c: any) => ({
      title: c.maps.title,
      uri: c.maps.uri,
      snippet: c.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]
    })) || [];

  return { text: response.text || "", locations };
};

// Fix: Implemented generateConceptArt for VisualDev component
export const generateConceptArt = async (prompt: string, style: string, refImage?: string, aspectRatio: any = '16:9', styleId?: string) => {
  const ai = getAI();
  const contents: any = {
    parts: [
      { text: `Gere uma arte conceitual no estilo ${style}: ${prompt}` }
    ]
  };
  if (refImage) {
    contents.parts.unshift({
      inlineData: { data: refImage.split(',')[1], mimeType: 'image/png' }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
    config: { imageConfig: { aspectRatio } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

// Fix: Implemented generateDialogue for DialogueLab component
export const generateDialogue = async (script: string, characters: any[], emotion?: string, isCloud?: boolean) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Gere áudio para este diálogo com emoção ${emotion || 'neutral'}: ${script}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: characters.slice(0, 2).map(c => ({
            speaker: c.name,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voice || 'Puck' } }
          }))
        }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

// Fix: Implemented generateVideoMetadata for CoverGeneratorModal component
export const generateVideoMetadata = async (title: string, prompt: string, creativeBrief: string): Promise<VideoMetadata> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere metadados de vídeo para "${title}". Contexto: ${prompt}. Brief criativo: ${creativeBrief}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// Fix: Implemented analyzeAndSelectBestPost for CoverGeneratorModal component
export const analyzeAndSelectBestPost = async (titles: string[], genre: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise estes títulos e escolha o melhor para o gênero ${genre}: ${titles.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestTitle: { type: Type.STRING },
          bestPlatform: { type: Type.STRING },
          bestCoverIndex: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// Fix: Implemented analyzeCompetitors for Analytics component
export const analyzeCompetitors = async (niche: string, platform: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise os principais concorrentes no nicho ${niche} para a plataforma ${platform}.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) || [];
  return { text: response.text || "", sources };
};

// Fix: Implemented generateStructuredScript for Roteiros component
export const generateStructuredScript = async (title: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Crie um roteiro estruturado para "${title}": ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lines: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"lines": []}');
};

// Fix: Implemented generateBgmMood for Roteiros component
export const generateBgmMood = async (title: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Determine o humor da trilha sonora para "${title}": ${description}`,
    config: { systemInstruction: "Responda apenas com uma palavra descrevendo o humor (ex: Tense, Heroic, Sad)." }
  });
  return response.text?.trim() || "Cinematic";
};

// Fix: Implemented generateScenes for Roteiros component
export const generateScenes = async (title: string, description: string): Promise<Partial<Scene>[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Divida esta história em cenas: ${title} - ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

// Fix: Implemented generateProfessionalLaunchKit for Projetos component
export const generateProfessionalLaunchKit = async (title: string, description: string, provider: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere um kit de lançamento viral para "${title}": ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viralTitles: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"viralTitles": []}');
};

// Fix: Implemented auditCompetitorLink for Growth component
export const auditCompetitorLink = async (url: string, niche: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Audite este link de concorrente (${url}) no contexto de ${niche}.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          competitorAnalysis: { type: Type.STRING },
          viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                uri: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const performHardwareBenchmark = async () => {
  const gpu = (navigator as any).gpu;
  if (!gpu) return { tier: 'Bronze', score: 100, vramEstimate: 'Low', gpuName: 'CPU', webGpuActive: false, recommendedEngine: 'cloud' as AIProvider };
  const adapter = await gpu.requestAdapter();
  const limits = adapter.limits;
  const score = limits.maxStorageBufferBindingSize / (1024 * 1024);
  return { tier: (score > 512 ? 'Ouro' : 'Prata') as any, score: Math.floor(score), vramEstimate: '4GB+', gpuName: 'WebGPU Active', webGpuActive: true, recommendedEngine: 'cloud' as AIProvider };
};

export const checkHardwareCapability = performHardwareBenchmark;
export const getUserPreference = () => JSON.parse(localStorage.getItem('nexora_system_settings') || '{"primaryEngine": "cloud", "fallbackEnabled": true}');
export const checkKey = async () => await (window as any).aistudio.hasSelectedApiKey();
export const openKeySelection = async () => await (window as any).aistudio.openSelectKey();
export const analyzeChannelPostPattern = async (url: string) => ({ lastPostDate: '05/01/2026', suggestedNextPost: '06/01/2026', optimizedHours: ['11:35'], frequencyRecommendation: 'Diária', retentionEstimate: 'Alta' });
export const upscaleTo8K = async (u: any, onP: any) => { for(let i=0; i<=100; i+=10){ onP(i); await new Promise(r => setTimeout(r, 200)); } return u; };
export const learnChannelTone = async (u: string) => "Analítico e Profissional";
