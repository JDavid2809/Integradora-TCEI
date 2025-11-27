import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { CheckCircle2, XCircle, PlayCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp, Volume2, BarChart3, Clipboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type Section = {
  id: string
  title: string
  type: 'content' | 'quiz' | 'resources'
  content?: string | ContentObject
  questions?: QuizQuestion[]
  internal?: Resource[]
  external?: Resource[]
  keywords?: { word: string, phonetic?: string, example?: string }[]
}

type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

type Resource = {
  title: string
  description?: string
  link: string
  type?: 'video' | 'podcast' | 'exercise' | 'website'
}

type Block =
  | { type: 'subtitle'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list'; style?: 'bullet' | 'numbered'; items: string[] }
  | { type: 'dialogue'; dialogue: { role: string; text: string }[] }
  | { type: 'hr' }
  | { type: 'code'; code: string }

type ContentObject = { blocks: Block[] }

export default function InteractiveGuide({ 
  content, 
  guideId, 
  onQuizComplete, 
  onGuideComplete 
}: { 
  content: { 
    title?: string
    metadata?: { 
      topic?: string
      level?: string
      estimatedTime?: string
    }
    sections: Section[] 
  }, 
  guideId: number,
  onQuizComplete?: (score: number) => void,
  onGuideComplete?: () => void
}) {
  const [progress, setProgress] = useState<{[key: string]: boolean}>({})
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number[]}>({})
  const [showRawJson, setShowRawJson] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem(`guide-progress-${guideId}`)
    if (saved) {
      setProgress(JSON.parse(saved))
    }
  }, [guideId])

  useEffect(() => {
    // Check if guide is fully completed
    if (content?.sections && Object.keys(progress).length === content.sections.length) {
      const allCompleted = Object.values(progress).every(Boolean)
      if (allCompleted && onGuideComplete) {
        onGuideComplete()
      }
    }
  }, [progress, content, onGuideComplete])

  // If content doesn't have sections, fallback or error
  if (!content?.sections) return <div>Error: Formato de guía inválido</div>

  const updateProgress = useCallback((sectionId: string, completed: boolean) => {
    setProgress(prev => {
      // Avoid updating state when no change
      if (prev[sectionId] === completed) return prev
      const newProgress = { ...prev, [sectionId]: completed }
      try {
        localStorage.setItem(`guide-progress-${guideId}`, JSON.stringify(newProgress))
      } catch (e) {
        console.warn('Could not persist guide progress', e)
      }
      return newProgress
    })
  }, [guideId])

  const totalSections = content.sections.length
  const completedSections = Object.values(progress).filter(Boolean).length
  const progressPercentage = Math.round((completedSections / totalSections) * 100)

  const handlers = useMemo(() => {
    const map: Record<string, () => void> = {}
    for (const s of content.sections) {
      map[s.id] = () => updateProgress(s.id, true)
    }
    return map
  }, [content.sections, updateProgress])

  const setAnswerHandlers = useMemo(() => {
    const map: Record<string, (answers: number[]) => void> = {}
    for (const s of content.sections) {
      map[s.id] = (answers: number[]) => setQuizAnswers(prev => ({ ...prev, [s.id]: answers }))
    }
    return map
  }, [content.sections])

  return (
    <div className="space-y-8 relative">
      {/* Guide Header with Metadata */}
      {content.title && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#00246a] mb-3 leading-tight">{content.title}</h1>
              {content.metadata && (
                <div className="flex flex-wrap gap-3 text-sm">
                  {content.metadata.level && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-blue-900 rounded-full font-medium shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {content.metadata.level}
                    </span>
                  )}
                  {content.metadata.estimatedTime && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full font-medium shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {content.metadata.estimatedTime}
                    </span>
                  )}
                  {content.metadata.topic && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full font-medium shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {content.metadata.topic}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sticky Progress Bar */}
      <div className="sticky top-6 z-40 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-100 shadow-sm mb-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-[#00246a]">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tu Progreso</h3>
              <p className="text-xs text-slate-500">{completedSections} de {totalSections} completado</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <span className="text-xl font-bold text-[#00246a]">{progressPercentage}%</span>
            <button
              type="button"
              title="Ver JSON crudo"
              className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100"
              onClick={() => setShowRawJson(prev => !prev)}
            >
              <Clipboard size={16} />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-[#00246a] h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage === 100 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
              <CheckCircle2 size={12} />
              ¡Guía Completada!
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {showRawJson && (
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">JSON crudo</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-sm rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100"
                  onClick={() => {
                    const raw = JSON.stringify(content, null, 2)
                    navigator.clipboard?.writeText(raw)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1600)
                  }}
                >
                  Copiar
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-sm rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100"
                  onClick={() => setShowRawJson(false)}
                >Cerrar</button>
              </div>
            </div>
            <pre className="text-xs font-mono bg-slate-50 p-3 rounded-md overflow-auto max-h-64">{JSON.stringify(content, null, 2)}</pre>
            {copied && <div className="mt-2 text-sm text-green-700">Copiado al portapapeles</div>}
          </div>
        )}
        {content.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              isCompleted={progress[section.id] || false}
              onComplete={handlers[section.id]}
              quizAnswers={quizAnswers[section.id] || []}
              setQuizAnswers={setAnswerHandlers[section.id]}
              onQuizComplete={onQuizComplete}
            />
        ))}
      </div>
    </div>
  )
}

