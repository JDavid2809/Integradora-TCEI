"use server"

import { prisma } from "@/lib/prisma"
import { generateGeminiResponse } from "./geminiAction"
import { searchYouTube } from '@/lib/youtube'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"

// Enhanced keyword extraction: prioritize English grammar/vocab terms
function extractKeywordsFromText(text: string, limit = 8) {
  if (!text) return []
  
  const stopwords = new Set([
    'the','and','a','an','in','on','of','to','for','with','is','are','be','by','this','that','these','those','as','it','you','your','he','she','we','they','i','me','my','not','do','did','will','would','can','could','may','might','has','have','had',
    'el','la','los','las','un','una','y','o','de','en','del','al','que','por','para','con','su','se','es','son','como','pero','si','mas','muy','está','están'
  ])
  
  // Grammar terms get priority
  const grammarTerms = new Set([
    'present','past','future','perfect','continuous','progressive','simple','passive','active',
    'verb','noun','adjective','adverb','pronoun','preposition','conjunction','article',
    'tense','clause','phrase','modal','auxiliary','conditional','subjunctive','imperative',
    'subject','object','predicate','gerund','infinitive','participle'
  ])
  
  const words = text.replace(/[<>/"'*#\[\]()]/g, ' ').replace(/\W+/g, ' ').toLowerCase().split(/\s+/).filter(Boolean)
  const freq: Record<string, number> = {}
  
  for (const w of words) {
    if (w.length < 3) continue
    if (stopwords.has(w)) continue
    if (/^\d+$/.test(w)) continue
    
    freq[w] = (freq[w] || 0) + 1
    if (grammarTerms.has(w)) {
      freq[w] += 5 // Boost grammar terms
    }
  }
  
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a])
  const keywords = []
  
  for (let i = 0; i < Math.min(limit, sorted.length); i++) {
    const word = sorted[i]
    keywords.push({ 
      word, 
      phonetic: '', 
      example: ''
    })
  }
  
  return keywords
}

const serializeGuide = (g: any) => {
  let parsedContent: any = g.content
  if (typeof g.content === 'string') {
    try { parsedContent = JSON.parse(g.content) } catch (e) { /* keep as string */ }
  }
  return { id: g.id, title: g.title, content: parsedContent, created_at: g.created_at?.toISOString(), student_id: g.student_id }
}

// Sanitization utilities to enforce strict JSON content rules
function sanitizeString(s: string) {
  if (typeof s !== 'string') return s
  let out = s
  // Remove code fences and their delimiters (also remove '```json' markers)
  out = out.replace(/^```json\s*/gim, '')
  out = out.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
  // Remove markdown headings like #, ##, etc.
  out = out.replace(/(^|\n)\s*#{1,6}\s*/g, '$1')
  // Remove pipes and table-like separators
  out = out.replace(/\|/g, ' ')
  out = out.replace(/(^|\n)\s*[:\-\| ]{3,}\s*(\n|$)/g, '\n')
  // Remove emojis and other pictographic symbols while preserving accented letters
  try {
    out = out.replace(/\p{Extended_Pictographic}/gu, '')
  } catch (e) {
    // Some environments may not support the Unicode property; fallback to a simpler removal
    out = out.replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
  }
    // Keep only letters, marks, numbers, whitespace and common punctuation; remove other symbols like emojis
      out = out.replace(/[^\p{L}\p{M}\p{N}\s\.,:;()?!%&'"\/[\]@+\-]/gu, '')
  // Normalize newlines and preserve them: collapse 3+ newlines to 2
  out = out.replace(/\r\n/g, '\n')
  out = out.replace(/\n{3,}/g, '\n\n')
  // Replace multiple spaces and tabs (but keep newlines intact)
  out = out.replace(/[ \t]{2,}/g, ' ')
  return out.trim()
}

function sanitizeObject(obj: any): any {
  if (obj == null) return obj
  if (typeof obj === 'string') return sanitizeString(obj)
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  // object
  const out: Record<string, any> = {}
  for (const k of Object.keys(obj)) {
    // Special-case: if key is 'content' and it's an object with blocks, sanitize nested text
    if (k === 'content' && obj[k] && typeof obj[k] === 'object' && Array.isArray(obj[k].blocks)) {
      out[k] = { blocks: obj[k].blocks.map((b: any) => {
        const outBlock: any = { ...b }
        if (typeof outBlock.text === 'string') outBlock.text = sanitizeString(outBlock.text)
        if (Array.isArray(outBlock.items)) outBlock.items = outBlock.items.map((it: any) => typeof it === 'string' ? sanitizeString(it) : it)
        if (Array.isArray(outBlock.dialogue)) outBlock.dialogue = outBlock.dialogue.map((d: any) => ({ role: d.role, text: sanitizeString(d.text) }))
        return outBlock
      }) }
    } else {
      out[k] = sanitizeObject(obj[k])
    }
  }
  return out
}

function validateGuideStructure(guide: any): boolean {
  if (!guide || typeof guide !== 'object') return false
  if (!guide.title || typeof guide.title !== 'string') return false
  if (!guide.metadata || typeof guide.metadata !== 'object') return false
  if (!guide.metadata.topic || typeof guide.metadata.topic !== 'string') return false
  if (!guide.sections || !Array.isArray(guide.sections) || guide.sections.length === 0) return false
  // Minimal section validation
  for (const s of guide.sections) {
    if (!s.id || typeof s.id !== 'string') return false
    if (!s.title || typeof s.title !== 'string') return false
    if (!s.type || typeof s.type !== 'string') return false
    if (s.type === 'quiz') {
      if (!Array.isArray(s.questions) || s.questions.length === 0) return false
    }
    if (s.type === 'content') {
      // Accept string content or structured object with blocks
      if (typeof s.content === 'string') continue
      if (typeof s.content === 'object') {
        if (!Array.isArray(s.content.blocks) || s.content.blocks.length === 0) return false
        const allowed = new Set(['subtitle', 'paragraph', 'list', 'blockquote', 'dialogue', 'hr', 'code'])
        for (const b of s.content.blocks) {
          if (!b.type || typeof b.type !== 'string' || !allowed.has(b.type)) return false
          if (b.type === 'list' && (!Array.isArray(b.items) || b.items.length === 0)) return false
          if (b.type === 'dialogue' && (!Array.isArray(b.dialogue) || b.dialogue.length === 0)) return false
        }
      } else return false
    }
  }
  return true
}

// Detect disallowed patterns in strings (pipes, code fences) after sanitization
function containsDisallowedPatterns(obj: any): boolean {
  if (obj == null) return false
  if (typeof obj === 'string') {
    if (obj.includes('|')) return true
    if (obj.includes('```')) return true
    return false
  }
  if (Array.isArray(obj)) return obj.some(containsDisallowedPatterns)
  if (typeof obj === 'object') return Object.values(obj).some(containsDisallowedPatterns)
  return false
}

