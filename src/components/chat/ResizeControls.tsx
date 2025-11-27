import React from 'react'
import { CornerDownRight } from 'lucide-react'

interface ResizeControlsProps {
  isMinimized: boolean
  isFullScreen: boolean
  isResizing: boolean
  resizeDirection: string
  handleResizeMouseDown: (e: React.MouseEvent, direction: string) => void
}

export default function ResizeControls({
  isMinimized,
  isFullScreen,
  isResizing,
  resizeDirection,
  handleResizeMouseDown
}: ResizeControlsProps) {
  if (isMinimized || isFullScreen) return null

  return (
    <>
      {/* Borde superior */}
      <div
        className={`absolute top-0 left-3 right-3 h-2 cursor-n-resize transition-all duration-200 rounded-b-sm ${
          isResizing && resizeDirection === 'top'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/20'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
        title="Redimensionar desde arriba"
      />

      {/* Borde inferior */}
      <div
        className={`absolute bottom-0 left-3 right-3 h-2 cursor-s-resize transition-all duration-200 rounded-t-sm ${
          isResizing && resizeDirection === 'bottom'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/20'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
        title="Redimensionar desde abajo"
      />

      {/* Borde izquierdo */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-2 cursor-w-resize transition-all duration-200 rounded-r-sm ${
          isResizing && resizeDirection === 'left'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/20'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
        title="Redimensionar desde la izquierda"
      />

      {/* Borde derecho */}
      <div
        className={`absolute right-0 top-3 bottom-3 w-2 cursor-e-resize transition-all duration-200 rounded-l-sm ${
          isResizing && resizeDirection === 'right'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/20'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
        title="Redimensionar desde la derecha"
      />

      {/* Esquinas */}
      {/* Esquina superior izquierda */}
      <div
        className={`absolute top-0 left-0 w-4 h-4 cursor-nw-resize transition-all duration-200 rounded-br-lg ${
          isResizing && resizeDirection === 'top-left'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/30'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
        title="Redimensionar desde esquina superior izquierda"
      />

      {/* Esquina superior derecha */}
      <div
        className={`absolute top-0 right-0 w-4 h-4 cursor-ne-resize transition-all duration-200 rounded-bl-lg ${
          isResizing && resizeDirection === 'top-right'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/30'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
        title="Redimensionar desde esquina superior derecha"
      />

      {/* Esquina inferior izquierda */}
      <div
        className={`absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize transition-all duration-200 rounded-tr-lg ${
          isResizing && resizeDirection === 'bottom-left'
            ? 'bg-[#e30f28]/60 shadow-lg' 
            : 'hover:bg-[#00246a]/30'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
        title="Redimensionar desde esquina inferior izquierda"
      />

      {/* Esquina inferior derecha con icono */}
      <div
        className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize transition-all duration-200 ${
          isResizing && resizeDirection === 'bottom-right'
            ? 'bg-[#e30f28]/50 border-2 border-[#e30f28] shadow-lg' 
            : 'bg-[#00246a]/15 hover:bg-[#00246a]/35 border border-[#00246a]/30'
        } rounded-tl-lg flex items-center justify-center group`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
        title="Redimensionar desde esquina inferior derecha"
      >
        <CornerDownRight className={`w-4 h-4 transition-colors ${
          isResizing && resizeDirection === 'bottom-right' ? 'text-[#e30f28]' : 'text-[#00246a] group-hover:text-[#00246a]'
        }`} />
      </div>
    </>
  )
}
