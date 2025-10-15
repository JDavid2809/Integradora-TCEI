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
  
  // Estado para la animación de imágenes simplificada
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Estados para controlar el comportamiento del botón
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es móvil para ocultarlo
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      const mobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Array solo con las imágenes 03 y 04 para animación fluida
  const frames = [
    '/logos/01_logo.png',
    '/logos/02_logo.png',
    '/logos/01_logo.png',
    '/logos/03_logo.png'
  ];

  // Precargar todas las imágenes para evitar flashazos
  useEffect(() => {
    const preloadImages = async () => {
      // Solo precargar si estamos en el cliente
      if (typeof window === 'undefined') {
        setImagesLoaded(true);
        return;
      }

      const imagePromises = frames.map((src) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.onload = () => resolve(img);
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
  }, []);

  // Efecto para animación continua tipo video - optimizada
  useEffect(() => {
    if (!isAnimating || !imagesLoaded) return;
    
    const animationInterval = setInterval(() => {
      // Cambio directo sin transiciones complejas
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 3000); // Cambio cada 3 segundos para que se aprecie bien cada imagen

    return () => clearInterval(animationInterval);
  }, [isAnimating, frames.length, imagesLoaded]);

  // Pausar animación cuando el chat está abierto
  useEffect(() => {
    setIsAnimating(!open);
  }, [open]);

  // Efecto para mostrar tooltip SOLO UNA VEZ
  useEffect(() => {
    if (open || hasShownTooltip) return;

    const showTooltipTimer = setTimeout(() => {
      setShowTooltip(true);
      setHasShownTooltip(true); // Marcar que ya se mostró
      
      // Auto-ocultar después de 6 segundos
      const hideTooltipTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);

      return () => clearTimeout(hideTooltipTimer);
    }, 5000); // Aparece después de 5 segundos, solo una vez

    return () => clearTimeout(showTooltipTimer);
  }, [open, hasShownTooltip]);

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
      {/* Estilos simplificados */}
      <style jsx>{`
        @keyframes float-soft {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes tooltip-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
        .float-soft {
          animation: float-soft 4s ease-in-out infinite;
        }
        .tooltip-bounce {
          animation: tooltip-bounce 1s ease-in-out;
        }
      `}</style>

      {/* Botón flotante - Solo en desktop */}
      {!isMobile && (
        <div 
          className={`fixed z-[99999] transition-opacity duration-300 ${
            isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            right: '20px',
            bottom: '20px',
            transform: 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
        >
        
        {/* Tooltip que aparece SOLO UNA VEZ */}
        {showTooltip && !open && !isHidden && (
          <div className="absolute bottom-full right-0 mb-3 tooltip-bounce">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-medium whitespace-nowrap relative pr-8 max-w-xs">
              ¿Tienes dudas? ¡Pregúntame! 💬<br />
              <span className="text-xs opacity-75">Arrastra para mover</span>
              
              {/* Botón para cerrar el tooltip */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 font-bold text-lg leading-none"
              >
                ×
              </button>
              
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-purple-600"></div>
            </div>
          </div>
        )}

        {/* Botón ocultar solo cuando se necesite */}
        {(
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsHidden(true);
              setTimeout(() => setIsHidden(false), 10000);
            }}
            className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full text-xs flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            title="Ocultar por 10 segundos"
          >
            ×
          </button>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className={`group flex items-center justify-center w-20 h-20 rounded-full shadow-xl bg-gradient-to-br from-white via-blue-50 to-blue-100 transition-all duration-200 select-none cursor-pointer hover:scale-105 hover:shadow-2xl ${!open ? 'animate-float-soft' : ''}`}
          style={{
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
            willChange: 'auto' // Optimización de rendering
          }}
        >
          {/* Contenedor simple de la imagen */}
          <div className="relative w-16 h-16 overflow-hidden rounded-full bg-white shadow-inner">
            {/* Animación de las imágenes */}
            {imagesLoaded ? (
              <Image 
                src={frames[currentFrame]} 
                alt="ChatBot Animation" 
                width={64} 
                height={64}
                className="object-contain w-full h-full rounded-full"
                priority
                quality={95}
              />
            ) : (
              <Image 
                src="/ChatBot.png" 
                alt="ChatBot" 
                width={64} 
                height={64}
                className="object-contain animate-pulse rounded-full"
                priority
              />
            )}
          </div>
        </button>
      </div>
      )}

      {/* Chat Box - Solo en desktop */}
      {!isMobile && (
      <div
        className={`fixed w-[90vw] max-w-[440px] h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-500 z-[99998] ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          // Posición fija simple para evitar problemas SSR
          right: '16px',
          bottom: '16px',
        }}
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
      )}
    </>
  );
}
