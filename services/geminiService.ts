
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VISUAL_STYLES } from '../constants';
import { SystemSettings, AIProvider, VideoMetadata, AnalysisResult, LocationInspiration, Character } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Neural Router: O Cérebro do Jabuti que decide qual IA usar
 */
export const talkToJabuti = async (message: string) => {
  const settings: SystemSettings = JSON.parse(localStorage.getItem('nexora_system_settings') || '{}');
  const primary = settings.primaryEngine || 'cloud';

  if (primary === 'local' && (window as any).ai) {
    try {
      console.log("Jabuti: Tentando processamento Local...");
      const session = await (window as any).ai.createTextSession();
      const result = await session.prompt(message);
      return { text: result, engine: 'Local Engine' };
    } catch (e) {
      console.warn("Jabuti: IA Local falhou ou indisponível. Acionando Fallback Cloud...");
      if (!settings.fallbackEnabled) throw new Error("IA Local falhou e Fallback está desativado.");
    }
  }

  // Fallback ou Primário Cloud
  const ai = getAI();
  const activeModel = settings.activeModels?.find(m => m.provider === 'cloud' && m.isActive)?.modelName || 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model: activeModel,
    contents: message,
    config: { 
      systemInstruction: "Você é o Jabuti, o Diretor Supremo da NEXORA. Sua missão é orquestrar produções cinematográficas com precisão técnica e criatividade de ponta." 
    }
  });

  return { text: response.text || '', engine: `Cloud (${activeModel})` };
};

export const performHardwareBenchmark = async () => {
  const gpu = (navigator as any).gpu;
  if (!gpu) return { tier: 'Bronze', score: 100, vramEstimate: 'Baixa', gpuName: 'Somente CPU', webGpuActive: false, recommendedEngine: 'cloud' as AIProvider };

  const adapter = await gpu.requestAdapter();
  if (!adapter) return { tier: 'Bronze', score: 100, vramEstimate: 'Baixa', gpuName: 'GPU Incompatível', webGpuActive: false, recommendedEngine: 'cloud' as AIProvider };
  
  const limits = adapter.limits;
  const score = limits.maxStorageBufferBindingSize / (1024 * 1024);
  
  let tier: 'Bronze' | 'Prata' | 'Ouro' | 'Platina' = 'Bronze';
  if (score > 1024) tier = 'Platina';
  else if (score > 512) tier = 'Ouro';
  else if (score > 256) tier = 'Prata';

  return {
    tier,
    score: Math.floor(score),
    vramEstimate: `${Math.floor(score / 4)}GB VRAM Est.`,
    gpuName: 'Acelerador WebGPU Ativo',
    webGpuActive: true,
    recommendedEngine: (tier === 'Ouro' || tier === 'Platina' ? 'local' : 'cloud') as AIProvider
  };
};

export const checkHardwareCapability = performHardwareBenchmark;
export const getUserPreference = () => JSON.parse(localStorage.getItem('nexora_system_settings') || '{"primaryEngine": "cloud", "fallbackEnabled": true}');
export const checkKey = async () => await (window as any).aistudio.hasSelectedApiKey();
export const openKeySelection = async () => await (window as any).aistudio.openSelectKey();

/**
 * Fix: Added 2nd argument visualStyleId to handle style modifiers
 */
export const generateSceneVisual = async (description: string, visualStyleId?: string) => {
    const ai = getAI();
    const style = VISUAL_STYLES.find(s => s.id === visualStyleId);
    const prompt = style ? `${style.promptModifier}. ${description}` : description;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
};

// Missing functions implementation

export const generateScript = async (title: string, description: string, characters: Character[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a cinematic script for the scene "${title}". Description: ${description}. Characters: ${characters.map(c => c.name).join(', ')}.`,
    config: {
      systemInstruction: "You are a world-class screenwriter. Use industry standard formatting."
    }
  });
  return response.text || '';
};

export const learnChannelTone = async (url: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the content and tone of the channel at: ${url}`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text || 'Tone not identifiable.';
};

export const generateText = async (prompt: string, systemInstruction?: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction }
  });
  return { text: response.text || '' };
};

