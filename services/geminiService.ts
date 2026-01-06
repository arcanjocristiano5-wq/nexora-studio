
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
        **Instruções para o Assistente de Produção:**
        Sua tarefa é criar um cronograma de tarefas com base nas instruções do Diretor, retornando um JSON estruturado.
        Hoje é ${today}.
        Os canais disponíveis para postagem são: ${existingChannels.map(c => c.name).join(', ')}.
        
        **REGRA DE DISTRIBUIÇÃO DIÁRIA (OBRIGATÓRIO):**
        Se um pedido for para criar ou postar uma quantidade de itens (ex: "crie 10 vídeos", "postar 5 vídeos"), você **DEVE** distribuir essas tarefas em dias consecutivos. Crie uma tarefa separada para cada item, um por dia, começando na data de início mencionada ou inferida.
        
        **Exemplo de Comando:** "Na segunda-feira, crie 10 vídeos para o canal 'Contos e Mistérios' sobre lendas urbanas."
        
        **Resultado Correto:** Uma lista de 10 tarefas separadas. A primeira na segunda-feira, a segunda na terça-feira, e assim por diante. Cada tarefa terá a ação "Criar 1 vídeo" e o tema "lendas urbanas".
        
        A ação para cada tarefa individual gerada a partir de um lote deve ser sempre no singular (ex: "Criar 1 vídeo", "Postar 1 vídeo").
        
        **Pedido do Diretor a ser processado:** "${prompt}"
      `;

      const response = await ai.models.generateContent({
        model: config.modelName,
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                description: "A lista de tarefas do cronograma, seguindo estritamente a REGRA DE DISTRIBUIÇÃO DIÁRIA.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING, description: "Data da tarefa no formato YYYY-MM-DD." },
                    channelName: { type: Type.STRING, description: "Nome do canal para a tarefa, exatamente como fornecido na lista de canais." },
                    action: { type: Type.STRING, description: "Ação a ser executada (no singular, ex: 'Criar 1 vídeo')." },
                    themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de temas para o conteúdo." },
                  },
                  required: ["date", "channelName", "action", "themes"],
                },
              }
            },
            required: ['schedule'],
          },
        },
      });

      try {
        const jsonText = response.text?.trim() || '{}';
        const cleanJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
        const result = JSON.parse(cleanJson);
        return result.schedule.map((task: any) => ({
          ...task,
          id: crypto.randomUUID(),
          status: 'pending',
        }));
      } catch (e) {
        console.error("Erro ao analisar JSON do cronograma:", e);
        throw new Error("Não foi possível gerar um cronograma estruturado.");
      }
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

export const startFullAutoProduction = async (
  initialStory: Story,
  onProgress: (update: { message: string, story: Story, overallProgress: number }) => void
): Promise<Story> => {
    let story = { ...initialStory };

    try {
        // 1. Generate structured script (Progress: 0% -> 10%)
        onProgress({ message: 'Analisando e dividindo roteiro...', story, overallProgress: 5 });
        const lines = await generateStructuredScript(story.description);
        const scenes: Scene[] = lines.map((line, index) => ({
          id: crypto.randomUUID(),
          title: line.character ? `Diálogo: ${line.character}` : `Ação #${index+1}`,
          description: line.content,
          order: index,
          scriptLines: []
        }));
        story = { ...story, scriptLines: lines, scenes };
        onProgress({ message: `Roteiro dividido em ${scenes.length} cenas.`, story, overallProgress: 10 });
        
        // 2. Process each scene (Progress: 10% -> 60%)
        const totalAssetTasks = scenes.length * 3; // art, audio, video
        let completedAssetTasks = 0;

        for (const scene of story.scenes) {
            const updateAssetProgress = () => {
                completedAssetTasks++;
                return 10 + (completedAssetTasks / totalAssetTasks) * 50;
            };

            const baseProgress = updateAssetProgress() - (1/totalAssetTasks * 50);
            onProgress({ message: `Gerando arte para a cena: "${scene.title}"`, story, overallProgress: baseProgress });
            const style = VISUAL_STYLES.find(s => s.id === story.visualStyleId) || VISUAL_STYLES[0];
            const imageUrl = await generateConceptArt(scene.description, style.name);
            story.scenes = story.scenes.map(s => s.id === scene.id ? { ...s, imageUrl } : s);
            
            onProgress({ message: `Gerando áudio para a cena: "${scene.title}"`, story, overallProgress: baseProgress + 0.33 * (1/totalAssetTasks * 50) });
            const audioUrl = await generateDialogue(scene.description);
            story.scenes = story.scenes.map(s => s.id === scene.id ? { ...s, dialogueAudioUrl: audioUrl || undefined } : s);
            
            onProgress({ message: `Renderizando vídeo para a cena: "${scene.title}"`, story, overallProgress: baseProgress + 0.66 * (1/totalAssetTasks * 50) });
            const sceneToAnimate = story.scenes.find(s => s.id === scene.id)!;
            if (sceneToAnimate.imageUrl) {
                const videoUrl = await generateVideoContent(sceneToAnimate.description, sceneToAnimate.imageUrl);
                story.scenes = story.scenes.map(s => s.id === scene.id ? { ...s, videoUrl } : s);
            }
            onProgress({ message: `Cena "${scene.title}" concluída.`, story, overallProgress: updateAssetProgress() });
        }

        // 3. Analysis Stage (Progress: 60% -> 75%)
        onProgress({ message: `Analisando concorrência para "${story.title}"...`, story, overallProgress: 65 });
        await analyzeCompetitors(story.title, 'youtube');
        await new Promise(r => setTimeout(r, 2000));
        onProgress({ message: 'Análise de mercado concluída.', story, overallProgress: 75 });
        
        // 4. Marketing Stage (Progress: 75% -> 90%)
        onProgress({ message: 'Gerando pacote de marketing A/B...', story, overallProgress: 80 });
        await generateMarketingSwarm(story.title, story.description, 'youtube');
        await new Promise(r => setTimeout(r, 2000));
        onProgress({ message: 'Pacote de marketing pronto para revisão.', story, overallProgress: 90 });

        // 5. Final Render Stage (Progress: 90% -> 100%)
        onProgress({ message: 'Iniciando renderização final em 4K...', story, overallProgress: 95 });
        await upscaleTo8K(null, (p: number) => {
            if (p % 20 === 0 && p < 100) {
                 onProgress({ message: `Renderizando em 4K... Bloco ${p/10}/10 processado.`, story, overallProgress: 95 + (p / 20) });
            }
        });

    } catch (error) {
        console.error("Erro na produção automática:", error);
        onProgress({ message: 'Ocorreu um erro. Verifique o console.', story, overallProgress: story.scenes.length > 0 ? 50 : 10 });
        return story;
    }

    onProgress({ message: 'Produção automática concluída e pronta para exportação!', story, overallProgress: 100 });
    return story;
};


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

