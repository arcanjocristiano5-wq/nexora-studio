
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VISUAL_STYLES } from '../constants';
import { SystemSettings, AIProvider, MarketingPackage, MarketingVariant, Character, LocationInspiration, VideoMetadata, AnalysisResult, Scene, HardwareStatus, AIWorker, AIConfiguration, ScriptLine, Story, ScheduleTask, Channel } from '../types';

/**
 * Orquestrador de Chaves e Modelos: Pega a chave do modelo selecionado ou env global.
 */
const getActiveModelConfig = () => {
    const settings = JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{}');
    const brainId = settings.primaryBrainId;
    const model = settings.activeModels?.find((m: any) => m.id === brainId && m.isActive);
    const localModel = settings.localModels?.find((m: any) => m.id === brainId && m.isActive);
    
    if (localModel) return { ...localModel, provider: 'local', modelName: localModel.name };
    return model || { id: 'default', modelName: 'gemini-3-flash-preview', apiKey: process.env.API_KEY };
};

const getAI = () => {
    const config = getActiveModelConfig();
    return new GoogleGenAI({ apiKey: config.apiKey || process.env.API_KEY });
};

export const generateProductionSchedule = async (prompt: string, existingChannels: Channel[]): Promise<ScheduleTask[]> => {
      const ai = getAI();
      const config = getActiveModelConfig();
      const today = new Date().toISOString().split('T')[0];

      const fullPrompt = `
        **Instruções para o Assistente de Produção (Diretor Jabuti):**
        Sua tarefa é criar um cronograma de tarefas com base nas instruções do Diretor.
        Hoje é ${today}.
        Canais: ${existingChannels.map(c => c.name).join(', ')}.
        
        **REGRA DE OURO DE AGENDAMENTO:**
        Se o Diretor pedir para postar/criar vários vídeos (ex: "crie 10 vídeos"), você DEVE criar uma tarefa para CADA DIA consecutivo.
        Ex: Pedido de 5 vídeos na segunda -> 1 seg, 1 ter, 1 qua, 1 qui, 1 sex.
        
        Retorne um JSON com a lista de tarefas. Cada tarefa deve ter a ação no singular ("Criar 1 vídeo").
        
        Comando: "${prompt}"
      `;

      const response = await ai.models.generateContent({
        model: config.modelName === 'gemini-3-flash-preview' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview',
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    channelName: { type: Type.STRING },
                    action: { type: Type.STRING },
                    themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["date", "channelName", "action", "themes"],
                },
              }
            },
          },
        },
      });

      try {
        const result = JSON.parse(response.text || '{"schedule": []}');
        return result.schedule.map((task: any) => ({
          ...task,
          id: crypto.randomUUID(),
          status: 'pending',
        }));
      } catch (e) {
        console.error("Erro no parse do cronograma:", e);
        return [];
      }
    };

export const talkToJabuti = async (message: string) => {
  const config = getActiveModelConfig();
  
  if (config.provider === 'local') {
      // Simulação de resposta local via Llama 3 / WebGPU
      return { 
        text: `[Processamento Local WebGPU] Entendido Diretor. Baseado no modelo ${config.modelName}, analisei sua solicitação: "${message}". Como posso ajudar na execução?`,
        engine: config.modelName,
        sources: []
      };
  }

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

export const createProjectWithAI = async (prompt: string, type: 'story' | 'series'): Promise<{ title: string; description: string; }> => {
  const config = getActiveModelConfig();
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: config.modelName === 'gemini-3-flash-preview' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview',
    contents: `Crie um título e sinopse para um(a) ${type === 'series' ? 'série' : 'filme'} baseado em: ${prompt}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['title', 'description'],
      },
    },
  });
  return JSON.parse(response.text || '{"title": "Erro", "description": "Falha na geração"}');
};

export const generateDialogue = async (text: string, characters?: { name: string, voice: string }[]): Promise<string | null> => {
    if (!text?.trim()) return null;
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : null;
};

// FIX: Added missing scoutLocations member using Google Maps grounding.
export const scoutLocations = async (query: string, lat?: number, lng?: number): Promise<{ text: string; locations: LocationInspiration[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-latest",
    contents: `Pesquise locações reais inspiradoras para: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      ...(lat && lng ? {
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      } : {})
    },
  });

  const text = response.text || "";
  const locations = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.maps?.title || 'Local',
    uri: chunk.maps?.uri || '',
    snippet: chunk.maps?.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.text || ''
  })).filter((l: any) => l.uri) || [];

  return { text, locations };
};

