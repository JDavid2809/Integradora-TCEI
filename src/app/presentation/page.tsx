'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import ImpressPresentation from '@/components/ImpressPresentation'

interface PresentationData {
  title: string
  subtitle: string
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
  }
  slides: Array<{
    title: string
    content: string[]
    backgroundColor?: string
    textColor?: string
    imageUrl?: string
    icon?: string
    layout?: 'title' | 'content' | 'image' | 'split' | 'centered' | 'comparison'
    animation?: 'fade' | 'slide' | 'zoom' | '3d' | 'rotate'
  }>
}

function PresentationContent() {
  const searchParams = useSearchParams()
  const [presentation, setPresentation] = useState<PresentationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const id = searchParams.get('id')
      if (!id) {
        setError('No se encontró el identificador de presentación')
        return
      }

      // Obtener datos de sessionStorage
      const data = sessionStorage.getItem(id)
      if (!data) {
        setError('La presentación ha expirado o no existe')
        return
      }

      const parsed = JSON.parse(data)
      setPresentation(parsed)
      
      // Limpiar sessionStorage después de cargar (opcional)
      // sessionStorage.removeItem(id)
    } catch (err) {
      console.error('Error al cargar presentación:', err)
      setError('Error al cargar la presentación')
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md text-center">
          <div className="text-7xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    )
  }

  if (!presentation) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin w-20 h-20 border-4 border-white border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping w-20 h-20 border-4 border-white border-t-transparent rounded-full mx-auto opacity-20"></div>
          </div>
          <p className="text-white text-xl font-semibold animate-pulse">Cargando presentación 3D...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top left, #1a1a2e 0%, #0f0f1e 50%, #000 100%)'
    }}>
      {/* Estrellas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '10%', left: '20%' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '30%', left: '70%', animationDelay: '1s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '60%', left: '15%', animationDelay: '2s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '80%', left: '85%', animationDelay: '1.5s' }}></div>
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ top: '20%', left: '50%', animationDelay: '0.5s' }}></div>
        <div className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ top: '70%', left: '40%', animationDelay: '2.5s' }}></div>
      </div>

      <ImpressPresentation data={presentation} />
      
      {/* Controles de ayuda mejorados */}
      <div className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-lg text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 z-10">
        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded-lg text-xs">←</kbd>
            <kbd className="px-2 py-1 bg-white/20 rounded-lg text-xs">→</kbd>
            <span className="text-gray-200">Navegar</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-1 bg-white/20 rounded-lg text-xs">Espacio</kbd>
            <span className="text-gray-200">Siguiente</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded-lg text-xs">ESC</kbd>
            <span className="text-gray-200">Salir</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PresentationViewPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin w-20 h-20 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    }>
      <PresentationContent />
    </Suspense>
  )
}
