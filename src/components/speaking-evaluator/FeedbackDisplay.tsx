import React from "react";
import { CheckCircle2, Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Feedback } from "./types";

interface FeedbackDisplayProps {
  feedback: Feedback;
  transcript: string | null;
}

export default function FeedbackDisplay({ feedback, transcript }: FeedbackDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-slate-50 rounded-3xl p-6 border border-slate-100"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <Quote className="w-4 h-4" /> You said
          </div>
          <p className="text-lg text-slate-800 font-medium leading-relaxed">"{transcript}"</p>
        </div>
        {feedback && (
          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <span className="block text-4xl font-bold text-[#00246a]">{feedback.score}</span>
              <span className="text-xs text-slate-400 uppercase font-bold">Score</span>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
              feedback.score >= 80 ? "bg-green-500 text-white" : feedback.score >= 60 ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
            }`}>
               <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
        )}
      </div>
      {feedback?.suggestions && (
        <div className="pt-4 border-t border-slate-200">
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              AI Feedback
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {feedback.suggestions}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