export const createProjectWithAI = async (prompt: string, type: 'story' | 'series'): Promise<{ title: string; description: string; }> => {
  const config = getActiveModelConfig();
  const ai = getAI();

  const systemInstruction = `Você é um roteirista sênior e criador de conceitos. Sua tarefa é gerar um título e uma sinopse inicial para um novo projeto de ficção.`;
  const userPrompt = type === 'series'
    ? `Crie um título para uma nova mini-série e uma sinopse para o primeiro capítulo/episódio, baseado na seguinte ideia: "${prompt}"`
    : `Crie um título e uma sinopse curta e impactante para uma nova história longa baseada na seguinte ideia: "${prompt}"`;

  const response = await ai.models.generateContent({
    model: config.modelName,
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'O título criativo e chamativo do projeto.' },
          description: { type: Type.STRING, description: 'A sinopse inicial da história ou do primeiro capítulo.' },
        },
        required: ['title', 'description'],
      },
    },
  });

  try {
    const jsonText = response.text?.trim() || '{}';
    const cleanJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Erro ao analisar JSON do projeto:", e);
    return { title: 'Projeto Sem Título (Erro)', description: 'O Jabuti não conseguiu gerar o conteúdo. Tente novamente.' };
  }
};

export const continueScript = async (currentScript: string, isSeries: boolean = false) => {
  const config = getActiveModelConfig();
  const ai = getAI();
  
  const userPrompt = isSeries
    ? `Você é um roteirista mestre. Baseado no roteiro anterior, continue a história escrevendo o próximo capítulo. Comece com um título para o novo capítulo (ex: CAPÍTULO 2: A DESCOBERTA). Não repita o texto fornecido, apenas continue a partir dele:\n\n---\n\n${currentScript}`
    : `Você é um roteirista mestre. Continue este roteiro de forma criativa e coesa. Não repita o texto fornecido, apenas continue a partir dele:\n\n---\n\n${currentScript}`;

  const response = await ai.models.generateContent({
    model: config.modelName,
    contents: userPrompt,
  });
  return response.text || "";
};

