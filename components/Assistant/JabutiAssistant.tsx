
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  talkToJabuti, 
  generateDialogue, 
  generateStructuredScript, 
  extractCharacters, 
  generateConceptArt,
  scoutLocations
} from '../../services/geminiService';
import { Icons, VISUAL_STYLES } from '../../constants';
import Jabuti from '../Brand/Jabuti';
import { SystemSettings, Story, Character, Scene, ScheduleTask } from '../../types';
import { decodeAudio, decodeAudioData } from '../../services/audioUtils';

export default function JabutiAssistant({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [engineType, setEngineType] = useState<'cloud' | 'local'>('cloud');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const settingsRaw = localStorage.getItem('nexora_system_settings_v4');
    if (settingsRaw) {
        const settings: SystemSettings = JSON.parse(settingsRaw);
        setEngineType(settings.primaryBrainId?.startsWith('l') ? 'local' : 'cloud');
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const speak = async (text: string) => {
    if (!text) return;
    try {
        const base64Audio = await generateDialogue(text);
        if (base64Audio) {
            if (!audioContextRef.current) audioContextRef.current = new AudioContext();
            const audioData = decodeAudio(base64Audio.split(',')[1]);
            const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
        }
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        const result = await talkToJabuti(textToSend, messages);
        
        if (result.functionCalls && result.functionCalls.length > 0) {
          for (const fc of result.functionCalls) {
            const args = fc.args as any;

            // --- LÓGICA DE EXECUÇÃO DE FERRAMENTAS ---

            if (fc.name === 'create_character') {
                const newChar: Character = {
                    id: crypto.randomUUID(),
                    name: args.name,
                    role: args.role,
                    description: args.description,
                    visualTraits: args.visualTraits,
                    isFixed: args.isFixed || false
                };
                const storageKey = newChar.isFixed ? 'nexora_fixed_chars' : 'nexora_temp_chars';
                const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
                localStorage.setItem(storageKey, JSON.stringify([newChar, ...current]));
                window.dispatchEvent(new Event('storage'));
                setMessages(prev => [...prev, { role: 'assistant', content: `Ator "${newChar.name}" adicionado ao elenco com sucesso.`, engine: 'Jabuti Master' }]);
                await speak(`Diretor, o ator ${newChar.name} já está no camarim.`);
            }

            if (fc.name === 'add_schedule_task') {
                const newTask: ScheduleTask = {
                    id: crypto.randomUUID(),
                    date: args.date,
                    channelName: args.channelName,
                    action: args.action,
                    themes: args.themes || [],
                    status: 'pending'
                };
                const current = JSON.parse(localStorage.getItem('nexora_schedule_tasks_v1') || '[]');
                localStorage.setItem('nexora_schedule_tasks_v1', JSON.stringify([newTask, ...current]));
                window.dispatchEvent(new Event('storage'));
                setMessages(prev => [...prev, { role: 'assistant', content: `Tarefa agendada para ${newTask.date}: ${newTask.action}`, engine: 'Jabuti Master' }]);
                await speak("Cronograma atualizado, Diretor.");
            }

            if (fc.name === 'generate_art_action') {
                setMessages(prev => [...prev, { role: 'assistant', content: `Iniciando renderização de: ${args.prompt}`, engine: 'Jabuti Master' }]);
                const art = await generateConceptArt(args.prompt, args.style || 'Realistic 2.0', undefined, args.aspectRatio || '16:9');
                if (art) {
                    setMessages(prev => [...prev, { role: 'assistant', content: "Arte finalizada. Veja o preview abaixo.", artPreview: art, engine: 'Jabuti Master' }]);
                    await speak("A arte está pronta. O que achou dessa composição?");
                }
            }

            if (fc.name === 'scout_location_action') {
                const locs = await scoutLocations(args.query);
                setMessages(prev => [...prev, { role: 'assistant', content: `Encontrei algumas locações interessantes para "${args.query}":\n${locs.text}`, engine: 'Jabuti Master' }]);
            }

            if (fc.name === 'create_project') {
                // Reaproveitando a lógica existente para criar projetos
                const scriptLines = await generateStructuredScript(args.description);
                const newProject: Story = {
                  id: `proj-${crypto.randomUUID()}`,
                  title: args.title,
                  description: args.description,
                  status: 'production',
                  scenes: scriptLines.map((l, i) => ({ id: crypto.randomUUID(), title: `Cena ${i+1}`, description: l.content, order: i, scriptLines: [l] })),
                  characters: [],
                  visualStyleId: 'realistic-2.0'
                };
                const current = JSON.parse(localStorage.getItem('nexora_custom_projects_v1') || '[]');
                localStorage.setItem('nexora_custom_projects_v1', JSON.stringify([newProject, ...current]));
                window.dispatchEvent(new Event('nexora_projects_updated'));
                setMessages(prev => [...prev, { role: 'assistant', content: `Projeto "${newProject.title}" orquestrado e pronto no estúdio.`, engine: 'Jabuti Master' }]);
                navigate(`/roteiro/${newProject.id}`);
            }
          }
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: result.text, engine: result.engine, sources: result.sources }]);
          await speak(result.text);
        }
    } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Erro no protocolo de execução.", engine: "System" }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10"><Jabuti state={isTyping ? 'thinking' : 'idle'} /></div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Jabuti Master</h3>
            <p className="text-[8px] font-bold text-blue-500 uppercase">{engineType === 'local' ? 'Cérebro Local' : 'Neural Cloud'}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><Icons.Trash /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
              {m.content}
              {m.artPreview && (
                  <img src={m.artPreview} className="mt-4 w-full rounded-2xl border border-white/10 shadow-xl" />
              )}
            </div>
            {m.sources && m.sources.length > 0 && (
                <div className="flex gap-2 mt-2">
                    {m.sources.map((s: any, idx: number) => (
                        <a key={idx} href={s.uri} target="_blank" className="text-[8px] text-blue-500 hover:underline"> Fonte {idx+1}</a>
                    ))}
                </div>
            )}
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-slate-600 font-black uppercase animate-pulse ml-2">Sincronizando Sistemas...</div>}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
        <form onSubmit={e => { e.preventDefault(); handleSendMessage(input); }} className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Jabuti, agende um vídeo para amanhã..." className="flex-1 bg-transparent border-none text-xs text-white focus:ring-0 outline-none" />
          <button type="submit" disabled={isTyping || !input.trim()} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white disabled:opacity-50">
            <Icons.Plus />
          </button>
        </form>
      </div>
    </div>
  );
}