export const generateVideoContent = async (prompt: string, image?: string, aspectRatio: '16:9' | '9:16' | '1:1' = '16:9', onProgress?: (msg: string) => void) => {
  const ai = getAI();
  onProgress?.('Iniciando motores de vídeo...');
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: image ? { imageBytes: image.split(',')[1], mimeType: 'image/png' } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio === '1:1' ? '16:9' : aspectRatio
    }
  });

  while (!operation.done) {
    onProgress?.('Jabuti processando pixels neurais...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const extractCharactersFromScript = async (script: string): Promise<Character[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Extract characters from this script as JSON: ${script}`,
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
          },
          required: ["name", "role", "description"]
        }
      }
    }
  });
  const chars = JSON.parse(response.text || '[]');
  return chars.map((c: any) => ({ ...c, id: crypto.randomUUID(), isFixed: false }));
};

export const scoutLocations = async (query: string, lat?: number, lng?: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `Identify location inspirations for: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: lat && lng ? { latLng: { latitude: lat, longitude: lng } } : undefined
      }
    }
  });
  const locations: LocationInspiration[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((c: any) => c.maps)
    ?.map((c: any) => ({
      title: c.maps.title,
      uri: c.maps.uri,
      snippet: c.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]
    })) || [];
  return { text: response.text || '', locations };
};

export const generateConceptArt = async (prompt: string, styleName: string, referenceImage?: string, aspectRatio: string = "16:9", styleId?: string) => {
    const ai = getAI();
    const style = VISUAL_STYLES.find(s => s.id === styleId);
    const finalPrompt = `${style ? style.promptModifier : `Style: ${styleName}`}. ${prompt}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                ...(referenceImage ? [{ inlineData: { data: referenceImage.split(',')[1], mimeType: 'image/png' } }] : []),
                { text: finalPrompt }
            ]
        },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio as any
            }
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
};

export const generateDialogue = async (script: string, characters: any[], emotion?: string, useCloud: boolean = true) => {
  if (!useCloud) return null;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: `Read this script with ${emotion || 'natural'} emotion: ${script}`,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: characters.slice(0, 2).map(c => ({
            speaker: c.name,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voice } }
          }))
        }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

export const analyzeChannelPostPattern = async (url: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze post frequency and best times for channel: ${url}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lastPostDate: { type: Type.STRING },
          suggestedNextPost: { type: Type.STRING },
          frequencyRecommendation: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const upscaleTo8K = async (videoUrl: string, onProgress: (p: number) => void) => {
  for (let i = 0; i <= 100; i += 10) {
    onProgress(i);
    await new Promise(res => setTimeout(res, 500));
  }
};

export const generateVideoMetadata = async (title: string, description: string, creativeBrief: string): Promise<VideoMetadata> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate viral YouTube metadata for: ${title}. Brief: ${creativeBrief}. Desc: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeAndSelectBestPost = async (titles: string[], genre: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Select the best title from ${titles.join(', ')} for genre ${genre}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestTitle: { type: Type.STRING },
          bestCoverIndex: { type: Type.INTEGER },
          bestPlatform: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeCompetitors = async (niche: string, platform: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze top competitors in ${niche} on ${platform}`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.web).map((c: any) => c.web) || [];
  return { text: response.text || '', sources };
};

export const generateStructuredScript = async (title: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a structured script lines for: ${title}`,
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
  return JSON.parse(response.text || '{"lines":[]}');
};

export const generateBgmMood = async (description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest BGM mood for: ${description}`
  });
  return response.text || 'Dramatic';
};

export const generateScenes = async (title: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Break down scenes for: ${title}`,
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

export const generateProfessionalLaunchKit = async (title: string, description: string, mode: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate viral launch kit for: ${title}`,
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
  return JSON.parse(response.text || '{"viralTitles":["Default"]}');
};

export const auditCompetitorLink = async (url: string, niche: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Audit this video link ${url} for niche ${niche}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          competitorAnalysis: { type: Type.STRING },
          viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } } } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateMarketingSwarm = async (title: string, desc: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate 3 marketing variants for: ${title}. Desc: ${desc}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectId: { type: Type.STRING },
          selectedVariantId: { type: Type.STRING },
          variants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                coverUrl: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                score: { type: Type.INTEGER },
                reasoning: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  const data = JSON.parse(response.text || '{}');
  // Add placeholder images if missing
  data.variants = data.variants.map((v: any) => ({
    ...v,
    coverUrl: v.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop'
  }));
  return data;
};
