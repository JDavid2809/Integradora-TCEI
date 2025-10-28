"use client"

import React, { useState, useRef } from "react"
import { generateAssistantResponse } from "./assistantAction"

// Nota: Para usar la clave en cliente debes exponerla como NEXT_PUBLIC_OPENROUTER_API_KEY
// Esto es menos seguro porque la clave será visible en el bundle del navegador.
// Recomendado: usar el proxy servidor /api/assistant (ya incluido) para mantener la key privada.

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Asistente</h2>
          <p className="text-sm text-gray-500">Ayuda rápida para tus cursos de inglés</p>
        </div>
        <div className="flex items-center gap-2">
            <button type="button" onClick={() => setLanguage('es')} className={`px-3 py-1 rounded ${language === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>ES</button>
            <button type="button" onClick={() => setLanguage('en')} className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>EN</button>
            <select className="ml-3 border px-2 py-1 rounded text-sm" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="google/gemma-3n-e2b-it:free">Gemma</option>
              <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3</option>
              <option value="deepseek/deepseek-prover-v2:free">Deepseek (experimental)</option>
            </select>
          </div>
      </div>

  <div className="bg-white rounded-lg shadow p-4 h-[56vh] overflow-y-auto mb-4" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">Empieza la conversación — pregunta sobre gramática, ejercicios o vocabulario.</div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`${m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={`inline-block px-4 py-2 rounded-lg shadow-sm max-w-[85%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="flex items-end gap-2">
                    <div style={{ flex: 1 }}>{m.text}</div>
                    <div className="text-xs text-gray-400 ml-2">{m.time}</div>
                  </div>
                  {m.role === 'assistant' && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => copyToClipboard(m.text)} className="text-xs text-blue-600">{language === 'es' ? 'Copiar' : 'Copy'}</button>
                      <button onClick={() => saveToPortfolio(m.text)} className="text-xs text-green-600">{language === 'es' ? 'Guardar' : 'Save'}</button>
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
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="dot-typing"></div>
              </div>
              <div className="text-sm text-gray-500">Generando respuesta...</div>
            </div>
          ) : null}
        </div>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          className="flex-1 px-4 py-3 border rounded-lg"
          placeholder={language === 'es' ? 'Escribe tu pregunta...' : 'Type your question...'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button type="button" onClick={() => { setMessages([]) }} title="Limpiar" className="px-4 py-2 border rounded" disabled={loading}>
          Limpiar
        </button>
        <button type="submit" disabled={loading || !prompt.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          {loading ? (
            <span className="flex items-center gap-2"><span className="dot-typing" />{language === 'es' ? 'Enviando...' : 'Sending...'}</span>
          ) : (
            language === 'es' ? 'Enviar' : 'Send'
          )}
        </button>
        <button type="button" onClick={regenerateLast} title="Regenerar última" className="px-3 py-2 border rounded text-sm" disabled={loading}>
          {language === 'es' ? 'Regenerar' : 'Regenerate'}
        </button>
      </form>

      <style jsx>{`
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
          background: #3b82f6;
          border-radius: 9999px;
          position: absolute;
          animation: dot 1s infinite linear;
        }
        .dot-typing:before { left: 0; animation-delay: 0s }
        .dot-typing div { left: 5px; animation-delay: 0.15s }
        .dot-typing:after { left: 10px; animation-delay: 0.3s }
        @keyframes dot { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
      `}</style>
      {toast && (
        <div className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded shadow">{toast}</div>
      )}
    </div>
  )
}
