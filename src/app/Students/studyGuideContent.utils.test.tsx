import { tryParseJson, contentToString } from '../../../src/lib/studyGuideUtils'

describe('StudyGuideContent utils', () => {
  test('parses sections JSON string', () => {
    const jsonStr = '{"sections":[{"id":"s1","title":"Intro","type":"content","content":"This is a test"}]}'
    const parsed = tryParseJson(jsonStr)
    expect(parsed).not.toBeNull()
    expect(Array.isArray(parsed!.sections)).toBe(true)
    expect(parsed!.sections[0].id).toBe('s1')
  })

  test('parses blocks object', () => {
    const obj = { blocks: [{ type: 'paragraph', text: 'Hello' }] }
    const parsed = tryParseJson(obj)
    expect(parsed).not.toBeNull()
    expect(parsed!.sections.length).toBe(1)
  })

  test('contentToString transforms blocks into text', () => {
    const obj = { blocks: [{ type: 'paragraph', text: 'Hello' }, { type: 'subtitle', text: 'Title' }] }
    const s = contentToString(obj)
    expect(typeof s).toBe('string')
    expect(s).toContain('Hello')
    expect(s).toContain('Title')
  })

  test('null or empty returns empty string', () => {
    expect(contentToString(null)).toBe('')
    expect(contentToString(undefined)).toBe('')
  })
})