// FIX: Added missing continueScript member.
export const continueScript = async (currentScript: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Continue o seguinte roteiro mantendo o tom e estilo: ${currentScript}`,
  });
  return response.text || "";
};

// FIX: Added missing extractCharacters member.
export const extractCharacters = async (description: string): Promise<Character[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extraia os personagens principais desta descrição em formato JSON: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            visualTraits: { type: Type.STRING },
          },
          required: ["name", "role", "description", "visualTraits"]
        }
      }
    }
  });
  try {
    const chars = JSON.parse(response.text || "[]");
    return chars.map((c: any) => ({ ...c, id: c.id || crypto.randomUUID(), isFixed: false }));
  } catch (e) {
    return [];
  }
};

// FIX: Added missing startFullAutoProduction member to orchestrate the auto-production flow.
export const startFullAutoProduction = async (story: Story, onProgress: (update: any) => void) => {
  const ai = getAI();
  let currentStory = { ...story };
  
  onProgress({ message: "Gerando roteiro estruturado...", story: currentStory, overallProgress: 10 });
  const scenesRaw = await generateStructuredScript(currentStory.description);
  
  const scenes: Scene[] = scenesRaw.map((line: any, index: number) => ({
    id: crypto.randomUUID(),
    title: line.character ? `Diálogo: ${line.character}` : 'Cena de Ação',
    description: line.content,
    order: index,
    scriptLines: []
  }));
  
  currentStory.scenes = scenes;
  onProgress({ message: "Roteiro pronto. Iniciando enxame de render...", story: currentStory, overallProgress: 30 });

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const progressBase = 30 + (i / scenes.length) * 70;
    
    onProgress({ message: `Gerando arte para cena ${i+1}...`, story: currentStory, overallProgress: progressBase });
    const imgUrl = await generateConceptArt(scene.description, 'Disney 2.1');
    if (imgUrl) currentStory.scenes[i].imageUrl = imgUrl;

    onProgress({ message: `Sintetizando áudio para cena ${i+1}...`, story: currentStory, overallProgress: progressBase + 5 });
    const audioUrl = await generateDialogue(scene.description);
    if (audioUrl) currentStory.scenes[i].dialogueAudioUrl = audioUrl;

    onProgress({ message: `Renderizando vídeo (Veo) para cena ${i+1}...`, story: currentStory, overallProgress: progressBase + 10 });
    const videoUrl = await generateVideoContent(scene.description, imgUrl || undefined);
    if (videoUrl) currentStory.scenes[i].videoUrl = videoUrl;
  }

  onProgress({ message: "Produção Concluída com Sucesso!", story: currentStory, overallProgress: 100 });
};

/* Outros stubs mantidos para compatibilidade */
export const checkHardwareCapability = async (): Promise<HardwareStatus> => {
  const gpu = (navigator as any).gpu;
  if (!gpu) return { tier: 'Bronze', score: 100, vramEstimate: 'Low', vramTotalGb: 2, gpuName: 'CPU', webGpuActive: false };
  const adapter = await gpu.requestAdapter();
  const vramTotalGb = 8; // Simulado para Windows Nativo
  return { tier: 'Ouro', score: 800, vramEstimate: '8GB VRAM', vramTotalGb, gpuName: adapter?.name || 'GPU', webGpuActive: true };
};

export const checkKey = async () => true;
export const openKeySelection = async () => {};

export const generateConceptArt = async (prompt: string, style: string, refImage?: string, aspectRatio: string = '16:9') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Style: ${style}. Prompt: ${prompt}` },
        ...(refImage ? [{ inlineData: { data: refImage.split(',')[1], mimeType: 'image/png' } }] : [])
      ]
    },
    config: { imageConfig: { aspectRatio: aspectRatio as any } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const generateStructuredScript = async (storyDesc: string): Promise<ScriptLine[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Converta esta história em um roteiro estruturado JSON com linhas de 'action' e 'dialogue': ${storyDesc}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            character: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["type", "content"]
        }
      }
    }
  });
  try {
    const lines = JSON.parse(response.text || "[]");
    return lines.map((l: any) => ({ ...l, id: crypto.randomUUID() }));
  } catch(e) { return []; }
};

