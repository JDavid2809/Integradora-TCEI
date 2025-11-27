import React from "react";
import { motion } from "framer-motion";
import { Scenario } from "./types";
import { SCENARIOS } from "./data";
import { Mic, Sparkles } from "lucide-react";

interface ScenarioGridProps {
  onSelectScenario: (scenario: Scenario) => void;
  onSelectFreeSpeaking: () => void;
}

export default function ScenarioGrid({ onSelectScenario, onSelectFreeSpeaking }: ScenarioGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center mb-4 flex-shrink-0">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#00246a] text-xs font-medium mb-2"
        >
          <Sparkles className="w-3 h-3" />
          Interactive Speaking Practice
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-slate-900 mb-1"
        >
          Choose a Practice Mode
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-sm max-w-2xl mx-auto"
        >
          Select a topic or practice freely.
        </motion.p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 -mx-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-8">
          {/* Free Speaking Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={onSelectFreeSpeaking}
            className="bg-gradient-to-br from-[#00246a] to-[#0044cc] text-white p-4 rounded-xl shadow-md flex flex-col items-start text-left relative overflow-hidden group min-h-[160px]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-6 -mt-6 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="bg-white/20 p-2 rounded-lg mb-3 backdrop-blur-sm">
              <Mic className="w-5 h-5 text-white" />
            </div>
            
            <h3 className="text-base font-bold mb-1">Free Speaking</h3>
            <p className="text-blue-100 text-xs mb-3 leading-relaxed line-clamp-2">
              Practice without constraints.
            </p>
            
            <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-[#00246a] transition-colors">
              <Sparkles className="w-3 h-3" /> Open Mode
            </div>
          </motion.button>

          {/* Scenarios */}
          {SCENARIOS.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectScenario(scenario)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all text-left flex flex-col group min-h-[160px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full -mr-6 -mt-6 transition-colors group-hover:bg-blue-50" />
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{scenario.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  scenario.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                  scenario.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {scenario.level}
                </span>
              </div>
              
              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#00246a] transition-colors">{scenario.title}</h3>
              <p className="text-slate-500 text-xs mb-3 leading-relaxed line-clamp-2">
                {scenario.prompts.length} phrases available.
              </p>
              
              <div className="mt-auto w-full bg-slate-50 py-1.5 px-3 rounded-lg text-center text-[10px] font-bold text-slate-600 group-hover:bg-[#00246a] group-hover:text-white transition-all duration-300">
                Start
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
