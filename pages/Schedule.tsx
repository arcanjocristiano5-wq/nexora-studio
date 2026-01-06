
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { ScheduleTask, Channel } from '../types';
import { generateProductionSchedule } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

export default function Schedule() {
    const [tasks, setTasks] = useState<ScheduleTask[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [startOfWeek, setStartOfWeek] = useState(getStartOfWeek(new Date()));
    const [input, setInput] = useState('');
    const [themes, setThemes] = useState<string[]>([]);
    const [themeInput, setThemeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleRemoveTheme = (themeToRemove: string) => {
        setThemes(prev => prev.filter(theme => theme !== themeToRemove));
    };

    const handleGenerateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const fullPrompt = themes.length > 0 
                ? `${input} Os temas para estas tarefas são: ${themes.join(', ')}.`
                : input;

            const newTasks = await generateProductionSchedule(fullPrompt, channels);
            setTasks(prev => [...prev, ...newTasks].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setInput('');
            setThemes([]);
        } catch (error) {
            console.error(error);
            alert("O Jabuti não conseguiu gerar o cronograma. Tente ser mais específico.");
        } finally {
            setIsLoading(false);
        }
    };

    const changeWeek = (direction: number) => {
        setStartOfWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };
    
    const updateTaskStatus = (taskId: string, newStatus: ScheduleTask['status']) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        weekDays.push(day);
    }

    const formatDate = (date: Date, format: 'short' | 'long' | 'iso') => {
        if (format === 'iso') return date.toISOString().split('T')[0];
        const options: Intl.DateTimeFormatOptions = format === 'short'
            ? { weekday: 'short' }
            : { day: '2-digit', month: '2-digit' };
        return new Intl.DateTimeFormat('pt-BR', options).format(date).toUpperCase().replace('.', '');
    };

    const getStatusColor = (status: ScheduleTask['status']) => {
        if (status === 'complete') return 'text-emerald-400';
        if (status === 'in_progress') return 'text-amber-400';
        return 'text-slate-500';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Cronograma de Produção</h2>
                    <p className="text-slate-400 font-medium">Converse com o Jabuti para planejar e automatizar suas postagens.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                    <button onClick={() => changeWeek(-1)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-lg">Anterior</button>
                    <button onClick={() => setStartOfWeek(getStartOfWeek(new Date()))} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg">Hoje</button>
                    <button onClick={() => changeWeek(1)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-lg">Próxima</button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 gap-4 min-h-0">
                {weekDays.map(day => {
                    const dayISO = formatDate(day, 'iso');
                    const dayTasks = tasks.filter(t => t.date === dayISO);
                    const isToday = formatDate(new Date(), 'iso') === dayISO;

                    return (
                        <div key={dayISO} className={`bg-slate-900/50 border ${isToday ? 'border-blue-500/30' : 'border-slate-800'} rounded-2xl flex flex-col`}>
                            <div className={`p-3 border-b ${isToday ? 'border-blue-500/30 text-blue-400' : 'border-slate-800'} text-center`}>
                                <p className="text-[10px] font-black uppercase tracking-widest">{formatDate(day, 'short')}</p>
                                <p className="text-sm font-bold">{formatDate(day, 'long')}</p>
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                                {dayTasks.map(task => (
                                    <div key={task.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-left animate-in zoom-in-95">
                                        <p className="text-[10px] font-bold text-blue-400">{task.channelName}</p>
                                        <p className="text-xs text-slate-300 my-1">{task.action}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {task.themes.map(theme => <span key={theme} className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{theme}</span>)}
                                        </div>
                                        <div className="mt-2 text-right">
                                            <select 
                                              value={task.status} 
                                              onChange={(e) => updateTaskStatus(task.id, e.target.value as ScheduleTask['status'])}
                                              className={`bg-transparent text-[9px] font-bold border-none outline-none focus:ring-0 ${getStatusColor(task.status)} appearance-none text-right pr-2`}
                                              style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                                            >
                                                <option value="pending" style={{backgroundColor: '#020617'}}>Pendente</option>
                                                <option value="in_progress" style={{backgroundColor: '#020617'}}>Em Progresso</option>
                                                <option value="complete" style={{backgroundColor: '#020617'}}>Concluído</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="bg-slate-900 p-3 rounded-3xl border border-slate-800 shadow-2xl space-y-3">
                    <div className="px-4 pb-3 flex flex-wrap gap-2 items-center border-b border-slate-800 min-h-[36px]">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temas:</span>
                        {themes.map(theme => (
                            <div key={theme} className="flex items-center gap-1.5 bg-blue-600/20 px-2 py-1 rounded text-blue-300 text-xs font-bold animate-in zoom-in-95">
                                {theme}
                                <button onClick={() => handleRemoveTheme(theme)} className="text-blue-300/50 hover:text-white">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <form onSubmit={handleAddTheme} className="flex-1">
                            <input
                                value={themeInput}
                                onChange={e => setThemeInput(e.target.value)}
                                placeholder="Adicionar tema e pressionar Enter..."
                                className="bg-transparent border-none focus:ring-0 text-xs px-2 text-white placeholder:text-slate-600 w-full min-w-[200px]"
                            />
                        </form>
                    </div>
                    <form onSubmit={handleGenerateSchedule} className="flex gap-4">
                        <div className="w-12 h-12 flex-shrink-0">
                            <Jabuti state={isLoading ? 'thinking' : 'idle'} />
                        </div>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Diretor, o que vamos programar? Ex: 'na segunda-feira crie 10 vídeos para Contos e Mistérios'"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 text-white placeholder:text-slate-600"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            <Icons.Plus />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
