'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Download, Play, RefreshCw, FileText } from 'lucide-react'
import { generatePresentation } from './presentationAction'

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

export default function IAPresentation() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [presentation, setPresentation] = useState<PresentationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Preload images when presentation is generated
  useEffect(() => {
    if (presentation?.slides) {
      presentation.slides.forEach(slide => {
        if (slide.imageUrl) {
          // Ensure we use the browser DOM Image constructor and not a shadowed React component
          const img = new (window as any).Image()
          img.src = slide.imageUrl
        }
      })
    }
  }, [presentation])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please write a description for your presentation')
      return
    }

    setLoading(true)
    setError(null)
    setPresentation(null)

    try {
      const result = await generatePresentation(prompt)
      
      if (result.success && result.data) {
        setPresentation(result.data)
      } else {
        setError(result.error || 'Error generating presentation')
      }
    } catch (err) {
      setError('Unexpected error generating presentation')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const handleDownloadPDF = () => {
    if (!presentation) return

    // Estilos optimizados para impresión nativa
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        @page {
          size: landscape;
          margin: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background-color: #1e1b4b;
        }

        .pdf-page {
          width: 100vw;
          height: 100vh;
          page-break-after: always;
          position: relative;
          overflow: hidden;
          background: url('/fondo/image.png') no-repeat center center;
          background-size: cover;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          box-sizing: border-box;
          color: #000000;
        }

        .pdf-page:last-child {
          page-break-after: avoid;
        }

        .presentation-logo { position: absolute; top: 30px; right: 30px; width: 80px; height: auto; }
        .main-title { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; text-align: center; color: #000000; }
        .slide-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; text-align: center; color: ${presentation.theme.primaryColor}; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin-bottom: 0.5rem; text-align: center; color: #000000; }
        .content-text { font-size: 1.2rem; margin-bottom: 0.8rem; color: #000000; }
        .bullet-point { display: flex; align-items: flex-start; gap: 0.8rem; margin-bottom: 0.8rem; }
        .bullet { min-width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; background-color: ${presentation.theme.primaryColor}; }
        .image-container { display: flex; justify-content: center; margin-top: 1.5rem; width: 100%; }
        .slide-image { max-height: 250px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
      </style>
    `

    // Construir el HTML
    let htmlContent = ''

    // 1. Title Slide
    htmlContent += `
      <div class="pdf-page">
        <img src="/logos/01_logo.png" class="presentation-logo" />
        <h1 class="main-title">${presentation.title}</h1>
        <p class="subtitle" style="font-size: 1.5rem;">${presentation.subtitle}</p>
      </div>
    `

    // 2. Content Slides
    presentation.slides.forEach(slide => {
      let slideInner = ''
      
      if (slide.layout === 'image') {
        slideInner = `
          <h2 class="slide-title">${slide.title}</h2>
          <div class="image-container">
            ${slide.imageUrl ? `<img src="${slide.imageUrl}" class="slide-image" />` : ''}
          </div>
          <div style="margin-top: 1.5rem; width: 80%; text-align: center;">
            ${slide.content.map(line => `<p class="subtitle">${line}</p>`).join('')}
          </div>
        `
      } else {
        slideInner = `
          <h2 class="slide-title">${slide.title}</h2>
          <div style="width: 85%;">
            ${slide.content.map(line => `
              <div class="bullet-point">
                <span class="bullet"></span>
                <p class="content-text">${line}</p>
              </div>
            `).join('')}
          </div>
          ${slide.imageUrl ? `
            <div class="image-container">
              <img src="${slide.imageUrl}" class="slide-image" style="max-height: 180px;" />
            </div>
          ` : ''}
        `
      }

      htmlContent += `
        <div class="pdf-page">
          <img src="/logos/01_logo.png" class="presentation-logo" />
          ${slideInner}
        </div>
      `
    })

    // 3. End Slide
    htmlContent += `
      <div class="pdf-page">
        <img src="/logos/01_logo.png" class="presentation-logo" />
        <h1 class="main-title">Thank You!</h1>
        <p class="subtitle" style="font-size: 1.5rem;">Triunfando con Inglés</p>
      </div>
    `

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${presentation.title} - PDF</title>
            ${styles}
          </head>
          <body>
            ${htmlContent}
            <script>
              window.onload = () => {
                // Dar tiempo a que carguen las imágenes
                setTimeout(() => {
                  window.print();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleOpenPresentation = () => {
    if (!presentation) return

    // Guardar en sessionStorage en lugar de URL
    const presentationId = `presentation_${Date.now()}`
    sessionStorage.setItem(presentationId, JSON.stringify(presentation))
    
    // Abrir con solo el ID
    const url = `/presentation?id=${presentationId}`
    
    // Abrir en nueva ventana con dimensiones optimizadas
    window.open(url, '_blank', 'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no')
  }

  const examplePrompts = [
    "Create a presentation about numbers 1-100 in English",
    "Presentation on irregular verbs in English with examples",
    "Colors in English for kids with images",
    "Basic grammar: present simple vs present continuous",
    "Travel and tourism vocabulary in English"
  ]

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          {/* Header compacto */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Presentations</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Create professional presentations in seconds</p>
              </div>
            </div>

          {/* Input y botón */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your presentation
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a presentation about numbers in English from 1 to 20"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm dark:bg-slate-700 dark:text-white"
                rows={2}
                disabled={loading}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating presentation...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Presentation
                </>
              )}
            </button>

            {/* Ejemplos rápidos */}
            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-1.5">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    disabled={loading}
                    className="text-[10px] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

          {/* Preview y controles */}
          {presentation && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{presentation.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{presentation.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPresentation(null)
                      setPrompt('')
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Botón para abrir en nueva ventana */}
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                <div className="mb-4">
                  <Sparkles className="w-16 h-16 mx-auto text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Presentation Ready!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Your presentation is ready. Open it in a new window to view it.
                </p>
                <button
                  onClick={handleOpenPresentation}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  Open Presentation
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Opens in a new tab
                </p>
              </div>

              <div className="mt-4 text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="font-semibold mb-1">💡 Controls:</p>
                <div className="flex flex-wrap gap-3">
                  <span>← → Navigate</span>
                  <span>Space Next</span>
                  <span>Click Advance</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Función para generar HTML standalone con Impress.js (Estilo Gamma)
function generateHTMLPresentation(data: PresentationData): string {
  const displacement = 2500
  const APP_NAME = "Triunfando con Inglés"
  
  const slides = data.slides.map((slide, index) => {
    const bgColor = slide.backgroundColor || 'rgba(20, 20, 30, 0.7)'
    const textColor = '#000000'
    const accentColor = data.theme.primaryColor || '#A78BFA'
    
    // Calcular posición 3D (misma lógica que el componente)
    const baseX = displacement * (index + 1)
    let stepData = ''
    
    const animation = slide.animation || '3d'
    if (animation === '3d') {
      stepData = `data-x="${baseX}" data-y="${index % 2 === 0 ? -500 : 500}" data-z="${-1000 * (index % 3)}" data-rotate-x="${index % 2 === 0 ? 20 : -20}" data-rotate-y="10" data-scale="1.5"`
    } else if (animation === 'rotate') {
      stepData = `data-x="${baseX}" data-y="0" data-z="-500" data-rotate-z="90" data-scale="1"`
    } else if (animation === 'zoom') {
      stepData = `data-x="${baseX}" data-y="0" data-z="-2000" data-scale="3"`
    } else {
      stepData = `data-x="${baseX}" data-y="0" data-z="0" data-scale="1"`
    }

    // Logo HTML (A la derecha)
    const logoHtml = `<img src="/logos/01_logo.png" alt="Logo" class="presentation-logo" />`

    // Generar contenido HTML según layout
    let innerHTML = ''
    
    // Contenedor base con estilo Gamma y Fondo de Imagen
    const cardStyle = `
      background: url('/fondo/image.png') no-repeat center center;
      background-size: cover;
      color: ${textColor};
      border: 1px solid ${accentColor}30;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(0,0,0,0.2);
    `

    if (slide.layout === 'split') {
      innerHTML = `
        <div class="glass-card layout-split" style="${cardStyle}">
          ${logoHtml}
          <div class="split-content">
            <h2 class="slide-title" style="color: ${accentColor}">${slide.title}</h2>
            <div class="text-content scrollable-content">
              ${slide.content.map(line => `
                <div class="bullet-point">
                  <span class="bullet" style="background: ${accentColor}"></span>
                  <p>${line}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="split-media">
            ${slide.imageUrl ? `
              <div class="media-container" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="${slide.imageUrl}" class="media-element" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="placeholder-media" style="display: none; border-color: ${accentColor}; position: absolute; inset: 0;">${slide.icon || '🖼️'}</div>
              </div>
            ` : `<div class="placeholder-media" style="border-color: ${accentColor}">${slide.icon || '🖼️'}</div>`}
          </div>
        </div>
      `
    } else if (slide.layout === 'image') {
      innerHTML = `
        <div class="glass-card layout-image" style="${cardStyle}">
          ${logoHtml}
          <div style="height: 100%; display: flex; flex-direction: column;">
            <h2 class="slide-title" style="color: ${accentColor}">${slide.title}</h2>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; overflow: hidden; width: 100%;">
              <div class="media-container" style="position: relative; width: 100%; display: flex; justify-content: center;">
                <img src="${slide.imageUrl}" class="media-element" style="max-height: 350px; width: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="placeholder-media" style="display: none; border-color: ${accentColor}; width: 100%; height: 350px;">${slide.icon || '🖼️'}</div>
              </div>
              <div style="width: 100%;">
                ${slide.content.map(line => `<p class="subtitle" style="text-align: center; color: #000000;">${line}</p>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `
    } else if (slide.layout === 'title') {
      innerHTML = `
        <div class="glass-card layout-title" style="${cardStyle}">
          ${slide.imageUrl ? `<div class="absolute inset-0 z-0 opacity-20"><img src="${slide.imageUrl}" class="w-full h-full object-cover" /></div>` : ''}
          ${logoHtml}
          <div class="relative z-10 flex flex-col items-center">
            <div class="glow-bg" style="background: ${accentColor}"></div>
            ${slide.icon ? `<div class="slide-icon-lg">${slide.icon}</div>` : ''}
            <h1 class="main-title gradient-text" style="background-image: linear-gradient(135deg, #000 0%, ${accentColor} 100%)">
              ${slide.title}
            </h1>
            <div class="separator" style="background: ${accentColor}"></div>
            <div class="content-wrapper">
              ${slide.content.map(line => `<p class="subtitle">${line}</p>`).join('')}
            </div>
            <div class="absolute bottom-10 w-full text-center opacity-80">
              <p class="text-lg font-medium tracking-wider" style="color: ${textColor}">${APP_NAME}</p>
            </div>
          </div>
        </div>
      `
    } else if (slide.layout === 'comparison') {
      innerHTML = `
        <div class="glass-card layout-comparison" style="${cardStyle}">
          ${slide.imageUrl ? `<div class="absolute inset-0 z-0 opacity-10"><img src="${slide.imageUrl}" class="w-full h-full object-cover" /></div>` : ''}
          ${logoHtml}
          <div class="relative z-10 w-full h-full flex flex-col">
            <h2 class="slide-title-center" style="color: ${accentColor}">${slide.title}</h2>
            <div class="comparison-grid">
              ${slide.content.map((item, i) => `
                <div class="comparison-card" style="border-color: ${accentColor}40">
                  <div class="card-number" style="color: ${accentColor}">0${i + 1}</div>
                  <p>${item}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `
    } else {
      // Default layout
      innerHTML = `
        <div class="glass-card layout-default" style="${cardStyle}">
          ${logoHtml}
          ${slide.icon ? `<div class="slide-icon-sm">${slide.icon}</div>` : ''}
          <h2 class="slide-title" style="color: ${accentColor}">${slide.title}</h2>
          <div class="content-grid">
            <div class="text-area scrollable-content">
              ${slide.content.map(line => `
                <div class="bullet-point-lg">
                  <span class="bullet" style="background: ${accentColor}"></span>
                  <p>${line}</p>
                </div>
              `).join('')}
            </div>
            ${slide.imageUrl ? 
              `<div class="media-area">
                <div class="media-container" style="position: relative; width: 100%; height: 100%;">
                  <img src="${slide.imageUrl}" class="media-element-sm" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                  <div class="placeholder-media" style="display: none; border-color: ${accentColor}; position: absolute; inset: 0;">${slide.icon || '✨'}</div>
                </div>
              </div>` : 
              `<div class="media-area flex items-center justify-center bg-white/5 rounded-2xl border border-white/10"><div style="font-size: 5rem">${slide.icon || '✨'}</div></div>`
            }
          </div>
        </div>
      `
    }
    
    return `<div class="step slide-step" ${stepData}>${innerHTML}</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/impress.js@2.0.0/css/impress-common.css">
  <style>
    .presentation-logo {
      position: absolute;
      top: 40px;
      right: 40px;
      width: 80px;
      height: auto;
      object-fit: contain;
      opacity: 0.9;
      z-index: 50;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    }

    /* Glass Card System */
    .glass-card {
      width: 1000px;
      height: 650px;
      border-radius: 32px;
      backdrop-filter: blur(24px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      padding: 60px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      justify-content: center;
      padding-bottom: 80px;
      padding-right: 80px;
    }

    .scrollable-content {
      overflow-y: auto;
      padding-right: 15px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }

    .scrollable-content::-webkit-scrollbar {
      width: 6px;
    }

    .scrollable-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .scrollable-content::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
    }

    /* Typography */
    .main-title { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
    .slide-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.2rem; letter-spacing: -0.01em; margin-top: 0; line-height: 1.2; }
    .slide-title-large { font-size: 3.5rem; font-weight: 800; color: #000000; margin-bottom: 1.5rem; margin-top: 0; }
    .subtitle { font-size: 1.3rem; font-weight: 400; opacity: 0.9; line-height: 1.6; margin: 0; color: #000000; }
    .gradient-text { -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    /* Layouts */
    .layout-title { align-items: center; justify-content: center; text-align: center; }
    .glow-bg { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); opacity: 0.15; z-index: -1; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .separator { width: 80px; height: 6px; border-radius: 3px; margin: 0 auto 2rem; opacity: 0.8; }
    
    .layout-split { flex-direction: row; gap: 3rem; align-items: flex-start; }
    .split-content { flex: 1; max-height: 100%; display: flex; flex-direction: column; }
    .split-media { flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; }
    
    .media-element { width: 100%; height: auto; max-height: 450px; object-fit: contain; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); }
    .placeholder-media { width: 100%; height: 350px; border: 2px dashed; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 4rem; opacity: 0.5; }

    .layout-image-full { width: 1000px; height: 650px; border-radius: 32px; background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; padding: 60px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); box-sizing: border-box; }
    .overlay-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%); border-radius: 32px; }
    .image-content { position: relative; z-index: 10; width: 100%; }
    .glass-panel { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); padding: 2rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); }
    .image-text { font-size: 1.3rem; color: #000000; margin-bottom: 0.5rem; margin-top: 0; }

    .layout-comparison { justify-content: center; }
    .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; width: 100%; height: 100%; overflow-y: auto; }
    .comparison-card { background: rgba(255, 255, 255, 0.03); border: 1px solid; border-radius: 24px; padding: 1.5rem; text-align: center; transition: background 0.3s; color: #000000; }
    .comparison-card:hover { background: rgba(255, 255, 255, 0.08); }
    .card-number { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; opacity: 0.5; }

    .layout-default .content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; height: 100%; overflow: hidden; }
    .text-area { display: flex; flex-direction: column; }
    .bullet-point, .bullet-point-lg { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.2rem; }
    .bullet-point p { font-size: 1.2rem; line-height: 1.5; margin: 0; color: #000000; }
    .bullet-point-lg p { font-size: 1.3rem; line-height: 1.5; margin: 0; color: #000000; }
    .bullet { min-width: 10px; height: 10px; border-radius: 50%; margin-top: 0.5rem; box-shadow: 0 0 10px currentColor; }
    .media-element-sm { width: 100%; height: auto; max-height: 350px; object-fit: contain; border-radius: 20px; box-shadow: 0 15px 30px rgba(0,0,0,0.2); background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); }
    .slide-icon-sm { font-size: 3.5rem; margin-bottom: 1rem; }

    /* Impress Steps */
    .step { opacity: 0.1; transition: opacity 1s ease-in-out; }
    .step.active { opacity: 1; }
  </style>
</head>
<body>
  <div id="impress" data-transition-duration="1000">
    <!-- Title Slide -->
    <div class="step slide-step" data-x="0" data-y="0" data-z="0" data-scale="2">
      <div class="glass-card layout-title" style="background: url('/fondo/image.png') no-repeat center center; background-size: cover; border: 1px solid ${data.theme.primaryColor}40;">
        <img src="/logos/01_logo.png" alt="Logo" class="presentation-logo" />
        <div class="glow-bg" style="background: ${data.theme.primaryColor}"></div>
        <h1 class="main-title gradient-text" style="background-image: linear-gradient(135deg, #000 0%, ${data.theme.primaryColor} 100%)">
          ${data.title}
        </h1>
        <div class="separator" style="background: ${data.theme.primaryColor}"></div>
        <p class="subtitle">${data.subtitle}</p>
        <div class="absolute bottom-10 w-full text-center opacity-80">
          <!-- APP_NAME removed from here -->
        </div>
      </div>
    </div>

    <!-- Generated Slides -->
    ${slides}

    <!-- End Slide -->
    <div class="step slide-step" data-x="${displacement * (data.slides.length + 1)}" data-y="0" data-z="2000" data-rotate-x="-40" data-scale="2">
      <div class="glass-card layout-title" style="background: url('/fondo/image.png') no-repeat center center; background-size: cover; border: 1px solid ${data.theme.primaryColor}40;">
        <img src="/logos/01_logo.png" alt="Logo" class="presentation-logo" />
        <h1 class="main-title" style="color: ${data.theme.textColor || '#000'}">Thank You!</h1>
        <p class="subtitle" style="color: ${data.theme.textColor || '#000'}">${APP_NAME}</p>
      </div>
    </div>
  </div>


  <script src="https://cdn.jsdelivr.net/npm/impress.js@2.0.0/js/impress.js"></script>
  <script>
    impress().init();
  </script>
</body>
</html>`
}
