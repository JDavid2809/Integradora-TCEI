"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { generateAssistantResponse } from "./assistantAction"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { BrushCleaning, SendHorizontal } from "lucide-react"
import { saveStudyGuide } from "./studyGuideAction"

export default function AssistantContent() {
  type Msg = { role: 'user' | 'assistant' | 'system'; text: string; time?: string }
  const [aiConsent, setAiConsent] = useState<boolean | null>(null)
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

  // Load consent from localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem('ai_consent')
      setAiConsent(v === 'true' ? true : v === 'false' ? false : null)
    } catch {
      setAiConsent(null)
    }
  }, [])

  // Students should always use the server action to keep the key private.
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = prompt.trim()
    if (!text) return
    // Require consent before sending any student data to third-party AI
    if (aiConsent !== true) {
      setToast(language === 'es' ? 'Debes aceptar el uso de IA para continuar' : 'You must accept AI usage to continue')
      setTimeout(() => setToast(null), 2500)
      return
    }
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

  const acceptAiConsent = async (accepted: boolean) => {
    // Optimistic update
    try { localStorage.setItem('ai_consent', accepted ? 'true' : 'false') } catch {}
    setAiConsent(accepted)

    // Persist server-side
    try {
      const res = await fetch('/api/user/ai-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: accepted }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        console.warn('Failed to persist ai consent on server', json)
        setToast(language === 'es' ? 'No se pudo guardar el consentimiento en el servidor' : 'Could not save consent on server')
        setTimeout(() => setToast(null), 2500)
      } else {
        setToast(language === 'es' ? 'Preferencia guardada' : 'Preference saved')
        setTimeout(() => setToast(null), 1500)
      }
    } catch (err) {
      console.warn('Error calling ai-consent endpoint', err)
      setToast(language === 'es' ? 'No se pudo conectar al servidor' : 'Could not connect to server')
      setTimeout(() => setToast(null), 2500)
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
    const title = prompt || text.substring(0, 60) || 'Guía de Estudio'
    ;(async () => {
      try {
        const res: any = await saveStudyGuide(title, text)
        if (res?.success) {
          setToast(language === 'es' ? 'Guardado en Guías de Estudio' : 'Saved to Study Guides')
        } else {
          setToast(language === 'es' ? 'Error al guardar la guía' : 'Error saving guide')
        }
      } catch (err) {
        console.error('Error saving guide:', err)
        setToast(language === 'es' ? 'Error al guardar la guía' : 'Error saving guide')
      } finally {
        setTimeout(() => setToast(null), 2000)
      }
    })()
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
    <div className="w-full h-full flex flex-col px-0 sm:px-4 lg:px-6 py-0 sm:py-4">
      {/* AI Consent Banner */}
      {aiConsent !== true && (
        <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md mb-3 flex items-center justify-between">
          <div className="text-sm">
            {language === 'es'
              ? 'Para personalizar respuestas con tus datos, aceptas que usemos un servicio de IA externo. No compartiremos tu email.'
              : 'To personalize responses with your data, you accept we use a third-party AI service. We will not share your email.'}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => acceptAiConsent(false)} className="text-sm px-3 py-1 rounded-md bg-white/80">{language === 'es' ? 'No aceptar' : 'Decline'}</button>
            <button onClick={() => acceptAiConsent(true)} className="text-sm px-3 py-1 rounded-md bg-[#00246a] text-white">{language === 'es' ? 'Aceptar' : 'Accept'}</button>
          </div>
        </div>
      )}
      {/* HEADER */}
      <div 
        id="assistant-header"
        className="relative bg-gradient-to-br from-[#00246a] via-[#003875] to-[#00246a] p-4 sm:p-8 mb-0 sm:mb-4 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#e30f28] rounded-full -translate-x-36 -translate-y-36"></div>
        </div>

        <div className="relative z-10">
          {/* Layout Mobile: Minimalista y espaciado */}
          <div className="flex sm:hidden flex-col gap-3">
            {/* Solo Logo + Título */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center">
                  <img src="/ChatBot.png" alt="AI" className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#00246a]"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {language === 'es' ? 'Asistente Beanie' : 'Beanie Assistant'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/70">
                    {language === 'es' ? 'En línea' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles simplificados */}
            <div className="flex items-center gap-2">
              {/* Toggle idioma */}
              <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/20">
                <button
                  type="button"
                  onClick={() => setLanguage("es")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    language === "es"
                      ? "bg-[#e30f28] text-white"
                      : "text-white/70"
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    language === "en"
                      ? "bg-[#e30f28] text-white"
                      : "text-white/70"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Selector modelo */}
              <select
                className="flex-1 bg-white/10 text-white border border-white/20 px-3 py-2 rounded-xl text-sm font-medium focus:outline-none backdrop-blur-sm"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="google/gemma-3n-e2b-it:free" className="text-gray-900 bg-white">
                  Gemma
                </option>
                <option value="meta-llama/llama-3.3-70b-instruct:free" className="text-gray-900 bg-white">
                  Llama
                </option>
                <option value="deepseek/deepseek-prover-v2:free" className="text-gray-900 bg-white">
                  Deepseek
                </option>
              </select>
            </div>
          </div>

          {/* Layout Desktop: Original */}
          <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-md border-2 border-white/30 shadow-xl flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <img src="/ChatBot.png" alt="Robot Icon" className="w-12 h-12 relative z-10" />
                </div>
                <div className="absolute bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-[#00246a] shadow-lg">
                  <div className="w-full h-full rounded-full bg-green-400 animate-ping opacity-75"></div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                  {language === 'es' ? 'Asistente Beanie' : 'Beanie Assistant'}
                </h2>
                <p className="text-white/80 text-sm mt-0.5 font-medium">
                  {language === 'es' 
                    ? 'Potenciado con Inteligencia Artificial' 
                    : 'Powered by Artificial Intelligence'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/40">•</span>
                  <span className="text-xs text-white/60">
                    {language === 'es' ? 'Listo para ayudarte' : 'Ready to assist you'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles Desktop */}
            <div className="flex items-center gap-3">
              <div 
                id="language-selector"
                className="flex bg-white/10 rounded-xl p-1 backdrop-blur-md border border-white/20 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setLanguage("es")}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${
                    language === "es"
                      ? "bg-[#e30f28] text-white shadow-lg scale-105"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${
                    language === "en"
                      ? "bg-[#e30f28] text-white shadow-lg scale-105"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>

              <select
                id="model-selector"
                className="bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e30f28] transition-all cursor-pointer hover:bg-white/15 backdrop-blur-md shadow-lg min-w-[200px]"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="google/gemma-3n-e2b-it:free" className="text-gray-900 bg-white">
                  Gemma - Rápido
                </option>
                <option value="meta-llama/llama-3.3-70b-instruct:free" className="text-gray-900 bg-white">
                  Llama 3.3 - Preciso
                </option>
                <option value="deepseek/deepseek-prover-v2:free" className="text-gray-900 bg-white">
                  Deepseek - Experimental
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        id="chat-area"
        className="flex-1 bg-white sm:rounded-xl border-t sm:border border-gray-200 p-4 sm:p-5 overflow-y-auto mb-0 sm:mb-4 flex flex-col"
        style={{ 
          height: 'calc(100vh - 300px)',
          minHeight: '400px'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
            <div className="w-16 h-16 bg-[#00246a]/5 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-9 h-9 text-[#00246a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-gray-800 text-lg font-semibold mb-1">
              {language === 'es' ? '¡Hola! Soy tu asistente' : 'Hello! I\'m your assistant'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {language === 'es' 
                ? 'Pregúntame sobre inglés: gramática, vocabulario o ejercicios'
                : 'Ask me about English: grammar, vocabulary or exercises'}
            </p>
            
            {/* Sugerencias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl text-gray-600">
              {(language === 'es' ? [
                '¿Cómo uso el present perfect?',
                'Diferencia entre make y do',
                'Dame ejercicios de vocabulario',
                '¿Qué son los phrasal verbs? ' 
              ] : [
                'How do I use present perfect?',
                'Difference between make and do',
                'Give me vocabulary exercises',
                'What are phrasal verbs?'
              ]).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(suggestion)}
                  className="text-sm text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-[#00246a] rounded-lg transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start items-start gap-2.5"
                } animate-fade-in`}
              >
                {/* Avatar */}
                {m.role === "assistant" && (
                  <div className="w-9 h-9 rounded-full bg-[#00246a]/5 flex items-center justify-center flex-shrink-0 border border-[#00246a]/10">
                    <svg className="w-5 h-5 text-[#00246a]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[75%] ${
                    m.role === "user"
                      ? "bg-[#00246a] text-white rounded-2xl rounded-tr-md"
                      : "bg-gray-50 text-gray-900 rounded-2xl rounded-tl-md border border-gray-200"
                  } px-4 py-2.5 shadow-sm`}
                >
                  <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                  
                  {m.time && (
                    <div className={`text-xs mt-1.5 ${
                      m.role === "user" ? "text-white/60" : "text-gray-400"
                    }`}>
                      {m.time}
                    </div>
                  )}

                  {/* Botón copiar */}
                  {m.role === "assistant" && m.text && (
                    <button
                      onClick={() => copyToClipboard(m.text)}
                      className="mt-2 text-xs font-medium text-[#00246a] hover:text-[#e30f28] px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{language === "es" ? "Copiar" : "Copy"}</span>
                    </button>
                  )}
                  {/* Guardar como Guía */}
                  {m.role === "assistant" && m.text && (
                    <button
                      onClick={() => saveToPortfolio(m.text)}
                      className="mt-2 ml-2 text-xs font-medium text-[#00246a] hover:text-[#e30f28] px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                      </svg>
                      <span>{language === "es" ? "Guardar Guía" : "Save as Guide"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={appRef} />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#00246a] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#00246a] rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-2 h-2 bg-[#00246a] rounded-full animate-bounce [animation-delay:0.3s]"></span>
            </div>
            <span className="text-sm text-gray-600">
              {language === 'es' ? 'Escribiendo...' : 'Writing...'}
            </span>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <form
        onSubmit={submit}
        className="bg-white border-t sm:border-0 sm:bg-transparent p-4 sm:p-0"
      >
        <div className="flex items-stretch gap-2">
          {/* Input con botón limpiar */}
          <div 
            id="input-area"
            className="flex-1 flex items-center bg-white sm:bg-white border-2 border-gray-300 rounded-xl focus-within:border-[#00246a] transition-all"
          >
            <input
              className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400 text-sm rounded-l-xl"
              placeholder={language === "es" ? "Escribe tu pregunta..." : "Type your question..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            
            {messages.length > 0 && (
              <button
                id="clear-button"
                type="button"
                onClick={() => {
                  setMessages([])
                  setPrompt('')
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                disabled={loading}
              >
                <BrushCleaning className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Botón enviar */}
          <button
            id="send-button"
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-5 py-3 bg-[#e30f28] hover:bg-[#c20d22] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            ) : (
              <>
                <SendHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{language === "es" ? "Enviar" : "Send"}</span>
              </>
            )}
          </button>

          {/* Botón regenerar */}
          {messages.length > 0 && (
            <button
              id="regenerate-button"
              type="button"
              onClick={regenerateLast}
              disabled={loading}
              className="hidden sm:flex items-center gap-2 px-4 py-3 border-2 border-[#00246a] text-[#00246a] hover:bg-[#00246a] hover:text-white rounded-xl font-medium transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">{language === "es" ? "Regenerar" : "Regenerate"}</span>
            </button>
          )}
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#00246a] text-white px-5 py-3 rounded-lg shadow-xl animate-fade-in z-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}
