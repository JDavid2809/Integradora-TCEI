import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, RefreshCw, AlertCircle, Loader2 } from "lucide-react";


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SpeakingEvaluator() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Set to English

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        generateFeedback(text);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Microphone access denied.");
        } else {
          setErrorMsg("Error recognizing speech: " + event.error);
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
    setIsProcessing(true);
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Error fetching feedback");

      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      // Fallback if API fails
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
    } else {
      setErrorMsg(null);
      setTranscript(null);
      setFeedback(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 font-sans text-slate-900">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Speaking Evaluation</h2>
        <p className="text-slate-500 text-sm">
          {isSupported ? "Free Real-time Transcription (Browser Native)" : "Browser not supported"}
        </p>
      </div>

      <div className="space-y-8">
        {/* Controls */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <button
              onClick={toggleRecording}
              disabled={!isSupported}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-200" 
                  : "bg-slate-900 text-white hover:bg-slate-800 hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 fill-current" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            {isRecording && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{isRecording ? "Listening..." : "Tap to speak"}</span>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 text-sm rounded-lg justify-center">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-3 py-8 text-slate-400 animate-in fade-in">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Analyzing with DeepSeek AI...</span>
          </div>
        )}

        {/* Results */}
        {!isProcessing && (transcript || feedback) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid gap-8">
              {/* Score */}
              {feedback && (
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-light tracking-tighter text-slate-900">
                    {feedback.score}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-400 mt-2">
                    Score
                  </span>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="space-y-2 text-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">You said:</h3>
                  <p className="text-xl font-medium text-slate-800 leading-relaxed">
                    "{transcript}"
                  </p>
                </div>
              )}

              {/* Feedback Details */}
              {feedback && feedback.suggestions && (
                <div className="space-y-2 text-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Feedback</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feedback.suggestions}
                  </p>
                </div>
              )}
            </div>

            {/* Reset */}
            <div className="flex justify-center pt-8">
              <button
                onClick={() => {
                  setTranscript(null);
                  setFeedback(null);
                  setErrorMsg(null);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 text-center space-y-4">
        <p className="text-[10px] text-slate-300 uppercase tracking-widest">
          Powered by Web Speech API
        </p>
        
        <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-lg text-xs text-slate-500 text-left border border-slate-100">
          <p className="font-semibold mb-1 text-slate-700">Tecnología utilizada:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Transcripción:</strong> Web Speech API (Nativo del navegador).
            </li>
            <li>
              <strong>Evaluación:</strong> DeepSeek AI (Análisis gramatical y de coherencia).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