function SectionRenderer({ section, isCompleted, onComplete, quizAnswers, setQuizAnswers, onQuizComplete }: { 
  section: Section, 
  isCompleted: boolean, 
  onComplete: () => void,
  quizAnswers: number[],
  setQuizAnswers: (answers: number[]) => void,
  onQuizComplete?: (score: number) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`border transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-5 transition-colors text-left ${isCompleted ? 'bg-green-50/50 hover:bg-green-100/50' : 'bg-white hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-[#00246a]'}`}>
            {section.type === 'quiz' && <CheckCircle2 size={24} />}
            {section.type === 'resources' && <BookOpen size={24} />}
            {section.type === 'content' && <BookOpen size={24} />}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isCompleted ? 'text-green-800' : 'text-[#00246a]'}`}>
              {section.title}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              {section.type === 'quiz' ? 'Evaluación' : section.type === 'resources' ? 'Material complementario' : 'Lección'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} />
              Completado
            </span>
          )}
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 border-t border-slate-100 bg-white">
              {section.type === 'content' && <ContentSection content={section.content || ''} onComplete={onComplete} />}
              {section.type === 'quiz' && <QuizSection questions={section.questions || []} answers={quizAnswers} setAnswers={setQuizAnswers} onComplete={onComplete} onQuizComplete={onQuizComplete} />}
              {section.type === 'resources' && <ResourcesSection internal={section.internal || []} external={section.external || []} onComplete={onComplete} />}
              {section.keywords && section.keywords.filter(k => k.word && k.word.length > 2).length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Volume2 size={16} />
                    Vocabulario Clave
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {section.keywords.filter(k => k.word && k.word.length > 2).map((k, i) => (
                      <KeywordChip key={i} keyword={k} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ContentSection({ content, onComplete }: { content: string | ContentObject, onComplete: () => void }) {
  const didCompleteRef = useRef(false)
  useEffect(() => {
    // Mark as completed when viewed only once
    if (!didCompleteRef.current) {
      onComplete()
      didCompleteRef.current = true
    }
    // We intentionally do not add onComplete to deps to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderBlocks = (obj: ContentObject) => {
    return obj.blocks.map((b, idx) => {
      switch (b.type) {
        case 'subtitle':
          return <h3 key={idx} className="text-xl font-semibold mt-6 mb-2 border-l-4 border-blue-500 pl-4">{b.text}</h3>
        case 'paragraph':
          return <p key={idx} className="mb-4">{b.text}</p>
        case 'blockquote':
          return <blockquote key={idx} className="border-l-4 border-indigo-500 bg-indigo-50 py-3 px-4 my-4 rounded-r-lg">{b.text}</blockquote>
        case 'list':
          return b.style === 'numbered' ? (
            <ol key={idx} className="mb-4 list-decimal ml-6">{b.items.map((it, i) => <li key={i} className="mb-1">{it}</li>)}</ol>
          ) : (
            <ul key={idx} className="mb-4 list-disc ml-6">{b.items.map((it, i) => <li key={i} className="mb-1">{it}</li>)}</ul>
          )
        case 'dialogue':
          return (
            <div key={idx} className="mb-4">
              {b.dialogue.map((d, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <strong className="w-24 text-slate-800">{d.role}:</strong>
                  <span className="text-slate-700">{d.text}</span>
                </div>
              ))}
            </div>
          )
        case 'hr':
          return <hr key={idx} className="my-6 border-slate-300" />
        case 'code':
          return <pre key={idx} className="bg-indigo-50 p-3 rounded text-sm font-mono">{(b as any).code}</pre>
        default:
          return <p key={idx}>{(b as any).text || ''}</p>
      }
    })
  }

  return (
    <div className="prose prose-slate prose-lg max-w-none 
      prose-headings:text-[#00246a] prose-headings:font-bold prose-headings:mb-4
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:border-l-4 prose-h3:border-blue-500 prose-h3:pl-4
      prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
      prose-strong:text-slate-900 prose-strong:font-bold
      prose-ul:text-slate-700 prose-ul:mb-4 prose-ul:space-y-2
      prose-ol:text-slate-700 prose-ol:mb-4 prose-ol:space-y-2
      prose-li:text-slate-700 prose-li:leading-relaxed
      prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:my-4 prose-blockquote:rounded-r-lg
      prose-blockquote:text-slate-800 prose-blockquote:not-italic
      prose-hr:border-slate-300 prose-hr:my-6
      prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm">
      {typeof content === 'string' ? (
        <>
          <ReactMarkdown>{content}</ReactMarkdown>
          <AudioButton text={content} />
        </>
      ) : (
        <>
          {renderBlocks(content)}
          <AudioButton text={content.blocks.map(b => (b as any).text || (b as any).items?.join(' ')).join('\n\n')} />
        </>
      )}
    </div>
  )
}

function QuizSection({ questions, answers, setAnswers, onComplete, onQuizComplete }: { 
  questions: QuizQuestion[], 
  answers: number[], 
  setAnswers: (answers: number[]) => void,
  onComplete: () => void,
  onQuizComplete?: (score: number) => void
}) {
  const [showResults, setShowResults] = useState<boolean[]>([])
  const didCompleteRef = useRef(false)

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (showResults[qIdx]) return
    const newAnswers = [...answers]
    newAnswers[qIdx] = oIdx
    setAnswers(newAnswers)
  }

  const handleCheck = (qIdx: number) => {
    const newShowResults = [...showResults]
    newShowResults[qIdx] = true
    setShowResults(newShowResults)
    
    // Check if all questions are answered
    if (answers.filter(a => a !== undefined).length === questions.length && !didCompleteRef.current) {
      // Mark section complete only once
      didCompleteRef.current = true
      onComplete()
      
      // Calculate score
      const correctAnswers = questions.filter((q, idx) => answers[idx] === q.correctAnswer).length
      const score = Math.round((correctAnswers / questions.length) * 100)
      
      if (onQuizComplete) {
        onQuizComplete(score)
      }
    }
  }

  return (
    <div className="space-y-8">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex gap-4 mb-6">
            <span className="flex-shrink-0 w-8 h-8 bg-[#00246a] text-white rounded-full flex items-center justify-center font-bold text-sm">
              {qIdx + 1}
            </span>
            <p className="font-medium text-slate-800 text-lg pt-1">{q.question}</p>
          </div>
          
          <div className="grid gap-3 pl-12">
            {q.options.map((opt, oIdx) => {
              const isSelected = answers[qIdx] === oIdx
              const isCorrect = q.correctAnswer === oIdx
              const showResult = showResults[qIdx]
              
              let className = "w-full text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden "
              if (showResult) {
                if (isCorrect) className += "bg-green-50 border-green-500 text-green-900"
                else if (isSelected) className += "bg-red-50 border-red-500 text-red-900"
                else className += "bg-white border-slate-200 opacity-50 grayscale"
              } else {
                if (isSelected) className += "bg-blue-50 border-blue-500 text-blue-900 shadow-md transform scale-[1.01]"
                else className += "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700"
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelect(qIdx, oIdx)}
                  disabled={showResult}
                  className={className}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className="font-medium">{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 size={20} className="text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-600" />}
                  </div>
                </button>
              )
            })}
          </div>
          
          {!showResults[qIdx] ? (
            <div className="pl-12 mt-6">
              <button
                onClick={() => handleCheck(qIdx)}
                disabled={answers[qIdx] === undefined}
                className="px-6 py-3 bg-[#00246a] text-white rounded-lg text-sm font-bold hover:bg-[#001a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                Verificar respuesta
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 ml-12 p-5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900"
            >
              <div className="flex gap-3">
                <div className="bg-blue-100 p-2 rounded-full h-fit">
                  <BookOpen size={16} className="text-blue-700" />
                </div>
                <div>
                  <strong className="block mb-1 text-blue-800">Explicación:</strong>
                  <p className="text-sm leading-relaxed text-blue-700/90">{q.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

function ResourcesSection({ internal, external, onComplete }: { internal: Resource[], external: Resource[], onComplete: () => void }) {
  const didCompleteRef = useRef(false)
  useEffect(() => {
    // Mark as completed when viewed only once
    if (!didCompleteRef.current) {
      onComplete()
      didCompleteRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasInternal = internal && internal.length > 0
  const hasExternal = external && external.length > 0

  if (!hasInternal && !hasExternal) {
    return (
      <div className="text-center py-8 text-slate-500">
        <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
        <p>No hay recursos disponibles para esta sección.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {hasInternal && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-[#00246a]" />
            Recursos de tus Cursos
          </h4>
          <div className="space-y-3">
            {internal.map((res, idx) => (
              <Link 
                key={idx} 
                href={res.link}
                className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-[#00246a] hover:shadow-sm transition-all group"
              >
                <h5 className="font-medium text-slate-800 group-hover:text-[#00246a] transition-colors">{res.title}</h5>
                {res.description && <p className="text-sm text-slate-500 mt-1">{res.description}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasExternal && (
        <div className={hasInternal ? '' : 'md:col-span-2'}>
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ExternalLink size={18} className="text-[#00246a]" />
            Recursos Externos
          </h4>
          <div className="space-y-3">
            {external.map((res, idx) => (
              <ResourceCard key={idx} resource={res} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'video': return <PlayCircle size={18} className="text-red-500" />
      case 'podcast': return <Volume2 size={18} className="text-purple-500" />
      case 'exercise': return <CheckCircle2 size={18} className="text-green-500" />
      default: return <ExternalLink size={18} className="text-blue-500" />
    }
  }
  
  const getTypeBadge = (type?: string) => {
    const badges = {
      video: { bg: 'bg-red-50', text: 'text-red-700', label: 'Video' },
      podcast: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Podcast' },
      exercise: { bg: 'bg-green-50', text: 'text-green-700', label: 'Ejercicio' },
      website: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Web' },
    }
    return badges[type as keyof typeof badges] || badges.website
  }
  
  const badge = getTypeBadge(resource.type)

  return (
    <a 
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl hover:border-[#00246a] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-[#00246a] transition-colors">
          {getIcon(resource.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-slate-900 group-hover:text-[#00246a] transition-colors leading-snug mb-1">
            {resource.title}
          </h5>
          {resource.type && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          )}
        </div>
        <ExternalLink size={16} className="text-slate-300 group-hover:text-[#00246a] transition-colors flex-shrink-0 mt-1" />
      </div>
      {resource.description && (
        <p className="text-sm text-slate-600 leading-relaxed pl-14">
          {resource.description}
        </p>
      )}
    </a>
  )
}

export function KeywordChip({ keyword }: { keyword: { word: string, phonetic?: string, example?: string } }) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = (text: string) => {
    if (typeof window === 'undefined') return
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(true)
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      u.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(u)
    } else {
      alert('Tu navegador no soporta síntesis de voz.')
    }
  }

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-br from-white to-blue-50/30 border border-slate-200 pl-3 pr-4 py-2.5 rounded-full text-sm shadow-sm hover:shadow-md hover:border-blue-300 hover:scale-105 transition-all duration-200 group">
      <button 
        onClick={() => speak(keyword.word)} 
        className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 ${
          isSpeaking 
            ? 'bg-[#00246a] text-white animate-pulse' 
            : 'bg-blue-50 text-[#00246a] hover:bg-[#00246a] hover:text-white'
        }`}
        title="Escuchar pronunciación"
      >
        <Volume2 size={14} />
      </button>
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 leading-none">{keyword.word}</span>
        {keyword.phonetic && keyword.phonetic.length > 1 && (
          <span className="text-[10px] text-blue-600/70 font-mono leading-none mt-1">{keyword.phonetic}</span>
        )}
      </div>
      
      {keyword.example && keyword.example.length > 3 && (
        <div className="ml-2 pl-2 border-l border-slate-200">
          <button 
            onClick={() => speak(keyword.example || '')} 
            className="text-xs text-slate-600 italic hover:text-[#00246a] text-left max-w-[200px] truncate block transition-colors"
            title={keyword.example}
          >
            "{keyword.example}"
          </button>
        </div>
      )}
    </div>
  )
}

function AudioButton({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const speak = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel()
        setIsPlaying(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US' // English
        utterance.onend = () => setIsPlaying(false)
        speechSynthesis.speak(utterance)
        setIsPlaying(true)
      }
    } else {
      alert('Tu navegador no soporta síntesis de voz.')
    }
  }

  return (
    <button
      onClick={speak}
      className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isPlaying 
          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 animate-pulse' 
          : 'bg-blue-50 text-[#00246a] hover:bg-[#00246a] hover:text-white border border-blue-100'
      }`}
    >
      {isPlaying ? <XCircle size={16} /> : <Volume2 size={16} />}
      {isPlaying ? 'Detener audio' : 'Escuchar lección completa'}
    </button>
  )
}
