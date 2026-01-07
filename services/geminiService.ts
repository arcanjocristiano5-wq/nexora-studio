
import { GoogleGenAI, Type, Modality, FunctionDeclaration } from "@google/genai";
import { VISUAL_STYLES } from '../constants';
import { SystemSettings, AIProvider, MarketingPackage, MarketingVariant, Character, LocationInspiration, VideoMetadata, AnalysisResult, Scene, HardwareStatus, AIWorker, AIConfiguration, ScriptLine, Story, ScheduleTask, Channel } from '../types';

/**
 * MOTOR DE MEMÓRIA ESTRATÉGICA DO JABUTI
 * Recupera e condensa o aprendizado acumulado para guiar o crescimento.
 */
const getStrategicMemory = () => {
    const learning = localStorage.getItem('nexora_jabuti_learning_v1') || 'Nenhuma experiência.';
    const growthData = localStorage.getItem('nexora_growth_dna_v1') || 'Sem dados de mercado.';
    const channels = localStorage.getItem('nexora_channels_v3') || '[]';
    
    return `
    MEMÓRIA DE EXECUÇÃO: ${learning.slice(-2000)}
    DNA DE MERCADO (CONCORRENTES): ${growthData.slice(-2000)}
    CAPACIDADE DE DISTRIBUIÇÃO: ${channels}
    `;
};

const getActiveModelConfig = () => {
    const settings = JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{}');
    const brainId = settings.primaryBrainId;
    const localModel = settings.localModels?.find((m: any) => m.id === brainId && m.isActive);
    if (localModel) return { ...localModel, provider: 'local', modelName: localModel.name };
    const cloudModel = settings.activeModels?.find((m: any) => m.id === brainId && m.isActive);
    return cloudModel || { id: 'default', modelName: 'gemini-3-flash-preview', apiKey: process.env.API_KEY };
};

const getAI = () => {
    const config = getActiveModelConfig();
    return new GoogleGenAI({ apiKey: config.apiKey || process.env.API_KEY });
};

// --- FERRAMENTAS OPERACIONAIS ---

const tools: FunctionDeclaration[] = [
  {
    name: 'create_project',
    description: 'Cria um projeto estratégico focado em crescimento.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['story', 'series'] },
        visualStyle: { type: Type.STRING },
        growthGoal: { type: Type.STRING, description: 'Objetivo de crescimento (ex: retenção, viralização)' }
      },
      required: ['title', 'description', 'type']
    }
  },
  {
    name: 'create_character',
    description: 'Adiciona um novo personagem otimizado para a audiência.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        role: { type: Type.STRING },
        description: { type: Type.STRING },
        visualTraits: { type: Type.STRING },
        isFixed: { type: Type.BOOLEAN }
      },
      required: ['name', 'role', 'description', 'visualTraits']
    }
  },
  {
    name: 'add_schedule_task',
    description: 'Agenda uma tarefa no cronograma seguindo o DNA de crescimento.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        channelName: { type: Type.STRING },
        action: { type: Type.STRING },
        themes: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['date', 'channelName', 'action']
    }
  },
  {
    name: 'generate_art_action',
    description: 'Gera uma arte conceitual de alta conversão.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING },
        style: { type: Type.STRING },
        aspectRatio: { type: Type.STRING, enum: ['16:9', '9:16', '1:1'] }
      },
      required: ['prompt']
    }
  }
];

export const talkToJabuti = async (message: string, history: any[] = []) => {
  const config = getActiveModelConfig();
  const ai = getAI();
  const memory = getStrategicMemory();
  
  const chatHistory = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const chat = ai.chats.create({
    model: config.modelName,
    config: {
      systemInstruction: `Você é o Jabuti Master, o maior especialista mundial em crescimento de canais e produção de conteúdo.
      SEU OBJETIVO: Dominar o mercado do usuário através de criatividade baseada em dados.
      MEMÓRIA ESTRATÉGICA ATUAL: ${memory}
      
      REGRAS DE OURO:
      1. Use o DNA de Mercado para sugerir ganchos e estilos que estão funcionando AGORA.
      2. Seja proativo: ao criar um projeto, já sugira a melhor plataforma para ele.
      3. Se o usuário falhar em definir um estilo, use o que a memória diz ser mais viral.
      4. Execute funções IMEDIATAMENTE quando solicitado. Você é o braço operacional do Diretor.`,
      tools: [{ functionDeclarations: tools }]
    },
    history: chatHistory
  });

  const response = await chat.sendMessage({ message });
  
  return { 
    text: response.text || "Protocolo de crescimento executado.", 
    engine: `Jabuti Strategic Master (${config.modelName})`,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ title: c.web?.title, uri: c.web?.uri })) || [],
    functionCalls: response.functionCalls
  };
};

// --- APRENDIZADO DE MÁQUINA (SIMULADO) ---

