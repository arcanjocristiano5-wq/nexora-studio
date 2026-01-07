
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { ScheduleTask, Channel } from '../types';
import { generateProductionSchedule, jabutiLearnFromExecution } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
};

// Formatação local estável para evitar problemas de fuso horário ISO
const toLocalISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Schedule() {
    const [tasks, setTasks] = useState<ScheduleTask[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date()));
    const [input, setInput] = useState('');
    const [themes, setThemes] = useState<string[]>([]);
    const [themeInput, setThemeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [executingDay, setExecutingDay] = useState<string | null>(null);

    useEffect(() => {
        const savedTasks = localStorage.getItem('nexora_schedule_tasks_v1');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        const savedChannels = localStorage.getItem('nexora_channels_v3');
        if (savedChannels) setChannels(JSON.parse(savedChannels));
    }, []);

    useEffect(() => {
        localStorage.setItem('nexora_schedule_tasks_v1', JSON.stringify(tasks));
    }, [tasks]);

    const handleAddTheme = (e: React.FormEvent) => {
        e.preventDefault();
        if (themeInput.trim() && !themes.includes(themeInput.trim())) {
            setThemes(prev => [...prev, themeInput.trim()]);
        }
        setThemeInput('');
    };

    const handleGenerateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        setIsLoading(true);

        // Criar contexto da semana para o Jabuti
        const weekDates = weekDays.map(d => `${new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(d)}: ${toLocalISO(d)}`).join(', ');

        try {
            const finalPrompt = `Temas: [${themes.join(', ')}]. Ordem: ${input}`;
            const newTasks = await generateProductionSchedule(finalPrompt, channels, weekDates);
            
            setTasks(prev => {
                // Filtra para evitar duplicatas exatas se a IA repetir o que já existe
                const filteredNew = newTasks.filter(nt => !prev.some(pt => pt.date === nt.date && pt.action === nt.action));
                const combined = [...prev, ...filteredNew];
                return combined.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            });
            
            setInput('');
            setThemes([]);
        } catch (error) {
            alert("Erro ao orquestrar cronograma. Verifique sua conexão.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteDay = async (dayISO: string) => {
        const dayTasks = tasks.filter(t => t.date === dayISO && t.status !== 'complete');
        if (dayTasks.length === 0) return alert("Nenhuma tarefa pendente para este dia.");

        setExecutingDay(dayISO);
        try {
            await jabutiLearnFromExecution(dayTasks);
            setTasks(prev => prev.map(t => 
                t.date === dayISO ? { ...t, status: 'complete' } : t
            ));
            alert(`O Jabuti processou as tarefas de ${dayISO} e otimizou sua base de conhecimento.`);
        } catch (e) {
            alert("Erro na execução neural.");
        } finally {
            setExecutingDay(null);
        }
    };

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        weekDays.push(day);
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-700 pb-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Cronograma Inteligente</h2>
                    <p className="text-slate-400 font-medium">O Jabuti agenda postagens diárias e aprende com cada execução.</p>
                </div>
                <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                    <button onClick={() => setStartOfWeek(new Date(startOfWeek.setDate(startOfWeek.getDate() - 7)))} className="px-4 py-2 text-xs font-bold text-slate-400">Anterior</button>
                    <button onClick={() => setStartOfWeek(getStartOfWeek(new Date()))} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg">Hoje</button>
                    <button onClick={() => setStartOfWeek(new Date(startOfWeek.setDate(startOfWeek.getDate() + 7)))} className="px-4 py-2 text-xs font-bold text-slate-400">Próxima</button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 gap-4 min-h-0">
                {weekDays.map(day => {
                    const dayISO = toLocalISO(day);
                    const dayTasks = tasks.filter(t => t.date === dayISO);
                    const isToday = dayISO === toLocalISO(new Date());
                    const isExecuting = executingDay === dayISO;

                    return (
                        <div key={dayISO} className={`bg-slate-900/50 border ${isToday ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-slate-800'} rounded-3xl flex flex-col overflow-hidden group`}>
                            <div className={`p-3 ${isToday ? 'bg-blue-600/10' : 'bg-slate-950/50'} border-b border-slate-800 text-center relative`}>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day)}</p>
                                <p className="text-sm font-bold text-white">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(day)}</p>
                                
                                {dayTasks.length > 0 && dayTasks.some(t => t.status !== 'complete') && (
                                    <button 
                                        onClick={() => handleExecuteDay(dayISO)}
                                        disabled={isExecuting}
                                        className="absolute top-2 right-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                        title="Executar Produção"
                                    >
                                        {isExecuting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.Video />}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                {dayTasks.map(task => (
                                    <div key={task.id} className={`p-3 rounded-2xl border transition-all ${task.status === 'complete' ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-slate-950 border-blue-500/20 shadow-lg'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-[9px] font-black uppercase ${task.status === 'complete' ? 'text-emerald-500' : 'text-blue-500'} truncate mr-1`}>{task.channelName || 'CANAL'}</p>
                                            {task.status === 'complete' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                                        </div>
                                        <p className={`text-[11px] leading-tight font-medium ${task.status === 'complete' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                            {task.action}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {task.themes?.map(t => <span key={t} className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">{t}</span>)}
                                        </div>
                                    </div>
                                ))}
                                {dayTasks.length === 0 && (
                                    <div className="h-full flex items-center justify-center opacity-10 grayscale">
                                        <Icons.Calendar />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-slate-900 p-4 rounded-[32px] border border-slate-800 shadow-2xl space-y-4">
                <div className="flex flex-wrap gap-2 items-center px-2">
                    <div className="w-8 h-8 mr-2"><Jabuti state={isLoading ? 'thinking' : 'idle'} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Temas Foco:</span>
                    {themes.map(theme => (
                        <button key={theme} onClick={() => setThemes(themes.filter(t => t !== theme))} className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-400 text-[10px] font-bold uppercase flex items-center gap-2">
                            {theme} <span className="opacity-50">×</span>
                        </button>
                    ))}
                    <form onSubmit={handleAddTheme}>
                        <input value={themeInput} onChange={e => setThemeInput(e.target.value)} placeholder="+ Adicionar Tema..." className="bg-transparent border-none text-xs text-white focus:ring-0 placeholder:text-slate-700 w-32" />
                    </form>
                </div>

                <form onSubmit={handleGenerateSchedule} className="flex gap-4">
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder="Ex: Adicione uma história de terror na sexta e um post de curiosidade no sábado..." 
                        className="flex-1 bg-transparent border-none text-lg text-white placeholder:text-slate-700 outline-none focus:ring-0" 
                    />
                    <button type="submit" disabled={isLoading} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50">
                        {isLoading ? 'Orquestrando...' : 'Sincronizar Cronograma'}
                    </button>
                </form>
            </div>
        </div>
    );
}
