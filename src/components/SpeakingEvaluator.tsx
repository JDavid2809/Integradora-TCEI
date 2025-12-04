import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Scenario, Feedback } from "./speaking-evaluator/types";
import ScenarioGrid from "./speaking-evaluator/ScenarioGrid";
import PhraseSelector from "./speaking-evaluator/PhraseSelector";
import RecordingInterface from "./speaking-evaluator/RecordingInterface";
import FeedbackDisplay from "./speaking-evaluator/FeedbackDisplay";
import FreeSpeakingMode from "./speaking-evaluator/FreeSpeakingMode";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SpeakingEvaluator() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);
  const [isFreeSpeaking, setIsFreeSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const currentFullTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
          
        setTranscript(currentFullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Microphone access denied.");
        } else if (event.error === 'no-speech') {
          return; 
        } else {
          setErrorMsg("Error: " + event.error);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setErrorMsg("Your browser does not support Speech Recognition (Try Chrome or Edge).");
    }
  }, []);

  const generateFeedback = async (text: string) => {
    if (!text || text.trim().length === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text,
          context: selectedScenario && selectedPromptIndex !== null 
            ? `User is practicing: ${selectedScenario.title}. Target phrase: ${selectedScenario.prompts[selectedPromptIndex]}` 
            : undefined
        }),
      });

      if (!response.ok) throw new Error("Error fetching feedback");

      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      setFeedback({
        score: 70,
        suggestions: "Could not connect to AI. Good effort on speaking!",
        issues: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript) {
        generateFeedback(transcript);
      }
    } else {
      setErrorMsg(null);
      setTranscript("");
      setFeedback(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSelectedPromptIndex(null);
    setIsFreeSpeaking(false);
    setTranscript("");
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleFreeSpeakingSelect = () => {
    setIsFreeSpeaking(true);
    setSelectedScenario(null);
    setSelectedPromptIndex(null);
    setTranscript("");
    setFeedback(null);
    setErrorMsg(null);
  };

  const handleBackToGrid = () => {
    setSelectedScenario(null);
    setIsFreeSpeaking(false);
    setSelectedPromptIndex(null);
    setTranscript("");
    setFeedback(null);
    setErrorMsg(null);
  };

  const handlePromptSelect = (index: number) => {
    setSelectedPromptIndex(index);
    setTranscript("");
    setFeedback(null);
    setErrorMsg(null);
  };

  // Determine which view to show
  const showGrid = !selectedScenario && !isFreeSpeaking;
  const showScenario = selectedScenario && selectedPromptIndex === null;
  const showRecording = selectedScenario && selectedPromptIndex !== null;
  const showFreeSpeaking = isFreeSpeaking;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8">
      {showGrid && (
        <ScenarioGrid 
          onSelectScenario={handleScenarioSelect}
          onSelectFreeSpeaking={handleFreeSpeakingSelect}
        />
      )}

      {!showGrid && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 relative min-h-[600px] flex flex-col"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#00246a] to-[#0044cc] dark:from-blue-900 dark:to-blue-800 opacity-10" />
          
          <div className="relative z-10 p-6 md:p-12 flex-1 flex flex-col">
            
            {showScenario && (
              <PhraseSelector 
                scenario={selectedScenario!} 
                onSelectPhrase={handlePromptSelect} 
                onClearScenario={handleBackToGrid} 
              />
            )}

            {showRecording && (
              <RecordingInterface 
                isRecording={isRecording}
                toggleRecording={toggleRecording}
                transcript={transcript}
                isSupported={isSupported}
                targetPhrase={selectedScenario!.prompts[selectedPromptIndex!]}
                onBack={() => setSelectedPromptIndex(null)}
              />
            )}

            {showFreeSpeaking && (
              <FreeSpeakingMode 
                isRecording={isRecording}
                toggleRecording={toggleRecording}
                transcript={transcript}
                isSupported={isSupported}
                onBack={handleBackToGrid}
              />
            )}

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/50 max-w-md mx-auto mb-8"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-8"
                >
                  <Loader2 className="w-10 h-10 text-[#00246a] dark:text-blue-400 animate-spin" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Analyzing your pronunciation...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isRecording && !isProcessing && (transcript || feedback) && (
                <FeedbackDisplay feedback={feedback!} transcript={transcript} />
              )}
            </AnimatePresence>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 p-4 text-center">
             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
               Powered by Web Speech API & DeepSeek AI
             </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
