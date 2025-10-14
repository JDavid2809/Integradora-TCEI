"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

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
  
  // Estado para la animación de imágenes con crossfade
  const [currentFrame, setCurrentFrame] = useState(0);
  const [nextFrame, setNextFrame] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Array de las 4 imágenes
  const frames = [
    '/logos/01_logo.png',
    '/logos/02_logo.png', 
    // '/logos/03_logo.png',
    // '/logos/04_logo.png'
  ];

  // Precargar todas las imágenes para evitar flashazos
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = frames.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Error preloading images:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, [frames]);

  // Efecto para la animación con crossfade perfecto
  useEffect(() => {
    if (!isAnimating || !imagesLoaded) return;
    
    const animationInterval = setInterval(() => {
      setIsTransitioning(true);
      
      // Preparar el siguiente frame
      setNextFrame((current) => (current + 1) % frames.length);
      
      // Después de un momento, hacer el cambio
      setTimeout(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
        setIsTransitioning(false);
      }, 500); // Mitad de la duración de la transición
      
    }, 2000); // Cambio cada 2 segundos

    return () => clearInterval(animationInterval);
  }, [isAnimating, frames.length, imagesLoaded]);

  // Pausar animación cuando el chat está abierto
  useEffect(() => {
    setIsAnimating(!open);
  }, [open]);

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
      {/* Botón flotante con animación de frames personalizados */}
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setIsAnimating(true)}
        onMouseLeave={() => setIsAnimating(!open)}
        className="group fixed bottom-4 right-4 w-20 h-20 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-[99999] overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-300"
      >
        {/* Contenedor con crossfade perfecto (sin flashazos) */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
          {/* Mostrar solo cuando las imágenes estén cargadas */}
          {imagesLoaded ? (
            <>
              {/* Imagen base (siempre visible) */}
              <img
                src={frames[currentFrame]}
                alt={`Animation frame ${currentFrame + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
                loading="eager"
              />
              
              {/* Imagen de transición (solo durante crossfade) */}
              {isTransitioning && (
                <img
                  src={frames[nextFrame]}
                  alt={`Next frame ${nextFrame + 1}`}
                  className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000"
                  style={{ objectPosition: 'center' }}
                  loading="eager"
                />
              )}
            </>
          ) : (
            // Placeholder mientras cargan las imágenes
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Overlay muy sutil para unificar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/3 via-transparent to-white/3"></div>
        </div>
        
        {/* Badge de notificación animado */}
        {!open && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
        
        {/* Indicador de estado */}
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
        
        {/* Tooltip mejorado */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl border border-gray-700/50">
          {open ? '🔒 Close Assistant' : '💬 Open English Helper'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900/90"></div>
        </div>
        
        {/* Efecto de pulso en el borde */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 opacity-0 group-hover:opacity-100 animate-ping"></div>
      </button>


      {/* Chat Box */}
      <div
        className={`fixed bottom-4 right-4 w-[90vw] max-w-[440px] h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-500 z-[99999]
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-lg text-[#002469]">Chatbot AI</h2>
            <p className="text-sm text-gray-500">Tu asistente inteligente</p>
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
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold shadow-lg animate-pulse">
                  AI
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
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold shadow-lg animate-pulse">
                AI
              </div>
              <p className="bg-blue-50 px-5 py-3 rounded-2xl shadow-lg max-w-[70%] animate-pulse">...</p>
            </div>
          )}
        </div>

        {/* Botón mostrar/ocultar opciones */}
        <div className="p-2 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">Opciones rápidas</span>
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
                className="bg-white px-4 py-2 rounded-2xl shadow hover:bg-blue-100 hover:scale-105 transition transform text-sm flex items-center gap-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="p-2 text-xs text-gray-400 text-center">English App • Soporte: contacto@xdxdxd.com</div>
      </div>
    </>
  );
}
