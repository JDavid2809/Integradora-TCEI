"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type Msg = {
  id: string;
  sender: "AI" | "You";
  text: string;
};

let messageCounter = 0;
const uid = () => `msg-${++messageCounter}-${Date.now()}`;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    // Evitar múltiples peticiones mientras está escribiendo
    if (typing) return;
    
    if (text.trim()) {
      setMessages((prev) => [...prev, { id: uid(), sender: "You", text }]);
      setInput("");
    }

    setTyping(true);

    let data;
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      data = await res.json();
    } catch {
      data = { reply: "Lo siento, no entendí. Aquí tienes algunas opciones:", options: [] };
    }

    const aiId = uid();
    setMessages((prev) => [...prev, { id: aiId, sender: "AI", text: "" }]);

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiId ? { ...msg, text: data.reply.slice(0, i) } : msg))
      );
      if (i >= data.reply.length) {
        clearInterval(interval);
        setTyping(false);
        if (data.options?.length) setOptions(data.options);
      }
    }, 15);
  }, [typing]); // Solo depende de typing

  // Efecto para mensaje inicial - solo una vez
  useEffect(() => {
    if (open && !isInitialized) {
      setIsInitialized(true);
      sendMessage(""); // mensaje inicial
    }
  }, [open, isInitialized, sendMessage]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const resetChat = () => {
    setMessages([]);
    setOptions([]);
    setIsInitialized(false);
    setTyping(false);
   
  };

  return (
    <>
      <style jsx>{`
        @keyframes borderPulse {
          0%, 100% {
            border-color: #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            border-color: #ef4444;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
          }
        }
        .animate-border-pulse {
          animation: borderPulse 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 flex items-center justify-center w-20 h-20 rounded-full shadow-xl bg-white hover:scale-110 transition z-[99999] border-4 animate-border-pulse"
      >
        <Image 
          src="/ChatBot.png" 
          alt="ChatBot" 
          width={48} 
          height={48}
          className="object-contain"
        />
      </button>

      {/* Chat Box */}
      <div
        className={`fixed bottom-4 right-4 w-[90vw] max-w-[440px] h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-500 z-[99999]
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-lg text-gray-700">Chatbot AI</h2>
            <p className="text-sm text-gray-700">Tu asistente inteligente</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetChat}
              className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition"
            >
              Reiniciar
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "AI" && (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border-2 border-blue-400">
                  <Image 
                    src="/ChatBot.png" 
                    alt="ChatBot" 
                    width={30} 
                    height={30}
                    className="object-contain"
                  />
                </div>
              )}
              <div
                className={`px-5 py-3 rounded-2xl max-w-[70%] shadow-lg relative ${
                  msg.sender === "You"
                    ? "bg-red-500 text-white"
                    : "bg-gradient-to-tr from-blue-100 to-blue-50 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "You" && (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-black font-bold">
                  Tú
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border-2 border-blue-400 animate-pulse">
                <Image 
                  src="/ChatBot.png" 
                  alt="ChatBot" 
                  width={30} 
                  height={30}
                  className="object-contain"
                />
              </div>
              <p className="bg-blue-50 px-5 py-3 rounded-2xl shadow-lg max-w-[70%] animate-pulse">...</p>
            </div>
          )}
        </div>

        {/* Botón mostrar/ocultar opciones */}
        <div className="p-2 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-700">Opciones rápidas</span>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-xs text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded hover:bg-blue-100"
          >
            {showOptions ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {/* Opciones persistentes */}
        {showOptions && options.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex flex-wrap gap-2 bg-gray-50 shadow-inner overflow-x-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => !typing && sendMessage(opt)}
                disabled={typing}
                className="bg-white px-4 py-2 rounded-2xl shadow hover:bg-blue-100 hover:scale-105 transition transform text-sm flex items-center gap-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
              >
                💡 {opt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !typing) {
              sendMessage(input);
            }
          }}
          className="flex p-4 border-t border-gray-200 gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={typing}
            className="flex-1 rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002469] disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={typing || !input.trim()}
            className="bg-[#002469] text-white px-5 py-2 rounded-2xl hover:bg-[#001a4d] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {typing ? "..." : "Enviar"}
          </button>
        </form>

        {/* Footer */}
        <div className="p-2 text-xs text-gray-700 text-center">English App • Soporte: contacto@xdxdxd.com</div>
      </div>
    </>
  );
}
