function sanitizeString(s) {
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
  out = out.replace(/[^\p{L}\p{M}\p{N}\s\.,:;()?!%&'"\/\[\]@+\-\n]/gu, '')
  // Replace multiple spaces with single space
  out = out.replace(/\s{2,}/g, ' ')
  return out.trim()
}

const inputs = [
  "Here is a JSON with code fences:\n```json\n{\"title\": \"Guide|Title\"}\n```",
  "Table: | col1 | col2 |\n|------|------|\n| a | b |",
  "Emoji: This is cool ✅🎉 and fun 😄",
  "Headers:\n# Title\n## Subtitle\nContent",
]

for (const i of inputs) {
  console.log('--- ORIGINAL ---\n' + i)
  console.log('--- SANITIZED ---\n' + sanitizeString(i))
}
