'use client'

import React, { useState } from 'react'
// @ts-ignore - react-impressjs no tiene tipos TypeScript
import { Impress, Step } from 'react-impressjs'
import 'react-impressjs/styles/react-impressjs.css'

interface Slide {
  title: string
  content: string[]
  backgroundColor?: string
  textColor?: string
  imageUrl?: string
  videoUrl?: string
  icon?: string
  layout?: 'title' | 'content' | 'image' | 'split' | 'centered' | 'comparison'
  animation?: 'fade' | 'slide' | 'zoom' | 'rotate' | '3d'
}

interface PresentationData {
  title: string
  subtitle: string
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
  }
  slides: Slide[]
}

interface SlideImageProps {
  src?: string
  alt: string
  className?: string
  icon?: string
  accentColor: string
  fallbackClassName?: string
}
const SlideImage = ({ src, alt, className, icon, accentColor, fallbackClassName }: SlideImageProps) => {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 ${fallbackClassName || ''}`} style={{ borderColor: `${accentColor}40` }}>
         <div style={{ fontSize: '5rem' }}>{icon || '✨'}</div>
      </div>
    )
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
      loading="eager"
    />
  )
}

interface ImpressPresentationProps {
  data: PresentationData
}

export default function ImpressPresentation({ data }: ImpressPresentationProps) {
  // Aumentamos el desplazamiento para dar más "aire" y sensación cinemática
  const displacement = 2500 
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Triunfando con Inglés"

  const renderSlide = (slide: Slide, index: number) => {
    // Colores por defecto estilo Gamma (Dark Mode Premium) si no vienen definidos
    const bgColor = slide.backgroundColor || 'rgba(20, 20, 30, 0.7)' // Más opacidad para legibilidad
    const textColor = '#000000' // Forzamos negro para legibilidad
    const accentColor = data.theme.primaryColor || '#A78BFA'

    // Sistema de posicionamiento 3D "Cinemático"
    const getStepData = () => {
      const baseX = displacement * (index + 1)
      const animation = slide.animation || '3d'
      
      // Coordenadas calculadas para un flujo suave pero dinámico
      switch (animation) {
        case '3d':
          return {
            x: baseX,
            y: index % 2 === 0 ? -500 : 500,
            z: -1000 * (index % 3),
            rotateX: index % 2 === 0 ? 20 : -20,
            rotateY: 10,
            scale: 1.5
          }
        case 'rotate':
          return {
            x: baseX,
            y: 0,
            z: -500,
            rotateZ: 90,
            scale: 1
          }
        case 'zoom':
          return {
            x: baseX,
            y: 0,
            z: -2000, // Muy profundo
            scale: 3
          }
        default: // 'slide' o 'fade'
          return {
            x: baseX,
            y: 0,
            z: 0,
            scale: 1
          }
      }
    }

    const stepData = getStepData()

    // Contenedor común "Glass Card"
    const CardContainer = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
      <div
        className={`glass-card ${className}`}
        style={{
          // Fondo de imagen por slide solicitado por el usuario
          background: `url('/fondo/image.png') no-repeat center center`,
          backgroundSize: 'cover',
          color: textColor,
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(0,0,0,0.2)`
        }}
      >
        {/* Logo de la App - AHORA A LA DERECHA */}
        <img 
          src="/logos/01_logo.png" 
          alt="Logo" 
          className="presentation-logo"
        />
        {children}
      </div>
    )

    switch (slide.layout) {
      case 'title':
        return (
          <Step key={index} className="slide-step" data={stepData}>
            <CardContainer className="layout-title">
              {/* Imagen de fondo sutil si existe */}
              {slide.imageUrl && (
                <div className="absolute inset-0 z-0 opacity-20">
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="glow-bg" style={{ background: accentColor }} />
                {slide.icon && <div className="slide-icon-lg">{slide.icon}</div>}
                <h1 className="main-title gradient-text" style={{ 
                  backgroundImage: `linear-gradient(135deg, #000 0%, ${accentColor} 100%)` 
                }}>
                  {slide.title}
                </h1>
                <div className="separator" style={{ background: accentColor }} />
                <div className="content-wrapper">
                  {slide.content.map((line, i) => (
                    <p key={i} className="subtitle">{line}</p>
                  ))}
                </div>
              </div>
            </CardContainer>
          </Step>
        )

      case 'split':
        return (
          <Step key={index} className="slide-step" data={stepData}>
            <CardContainer className="layout-split">
              <div className="split-content">
                <h2 className="slide-title" style={{ color: accentColor }}>{slide.title}</h2>
                <div className="text-content scrollable-content">
                  {slide.content.map((line, i) => (
                    <div key={i} className="bullet-point">
                      <span className="bullet" style={{ background: accentColor }} />
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="split-media">
                {slide.videoUrl ? (
                  <video src={slide.videoUrl} autoPlay loop muted className="media-element" />
                ) : (
                  <SlideImage 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="media-element" 
                    icon={slide.icon || '🖼️'}
                    accentColor={accentColor}
                    fallbackClassName="w-full h-[350px]"
                  />
                )}
              </div>
            </CardContainer>
          </Step>
        )

      case 'image':
        return (
          <Step key={index} className="slide-step" data={stepData}>
            <CardContainer className="layout-image">
              <div className="h-full flex flex-col">
                <h2 className="slide-title" style={{ color: accentColor }}>{slide.title}</h2>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-hidden">
                  <SlideImage 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="rounded-2xl shadow-lg max-h-[350px] w-auto object-contain border border-white/20"
                    icon={slide.icon || '🖼️'}
                    accentColor={accentColor}
                    fallbackClassName="w-full max-w-[500px] h-[350px]"
                  />
                  <div className="w-full">
                    {slide.content.map((line, i) => (
                      <p key={i} className="subtitle text-center" style={{ color: '#000000' }}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContainer>
          </Step>
        )

      case 'comparison':
        return (
          <Step key={index} className="slide-step" data={stepData}>
            <CardContainer className="layout-comparison">
              {/* Imagen de fondo muy sutil si existe */}
              {slide.imageUrl && (
                <div className="absolute inset-0 z-0 opacity-10">
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative z-10 w-full h-full flex flex-col">
                <h2 className="slide-title-center" style={{ color: accentColor }}>{slide.title}</h2>
                <div className="comparison-grid">
                  {slide.content.map((item, i) => (
                    <div key={i} className="comparison-card" style={{ borderColor: `${accentColor}40` }}>
                      <div className="card-number" style={{ color: accentColor }}>0{i + 1}</div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContainer>
          </Step>
        )

      default: // 'content' or 'centered'
        return (
          <Step key={index} className="slide-step" data={stepData}>
            <CardContainer className="layout-default">
              {slide.icon && <div className="slide-icon-sm">{slide.icon}</div>}
              <h2 className="slide-title" style={{ color: accentColor }}>{slide.title}</h2>
              <div className="content-grid">
                <div className="text-area scrollable-content">
                  {slide.content.map((line, i) => (
                    <div key={i} className="bullet-point-lg">
                      <span className="bullet" style={{ background: accentColor }} />
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
                <div className="media-area">
                  <SlideImage 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="media-element-sm" 
                    icon={slide.icon || '✨'}
                    accentColor={accentColor}
                    fallbackClassName="w-full h-[350px]"
                  />
                </div>
              </div>
            </CardContainer>
          </Step>
        )
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        /* Reset & Base */
        #impress {
          font-family: 'Plus Jakarta Sans', sans-serif;
          /* Fondo Gamma-style: Deep Indigo/Slate con textura */
          background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%);
        }

        /* Logo - POSICIONADO A LA DERECHA */
        .presentation-logo {
          position: absolute;
          top: 40px;
          right: 40px; /* Cambiado de left a right */
          width: 80px; /* Un poco más grande */
          height: auto;
          object-fit: contain;
          opacity: 0.9;
          z-index: 50;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }

        /* Glass Card System - Estilo Gamma */
        .glass-card {
          width: 1000px;
          height: 650px;
          border-radius: 32px;
          backdrop-filter: blur(40px); /* Más blur para efecto premium */
          padding: 60px;
          padding-top: 60px; 
          padding-bottom: 80px; /* Extra padding para evitar esquina inferior derecha */
          padding-right: 80px; /* Extra padding para evitar esquina inferior derecha */
          display: flex;
          flex-direction: column;
          justify-content: center; /* Centrar contenido verticalmente */
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .glass-card:hover {
          box-shadow: 
            0 40px 80px -12px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(255,255,255,0.1);
        }

        /* Scrollable Content */
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

        /* Typography - Reducido para evitar desbordes */
        .main-title {
          font-size: 3.5rem; 
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .slide-title {
          font-size: 2.5rem; 
          font-weight: 700;
          margin-bottom: 1.2rem;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        
        .slide-title-center {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 2.5rem;
          text-align: center;
        }

        .slide-title-large {
          font-size: 3.5rem; 
          font-weight: 800;
          color: #000000;
          margin-bottom: 1.5rem;
        }

        .subtitle {
          font-size: 1.3rem; 
          font-weight: 400;
          opacity: 0.9;
          line-height: 1.6;
          margin: 0;
          color: #000000;
        }

        .gradient-text {
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Layouts */
        .layout-title {
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          z-index: -1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .separator {
          width: 80px;
          height: 6px;
          border-radius: 3px;
          margin: 0 auto 2rem;
          opacity: 0.8;
        }

        .layout-split {
          flex-direction: row;
          gap: 3rem;
          align-items: flex-start; 
        }

        .split-content {
          flex: 1;
          max-height: 100%;
          display: flex;
          flex-direction: column;
        }

        .split-media {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .media-element {
          width: 100%;
          height: auto;
          max-height: 450px;
          object-fit: contain; 
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          background: rgba(0,0,0,0.2); /* Fondo oscuro para imágenes transparentes */
          border: 1px solid rgba(255,255,255,0.1);
        }

        .layout-image-full {
          width: 1000px;
          height: 650px;
          border-radius: 32px;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%);
          border-radius: 32px;
        }

        .image-content {
          position: relative;
          z-index: 10;
          width: 100%;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .image-text {
          font-size: 1.3rem;
          color: #000000;
          margin-bottom: 0.5rem;
        }

        .layout-comparison {
          justify-content: center;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }

        .comparison-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid;
          border-radius: 24px;
          padding: 1.5rem;
          text-align: center;
          transition: background 0.3s;
          color: #000000;
        }
        
        .comparison-card:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .card-number {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }

        .layout-default .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 3rem;
          height: 100%;
          overflow: hidden; 
        }

        .text-area {
          display: flex;
          flex-direction: column;
        }

        .bullet-point, .bullet-point-lg {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.2rem;
        }

        .bullet-point p {
          font-size: 1.2rem; 
          line-height: 1.5;
          margin: 0;
          color: #000000;
        }

        .bullet-point-lg p {
          font-size: 1.3rem; 
          line-height: 1.5;
          margin: 0;
          color: #000000;
        }

        .bullet {
          min-width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 0.5rem;
          box-shadow: 0 0 10px currentColor;
        }

        .media-element-sm {
          width: 100%;
          height: auto;
          max-height: 350px;
          object-fit: contain;
          border-radius: 20px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .slide-icon-lg {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }

        .slide-icon-sm {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .placeholder-media {
          width: 100%;
          height: 350px;
          border: 2px dashed;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          opacity: 0.5;
        }

        /* Impress Step Defaults */
        .step {
          opacity: 0.1;
          transition: opacity 1s ease-in-out;
        }
        
        .step.active {
          opacity: 1;
        }
      `}</style>

      <Impress
        progress={true}
        fallbackMessage={<p>Not supported</p>}
      >
        {/* Title Slide */}
        <Step
          className="slide-step"
          data={{ x: 0, y: 0, z: 0, scale: 2 }}
        >
          <div className="glass-card layout-title" style={{ 
            background: `url('/fondo/image.png') no-repeat center center`,
            backgroundSize: 'cover',
            border: `1px solid ${data.theme.primaryColor}40`
          }}>
            {/* Logo en Title Slide - A LA DERECHA */}
            <img 
              src="/logos/01_logo.png" 
              alt="Logo" 
              className="presentation-logo"
            />
            <div className="glow-bg" style={{ background: data.theme.primaryColor }} />
            <h1 className="main-title gradient-text" style={{ 
              backgroundImage: `linear-gradient(135deg, #000 0%, ${data.theme.primaryColor} 100%)` 
            }}>
              {data.title}
            </h1>
            <div className="separator" style={{ background: data.theme.primaryColor }} />
            <p className="subtitle">{data.subtitle}</p>
            <div className="absolute bottom-10 w-full text-center opacity-80">
              {/* APP_NAME removed from here */}
            </div>
          </div>
        </Step>

        {/* Generated Slides */}
        {data.slides.map((slide, index) => renderSlide(slide, index))}

        {/* End Slide */}
        <Step
          className="slide-step"
          data={{ 
            x: displacement * (data.slides.length + 1), 
            y: 0, 
            z: 2000, 
            rotateX: -40,
            scale: 2 
          }}
        >
          <div className="glass-card layout-title" style={{ 
            background: `url('/fondo/image.png') no-repeat center center`,
            backgroundSize: 'cover',
            border: `1px solid ${data.theme.primaryColor}40`
          }}>
            <img 
              src="/logos/01_logo.png" 
              alt="Logo" 
              className="presentation-logo"
            />
            <h1 className="main-title" style={{ color: data.theme.textColor || '#000' }}>Thank You!</h1>
            <p className="subtitle" style={{ color: data.theme.textColor || '#000' }}>{APP_NAME}</p>
          </div>
        </Step>
      </Impress>
    </>
  )
}