// Convert legacy string content into structured blocks
function textToBlocks(text: string) {
  if (!text || typeof text !== 'string') return { blocks: [] }
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const parts = normalized.split(/\n\n+/g).map(p => p.trim()).filter(Boolean)
  const blocks: any[] = []
  for (const part of parts) {
    if (/^#{1,6}\s+/.test(part)) {
      const t = part.replace(/^#{1,6}\s+/, '').trim()
      blocks.push({ type: 'subtitle', text: t })
      continue
    }
    if (/^>\s+/.test(part)) {
      blocks.push({ type: 'blockquote', text: part.replace(/^>\s+/, '').trim() })
      continue
    }
    // Ordered list detection
    if (/^(\d+\.|\- )/.test(part)) {
      const lines = part.split(/\n/).map(l => l.replace(/^\s*[-\d\.]+\s*/, '').trim()).filter(Boolean)
      blocks.push({ type: 'list', style: /^\d+\./.test(part) ? 'numbered' : 'bullet', items: lines })
      continue
    }
    // Dialogue detection: simple pattern 'Name: Text' or 'A: Text'
    if (/^[A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]{1,20}:/.test(part)) {
      const lines = part.split(/\n/).map(l => {
        const m = l.match(/^([^:]{1,20}):\s*(.*)$/)
        if (m) return { role: m[1].trim(), text: m[2].trim() }
        return null
      }).filter(Boolean)
      if (lines.length > 0) {
        blocks.push({ type: 'dialogue', dialogue: lines })
        continue
      }
    }
    // Fallback paragraph
    blocks.push({ type: 'paragraph', text: part })
  }
  return { blocks }
}

export async function generateStudyGuide(topic: string) {
  try {
    const session = await getServerSession(authOptions)
    // Log only user id to avoid writing PII to logs
    console.log('generateStudyGuide session id:', { id: session?.user?.id })
  if (!session?.user?.id) {
    const r = { error: "No autorizado" }
    console.error('generateStudyGuide returning (no session):', r)
    try { JSON.stringify(r) } catch(e) { console.error('Serialization error for no session return', e) }
    return r
  }

  // 1. Get student ID and extended data
  let student: any
  let activeInscripciones: any[]
  let academicHistoryRows: any[]
  try {
    const parsedUserId = parseInt(session.user.id)
    console.log('generateStudyGuide parsedUserId:', parsedUserId)
    student = await prisma.estudiante.findUnique({
      where: { id_usuario: parsedUserId },
    })

    if (!student && session.user.email) {
      // Fallback: find user by email and retrieve the associated estudiante
      console.warn('generateStudyGuide: student not found by id, attempting fallback via usuario.email')
      const user = await prisma.usuario.findUnique({ where: { email: session.user.email }, include: { estudiante: true } })
      console.log('generateStudyGuide fetched usuario for fallback:', user ? { id: user.id } : null)
      if (user && user.estudiante) {
        student = user.estudiante
      }
    }

    if (!student) {
      const r = { error: "Estudiante no encontrado" }
      console.error('generateStudyGuide returning (no student):', r)
      try { JSON.stringify(r) } catch(e) { console.error('Serialization error for no student return', e) }
      return r
    }

    // Fetch active inscriptions (separately for better control and compatibility)
    activeInscripciones = await prisma.inscripcion.findMany({
      where: { student_id: student.id_estudiante, status: 'ACTIVE' },
      include: {
        course: true,
        submissions: { orderBy: { submitted_at: 'desc' }, take: 5 },
      },
    })

    academicHistoryRows = await prisma.historial_academico.findMany({
      where: { id_estudiante: student.id_estudiante },
      orderBy: { fecha: 'desc' },
      take: 5,
      include: { imparte: { include: { nivel: true } } },
    })
  } catch (e) {
    console.error('Database query error in generateStudyGuide', e)
    const r = { error: 'Error interno al consultar datos del estudiante' }
    console.error('generateStudyGuide returning (db error):', r)
    try { JSON.stringify(r) } catch(e) { console.error('Serialization error for db error return', e) }
    return r
  }

  if (!student) {
    const r = { error: "Estudiante no encontrado" }
    console.error('generateStudyGuide returning (no student after queries):', r)
    try { JSON.stringify(r) } catch(e) { console.error('Serialization error for no student after queries return', e) }
    return r
  }

  // Construct context from student data
  const activeCourses = activeInscripciones.map(ins => {
    const course = ins.course
    let contentDescription = ''

    // Try to use the new CourseModule structure first
    if (course.modules && course.modules.length > 0) {
      contentDescription = course.modules.map((mod: any) => {
        const lessons = mod.lessons.map((les: any) => `- ${les.title}`).join(', ')
        return `  * Módulo: ${mod.title} (${lessons})`
      }).join('\n')
    } 
    // Fallback to legacy JSON course_content
    else if (course.course_content) {
      try {
        const parsedContent = JSON.parse(course.course_content)
        if (Array.isArray(parsedContent)) {
           contentDescription = parsedContent.map((mod: any) => {
             const topics = mod.topics ? mod.topics.map((t: any) => `- ${t.title}`).join(', ') : ''
             return `  * Módulo: ${mod.title} (${topics})`
           }).join('\n')
        }
      } catch (e) {
        contentDescription = '  (Contenido disponible pero no estructurado)'
      }
    }

    return `- Curso: ${course.nombre} (ID: ${course.id_curso})\n  Nivel: ${course.nivel_ingles || 'N/A'}\n  Contenido:\n${contentDescription}`
  }).join('\n\n')

  const recentActivity = activeInscripciones.flatMap(i => i.submissions).map(sub => 
    `- Entrega reciente: Estado ${sub.status}, Puntaje ${sub.score || 'N/A'}`
  ).join('\n')

  const academicHistory = academicHistoryRows.map(h => 
    `- ${h.imparte.nivel.nombre}: Calificación ${h.calificacion || 'N/A'} (${h.fecha?.toLocaleDateString()})`
  ).join('\n')

  // Map nivel_ingles to CEFR levels for better AI context
  const cefrMap: Record<string, string> = {
    'Básico': 'A1-A2 (Beginner)',
    'Intermedio': 'B1-B2 (Intermediate)', 
    'Avanzado': 'C1-C2 (Advanced)'
  }
  const cefrLevel = cefrMap[student.nivel_ingles] || student.nivel_ingles || 'N/A'
  
  // Identify weak areas from recent submissions
  const weakAreas = activeInscripciones
    .flatMap(i => i.submissions)
    .filter(s => s.score !== null && s.score < 70)
    .slice(0, 3)
    .map(s => `Score ${s.score}% en actividad reciente`)
    .join(', ')
  
  // Construir contexto del estudiante SIN PII
  const studentContext = `
  Perfil del Estudiante:
  - Nivel: ${cefrLevel}
  - Áreas de mejora detectadas: ${weakAreas || 'No hay datos suficientes'}
  
  Cursos Activos y Contenido:
  ${activeCourses || 'No hay cursos activos actualmente.'}
  
  Historial Académico (últimos 5 registros):
  ${academicHistory || 'Sin historial reciente.'}
  
  Actividad Reciente:
  ${recentActivity || 'Sin actividad reciente.'}
  `

  // 2. Generate content with AI with enhanced prompt
  const prompt = `
  Contexto del Estudiante (Datos Reales):
  ${studentContext}

  TAREA: Genera una guía de estudio PERSONALIZADA, INTERACTIVA y PRÁCTICA para aprender inglés sobre: "${topic}"
  
  REGLAS CRÍTICAS (OBLIGATORIAS):
  1. Devuelve EXCLUSIVAMENTE un objeto JSON válido como salida. NO agregues texto fuera del JSON.
  2. NO uses bloques de código markdown (\`\`\`json ... \`\`\`). Devuelve solo el JSON crudo.
  3. NO incluyas emojis, iconos ni símbolos pictográficos en los campos JSON (por ejemplo: checkmark o icono). 
  4. NO uses tablas Markdown, caracteres de tabla (por ejemplo, |) o encabezados de tabla; usa arrays y listas planas.
  5. Todas las explicaciones en ESPAÑOL, ejemplos y ejercicios en INGLÉS.
  6. Adapta la dificultad al nivel CEFR del estudiante (ver contexto arriba).
  7. Relaciona el tema con sus cursos activos cuando sea relevante.
  
  ESTRUCTURA JSON REQUERIDA (FORMATO ESTRUCTURADO DE CONTENT):
  {
    "title": "Título Creativo de la Guía",
    "metadata": {
      "topic": "${topic}",
      "level": "Nivel CEFR",
      "estimatedTime": "Tiempo estimado (ej. 15 min)"
    },
    "sections": [
      {
        "id": "intro",
        "title": "Introduccion Personalizada",
        "type": "content",
        "content": {
          "blocks": [
            { "type": "subtitle", "text": "Por qué este tema es importante" },
            { "type": "paragraph", "text": "Explicación de la relevancia (2-3 oraciones)." },
            { "type": "subtitle", "text": "Cómo se relaciona con tu nivel actual" },
            { "type": "paragraph", "text": "Conexión con el nivel CEFR del estudiante (2-3 oraciones)." },
            { "type": "subtitle", "text": "Objetivos de aprendizaje" },
            { "type": "list", "style": "numbered", "items": ["Objetivo específico 1", "Objetivo específico 2", "Objetivo específico 3"] }
          ]
        },
        "keywords": [{ "word": "término clave", "phonetic": "IPA si aplica", "example": "Frase de ejemplo en inglés" }]
      },
      {
        "id": "concepts",
        "title": "Conceptos Fundamentales",
        "type": "content",
        "content": {
          "blocks": [
            { "type": "subtitle", "text": "Regla Principal" },
            { "type": "paragraph", "text": "Explicación clara de la regla fundamental (2-3 oraciones)." },
            { "type": "subtitle", "text": "Cómo funciona" },
            { "type": "list", "style": "numbered", "items": ["Primera característica o paso","Segunda característica o paso","Tercera característica o paso"] },
            { "type": "subtitle", "text": "Ejemplos claros" },
            { "type": "blockquote", "text": "**Ejemplo 1:** English sentence example\nTraducción al español y breve explicación." },
            { "type": "blockquote", "text": "**Ejemplo 2:** Another English sentence\nSu traducción y explicación del uso." },
            { "type": "blockquote", "text": "**Ejemplo 3:** One more example sentence\nTraducción y nota sobre el contexto." },
            { "type": "subtitle", "text": "Puntos clave a recordar" },
            { "type": "list", "style": "bullet", "items": ["Punto importante 1 explicado brevemente","Punto importante 2 con detalle","Punto importante 3 con ejemplo"] },
            { "type": "subtitle", "text": "Casos especiales" },
            { "type": "paragraph", "text": "Explicación de excepciones (2-3 oraciones) con ejemplos concretos." }
          ]
        },
        "keywords": [{ "word": "grammar term", "phonetic": "", "example": "Example sentence" }]
      },
      {
        "id": "common-mistakes",
        "title": "Errores Comunes",
        "type": "content",
        "content": {
          "blocks": [
            { "type": "subtitle", "text": "Error 1: Título descriptivo del error" },
            { "type": "paragraph", "text": "Incorrecto:" },
            { "type": "blockquote", "text": "Wrong example sentence" },
            { "type": "paragraph", "text": "Correcto:" },
            { "type": "blockquote", "text": "Correct example sentence" },
            { "type": "paragraph", "text": "Por qué es incorrecto: Explicación clara del error (1-2 oraciones)." },
            { "type": "paragraph", "text": "Regla a recordar: Consejo práctico y memorable." },
            { "type": "hr" },
            { "type": "subtitle", "text": "Error 2: Otro error común" },
            { "type": "paragraph", "text": "Incorrecto:" },
            { "type": "blockquote", "text": "Another wrong example" },
            { "type": "paragraph", "text": "Correcto:" },
            { "type": "blockquote", "text": "Correct version" },
            { "type": "paragraph", "text": "Por qué es incorrecto: Explicación del problema." },
            { "type": "paragraph", "text": "Regla a recordar: Tip para recordar." },
            { "type": "hr" },
            { "type": "subtitle", "text": "Error 3: Tercer error típico" },
            { "type": "paragraph", "text": "Incorrecto:" },
            { "type": "blockquote", "text": "Third wrong example" },
            { "type": "paragraph", "text": "Correcto:" },
            { "type": "blockquote", "text": "Fixed version" },
            { "type": "paragraph", "text": "Por qué es incorrecto: Razón del error." },
            { "type": "paragraph", "text": "Regla a recordar: Consejos para evitarlo." }
          ]
        },
        "keywords": []
      },
      {
        "id": "practice",
        "title": "Practica Conversacional",
        "type": "content",
        "content": {
          "blocks": [
            { "type": "subtitle", "text": "Situación 1: En un restaurante" },
            { "type": "dialogue", "dialogue": [
              { "role": "Sarah", "text": "How about trying that new Italian place?" },
              { "role": "Mike", "text": "That sounds great! What time shall we go?" },
              { "role": "Sarah", "text": "How about 7 PM?" }
            ] },
            { "type": "list", "style": "bullet", "items": ["'How about' + gerundio para sugerencias informales","'Shall we' para confirmar planes"] },
            { "type": "hr" },
            { "type": "subtitle", "text": "Situación 2: Planificando el fin de semana" },
            { "type": "dialogue", "dialogue": [
              { "role": "Ana", "text": "What about going to the beach this weekend?" },
              { "role": "Carlos", "text": "I'd love to! Should we invite the others?" },
              { "role": "Ana", "text": "Yes, let's meet at my place first." }
            ] },
            { "type": "list", "style": "bullet", "items": ["'What about' es intercambiable con 'how about'","'Let's' para propuestas directas"] },
            { "type": "hr" },
            { "type": "subtitle", "text": "Situación 3: En la oficina" },
            { "type": "dialogue", "dialogue": [
              { "role": "Boss", "text": "Shall we schedule the meeting for Tuesday?" },
              { "role": "Employee", "text": "That works for me. What time would be best?" },
              { "role": "Boss", "text": "How about 2 PM?" }
            ] },
            { "type": "list", "style": "bullet", "items": ["'Shall' es más formal","Útil en contextos profesionales"] }
          ]
        },
        "keywords": []
      },
      {
        "id": "quiz",
        "title": "Autoevaluacion",
        "type": "quiz",
        "questions": [
          {
            "question": "Pregunta en inglés adaptada al nivel del estudiante",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Explicación detallada en español de por qué esta opción es correcta y las otras incorrectas."
          {
            "id": "common-mistakes",
            "title": "Errores Comunes",
            "type": "content",
            "content": {
              "blocks": [
                { "type": "subtitle", "text": "Error 1: Usar 'to' después del modal" },
                { "type": "paragraph", "text": "Incorrecto:" },
                { "type": "blockquote", "text": "You should to go" },
                { "type": "paragraph", "text": "Correcto:" },
                { "type": "blockquote", "text": "You should go now" },
                { "type": "paragraph", "text": "Por qué es incorrecto: Muchos hispanohablantes tienden a usar 'to' después de modales por influencia del español." },
                { "type": "paragraph", "text": "Regla a recordar: Los modales NO van seguidos de 'to'" },
                { "type": "hr" },
                { "type": "subtitle", "text": "Error 2: Conjugar el modal en tercera persona" },
                { "type": "paragraph", "text": "Incorrecto:" },
                { "type": "blockquote", "text": "She cans speak three languages" },
                { "type": "paragraph", "text": "Correcto:" },
                { "type": "blockquote", "text": "She can speak three languages" },
                { "type": "paragraph", "text": "Por qué es incorrecto: Los modales no se conjugan." },
                { "type": "paragraph", "text": "Regla a recordar: Usa la forma base sin 's'" },
                { "type": "hr" },
                { "type": "subtitle", "text": "Error 3: Confundir 'Mustn't' con 'Don't have to'" },
                { "type": "paragraph", "text": "Incorrecto:" },
                { "type": "blockquote", "text": "I mustnt go to the party if I don't want" },
                { "type": "paragraph", "text": "Correcto:" },
                { "type": "blockquote", "text": "I don't have to go to the party if I don't want" },
                { "type": "paragraph", "text": "Por qué es incorrecto: 'Mustn't' expresa prohibición, mientras 'don't have to' no." }
              ]
            },
        "title": "Recursos para Profundizar",
        "type": "resources",
        "internal": [{ "title": "Lección X del Curso Y", "description": "Repasa esto porque...", "link": "/Students/Courses/{ID}" }],
        "external": [
          { "title": "Video/Podcast/Ejercicio", "description": "Qué aprenderás", "link": "URL", "type": "video|podcast|exercise|website" }
        {
          "id": "practice",
          "title": "Practica Conversacional",
          "type": "content",
          "content": {
            "blocks": [
              { "type": "subtitle", "text": "Situación 1: Solicitando ayuda" },
              { "type": "dialogue", "dialogue": [
                { "role": "A", "text": "Excuse me, I am lost. Could you tell me where the nearest train station is?" },
                { "role": "B", "text": "Yes, of course. You must walk straight for two blocks, then you should turn left." }
              ] },
              { "type": "hr" },
              { "type": "subtitle", "text": "Situación 2: Dando un consejo de salud" },
              { "type": "dialogue", "dialogue": [
                { "role": "A", "text": "I feel terrible. I haven't slept well all week." },
                { "role": "B", "text": "Oh dear. You should drink some herbal tea and you must try to relax this evening." }
              ] },
              { "type": "hr" },
              { "type": "subtitle", "text": "Situación 3: Expresando habilidad y posibilidad" },
              { "type": "dialogue", "dialogue": [
                { "role": "A", "text": "Can your son lift that heavy box?" },
                { "role": "B", "text": "He is very strong, so he can probably lift it. But he might need help with the largest one." }
              ] }
            ]
          },
  INSTRUCCIONES CRÍTICAS DE FORMATO:
  
  **MUY IMPORTANTE - DEBES INCLUIR SALTOS DE LÍNEA REALES:**
  - Cada salto de línea debe ser un \\n literal en el string JSON
  - Usa \\n\\n para separar párrafos y secciones
  - NO escribas todo en una sola línea continua
  - Usa ### seguido de \\n\\n para subsecciones
  - Usa > seguido de espacio para bloques de cita
  - Usa --- entre subsecciones con \\n\\n antes y después
  
  **FORMATO MARKDOWN REQUERIDO:**
  - ### Título de Subsección (siempre seguido de \\n\\n)
  - Listas numeradas: 1. Item\\n2. Item\\n3. Item
  - Listas con viñetas: - Item\\n- Item\\n- Item
  - Bloques de cita: > Texto citado (para ejemplos)
  - Separadores: \\n\\n---\\n\\n
  - Énfasis: **texto en negrita**
  
  **EJEMPLO REAL DE FORMATO CORRECTO EN EL CAMPO content:**
  "### Por qué es importante\\n\\nEste tema te ayudará a comunicarte mejor en situaciones cotidianas.\\n\\n### Cómo funciona\\n\\n1. Identifica el contexto\\n2. Elige la estructura apropiada\\n3. Practica con ejemplos\\n\\n### Ejemplos claros\\n\\n> **Ejemplo 1:** How about going to the movies?\\n> ¿Qué tal si vamos al cine?\\n\\n> **Ejemplo 2:** Shall we meet at 5 PM?\\n> ¿Nos encontramos a las 5 PM?\\n\\n---\\n\\n### Puntos clave\\n\\n- Usa 'shall' para sugerencias formales\\n- Usa 'how about' para propuestas casuales\\n- El gerundio (-ing) va después de 'about'"
  
  **POR SECCIÓN:**
  - **Introducción**: Divide en 3 subsecciones con ### y \\n\\n entre ellas. Conecta "${topic}" con el estudiante.
  - **Conceptos**: Mínimo 5 subsecciones (Regla Principal, Cómo funciona, Ejemplos, Puntos clave, Casos especiales). 3+ ejemplos en bloques de cita. 200+ palabras.
  - **Errores Comunes**: 3-5 errores, cada uno en ### con Incorrecto (>), Correcto (>), Explicación, Regla. Separar con ---
  - **Práctica Conversacional**: 3 diálogos con ### Situación, formato de diálogo, y Notas. Separar con ---
  - **Quiz**: 4-5 preguntas variadas (selección múltiple, identificar errores, completar)
  - **Keywords**: 5-8 términos con IPA
  - **Recursos**: Internos (si aplica) + 2-3 externos
  
  TONO: Motivador, claro, didáctico. Actúa como tutor experto que conoce al estudiante.`

  let aiResponse
  try {
    const systemInstruction = `Eres un EXPERTO profesor de inglés ESL y diseñador instruccional. IMPORTANTE: Tu salida debe ser EXCLUSIVAMENTE JSON válido. NO incluyas texto antes ni después del JSON. NO uses bloques de código markdown (escribe "no code fences"). NO incluyas emojis ni símbolos pictográficos. NO uses caracteres de tabla (p. ej. |) ni tablas Markdown. CRÍTICO: **EL CAMPO 'content' EN CADA SECCIÓN DEBE SER UN OBJETO ESTRUCTURADO, NO UN STRING.**
      Específicamente, cada content debe tener la forma: { "blocks": [ { "type": "subtitle|paragraph|list|blockquote|dialogue|hr|code", "text": "..." , "items": ["..."], "dialogue": [{"role":"A","text":"..."}] } ] }
      - Para listas usa "type":"list" y agrega 'style': 'bullet' o 'numbered' y 'items' como arreglo de strings.
      - Para diálogos usa "type":"dialogue" y agrega 'dialogue' con objetos { role, text }.
      - Para blockquotes usa "type":"blockquote" y 'text'. Para separadores usa "type":"hr".
      - Inserta SALTOS DE LÍNEA REALES (\n\n) en las cadenas 'text' donde correspondan para separar párrafos dentro de 'text'.
      - NO escribas todo en una línea continua.
      - Si necesitas incluir ejemplos, usa objetos de tipo 'blockquote'.
      - No uses emojis ni caracteres de tabla.
    Prioriza LEGIBILIDAD y ESTRUCTURA JERÁRQUICA en el JSON. Las letras con acentos están permitidas.`
    
    aiResponse = await generateGeminiResponse(prompt, systemInstruction)
  } catch (e) {
    console.error('AI generation error', e)
    const r = { error: 'Error al generar la guía con IA' }
    console.error('generateStudyGuide returning (AI error):', r)
    try { JSON.stringify(r) } catch(e) { console.error('Serialization error for AI error return', e) }
    return r
  }

  if (!aiResponse || !aiResponse.reply) {
    console.error('AI returned invalid response', aiResponse)
    // If the AI response contains a helpful message, return it for debugging
    if (aiResponse && typeof aiResponse === 'object') {
      const maybeMsg = (aiResponse as any).reply || (aiResponse as any).error
      if (maybeMsg && typeof maybeMsg === 'string' && maybeMsg.includes('OPENROUTER_API_KEY')) {
        return { error: 'AI key missing. Configurar OPENROUTER_API_KEY en el servidor.' }
      }
    }
    const r = { error: "Error al generar la guía con IA" }
    console.error('generateStudyGuide returning (AI invalid reply):', r)
    try { JSON.stringify(r) } catch(e) { console.error('Serialization error for AI invalid reply return', e) }
    return r
  }

  // Check for explicit error messages from the assistant action
  if (aiResponse.reply.startsWith('Error desde Gemini') || aiResponse.reply.startsWith('Error: GEMINI_API_KEY')) {
    console.error('AI generation failed:', aiResponse.reply)
    
    // Check for rate limit specifically
    if (aiResponse.reply.includes('429')) {
      return { error: 'Límite de uso de IA excedido. Por favor intenta más tarde o contacta al administrador.' }
    }
    // Handle model overload (503) more clearly
    if (aiResponse.reply.includes('503') || aiResponse.reply.toLowerCase().includes('model is overloaded')) {
      return { error: 'El servicio de IA está temporalmente saturado (503). Intenta de nuevo en unos minutos.' }
    }
    
    return { error: 'Error en el servicio de IA: ' + aiResponse.reply }
  }

  // 3. Parse and validate AI response with robust error handling
  try {
    let rawContent = aiResponse.reply
      
      // Clean up various markdown code block formats
      rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/g, '').trim()
      
      // Try to extract JSON if wrapped in other text
      const jsonMatch = rawContent.match(/\{[\s\S]*"sections"[\s\S]*\}/)
      if (jsonMatch) {
        rawContent = jsonMatch[0]
      }

      let guideData: any
      try {
        guideData = JSON.parse(rawContent)
        // Sanitize all strings in the parsed object to remove disallowed formatting
        try {
          guideData = sanitizeObject(guideData)
          // If disallowed patterns remain, try re-sanitizing a couple more times
          for (let i = 0; i < 2 && containsDisallowedPatterns(guideData); i++) {
            guideData = sanitizeObject(guideData)
          }
          if (containsDisallowedPatterns(guideData)) {
            throw new Error('Disallowed characters detected after sanitization')
          }
        } catch (sanitizeErr) {
          console.warn('Failed to sanitize AI output; continuing with raw parsed object', sanitizeErr)
        }
        
        // Validate structure
        if (!guideData.sections || !Array.isArray(guideData.sections) || guideData.sections.length === 0) {
          throw new Error('Invalid structure: missing or empty sections array')
        }
        // Validate final shape
        if (!validateGuideStructure(guideData)) {
          throw new Error('Invalid structure: guide JSON does not meet required schema after sanitation')
        }
        
        console.log('Successfully parsed AI JSON with', guideData.sections.length, 'sections')
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.log('Raw AI response (first 500 chars):', rawContent.substring(0, 500))
        
        // Fallback: wrap markdown content into structured blocks
        const fallbackBlocks = textToBlocks(sanitizeString(aiResponse.reply))
        guideData = {
          sections: [
            {
              id: 'main',
              title: 'Guía de Estudio',
              type: 'content',
              content: fallbackBlocks,
              keywords: extractKeywordsFromText(sanitizeString(aiResponse.reply), 8)
            }
          ]
        }
        console.warn('Falling back to markdown wrapper due to parse error')
      }

      // Ensure sections array exists and each section has keywords
      if (!guideData.sections || !Array.isArray(guideData.sections)) {
         guideData = {
          sections: [
            {
              id: 'main',
              title: 'Guía de Estudio',
              type: 'content',
              content: sanitizeString(typeof guideData === 'string' ? guideData : JSON.stringify(guideData)),
              keywords: []
            }
          ]
        }
      }

      // Ensure each section has keywords (AI may include this, else generate fallback)
      guideData.sections = guideData.sections.map((s: any) => {
        // If content is a plain string, convert it to structured blocks
        if (s.content && typeof s.content === 'string') {
          s.content = textToBlocks(sanitizeString(s.content))
        }
        // If content is an object with blocks, sanitize them
        if (s.content && typeof s.content === 'object' && Array.isArray(s.content.blocks)) {
          s.content.blocks = s.content.blocks.map((b: any) => {
            if (b.text && typeof b.text === 'string') b.text = sanitizeString(b.text)
            if (Array.isArray(b.items)) b.items = b.items.map((it: any) => typeof it === 'string' ? sanitizeString(it) : it)
            if (Array.isArray(b.dialogue)) b.dialogue = b.dialogue.map((d: any) => ({ role: d.role, text: sanitizeString(d.text) }))
            return b
          })
        }
        if (!s.keywords || !Array.isArray(s.keywords) || s.keywords.length === 0) {
          const textSource = (s.content && typeof s.content === 'object' && Array.isArray(s.content.blocks))
            ? s.content.blocks.map((b: any) => (b.text ? b.text : (b.items && b.items.join(' ')) || '')).join('\n\n')
            : JSON.stringify(s)
          s.keywords = extractKeywordsFromText(textSource, 8)
        }
        return s
      })

      // Append recommended YouTube videos (if API key configured)
      try {
        const videos = await searchYouTube(`${topic} learn English tutorial`, 3)
        if (videos && videos.length > 0) {
          let resourceSection = guideData.sections.find((s: any) => s.type === 'resources')
          if (!resourceSection) {
            resourceSection = {
              id: 'resources',
              title: 'Recursos Recomendados',
              type: 'resources',
              internal: [],
              external: []
            }
            guideData.sections.push(resourceSection)
          }
          if (!resourceSection.external) resourceSection.external = []
          
          for (const v of videos) {
            // Avoid duplicates
            if (!resourceSection.external.some((e: any) => e.link === v.url)) {
              resourceSection.external.push({
                title: v.title,
                description: `Video tutorial de inglés: ${v.channelTitle}`,
                link: v.url,
                type: 'video'
              })
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch YouTube resources', err)
      }

      const finalContent = guideData
      
      // Auto-save to database
      try {
        const prismaAny = prisma as any
        if (!prismaAny.study_guide) {
          // Fallback for environments without the model
          const guide = {
            id: Math.floor(Date.now() / 1000),
            title: topic,
            content: finalContent,
            created_at: new Date(),
            student_id: student.id_estudiante
          }
          const serializedGuide = { id: guide.id, title: guide.title, content: guide.content, created_at: guide.created_at?.toISOString(), student_id: guide.student_id };
          const r = { success: true, guide: serializedGuide, savedToDb: false };
          console.log('generateStudyGuide returning (success, no DB):', { id: guide.id, title: guide.title })
          return r
        }
        
        // Create in database
        const savedGuide = await prismaAny.study_guide.create({
          data: {
            title: topic,
            content: JSON.stringify(finalContent),
            student_id: student.id_estudiante,
          },
        })
        
        const serializedGuide = serializeGuide(savedGuide);
        const r = { success: true, guide: serializedGuide, savedToDb: true };
        console.log('generateStudyGuide returning (success, saved to DB):', { id: savedGuide.id, title: savedGuide.title })
        try { JSON.stringify(r) } catch (e) { console.error('generateStudyGuide return serialization error', e) }
        return r
      } catch (error) {
        console.error("Error saving study guide to database:", error)
        const r = { error: "Error al guardar la guía en la base de datos" }
        console.error('generateStudyGuide returning (save error):', r)
        try { JSON.stringify(r) } catch(e) { console.error('Serialization error for save error return', e) }
        return r
      }
    } catch (err) {
      console.error('Unexpected error in generateStudyGuide', err)
      const r = { error: 'Error interno al generar la guía' }
      console.error('generateStudyGuide returning (unexpected):', r)
      try { JSON.stringify(r) } catch(e) { console.error('Serialization error for unexpected error return', e) }
      return r
    }
  } catch (err) {
    console.error('Unexpected error in generateStudyGuide', err)
    const r = { error: 'Error interno al generar la guía' }
    console.error('generateStudyGuide returning (unexpected):', r)
    try { JSON.stringify(r) } catch(e) { console.error('Serialization error for unexpected error return', e) }
    return r
  }
}

export async function getStudyGuides() {
  const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

  // Avoid logging PII
  console.log('getStudyGuides session id:', { id: session?.user?.id })
  let student = await prisma.estudiante.findUnique({
    where: { id_usuario: parseInt(session.user.id) },
  })
  if (!student && session.user.email) {
    console.warn('getStudyGuides: student not found by id, attempting fallback via usuario.email')
    const user = await prisma.usuario.findUnique({ where: { email: session.user.email }, include: { estudiante: true } })
    if (user && user.estudiante) student = user.estudiante
  }

  if (!student) return []

  const prismaAny = prisma as any
  if (!prismaAny.study_guide) return []
  const guides = await prismaAny.study_guide.findMany({
    where: { student_id: student.id_estudiante },
    orderBy: { created_at: 'desc' },
  })
  return guides.map(serializeGuide)
}

export async function deleteStudyGuide(id: number) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "No autorizado" }

  console.log('deleteStudyGuide session id:', { id: session?.user?.id })
  try {
    const prismaAny = prisma as any
    if (!prismaAny.study_guide) return { error: 'deleteStudyGuide not supported on this schema' }
    await prismaAny.study_guide.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error("Error deleting study guide:", error)
    return { error: "Error al eliminar la guía" }
  }
}

export async function saveStudyGuide(title: string, content: string | object) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "No autorizado" }

  console.log('saveStudyGuide session id:', { id: session?.user?.id })
  let student = await prisma.estudiante.findUnique({
    where: { id_usuario: parseInt(session.user.id) },
  })
  if (!student && session.user.email) {
    console.warn('saveStudyGuide: student not found by id, attempting fallback via usuario.email')
    const user = await prisma.usuario.findUnique({ where: { email: session.user.email }, include: { estudiante: true } })
    if (user && user.estudiante) student = user.estudiante
  }
  if (!student) return { error: "Estudiante no encontrado" }

  try {
    // Accept either a string (markdown or JSON string) or structured object
    let parsedContent: any = null
    if (typeof content === 'string') {
      // try parse JSON
      try { parsedContent = JSON.parse(content) } catch (e) { parsedContent = null }
      if (!parsedContent) {
        // treat as plain text and convert to blocks
        parsedContent = { sections: [ { id: 'main', title, type: 'content', content: textToBlocks(sanitizeString(content)), keywords: [] } ] }
      }
    } else if (typeof content === 'object') {
      parsedContent = content
    }
    // Append recommended YouTube videos (if not present already) to a 'resources' section
    try {
      const videos = await searchYouTube(`${title} learn English tutorial`, 3)
      if (videos && videos.length > 0) {
        // Find resources section if present
        if (!parsedContent.sections) parsedContent.sections = []
        let resourceSection = parsedContent.sections.find((s: any) => s.type === 'resources')
        if (!resourceSection) {
          resourceSection = { id: 'resources', title: 'Recursos Recomendados', type: 'resources', internal: [], external: [], keywords: [] }
          parsedContent.sections.push(resourceSection)
        }
        if (!resourceSection.external) resourceSection.external = []
        for (const v of videos) {
          if (!resourceSection.external.some((e: any) => e.link === v.url)) {
            resourceSection.external.push({ title: v.title, description: `Video tutorial de inglés: ${v.channelTitle}`, link: v.url, type: 'video' })
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch YouTube resources for saveStudyGuide', err)
    }
    // If the content is JSON with sections, ensure keywords exist per section
    // Ensure each section has keywords
    parsedContent.sections = parsedContent.sections.map((s: any) => {
      if (!s.keywords || !Array.isArray(s.keywords) || s.keywords.length === 0) {
        const textSource = typeof s.content === 'string' ? s.content : (s.content && s.content.blocks ? s.content.blocks.map((b: any) => b.text || (b.items && b.items.join(' '))).join('\n\n') : JSON.stringify(s))
        s.keywords = extractKeywordsFromText(textSource, 6)
      }
      return s
    })

    const prismaAny = prisma as any
    if (!prismaAny.study_guide) return { success: true, guide: { id: Math.floor(Date.now()/1000), title, content: parsedContent, created_at: new Date().toISOString(), student_id: student.id_estudiante } }
    const guide = await prismaAny.study_guide.create({
      data: {
        title,
        content: parsedContent,
        student_id: student.id_estudiante,
      },
    })
    return { success: true, guide: serializeGuide(guide) }
  } catch (error) {
    console.error("Error saving study guide:", error)
    return { error: "Error al guardar la guía" }
  }
}

export async function updateStudyGuide(id: number, title: string, content: string | object) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "No autorizado" }
  }
  console.log('updateStudyGuide session id:', { id: session?.user?.id })

  try {
    let parsedContent: any = null
    if (typeof content === 'string') {
      try { parsedContent = JSON.parse(content) } catch (e) { parsedContent = { sections: [ { id: 'main', title, type: 'content', content: textToBlocks(sanitizeString(content)), keywords: [] } ] } }
    } else {
      parsedContent = content
    }
    if (parsedContent && parsedContent.sections) {
      parsedContent.sections = parsedContent.sections.map((s: any) => {
        if (!s.keywords || !Array.isArray(s.keywords) || s.keywords.length === 0) {
          const textSource = typeof s.content === 'string' ? s.content : (s.content && s.content.blocks ? s.content.blocks.map((b: any) => b.text || (b.items && b.items.join(' '))).join('\n\n') : JSON.stringify(s))
          s.keywords = extractKeywordsFromText(textSource, 6)
        }
        return s
      })
    }
    const prismaAny = prisma as any
    if (!prismaAny.study_guide) return { success: true, guide: { id, title, content: parsedContent, created_at: new Date().toISOString(), student_id: 0 } }
    const updated = await prismaAny.study_guide.update({
      where: { id },
      data: { title, content: parsedContent },
    })
    return { success: true, guide: serializeGuide(updated) }
  } catch (error) {
    console.error("Error updating study guide:", error)
    return { error: "Error al actualizar la guía" }
  }
}
