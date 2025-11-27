import React from "react";
import { X } from "lucide-react";
import { Scenario } from "./types";

interface PhraseSelectorProps {
  scenario: Scenario;
  onSelectPhrase: (index: number) => void;
  onClearScenario: () => void;
}

export default function PhraseSelector({ scenario, onSelectPhrase, onClearScenario }: PhraseSelectorProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {scenario.icon} {scenario.title}
          </h2>
          <p className="text-slate-500 text-sm">Select a phrase to practice</p>
        </div>
        <button 
          onClick={onClearScenario}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-4">
        {scenario.prompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPhrase(idx)}
            className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group bg-white shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 text-[#00246a] flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-[#00246a] group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <span className="text-lg text-slate-700 font-medium group-hover:text-[#00246a]">
                "{prompt}"
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