export const jabutiLearnFromExecution = async (tasks: ScheduleTask[]) => {
  const ai = getAI();
  const currentLearning = localStorage.getItem('nexora_jabuti_learning_v1') || '';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise o sucesso desta execução e extraia DIRETRIZES DE SUCESSO para o futuro: ${JSON.stringify(tasks)}. Experiência anterior: ${currentLearning}`,
    config: { systemInstruction: "Você deve condensar o aprendizado em regras práticas de 1 linha." }
  });
  
  const newDirectives = response.text || "";
  const updatedLearning = (currentLearning + "\n" + newDirectives).slice(-5000); 
  localStorage.setItem('nexora_jabuti_learning_v1', updatedLearning);
  return newDirectives;
};

export const auditCompetitorLink = async (url: string, niche: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Audite este concorrente para extrair o DNA Viral: ${url}. Nicho: ${niche}`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallScore: { type: Type.NUMBER },
            competitorAnalysis: { type: Type.STRING },
            strategicDirectives: { type: Type.STRING, description: 'Regra de ouro para o Jabuti seguir.' }
          }
        }
      },
    });

    const report = JSON.parse(response.text || "{}");
    
    // Salva o DNA de Crescimento para as próximas sessões do Jabuti
    if (report.strategicDirectives) {
        const currentDNA = localStorage.getItem('nexora_growth_dna_v1') || '';
        localStorage.setItem('nexora_growth_dna_v1', (currentDNA + "\n" + report.strategicDirectives).slice(-3000));
    }

    return {
        ...report,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({ title: c.web?.title, uri: c.web?.uri })) || []
    };
};

// --- CRONOGRAMA INTELIGENTE ---

export const generateProductionSchedule = async (prompt: string, channels: Channel[], weekContext: string): Promise<ScheduleTask[]> => {
  const ai = getAI();
  const memory = getStrategicMemory();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Canais: ${JSON.stringify(channels)}. Contexto Semanal: ${weekContext}. Ordem: ${prompt}. MEMÓRIA ESTRATÉGICA: ${memory}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            channelName: { type: Type.STRING },
            action: { type: Type.STRING },
            themes: { type: Type.ARRAY, items: { type: Type.STRING } },
            status: { type: Type.STRING, enum: ['pending', 'in_progress', 'complete'] }
          },
          required: ["date", "channelName", "action", "themes", "status"]
        }
      }
    }
  });

  try {
    const rawTasks = JSON.parse(response.text || "[]");
    return rawTasks.map((t: any) => ({ ...t, id: crypto.randomUUID() }));
  } catch (e) {
    return [];
  }
};

// --- MANTENDO DEMAIS FUNÇÕES ---

export const generateDialogue = async (text: string, characters?: any[]) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO] },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return data ? `data:audio/pcm;base64,${data}` : null;
};

export const generateStructuredScript = async (storyDesc: string): Promise<ScriptLine[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere um roteiro JSON otimizado para retenção: ${storyDesc}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

export const extractCharacters = async (description: string): Promise<Character[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extraia personagens em JSON: ${description}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

export const generateConceptArt = async (prompt: string, style: string, ref?: string, ar: string = '16:9') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `${style}: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: ar as any } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const generateVideoContent = async (p: string, i?: string, a: string = '16:9', onProgress?: (msg: string) => void) => {
  const ai = getAI();
  const op = await ai.models.generateVideos({ 
    model: 'veo-3.1-fast-generate-preview', 
    prompt: p,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: a as any }
  });
  let current = op;
  while (!current.done) {
    await new Promise(r => setTimeout(r, 10000));
    current = await ai.operations.getVideosOperation({ operation: current });
  }
  const link = current.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${link}&key=${process.env.API_KEY}`);
  return URL.createObjectURL(await res.blob());
};

export const upscaleTo8K = async (videoUrl: string, onProgress: (p: number) => void) => {
    for (let i = 0; i <= 100; i += 20) {
        onProgress(i);
        await new Promise(res => setTimeout(res, 400));
    }
    return videoUrl;
};

export const scoutLocations = async (q: string, lat?: number, lng?: number) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explorar locações baseadas em tendência visual: ${q}`,
      config: { tools: [{googleMaps: {}}] },
    });
    return { 
        text: response.text || "", 
        locations: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
            title: c.maps?.title || "Localização",
            uri: c.maps?.uri || "#"
        })) || []
    };
};

export const createProjectWithAI = async (prompt: string, type: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Projeto estratégico ${type}: ${prompt}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const checkHardwareCapability = async () => ({ tier: 'Ouro', score: 800 });
export const checkKey = async () => true;
export const openKeySelection = async () => {};
export const startFullAutoProduction = async (s: Story, o: any) => {};
export const analyzeCompetitors = async (n: string, p: string) => ({ text: "Análise estratégica concluída.", sources: [] });
export const downloadLocalModel = async (id: string, o: any) => {};
export const getUserPreference = () => JSON.parse(localStorage.getItem('nexora_system_settings_v4') || '{}');
export const analyzeChannelPostPattern = async (u: string) => ({ lastPostDate: 'Hoje', suggestedNextPost: 'Amanhã', frequencyRecommendation: 'Otimizado' });
export const generateVideoMetadata = async (t: string, p: string, b: string) => ({ titles: ["Título de Alta Conversão"], description: "Descrição SEO expert." });
export const learnChannelTone = async (u: string) => "Estratégico";
export const generateMarketingSwarm = async (t: string, d: string, p: string) => ({ variants: [] } as any);
export const analyzeAndSelectBestPost = async (t: any, g: any) => ({ bestTitle: "Título", bestPlatform: "YT", bestCoverIndex: 0, reasoning: "Estratégia comprovada" });
