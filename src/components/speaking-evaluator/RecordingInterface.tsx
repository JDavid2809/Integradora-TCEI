import React from "react";
import { Mic, Square, Volume2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface RecordingInterfaceProps {
  isRecording: boolean;
  toggleRecording: () => void;
  transcript: string;
  isSupported: boolean;
  targetPhrase: string;
  onBack: () => void;
}

export default function RecordingInterface({ 
  isRecording, 
  toggleRecording, 
  transcript, 
  isSupported, 
  targetPhrase,
  onBack 
}: RecordingInterfaceProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
      <div className="mb-8">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#00246a] mb-4 transition-colors group"
         >
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           Back to phrases
         </button>

         <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 text-center relative shadow-sm"
        >
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4" /> Target Phrase
          </span>
          <h2 className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight">
            "{targetPhrase}"
          </h2>
        </motion.div>
      </div>

      {/* Interaction Area */}
      <div className="flex flex-col items-center justify-center gap-8 mb-8 flex-1">
        
        {/* Real-time Transcript */}
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
