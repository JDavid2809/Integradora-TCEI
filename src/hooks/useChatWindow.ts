import { useState, useCallback, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface DragStart {
  x: number
  y: number
  startX: number
  startY: number
}

interface ResizeStart extends DragStart {
  startWidth: number
  startHeight: number
}

export function useChatWindow(isOpen: boolean, isMinimized: boolean, isFullScreen: boolean) {
  // Estados para posición y tamaño de la ventana
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(0, window.innerWidth - 420),
        y: Math.max(0, window.innerHeight - 650)
      }
    }
    return { x: 0, y: 0 }
  })
  
  const [size, setSize] = useState<Size>({ width: 384, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const [dragStart, setDragStart] = useState<DragStart>({ x: 0, y: 0, startX: 0, startY: 0 })
  const [resizeStart, setResizeStart] = useState<ResizeStart>({ 
    x: 0, 
    y: 0, 
    startWidth: 0, 
    startHeight: 0, 
    startX: 0, 
    startY: 0 
  })

  // Funciones para arrastrar la ventana
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMinimized || isFullScreen || e.target !== e.currentTarget) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    })
  }, [position, isMinimized, isFullScreen])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStart.startX + deltaX))
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, dragStart.startY + deltaY))
      setPosition({ x: newX, y: newY })
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      let newWidth = resizeStart.startWidth
      let newHeight = resizeStart.startHeight
      let newX = resizeStart.startX
      let newY = resizeStart.startY

      // Redimensionar según la dirección
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(350, Math.min(window.innerWidth - newX, resizeStart.startWidth + deltaX))
      }
      if (resizeDirection.includes('left')) {
        const widthDelta = -deltaX
        const proposedWidth = resizeStart.startWidth + widthDelta
        if (proposedWidth >= 350) {
          newWidth = proposedWidth
          newX = Math.max(0, resizeStart.startX + deltaX)
        }
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(450, Math.min(window.innerHeight - newY, resizeStart.startHeight + deltaY))
      }
      if (resizeDirection.includes('top')) {
        const heightDelta = -deltaY
        const proposedHeight = resizeStart.startHeight + heightDelta
        if (proposedHeight >= 450) {
          newHeight = proposedHeight
          newY = Math.max(0, resizeStart.startY + deltaY)
        }
      }

      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }
  }, [isDragging, isResizing, dragStart, resizeStart, size, resizeDirection])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection('')
  }, [])

  // Funciones para redimensionar la ventana desde diferentes bordes
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    if (isFullScreen) return // No redimensionar en modo pantalla completa
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startX: position.x,
      startY: position.y
    })
  }, [size, position, isFullScreen])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = 'auto'
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // Ajustar posición cuando se minimiza/maximiza
  useEffect(() => {
    if (isMinimized) {
      setSize({ width: 320, height: 48 })
    } else {
      // Ensure the chat doesn't exceed the viewport height (leave some margin)
      const maxHeight = typeof window !== 'undefined' ? Math.max(200, Math.min(800, Math.floor(window.innerHeight - 80))) : 600
      const maxWidth = typeof window !== 'undefined' ? Math.max(320, Math.min(1024, Math.floor(window.innerWidth - 40))) : 384
      setSize({ width: Math.min(384, maxWidth), height: Math.min(600, maxHeight) })
    }
  }, [isMinimized])

  // Clamp size on window resize so it never becomes taller than the viewport
  useEffect(() => {
    const handleResize = () => {
      setSize(current => {
        const maxHeight = Math.max(200, Math.floor(window.innerHeight - 80))
        const maxWidth = Math.max(320, Math.floor(window.innerWidth - 40))
        const newHeight = Math.min(current.height, maxHeight)
        const newWidth = Math.min(current.width, maxWidth)
        if (newHeight !== current.height || newWidth !== current.width) {
          return { width: newWidth, height: newHeight }
        }
        return current
      })
      setPosition(pos => ({
        x: Math.min(pos.x, Math.max(0, window.innerWidth - 40)),
        y: Math.min(pos.y, Math.max(0, window.innerHeight - 40))
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Centrar ventana cuando se abre por primera vez
  useEffect(() => {
    if (isOpen && !isDragging) {
      const centerX = Math.max(0, (window.innerWidth - size.width) / 2)
      const centerY = Math.max(0, (window.innerHeight - size.height) / 2)
      
      // Solo centrar si la ventana está en la posición inicial
      if (position.x === Math.max(0, window.innerWidth - 420) && 
          position.y === Math.max(0, window.innerHeight - 650)) {
        setPosition({ x: centerX, y: centerY })
      }
    }
  }, [isOpen])

  return {
    position,
    size,
    isDragging,
    isResizing,
    resizeDirection,
    handleMouseDown,
    handleResizeMouseDown
  }
}
