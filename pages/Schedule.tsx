
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { ScheduleTask, Channel } from '../types';
import { generateProductionSchedule } from '../services/geminiService';
import Jabuti from '../components/Brand/Jabuti';

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

    const handleGenerateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const finalPrompt = `Com os temas [${themes.join(', ')}], faça o seguinte: ${input}`;
            const newTasks = await generateProductionSchedule(finalPrompt, channels);
            setTasks(prev => [...prev, ...newTasks].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setInput('');
            setThemes([]);
        } catch (error) {
            alert("Erro ao orquestrar cronograma.");
        } finally {
            setIsLoading(false);
        }
    };

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        weekDays.push(day);
    }

    const formatDate = (date: Date, format: 'iso' | 'display') => {
        if (format === 'iso') return date.toISOString().split('T')[0];
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-700 pb-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Cronograma Inteligente</h2>
                    <p className="text-slate-400 font-medium">O Jabuti agenda postagens diárias automaticamente com base em suas ordens.</p>
                </div>
                <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                    <button onClick={() => setStartOfWeek(new Date(startOfWeek.setDate(startOfWeek.getDate() - 7)))} className="px-4 py-2 text-xs font-bold text-slate-400">Anterior</button>
                    <button onClick={() => setStartOfWeek(getStartOfWeek(new Date()))} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg">Hoje</button>
                    <button onClick={() => setStartOfWeek(new Date(startOfWeek.setDate(startOfWeek.getDate() + 7)))} className="px-4 py-2 text-xs font-bold text-slate-400">Próxima</button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-7 gap-4 min-h-0">
                {weekDays.map(day => {
                    const dayISO = formatDate(day, 'iso');
                    const dayTasks = tasks.filter(t => t.date === dayISO);
                    return (
                        <div key={dayISO} className="bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
                            <div className="p-3 bg-slate-950/50 border-b border-slate-800 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day)}</p>
                                <p className="text-sm font-bold text-white">{formatDate(day, 'display')}</p>
                            </div>
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                {dayTasks.map(task => (
                                    <div key={task.id} className="p-3 bg-slate-950 rounded-2xl border border-blue-500/20 shadow-lg">
                                        <p className="text-[10px] font-black text-blue-500 uppercase mb-1">{task.channelName}</p>
                                        <p className="text-xs text-white font-medium">{task.action}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {task.themes.map(t => <span key={t} className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">{t}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-slate-900 p-4 rounded-[32px] border border-slate-800 shadow-2xl space-y-4">
                <div className="flex flex-wrap gap-2 items-center px-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Temas Ativos:</span>
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
                    <div className="w-12 h-12 flex-shrink-0"><Jabuti state={isLoading ? 'thinking' : 'idle'} /></div>
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Diretor, o que vamos agendar? Ex: 'Crie 10 vídeos para o canal Central de Mistérios'" className="flex-1 bg-transparent border-none text-lg text-white placeholder:text-slate-700 outline-none focus:ring-0" />
                    <button type="submit" disabled={isLoading} className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white shadow-xl transition-all active:scale-95 disabled:opacity-50"><Icons.Plus /></button>
                </form>
            </div>
        </div>
    );
}
