"use client"

import React, { useState, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import { tryParseJson, contentToString, extractKeywordsFromText } from '../../lib/studyGuideUtils'
import { generateStudyGuide, getStudyGuides, deleteStudyGuide, updateStudyGuide } from "./studyGuideAction"
import { Loader2, BookOpen, Trash2, Plus, FileText, ArrowLeft, Award, Target, Flame, Trophy, Star, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import InteractiveGuide, { KeywordChip } from "./InteractiveGuide"

type StudyGuide = {
  id: number
  title: string
  content: any // can be string or structured object
  created_at: string
}

type GenerateResult = { success?: boolean; guide?: StudyGuide; error?: string }
type UpdateResult = { success?: boolean; guide?: StudyGuide; error?: string }

type Badge = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  condition: (stats: UserStats) => boolean
  color: string
}

type UserStats = {
  totalGuides: number
  completedGuides: number
  perfectQuizzes: number
  currentStreak: number
  lastActiveDate: string | null
}

export default function StudyGuideContent() {
  const [guides, setGuides] = useState<StudyGuide[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [topic, setTopic] = useState("")
  const [selectedGuide, setSelectedGuide] = useState<StudyGuide | null>(null)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [view, setView] = useState<'list' | 'create' | 'view'>('list')
  const [userStats, setUserStats] = useState<UserStats>({
    totalGuides: 0,
    completedGuides: 0,
    perfectQuizzes: 0,
    currentStreak: 0,
    lastActiveDate: null
  })
  const [showBadges, setShowBadges] = useState(false)

  useEffect(() => {
    loadGuides()
    loadUserStats()
  }, [])

  useEffect(() => {
    if (!showBadges) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowBadges(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showBadges])

  const loadUserStats = () => {
    try {
      const stats = localStorage.getItem('study_guide_stats')
      if (stats) {
        setUserStats(JSON.parse(stats))
      }
    } catch (e) {
      console.error('Error loading user stats', e)
    }
  }

  const updateStats = (updates: Partial<UserStats>) => {
    const newStats = { ...userStats, ...updates }
    setUserStats(newStats)
    try {
      localStorage.setItem('study_guide_stats', JSON.stringify(newStats))
    } catch (e) {
      console.error('Error saving stats', e)
    }
  }

  const badges: Badge[] = [
    {
      id: 'first-guide',
      name: 'Primera Guía',
      description: 'Generaste tu primera guía de estudio',
      icon: <Target size={24} />,
      condition: (stats) => stats.totalGuides >= 1,
      color: 'text-blue-500'
    },
    {
      id: 'guide-master',
      name: 'Maestro del Estudio',
      description: 'Generaste 5 guías de estudio',
      icon: <BookOpen size={24} />,
      condition: (stats) => stats.totalGuides >= 5,
      color: 'text-purple-500'
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Obtuviste calificación perfecta en 3 quizzes',
      icon: <Trophy size={24} />,
      condition: (stats) => stats.perfectQuizzes >= 3,
      color: 'text-yellow-500'
    },
    {
      id: 'consistency',
      name: '7 Días Seguidos',
      description: 'Estudiaste 7 días consecutivos',
      icon: <Flame size={24} />,
      condition: (stats) => stats.currentStreak >= 7,
      color: 'text-orange-500'
    },
    {
      id: 'dedicated',
      name: 'Dedicado',
      description: 'Completaste 10 guías de estudio',
      icon: <Star size={24} />,
      condition: (stats) => stats.completedGuides >= 10,
      color: 'text-green-500'
    }
  ]

  const unlockedBadges = badges.filter(b => b.condition(userStats))
  const nextBadge = badges.find(b => !b.condition(userStats))

  const loadGuides = async () => {
    setLoading(true)
    const data = await getStudyGuides()
    setGuides(data)
    setLoading(false)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    // Require AI consent stored in localStorage before generating a guide
    try {
      const consent = localStorage.getItem('ai_consent')
      if (consent !== 'true') {
        const ok = confirm('Para generar una guía personalizada con tus datos académicos necesitamos tu consentimiento para usar un servicio de IA externo. ¿Aceptas?')
        if (!ok) return
        try { 
          localStorage.setItem('ai_consent', 'true') 
        } catch {}
        try {
          // Persist server-side
          await fetch('/api/user/ai-consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consent: true }),
          })
        } catch (err) {
          console.warn('Could not persist ai consent from StudyGuideContent', err)
        }
      }
    } catch {}

    setGenerating(true)
    const result: GenerateResult = await generateStudyGuide(topic)
    setGenerating(false)

    if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
      console.error('StudyGuide generation error: empty or invalid result', result)
      try { console.dir(result) } catch (e) { console.error('Could not dir result', e) }
      // Ask server for details: include server error if present
      const serverMessage = result?.error || null
      alert(serverMessage || 'Error al generar la guía. Intenta de nuevo más tarde.')
      return
    }

    if (result.success && result.guide) {
      setGuides([result.guide, ...guides])
      setSelectedGuide(result.guide)
      setView('view')
      setTopic("")
      
      // Update stats
      const newTotal = userStats.totalGuides + 1
      updateStats({ totalGuides: newTotal })
      
      // Show badge notification if earned
      if (newTotal === 1 || newTotal === 5) {
        setTimeout(() => setShowBadges(true), 1000)
      }
    } else {
      const msg = result.error || 'Error al generar la guía'
      console.error('StudyGuide generation error:', result)
      if (msg === 'Estudiante no encontrado') {
        alert('No se encontró un perfil de estudiante para tu cuenta. Verifica que hayas iniciado sesión como estudiante o contacta al administrador para configurar tu cuenta.')
      } else {
        alert(msg)
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta guía?")) return
    const result = await deleteStudyGuide(id)
    if (result.success) {
      setGuides(guides.filter(g => g.id !== id))
      if (selectedGuide?.id === id) {
        setView('list')
        setSelectedGuide(null)
      }
    }
  }

  const handleEdit = (guide: StudyGuide) => {
    setSelectedGuide(guide)
    setEditTitle(guide.title)
    // Normalize existing content to a string for the textarea (pretty JSON if object)
    setEditContent(typeof guide.content === 'string' ? guide.content : JSON.stringify(guide.content, null, 2))
    setEditing(true)
    setView('view')
  }

  const handleUpdate = async () => {
    if (!selectedGuide) return
    const res: UpdateResult = await updateStudyGuide(selectedGuide.id, editTitle, editContent)
    if (res.success && res.guide) {
      const updated = res.guide
      setGuides(guides.map(g => g.id === updated.id ? updated : g))
      setSelectedGuide(updated)
      setEditing(false)
    } else {
      alert('Error al actualizar la guía')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center relative">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Guía de Estudio (IA)</h1>
          <p className="text-slate-500">Genera planes de estudio personalizados con Inteligencia Artificial</p>
        </div>
        <div className="flex gap-3 items-center">
          {view === 'list' && (
            <>
              {/* Single 'Ver Logros' button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBadges(true)}
                  aria-haspopup="dialog"
                  aria-expanded={showBadges}
                  aria-controls="badge-popover"
                  aria-label={`Ver logros (${unlockedBadges.length})`}
                  className="flex items-center gap-2 w-auto h-8 rounded-full px-2 text-sm transition-shadow hover:shadow-sm bg-white border border-slate-100"
                >
                  <Award size={16} className="text-slate-600" />
                  <span className="text-slate-700 text-sm font-medium">Logros</span>
                  {unlockedBadges.length > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs bg-[#00246a] text-white font-semibold">{unlockedBadges.length}</span>
                  )}
                </button>
              </div>

              <button
                onClick={() => setView('create')}
                className="flex items-center gap-2 bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-[#001a4d] transition-colors"
              >
                <Plus size={20} />
                Nueva Guía
              </button>
            </>
          )}
        </div>
      </div>

      {/* Badges Popover (compact medallion) */}
      <AnimatePresence>
        {showBadges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            id="badge-popover"
            className="absolute right-6 top-16 z-50 w-80 md:w-96 bg-white rounded-xl p-4 border border-slate-200 shadow-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="text-[#00246a]" size={18} />
                Logros
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowBadges(false)} className="text-slate-400 hover:text-slate-600 text-sm" aria-label="Cerrar lista de logros">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {badges.map((badge) => {
                const unlocked = badge.condition(userStats)
                return (
                  <div key={badge.id} className={`flex items-center gap-2 p-2 rounded-md ${unlocked ? 'bg-slate-50' : 'bg-slate-100 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${unlocked ? '' : 'opacity-40'}`} aria-hidden>
                      <div className={`${unlocked ? badge.color : 'text-slate-300'}`}>{badge.icon}</div>
                    </div>
                    <div className="text-xs text-slate-700">
                      <div className="font-semibold leading-tight">{badge.name}</div>
                      <div className="text-xs text-slate-500 leading-tight">{badge.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              {nextBadge ? (
                <div className="text-xs text-slate-600">Próximo: <span className="font-medium">{nextBadge.name}</span></div>
              ) : (
                <div className="text-xs text-slate-600">Has desbloqueado todos tus logros.</div>
              )}
              <button onClick={() => window.alert('Ver detalles aún no implementado')} className="text-xs text-[#00246a] font-medium hover:underline">Ver detalles</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="animate-spin text-[#00246a]" size={32} />
              </div>
            ) : guides.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
                <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">No tienes guías de estudio aún.</p>
                <button
                  onClick={() => setView('create')}
                  className="mt-4 text-[#00246a] font-medium hover:underline"
                >
                  Crear mi primera guía
                </button>
              </div>
            ) : (
              guides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group relative"
                  onClick={() => {
                    setSelectedGuide(guide)
                    setView('view')
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-[#00246a]">
                      <FileText size={24} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(guide.id)
                      }}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{guide.title}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(guide.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
          >
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6"
            >
              <ArrowLeft size={18} />
              Volver
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6">Crear Nueva Guía de Estudio</h2>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Sobre qué tema quieres estudiar?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Present Perfect, Vocabulario de viajes, Verbos modales..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00246a] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-[#00246a] text-white py-3 rounded-xl font-medium hover:bg-[#001a4d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generando tu guía con IA...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generar Guía
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {view === 'view' && selectedGuide && (
          <motion.div
            key="view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft size={18} />
                Volver a la lista
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedGuide.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Eliminar guía"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => handleEdit(selectedGuide)}
                  className="text-[#00246a] hover:bg-slate-50 p-2 rounded-lg transition-colors"
                  title="Editar guía"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </button>
              </div>
            </div>
            
            <div className="p-8 max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-[#00246a] mb-2">{selectedGuide.title}</h1>
              <p className="text-slate-400 text-sm mb-8 border-b border-slate-100 pb-4">
                Generado el {new Date(selectedGuide.created_at).toLocaleDateString()}
              </p>
              
              <div className="prose prose-slate max-w-none">
                {editing ? (
                  <div className="space-y-4">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-2 rounded border border-slate-200" />
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={12} className="w-full p-4 rounded border border-slate-200" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(false)} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
                      <button onClick={handleUpdate} className="px-4 py-2 rounded bg-[#00246a] text-white">Guardar cambios</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-700 leading-relaxed">
                    {(() => {
                      const parsedContent = tryParseJson(selectedGuide.content)
                      
                      if (parsedContent) {
                        return (
                          <InteractiveGuide 
                            content={parsedContent} 
                            guideId={selectedGuide.id}
                            onQuizComplete={(score) => {
                              if (score === 100) {
                                const newPerfect = userStats.perfectQuizzes + 1
                                updateStats({ perfectQuizzes: newPerfect })
                                if (newPerfect === 3) {
                                  setTimeout(() => setShowBadges(true), 1000)
                                }
                              }
                            }}
                            onGuideComplete={() => {
                              const newCompleted = userStats.completedGuides + 1
                              updateStats({ completedGuides: newCompleted })
                              if (newCompleted === 10) {
                                setTimeout(() => setShowBadges(true), 1000)
                              }
                            }}
                          />
                        )
                      }
                      
                      // Fallback for old plain text guides or failed parses
                      const isLikelyJson = typeof selectedGuide.content === 'string' && (selectedGuide.content.trim().startsWith('{') || selectedGuide.content.trim().startsWith('```json'));
                      
                      if (isLikelyJson) {
                        return (
                          <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              <p>No se pudo cargar el modo interactivo. Se muestra el contenido original.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg overflow-auto max-h-[500px] text-xs font-mono border border-slate-200">
                              <pre>{selectedGuide.content}</pre>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <>
                          {/* Extract keywords from Markdown content as fallback */}
                          {extractKeywordsFromText(contentToString(selectedGuide.content)).length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-slate-800 mb-2">Palabras clave</h4>
                              <div className="flex gap-2 flex-wrap">
                                {extractKeywordsFromText(contentToString(selectedGuide.content)).map((k, idx) => (
                                  <KeywordChip key={idx} keyword={k} />
                                ))}
                              </div>
                            </div>
                          )}
                          {/* If the generated guide doesn't include recommended video resources, render a small hint */}
                          {!contentToString(selectedGuide.content).includes('Recursos Recomendados (Videos)') && (
                            <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-100 text-sm text-slate-500">
                              No se encontraron recursos de video sugeridos para este tema. Si quieres que aparezcan, configura una API key de YouTube (YOUTUBE_API_KEY) en el servidor.
                            </div>
                          )}
                          <ReactMarkdown>{contentToString(selectedGuide.content)}</ReactMarkdown>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// tryParseJson is implemented in src/lib/studyGuideUtils.ts and imported

// use extractKeywordsFromText from imported utils

// contentToString is implemented in src/lib/studyGuideUtils.ts and imported

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5H5" />
      <path d="M19 17v4" />
      <path d="M15 19h4" />
    </svg>
  )
}
