"use client";

import React, { useState } from "react";
import { Search, Volume2, Loader2, PlayCircle, PauseCircle, Globe, BookOpen, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Phonetic {
    text?: string;
    audio?: string;
}

interface Definition {
    definition: string;
    example?: string;
    synonyms: string[];
    antonyms: string[];
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
    synonyms: string[];
    antonyms: string[];
}

interface DictionaryEntry {
    word: string;
    phonetic?: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    origin?: string;
    sourceUrls?: string[];
}

export default function DictionaryContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [result, setResult] = useState<DictionaryEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`);
            if (!response.ok) {
                throw new Error("Word not found");
            }
            const data = await response.json();
            setResult(data[0]);
        } catch (err) {
            setError("No encontramos esa palabra. Intenta con otra.");
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (audioUrl: string) => {
        if (!audioUrl) return;
        const fullUrl = audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl;
        
        const audio = new Audio(fullUrl);
        setAudioPlaying(audioUrl);
        audio.play().catch(e => console.error("Error playing audio:", e));
        audio.onended = () => setAudioPlaying(null);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6 max-w-5xl mx-auto w-full p-4">
            {/* Header & Search - Compact & Consistent */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 self-start md:self-center">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Diccionario</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Consulta definiciones y pronunciación</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="w-full md:max-w-md relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar palabra..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-2 p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center p-8"
                        >
                            <div className="p-3 bg-red-50 rounded-full mb-3">
                                <Search className="w-6 h-6 text-red-500" />
                            </div>
                            <p className="text-slate-600 font-medium">{error}</p>
                        </motion.div>
                    )}

                    {!result && !loading && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-400"
                        >
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600 mb-1">Diccionario de Inglés</h3>
                            <p className="text-sm max-w-xs mx-auto">
                                Escribe una palabra en el buscador para ver su definición, pronunciación y ejemplos.
                            </p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Word Header */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 capitalize mb-1">
                                            {result.word}
                                        </h2>
                                        <div className="flex items-center gap-3 text-indigo-600">
                                            <span className="font-mono text-lg">{result.phonetic}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        {result.phonetics.map((phonetic, index) => (
                                            phonetic.audio && (
                                                <button
                                                    key={index}
                                                    onClick={() => playAudio(phonetic.audio!)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors text-sm font-medium"
                                                >
                                                    {audioPlaying === phonetic.audio ? (
                                                        <PauseCircle className="w-4 h-4" />
                                                    ) : (
                                                        <PlayCircle className="w-4 h-4" />
                                                    )}
                                                    <span>{phonetic.text || "Escuchar"}</span>
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                                {result.origin && (
                                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-3">
                                        <span className="font-semibold text-slate-700">Origen:</span> {result.origin}
                                    </p>
                                )}
                            </div>

                            {/* Meanings */}
                            <div className="space-y-4">
                                {result.meanings.map((meaning, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                                {meaning.partOfSpeech}
                                            </span>
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/40"></div>
                                        </div>
                                        
                                        <ul className="space-y-6">
                                            {meaning.definitions.map((def, idx) => (
                                                <li key={idx} className="flex gap-4">
                                                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="space-y-2 flex-1">
                                                        <p className="text-slate-800 dark:text-slate-100 leading-relaxed">
                                                            {def.definition}
                                                        </p>
                                                        {def.example && (
                                                            <p className="text-slate-500 dark:text-slate-400 text-sm italic pl-3 border-l-2 border-indigo-200">
                                                                "{def.example}"
                                                            </p>
                                                        )}
                                                        
                                                        {(def.synonyms.length > 0 || def.antonyms.length > 0) && (
                                                            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                                                                {def.synonyms.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 text-xs items-center">
                                                                        <span className="text-emerald-600 font-medium">Sinónimos:</span>
                                                                        {def.synonyms.slice(0, 3).map((syn, i) => (
                                                                            <span key={i} className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                                                {syn}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {def.antonyms.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 text-xs items-center">
                                                                        <span className="text-rose-600 font-medium">Antónimos:</span>
                                                                        {def.antonyms.slice(0, 3).map((ant, i) => (
                                                                            <span key={i} className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                                                {ant}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Source */}
                            {result.sourceUrls && result.sourceUrls.length > 0 && (
                                <div className="text-center pb-4">
                                    <a 
                                        href={result.sourceUrls[0]} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Globe className="w-3 h-3" />
                                        <span>Fuente original</span>
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
