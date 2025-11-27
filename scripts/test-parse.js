// A small test harness to replicate the parsing and sanitization flow used in studyGuideAction.ts

function sanitizeString(s) {
  if (typeof s !== 'string') return s
  let out = s
  out = out.replace(/^```json\s*/gim, '')
  out = out.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
  out = out.replace(/(^|\n)\s*#{1,6}\s*/g, '$1')
  out = out.replace(/\|/g, ' ')
  out = out.replace(/(^|\n)\s*[:\-\| ]{3,}\s*(\n|$)/g, '\n')
  try {
    out = out.replace(/\p{Extended_Pictographic}/gu, '')
  } catch (e) {
    out = out.replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
  }
  out = out.replace(/[^\p{L}\p{M}\p{N}\s\.,:;()?!%&'"\/\[\]@+\-\n]/gu, '')
  out = out.replace(/\s{2,}/g, ' ')
  return out.trim()
}

function sanitizeObject(obj) {
  if (obj == null) return obj
  if (typeof obj === 'string') return sanitizeString(obj)
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  const out = {}
  for (const k of Object.keys(obj)) {
    out[k] = sanitizeObject(obj[k])
  }
  return out
}

function validateGuideStructure(guide) {
  if (!guide || typeof guide !== 'object') return false
  if (!guide.title || typeof guide.title !== 'string') return false
  if (!guide.metadata || typeof guide.metadata !== 'object') return false
  if (!guide.metadata.topic || typeof guide.metadata.topic !== 'string') return false
  if (!guide.sections || !Array.isArray(guide.sections) || guide.sections.length === 0) return false
  for (const s of guide.sections) {
    if (!s.id || typeof s.id !== 'string') return false
    if (!s.title || typeof s.title !== 'string') return false
    if (!s.type || typeof s.type !== 'string') return false
    if (s.type === 'quiz') {
      if (!Array.isArray(s.questions) || s.questions.length === 0) return false
    }
  }
  return true
}

function containsDisallowedPatterns(obj) {
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

function parseAiReply(aiReply, topic) {
  let rawContent = aiReply
  rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim()
  const jsonMatch = rawContent.match(/\{[\s\S]*"sections"[\s\S]*\}/)
  if (jsonMatch) rawContent = jsonMatch[0]
  let guideData
  try {
    guideData = JSON.parse(rawContent)
    guideData = sanitizeObject(guideData)
    for (let i = 0; i < 3 && containsDisallowedPatterns(guideData); i++) guideData = sanitizeObject(guideData)
    if (containsDisallowedPatterns(guideData)) throw new Error('Disallowed patterns present')
    if (!validateGuideStructure(guideData)) throw new Error('Structure invalid')
    return { ok: true, data: guideData }
  } catch (e) {
    console.warn('Parse failed:', e.message)
    // Fallback wrapper
    guideData = {
      title: 'Guia de Estudio',
      metadata: { topic, level: '', estimatedTime: ''},
      sections: [
        {
          id: 'main',
          title: 'Guia de Estudio',
          type: 'content',
          content: sanitizeString(aiReply),
          keywords: []
        }
      ]
    }
    return { ok: false, data: sanitizeObject(guideData) }
  }
}

const samples = [
  {
    name: 'fenced JSON with pipes and json header',
    text: 'Some comment\n```json\n{\n "title": "My Guide|Example", "metadata": { "topic": "Test" }, "sections": [{ "id": "intro", "title": "Introduccion", "type": "content", "content": "Hola | mundo" }] }\n```'
  },
  {
    name: 'JSON with emojis',
    text: '{\n"title": "Guide 😀",\n"metadata": { "topic": "topic1" },\n"sections": [{ "id": "intro", "title": "Introduccion 😊", "type": "content", "content": "Hola mundo" }]\n}'
  },
  {
    name: 'structured content blocks',
    text: '{"title": "Guide", "metadata": { "topic": "topic1" }, "sections": [{ "id": "intro", "title": "Intro", "type": "content", "content": { "blocks": [{ "type": "subtitle", "text": "Por qué" }, { "type": "paragraph", "text": "Explicación" }, { "type": "list", "style": "bullet", "items": ["punto1","punto2"] }] } }] }'
  },
  {
    name: 'invalid JSON',
    text: 'This is not JSON \n but contains a pipe | and a table\n| col1 | col2 |\n| ---- | ---- |\n| a | b |'
  }
]

for (const s of samples) {
  console.log('--- SAMPLE:', s.name)
  const r = parseAiReply(s.text, 'Sample Topic')
  console.log('ok:', r.ok)
  console.log('data:', JSON.stringify(r.data, null, 2))
}
