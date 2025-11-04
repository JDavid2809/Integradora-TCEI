"use server"

// Server Action para llamar a OpenRouter de forma segura desde el servidor.
// Uso: importar y llamar generateAssistantResponse desde un componente cliente.

type Payload = {
  prompt: string
  system?: string
  model?: string
  language?: 'es' | 'en'
}

const DEFAULT_SYSTEM_PROMPTS: Record<'es' | 'en', string> = {
  en: `You are an English tutor and conversational assistant. Answer clearly and concisely in English unless the user explicitly asks otherwise. Give examples, correct grammar when appropriate, and keep explanations friendly and simple. If the user asks for translations, provide both the original and the translation. When possible, provide short exercises or follow-up questions to practice.`,
  es: `Eres un tutor de inglés y asistente conversacional. Responde con claridad y concisión en español a menos que el usuario pida lo contrario. Da ejemplos, corrige la gramática cuando sea apropiado y mantén un tono amable y claro. Si el usuario pide traducciones, ofrece el original y la traducción. Cuando sea posible, ofrece ejercicios cortos o preguntas de seguimiento para practicar.`,
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ text?: string }>
}

type OpenRouterRequest = {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

type OpenRouterChoice = {
  message?: { content?: string | Array<{ text?: string }> }
  delta?: { content?: string }
}

type OpenRouterResponse = {
  choices?: OpenRouterChoice[]
  [key: string]: unknown
}

export async function generateAssistantResponse({ prompt, system, model, language }: Payload): Promise<{ reply: string }> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    return { reply: 'OPENROUTER_API_KEY no está configurada en el servidor.' }
  }

  try {
    const body: OpenRouterRequest = {
      model: model || 'deepseek/deepseek-prover-v2:free',
      messages: [],
    }  
    // Si no se provee system desde el cliente, usar el prompt por defecto según el idioma
    const chosenLang: 'es' | 'en' = language === 'es' ? 'es' : 'en'
    if (system) {
      body.messages.push({ role: 'system', content: system })
    } else if (DEFAULT_SYSTEM_PROMPTS[chosenLang]) {
      body.messages.push({ role: 'system', content: DEFAULT_SYSTEM_PROMPTS[chosenLang] })
    }
    body.messages.push({ role: 'user', content: prompt })

    // Intentar llamada; si OpenRouter responde 404 "No endpoints found" reintentar con modelos fallback
    const FALLBACK_MODELS: string[] = [
      //'openai/gpt-4o',
      'google/gemma-3n-e2b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-prover-v2:free',
    ]

    const modelCandidates: string[] = model ? [model, ...FALLBACK_MODELS.filter((m) => m !== model)] : FALLBACK_MODELS

    let res: Response | null = null
    let data: OpenRouterResponse | null = null
    let lastErrorText = ''

    for (const candidate of modelCandidates) {
      body.model = candidate
      try {
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const txt = await res.text()
          lastErrorText = `Model ${candidate} -> ${res.status} ${txt}`
          // Si el error indica "No endpoints found" probamos el siguiente modelo
          if (res.status === 404 && txt.includes('No endpoints found')) {
            continue
          }

          // Manejar error específico de Google Gemma: "Developer instruction is not enabled"
          // En ese caso reintentamos sin usar role: 'system', sino concatenando el system prompt al mensaje de usuario.
          if (res.status === 400 && txt.includes('Developer instruction is not enabled')) {
            try {
              // Construir body alternativo: unir system + user en un único mensaje user
              const systemMsg = body.messages.find((m) => m.role === 'system')?.content
              const systemText = typeof systemMsg === 'string' ? systemMsg : ''
              const altBody: OpenRouterRequest = {
                model: candidate,
                messages: [{ role: 'user', content: `${systemText}\n\n${prompt}` }],
              }

              const res2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(altBody),
              })

              if (!res2.ok) {
                const txt2 = await res2.text()
                lastErrorText = `Alt attempt ${candidate} -> ${res2.status} ${txt2}`
                // si tampoco funciona, pasar al siguiente candidato
                continue
              }

              data = (await res2.json()) as OpenRouterResponse
              res = res2
              break
            } catch (err) {
              lastErrorText = String(err)
              continue
            }
          }

          // otro error: no seguimos intentando
          return { reply: `Error desde OpenRouter: ${res.status} ${txt}` }
        }

        data = (await res.json()) as OpenRouterResponse
        // Si llegamos aquí, la petición fue exitosa con este modelo candidato
        break
      } catch (err) {
        lastErrorText = String(err)
        // intentar siguiente modelo
        continue
      }
    }

    if (!res) {
      return { reply: `No se pudo conectar a OpenRouter. Último error: ${lastErrorText}` }
    }

    if (res && !res.ok && lastErrorText) {
      return { reply: `Fallo al llamar a OpenRouter. Último intento: ${lastErrorText}` }
    }

    // Extracción robusta del texto de la respuesta (varios formatos posibles)
    let text = ''
    try {
      const choice = data?.choices?.[0]
      if (choice?.message?.content) {
        const content = choice.message.content
        if (Array.isArray(content)) {
          text = content.map((c) => c.text ?? '').join('')
        } else if (typeof content === 'string') {
          text = content
        }
      } else if (choice?.delta?.content) {
        text = choice.delta.content
      } else {
        text = JSON.stringify(data)
      }
    } catch (err) {
      text = JSON.stringify(data)
    }

    return { reply: text }
  } catch (err) {
    return { reply: `Error llamando a OpenRouter: ${String(err)}` }
  }
}
