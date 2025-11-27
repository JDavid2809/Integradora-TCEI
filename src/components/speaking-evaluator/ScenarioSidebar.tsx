import React from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Scenario } from "./types";
import { SCENARIOS } from "./data";

interface ScenarioSidebarProps {
  selectedScenario: Scenario | null;
  onSelectScenario: (scenario: Scenario) => void;
}

export default function ScenarioSidebar({ selectedScenario, onSelectScenario }: ScenarioSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 overflow-hidden relative h-full max-h-[800px] overflow-y-auto custom-scrollbar"
      >
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
         
         <div className="relative z-10">
           <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
             <BookOpen className="w-5 h-5 text-[#00246a]" />
             Practice Topics
           </h3>
           <p className="text-sm text-slate-500 mb-6">
             Choose a scenario to see available phrases.
           </p>

           <div className="space-y-3">
             {SCENARIOS.map((scenario) => (
               <button
                 key={scenario.id}
                 onClick={() => onSelectScenario(scenario)}
                 className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between group border ${
                   selectedScenario?.id === scenario.id
                     ? "bg-[#00246a] text-white border-[#00246a] shadow-lg shadow-blue-200"
                     : "bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50"
                 }`}
               >
                 <div className="flex items-center gap-3">
                   <span className="text-2xl group-hover:scale-110 transition-transform">{scenario.icon}</span>
                   <div>
                     <span className="font-semibold block text-sm md:text-base">{scenario.title}</span>
                     <span className={`text-[10px] uppercase tracking-wider font-medium ${selectedScenario?.id === scenario.id ? "text-blue-200" : "text-slate-400"}`}>
                       {scenario.level}
                     </span>
                   </div>
                 </div>
                 {selectedScenario?.id === scenario.id && (
                   <ChevronRight className="w-5 h-5 animate-pulse" />
                 )}
               </button>
             ))}
           </div>
         </div>
      </motion.div>
    </div>
  );
}