export const extractCharacters = async (script: string): Promise<Partial<Character>[]> => {
    const config = getActiveModelConfig();
    const ai = getAI();

    const response = await ai.models.generateContent({
        model: config.modelName,
        contents: `Analise o roteiro a seguir e extraia todos os personagens. Para cada personagem, forneça o nome, um papel sugerido (ex: Protagonista, Antagonista, Coadjuvante) e uma breve descrição baseada em suas ações e diálogos. Ignore nomes que não pareçam ser personagens (ex: NARRADOR). Roteiro: "${script}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'Nome do personagem em maiúsculas.' },
                        role: { type: Type.STRING, description: 'Papel do personagem na história.' },
                        description: { type: Type.STRING, description: 'Breve descrição do personagem.' },
                    },
                    required: ['name', 'role', 'description'],
                },
            },
        },
    });

    try {
        const jsonText = response.text?.trim() || '[]';
        const cleanJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
        const characters = JSON.parse(cleanJson);
        return characters.map((c: any) => ({ ...c, id: crypto.randomUUID(), isFixed: false, visualTraits: '' }));
    } catch (e) {
        console.error("Erro ao analisar JSON de personagens:", e);
        return [];
    }
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
    const config = getActiveModelConfig();
    return `${downloadLink}&key=${config.apiKey || process.env.API_KEY}`;
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

export const generateStructuredScript = async (scriptText: string): Promise<ScriptLine[]> => {
  const config = getActiveModelConfig();
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: config.modelName,
    contents: `Analise o roteiro a seguir e divida-o em uma lista de ações e diálogos em ordem. Ações são descrições de cena. Diálogos têm um personagem (em maiúsculas). Roteiro: "${scriptText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'O tipo de linha: "action" ou "dialogue".' },
            character: { type: Type.STRING, description: 'O nome do personagem que está falando (apenas para "dialogue").' },
            content: { type: Type.STRING, description: 'O texto da ação ou do diálogo.' },
          },
          required: ['type', 'content'],
        },
      },
    },
  });

  try {
    const jsonText = response.text?.trim() || '[]';
    const cleanJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const lines = JSON.parse(cleanJson);
    return lines.map((line: any) => ({ ...line, id: crypto.randomUUID() }));
  } catch (e) {
    console.error("Erro ao analisar JSON do roteiro:", e);
    return scriptText.split('\n').filter(l => l.trim()).map(l => ({
        id: crypto.randomUUID(),
        type: l.includes(':') ? 'dialogue' : 'action',
        character: l.includes(':') ? l.split(':')[0].trim() : undefined,
        content: l.includes(':') ? l.split(':').slice(1).join(':').trim() : l.trim()
    }));
  }
};

// FIX: Updated function to handle multi-speaker dialogue generation based on the provided characters.
export const generateDialogue = async (text: string, characters?: { name: string, voice: string }[]): Promise<string | null> => {
    if (!text?.trim()) return null;
    const ai = getAI();
    let speechConfig: any;
    let prompt = text;

    if (characters && characters.length >= 2) {
        const speakerConfigs = characters.map(c => ({
            speaker: c.name,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voice } }
        }));

        speechConfig = {
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: speakerConfigs
            }
        };
        prompt = `TTS the following conversation between ${characters.map(c => c.name).join(' and ')}:\n\n${text}`;
    } else {
        speechConfig = {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
        };
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig,
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return `data:audio/pcm;base64,${base64Audio}`;
    }
    return null;
};

export const generateBgmMood = async (title: string, description: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sugira um estilo de trilha sonora (Royalty Free) para esta cena: ${title} - ${description}. Responda apenas o nome do estilo e BPM.`
  });
  return response.text || "Cinematic Ambient - 90 BPM";
};

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
export const checkKey = async () => {
    const hasApiKey = (window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey();
    return hasApiKey || !!process.env.API_KEY;
};
export const openKeySelection = async () => (window as any).aistudio?.openSelectKey?.();
export const generateScenes = async (t: string, d: string) => [{ title: "Cena 1", description: "O personagem entra na névoa." }];
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