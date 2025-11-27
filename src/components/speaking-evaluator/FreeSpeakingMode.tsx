import React from "react";
import { Mic, Square, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface FreeSpeakingModeProps {
  isRecording: boolean;
  toggleRecording: () => void;
  transcript: string;
  isSupported: boolean;
  onBack: () => void;
}

export default function FreeSpeakingMode({ 
  isRecording, 
  toggleRecording, 
  transcript, 
  isSupported,
  onBack
}: FreeSpeakingModeProps) {
  return (
    <div className="py-8 flex flex-col h-full relative">
      <button 
        onClick={onBack}
        className="absolute top-0 left-0 flex items-center gap-2 text-sm text-slate-500 hover:text-[#00246a] transition-colors group z-20"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to modes
      </button>

      <div className="text-center mb-8 mt-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-2xl mb-6 text-[#00246a]"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Free Speaking Mode</h2>
        <p className="text-slate-500 text-lg">Speak freely about any topic.</p>
      </div>

      {/* Interaction Area (Free Speaking) */}
      <div className="flex flex-col items-center justify-center gap-8 mb-8 flex-1">
        {isRecording && (
          <div className="w-full max-w-2xl text-center min-h-[60px] animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xl text-slate-700 font-medium leading-relaxed">
              {transcript || <span className="text-slate-300 italic">Listening...</span>}
            </p>
          </div>
        )}

        <div className="relative group">
          {isRecording && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-400 rounded-full"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="absolute inset-0 bg-red-400 rounded-full"
                />
            </>
          )}
          
          <button
            onClick={toggleRecording}
            disabled={!isSupported}
            className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
              isRecording 
                ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-300 scale-110" 
                : "bg-gradient-to-br from-[#00246a] to-[#0044cc] text-white shadow-blue-200 hover:scale-105 hover:shadow-blue-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <Square className="w-10 h-10 md:w-12 md:h-12 fill-current" />
            ) : (
              <Mic className="w-10 h-10 md:w-12 md:h-12" />
            )}
          </button>
        </div>

        <div className="text-center space-y-2">
          <p className={`text-lg font-medium transition-colors duration-300 ${isRecording ? "text-red-500" : "text-slate-600"}`}>
            {isRecording ? "Recording... Tap to Stop" : "Tap microphone to start"}
          </p>
        </div>
      </div>
    </div>
  );
}
