import React, { useState } from 'react';
import { scoutLocations } from '../services/geminiService';
import { LocationInspiration } from '../types';

export default function Locations() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ text: string; locations: LocationInspiration[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      let coords: { lat: number; lng: number } | undefined;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      } catch (e) {
        console.warn("Geolocalização negada ou indisponível, buscando globalmente.");
      }

      const data = await scoutLocations(query, coords?.lat, coords?.lng);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2">Explorador de Locações</h2>
          <p className="text-slate-400">Descubra inspirações arquitetônicas e naturais do mundo real para sua produção.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-1 shadow-2xl overflow-hidden">
        <form onSubmit={handleScout} className="flex gap-2 p-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ex: Becos cyberpunk em Tóquio ou edifícios brutalistas em Londres..."
            className="flex-1 bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl px-6 py-4 text-lg"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            Explorar Locais
          </button>
        </form>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Análise de IA</h3>
              <p className="text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">{results.text}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Locais Identificados</h3>
            {results.locations.map((loc, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all group">
                <h4 className="font-bold text-white mb-2">{loc.title}</h4>
                {loc.snippet && (
                  <p className="text-xs text-slate-400 italic mb-4 line-clamp-3">"{loc.snippet}"</p>
                )}
                <a
                  href={loc.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
                >
                  Ver no Google Maps
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
            {results.locations.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500 text-sm">Nenhum ponto específico encontrado. Tente uma busca diferente.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}