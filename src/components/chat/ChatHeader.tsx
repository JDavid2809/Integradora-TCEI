import React from 'react'
import { useChat } from '@/contexts/ChatContext'
import { MessageCircle, Wifi, WifiOff, Minimize2, Maximize, X, Loader2, Menu, ChevronLeft } from 'lucide-react'

interface ChatHeaderProps {
  isFullScreen: boolean
  setIsFullScreen: (value: boolean) => void
  onClose: () => void
  isDragging: boolean
  isConnected: boolean
  participantsCount: number
  isJoining?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  isMobile?: boolean
  onOpenRooms?: () => void
}

export default function ChatHeader({
  isFullScreen,
  setIsFullScreen,
  onClose,
  isDragging,
  isConnected,
  participantsCount,
  onMouseDown
  , isJoining
  , isMobile
  , onOpenRooms
}: ChatHeaderProps) {
  const { typingUsers } = useChat()
  return (
    <div 
      className={`sticky top-0 flex items-center justify-between px-6 py-4 border-b bg-white text-gray-800 shadow-sm z-30 flex-shrink-0 ${
        isFullScreen ? 'rounded-none' : 'rounded-t-2xl'
      } ${
        isDragging && !isFullScreen ? 'cursor-grabbing' : !isFullScreen ? 'cursor-move' : 'cursor-default'
      }`}
      onMouseDown={!isFullScreen ? onMouseDown : undefined}
    >
      <div className="flex items-center gap-4">
        {isMobile && (
          <div className="flex items-center gap-2 safe-area-top">
            <button onClick={() => onOpenRooms && onOpenRooms()} className="p-2 mr-1 bg-gray-50 rounded-md" title="Ver Salas">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-base text-gray-900">Chat</span>
          </div>
        )}
        <div className="p-2 bg-blue-50 text-[#00246a] rounded-xl">
          <MessageCircle className="w-6 h-6" />
        </div>
        {isMobile ? (
          <div className="ml-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-gray-900">Chat</span>
              {isConnected ? (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">Chat</span>
              {isConnected ? (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>{isConnected ? 'En línea' : 'Desconectado'}</span>
              {participantsCount > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{participantsCount} participantes</span>
                </>
              )}
              {isJoining && (
                <> 
                  <span className="text-gray-300">•</span>
                  <span className="text-blue-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Conectando...</span>
                  </span>
                </>
              )}
              {typingUsers && typingUsers.length > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#00246a] animate-pulse font-semibold">{typingUsers.join(', ')} está escribiendo...</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!isMobile && (
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-gray-100 text-gray-500 hover:text-[#00246a] rounded-full transition-all duration-200"
            title={isFullScreen ? "Salir de pantalla completa (Esc)" : "Ver en pantalla completa"}
          >
            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
