export function contentToString(content: any) {
  if (!content) return ''
  if (typeof content === 'string') return content
  try {
    // blocks-based content
    if (Array.isArray(content.blocks)) {
      return content.blocks.map((b: any) => {
        if (typeof b.text === 'string') return b.text
        if (Array.isArray(b.items)) return b.items.join(' ')
        if (b.type === 'dialogue' && Array.isArray(b.dialogue)) return b.dialogue.map((d: any) => `${d.role}: ${d.text}`).join('\n')
        return ''
      }).filter(Boolean).join('\n\n')
    }
    // sections-based content
    if (Array.isArray(content.sections)) {
      return content.sections.map((s: any) => {
        if (typeof s.content === 'string') return s.content
        if (s.content && Array.isArray(s.content.blocks)) return contentToString(s.content)
        return ''
      }).filter(Boolean).join('\n\n')
    }
    return JSON.stringify(content, null, 2)
  } catch (e) {
    return String(content)
  }
}

export function extractKeywordsFromText(text: string, limit = 6) {
  if (!text) return []
  const stopwords = new Set([
    'the','and','a','an','in','on','of','to','for','with','is','are','be','by','this','that','these','those','as','it','you','your','he','she','we','they','i','me','my','not','do','did','will','would','can','could','may','might',
    'el','la','los','las','un','una','y','o','de','en','del','al','que','por','para','con','su','se','es','son','como','pero','si','mas','muy'
  ])
  const words = text.replace(/[<>/"'\*#\[\]\(\)]/g, ' ').replace(/\W+/g, ' ').toLowerCase().split(/\s+/).filter(Boolean)
  const freq: Record<string, number> = {}
  for (const w of words) {
    if (w.length < 3) continue
    if (stopwords.has(w)) continue
    if (/^\d+$/.test(w)) continue
    freq[w] = (freq[w] || 0) + 1
  }
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a])
  const keywords = []
  for (let i = 0; i < Math.min(limit, sorted.length); i++) {
    const word = sorted[i]
    keywords.push({ word, phonetic: '', example: '' })
  }
  return keywords
}

export function tryParseJson(input: any): { sections: any[] } | null {
  if (!input) return null
  const str = String(input)

  // If input is already an object -> try to detect supported content shapes
  if (typeof input === 'object') {
    // Already has sections
    if (Array.isArray((input as any).sections)) return input
    // Already has blocks (legacy new structure): wrap into a single section
    if (Array.isArray((input as any).blocks)) {
      return {
        sections: [
          {
            id: 'content',
            title: (input.title || 'Contenido'),
            type: 'content',
            content: input
          }
        ]
      } as any
    }
    // If it's a top level object with nested content property holding blocks
    if (input.content && Array.isArray(input.content.blocks)) {
      return {
        sections: [
          {
            id: 'content',
            title: (input.title || 'Contenido'),
            type: 'content',
            content: input.content
          }
        ]
      } as any
    }
  }

  try {
    // 1. Direct parse attempt
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) {
      return parsed
    }
  } catch (e) {
    // Continue to cleanup strategies
  }

  try {
    // 2. Clean up markdown code blocks
    // Remove ```json at start, ``` at start, and ``` at end
    let cleaned = str
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```\s*$/, '')
      .trim()
    
    const parsed = JSON.parse(cleaned)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) {
      return parsed
    }
  } catch (e) {
    // Continue to extraction strategy
  }

  try {
    // 3. Aggressive extraction: Find the outermost JSON object
    const firstBrace = str.indexOf('{')
    const lastBrace = str.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = str.substring(firstBrace, lastBrace + 1)
      const parsed = JSON.parse(jsonCandidate)
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) {
        return parsed
      }
    }
  } catch (e) {
    console.error("Failed to parse study guide JSON:", e)
  }
  
  return null
}