export const analyzeCompetitors = async (n: string, p: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise concorrentes no nicho ${n} na plataforma ${p}`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Fonte',
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];
  return { text, sources };
};

export const downloadLocalModel = async (id: string, onProgress: any) => {
  for (let i = 0; i <= 100; i += 10) {
    onProgress(i);
    await new Promise(r => setTimeout(r, 300));
  }
};

export const getUserPreference = () => JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{}');

export const learnChannelTone = async (url: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise o tom de voz deste canal: ${url}`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "Tom Amigável e Informativo";
};

export const auditCompetitorLink = async (url: string, niche: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audite este link ${url} no nicho ${niche} e forneça um relatório JSON`,
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
        }
      }
    }
  });
  const data = JSON.parse(response.text || "{}");
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Fonte',
    uri: chunk.web?.uri
  })).filter((s: any) => s.uri) || [];
  return { ...data, sources };
};

// FIX: Update generateMarketingSwarm return type to include selectedVariantId.
export const generateMarketingSwarm = async (t: string, d: string, p: string): Promise<MarketingPackage> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere 3 variantes de marketing para ${t} (${d}) na plataforma ${p} em formato JSON`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                score: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
                aspectRatio: { type: Type.STRING },
              }
            }
          }
        }
      }
    }
  });
  const result = JSON.parse(response.text || '{"variants": []}');
  const variants = result.variants.map((v: any) => ({
    ...v,
    id: v.id || crypto.randomUUID(),
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    aspectRatio: p === 'youtube' ? '16:9' : '9:16'
  }));
  return {
    projectId: 'swarm',
    platform: p as any,
    variants,
    selectedVariantId: variants[0]?.id
  };
};

export const upscaleTo8K = async (u: any, onP: any) => {
  for (let i = 0; i <= 100; i += 5) {
    onP(i);
    await new Promise(r => setTimeout(r, 100));
  }
};

export const analyzeChannelPostPattern = async (u: string) => {
  return {
    lastPostDate: 'Ontem, 18:00',
    suggestedNextPost: 'Amanhã, 11:30',
    frequencyRecommendation: 'Postar 3x por semana nos horários de pico de audiência brasileira.'
  };
};

// FIX: Update generateVideoContent to accept onProgress callback and match 4 arguments in Studio.tsx.
export const generateVideoContent = async (p: string, i?: string, a?: string, onProgress?: (msg: string) => void) => {
  if (onProgress) onProgress("Iniciando motores de vídeo...");
  const ai = getAI();
  const operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: p,
    image: i ? { imageBytes: i.split(',')[1], mimeType: 'image/png' } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: a === '9:16' ? '9:16' : '16:9'
    }
  });
  
  let currentOp = operation;
  while (!currentOp.done) {
    if (onProgress) onProgress("Processando frames neurais...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
  }

  const downloadLink = currentOp.response?.generatedVideos?.[0]?.video?.uri;
  return downloadLink ? `${downloadLink}&key=${process.env.API_KEY}` : "";
};

export const generateVideoMetadata = async (t: string, p: string, b: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere títulos e descrição para o vídeo ${t} sobre ${p} com o briefing ${b}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"titles": [], "description": ""}');
};

export const analyzeAndSelectBestPost = async (t: any, g: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Qual destes títulos [${t.join(', ')}] é melhor para o gênero ${g}?`,
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
  return JSON.parse(response.text || "{}");
};
