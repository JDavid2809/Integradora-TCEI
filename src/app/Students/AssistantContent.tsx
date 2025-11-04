"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { generateAssistantResponse } from "./assistantAction"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export default function AssistantContent() {
  type Msg = { role: 'user' | 'assistant' | 'system'; text: string; time?: string }
  const [messages, setMessages] = useState<Msg[]>([])
  const [prompt, setPrompt] = useState("")
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [model, setModel] = useState<string>('openai/gpt-4o')
  const [loading, setLoading] = useState(false)
  const appRef = useRef<HTMLDivElement | null>(null)
  const typingAbortRef = useRef<{ aborted: boolean }>({ aborted: false })
  const [toast, setToast] = useState<string | null>(null)

  // Tour con driver.js
  const startAssistantTour = useCallback(() => {
    const steps = [
      {
        element: "#assistant-header",
        popover: {
          title: language === 'es' ? "Bienvenido al Asistente Virtual" : "Welcome to Virtual Assistant",
          description: language === 'es' 
            ? "Tu asistente inteligente para aprender inglés. Aquí puedes hacer preguntas sobre gramática, vocabulario, ejercicios y más."
            : "Your intelligent assistant to learn English. Here you can ask questions about grammar, vocabulary, exercises and more.",
          position: "bottom",
        },
      },
      {
        element: "#language-selector",
        popover: {
          title: language === 'es' ? "Selector de Idioma" : "Language Selector",
          description: language === 'es'
            ? "Cambia el idioma de las respuestas entre español e inglés según tu preferencia."
            : "Switch the response language between Spanish and English according to your preference.",
          position: "bottom",
        },
      },
      {
        element: "#model-selector",
        popover: {
          title: language === 'es' ? "Modelo de IA" : "AI Model",
          description: language === 'es'
            ? "Selecciona el modelo de inteligencia artificial que prefieras."
            : "Select your preferred artificial intelligence model.",
          position: "bottom",
        },
      },
      {
        element: "#chat-area",
        popover: {
          title: language === 'es' ? "Área de Conversación" : "Chat Area",
          description: language === 'es'
            ? "Aquí aparecerán tus preguntas y las respuestas del asistente. Puedes copiar las respuestas con el botón de copiar."
            : "Your questions and the assistant's responses will appear here. You can copy responses with the copy button.",
          position: "top",
        },
      },
      {
        element: "#input-area",
        popover: {
          title: language === 'es' ? "Escribe tu Pregunta" : "Type Your Question",
          description: language === 'es'
            ? "Escribe aquí tus preguntas sobre inglés. Puedes preguntar sobre gramática, vocabulario, traducciones, etc."
            : "Write your English questions here. You can ask about grammar, vocabulary, translations, etc.",
          position: "top",
        },
      },
      {
        element: "#clear-button",
        popover: {
          title: language === 'es' ? "Limpiar Chat" : "Clear Chat",
          description: language === 'es'
            ? "Limpia toda la conversación para empezar de nuevo."
            : "Clear the entire conversation to start fresh.",
          position: "top",
        },
      },
      {
        element: "#send-button",
        popover: {
          title: language === 'es' ? "Enviar Pregunta" : "Send Question",
          description: language === 'es'
            ? "Envía tu pregunta al asistente y espera la respuesta."
            : "Send your question to the assistant and wait for the response.",
          position: "top",
        },
      },
      {
        element: "#regenerate-button",
        popover: {
          title: language === 'es' ? "Regenerar Respuesta" : "Regenerate Response",
          description: language === 'es'
            ? "Si no te gustó la respuesta, puedes regenerarla para obtener una nueva versión."
            : "If you didn't like the response, you can regenerate it to get a new version.",
          position: "top",
        },
      },
    ];

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      popoverClass: "driverjs-theme",
      steps,
    });

    driverObj.drive();
  }, [language]);

  // Ejecutar el tour solo una vez
  useEffect(() => {
    const hasSeenAssistantTour = localStorage.getItem("hasSeenAssistantTour");
    if (hasSeenAssistantTour) return;

    const timeout = setTimeout(() => {
      startAssistantTour();
      localStorage.setItem("hasSeenAssistantTour", "true");
    }, 800);

    return () => clearTimeout(timeout);
  }, [startAssistantTour]);

  // Students should always use the server action to keep the key private.
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = prompt.trim()
    if (!text) return
    setPrompt("")
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  setMessages((m) => [...m, { role: 'user', text, time }])
    setLoading(true)

    try {
      // cancelar cualquier tipeo previo
      typingAbortRef.current.aborted = true
      typingAbortRef.current = { aborted: false }

  const args: any = { prompt: text, language, model }
      const data = await generateAssistantResponse(args)
      const reply: string = data?.reply || (language === 'es' ? 'No se obtuvo respuesta.' : 'No response received.')

  // Push an empty assistant message and animate typing
  const respTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  setMessages((m) => [...m, { role: 'assistant', text: '', time: respTime }])
      await animateTyping(reply, typingAbortRef.current)
    } catch (err) {
      console.error(err)
      setMessages((m) => [...m, { role: 'assistant', text: language === 'es' ? 'Error al generar la respuesta.' : 'Error generating response.' }])
    } finally {
      setLoading(false)
      appRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  // Animación tipo "typewriter" que actualiza el último mensaje assistant
  const animateTyping = async (fullText: string, abortToken: { aborted: boolean }) => {
    const delayBase = 12 // ms per char
    for (let i = 0; i < fullText.length; i++) {
      if (abortToken.aborted) break
      const nextChar = fullText[i]
        setMessages((prev) => {
        const copy = [...prev]
        // encontrar último assistant
        let idx = -1
        for (let j = copy.length - 1; j >= 0; j--) {
          if (copy[j].role === 'assistant') { idx = j; break }
        }
        if (idx === -1) {
          copy.push({ role: 'assistant', text: nextChar, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
        } else {
          copy[idx] = { ...copy[idx], text: copy[idx].text + nextChar }
        }
        return copy
      })
      // scroll
      appRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      // small variable delay to feel natural: punctuation slightly longer
      const extra = /[.,!?]/.test(nextChar) ? 60 : 0
      await new Promise((r) => setTimeout(r, delayBase + extra))
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast(language === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard')
      setTimeout(() => setToast(null), 2000)
    } catch {
      setToast(language === 'es' ? 'No se pudo copiar' : 'Could not copy')
      setTimeout(() => setToast(null), 2000)
    }
  }

  const saveToPortfolio = (text: string) => {
    // Placeholder: integrarlo con endpoint real para guardar en DB
    setToast(language === 'es' ? 'Guardado en portafolio (simulado)' : 'Saved to portfolio (simulated)')
    setTimeout(() => setToast(null), 2000)
  }

  const regenerateLast = async () => {
    // Busca la última pregunta del usuario
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) {
      setToast(language === 'es' ? 'No hay consulta para regenerar' : 'No prompt to regenerate')
      setTimeout(() => setToast(null), 2000)
      return
    }
    // Llamar la server action con el mismo prompt
    setLoading(true)
    typingAbortRef.current.aborted = true
    typingAbortRef.current = { aborted: false }
    try {
      const args: any = { prompt: lastUser.text, language, model }
      const data = await generateAssistantResponse(args)
      const reply: string = data?.reply || (language === 'es' ? 'No se obtuvo respuesta.' : 'No response received.')
      const respTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages((m) => [...m, { role: 'assistant', text: '', time: respTime }])
      await animateTyping(reply, typingAbortRef.current)
    } catch (err) {
      console.error(err)
      setMessages((m) => [...m, { role: 'assistant', text: language === 'es' ? 'Error al generar la respuesta.' : 'Error generating response.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
        <div className="max-w-5xl mx-auto px-4">
      <div id="assistant-header" className="rounded-xl bg-[#00246a] p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Asistente</h2>
            <p className="text-white/80 text-sm">Ayuda rápida para tus cursos de inglés</p>
          </div>
          <div className="flex items-center gap-3">
            <div id="language-selector" className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLanguage("es")}
                className={`px-4 py-2 rounded-md font-medium transition-all ${language === "es" ? "bg-[#e30f28] text-white shadow-md" : "text-white hover:bg-white/10"}`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded-md font-medium transition-all ${language === "en" ? "bg-[#e30f28] text-white shadow-md" : "text-white hover:bg-white/10"}`}
              >
                EN
              </button>
            </div>
            <select
              id="model-selector"
              className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e30f28] transition-all cursor-pointer hover:bg-white/20"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="google/gemma-3n-e2b-it:free" className="text-gray-900">
                Gemma
              </option>
              <option value="meta-llama/llama-3.3-70b-instruct:free" className="text-gray-900">
                Llama 3.3
              </option>
              <option value="deepseek/deepseek-prover-v2:free" className="text-gray-900">
                Deepseek (experimental)
              </option>
            </select>
          </div>
        </div>
      </div>

      <div
        id="chat-area"
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-[56vh] overflow-y-auto mb-6"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1 }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-[#00246a]/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[#00246a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">Empieza la conversación</p>
              <p className="text-gray-400 text-sm mt-1">Pregunta sobre gramática, ejercicios o vocabulario</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${m.role === "user" ? "flex justify-end" : "flex justify-start items-start gap-2"} animate-fade-in`}
              >
                {m.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                    <img src="/logos/01_logo.png" alt="Assistant Avatar" className="w-8 h-8 rounded-full" />
                  </div>
                )}
                <div  
                  className={`inline-block px-5 py-3 rounded-xl shadow-sm max-w-[85%] whitespace-pre-wrap transition-all hover:shadow-md ${m.role === "user" ? "bg-[#00246a] text-white" : "bg-gray-50 border border-gray-200 text-gray-800"}`}
                >
                  <div className="flex items-end gap-3">
                    <div style={{ flex: 1 }} className="leading-relaxed">
                      {m.text}
                    </div>
                    <div
                      className={`text-xs ${m.role === "user" ? "text-white/70" : "text-gray-400"} ml-2 whitespace-nowrap`}
                    >
                      {m.time}
                    </div>
                  </div>
                  {m.role === "assistant" && (
                    <div className="mt-3 flex gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => copyToClipboard(m.text)}
                        className="text-xs font-medium text-[#00246a] hover:text-white hover:bg-[#00246a] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-[#00246a]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {language === "es" ? "Copiar" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={appRef} />
          </div>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="flex items-center gap-3 bg-[#00246a]/5 px-4 py-3 rounded-lg border border-[#00246a]/20">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#00246a]/20">
                <div className="dot-typing"></div>
              </div>
              <div className="text-sm font-medium text-[#00246a]">Generando respuesta...</div>
            </div>
          ) : null}
        </div>
      </div>

      <form onSubmit={submit} className="flex items-center gap-3">
        <input
          id="input-area"
          className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/20 transition-all text-gray-800 placeholder:text-gray-400"
          placeholder={language === "es" ? "Escribe tu pregunta..." : "Type your question..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button
          id="clear-button"
          type="button"
          onClick={() => {
            setMessages([])
          }}
          title="Limpiar"
          className="px-5 py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Limpiar
        </button>
        <button
          id="send-button"
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-6 py-4 bg-[#e30f28] hover:bg-[#c20d22] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="dot-typing-white" />
              {language === "es" ? "Enviando..." : "Sending..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {language === "es" ? "Enviar" : "Send"}
            </span>
          )}
        </button>
        <button
          id="regenerate-button"
          type="button"
          onClick={regenerateLast}
          title="Regenerar última"
          className="px-5 py-4 border-2 border-[#00246a] text-[#00246a] rounded-lg hover:bg-[#00246a] hover:text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {language === "es" ? "Regenerar" : "Regenerate"}
        </button>
      </form>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .dot-typing {
          width: 14px;
          height: 6px;
          display: inline-block;
          position: relative;
        }
        .dot-typing:before, .dot-typing:after, .dot-typing div {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #00246a;
          border-radius: 9999px;
          position: absolute;
          animation: dot 1s infinite ease-in-out;
        }
        .dot-typing:before { left: 0; animation-delay: 0s }
        .dot-typing div { left: 5px; animation-delay: 0.15s }
        .dot-typing:after { left: 10px; animation-delay: 0.3s }
        
        .dot-typing-white {
          width: 14px;
          height: 6px;
          display: inline-block;
          position: relative;
        }
        .dot-typing-white:before, .dot-typing-white:after, .dot-typing-white div {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 9999px;
          position: absolute;
          animation: dot 1s infinite ease-in-out;
        }
        .dot-typing-white:before { left: 0; animation-delay: 0s }
        .dot-typing-white div { left: 5px; animation-delay: 0.15s }
        .dot-typing-white:after { left: 10px; animation-delay: 0.3s }
        
        @keyframes dot { 
          0%, 100% { transform: translateY(0); opacity: 0.7; } 
          50% { transform: translateY(-8px); opacity: 1; } 
        }
      `}</style>

      {toast && (
        <div className="fixed right-6 bottom-6 bg-[#00246a] text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
