import React, { useEffect, useRef } from 'react'
import { MessageCircle, Users, Check, CheckCheck, Clock, Hash, HeadphonesIcon, Lock, Loader2, XCircle } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import FeedbackAlert from '@/components/FeedbackAlert'

interface ChatMessageListProps {
  activeRoom: any
  participants: any[]
  messages: any[]
  session: any
  loading: boolean
  newMessage: string
  setNewMessage: (msg: string) => void
  handleSendMessage: (e: React.FormEvent) => void
  messageInputRef: React.RefObject<HTMLInputElement | null>
  messagesEndRef?: React.RefObject<HTMLDivElement | null>
  isMobile?: boolean
}

export default function ChatMessageList({
  activeRoom,
  participants,
  messages,
  session,
  loading,
  newMessage,
  setNewMessage,
  handleSendMessage,
  messageInputRef,
  messagesEndRef: messagesEndRefFromParent,
  isMobile
}: ChatMessageListProps) {
  const { pendingReadIds, failedReadIds, markMessageAsRead } = useChat()
  const internalMessagesEndRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = (messagesEndRefFromParent as React.RefObject<HTMLDivElement | null>) || internalMessagesEndRef

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const isBusy = pendingReadIds && pendingReadIds.length > 0

  const getRoomIcon = (tipo: string) => {
    switch (tipo) {
      case 'GENERAL':
        return <Hash className="w-4 h-4" />
      case 'SOPORTE':
        return <HeadphonesIcon className="w-4 h-4" />
      case 'CLASE':
        return <HeadphonesIcon className="w-4 h-4" />
      case 'PRIVADO':
        return <Lock className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMessageStatusIcon = (message: any) => {
    const myIdNum = Number(session?.user?.id)
    const myIdStr = String(session?.user?.id)
    const isMyMessage = message.usuario_id === myIdNum || (message.usuario && message.usuario.id === myIdNum) || (message.senderId && String(message.senderId) === myIdStr) || (message.usuario && message.usuario.email && message.usuario.email === session?.user?.email) || (message.senderEmail && message.senderEmail === session?.user?.email)
    
    if (!isMyMessage) return null // Solo mostrar estado en mis mensajes
    
    const isPendingRead = pendingReadIds?.includes(message.id)
    const isFailedRead = failedReadIds?.includes(message.id)
    if (isFailedRead) {
      return (
        <div title="Error marcando como leído">
          <XCircle className="w-3 h-3 text-red-400" />
        </div>
      )
    }

    if (isPendingRead) {
      return (
        <div title="Marcando como leído...">
          <Loader2 role="status" aria-live="polite" className="w-3 h-3 text-white/70 animate-spin" />
        </div>
      )
    }

    if (message.lecturas && message.lecturas.length > 0) {
      // Mensaje leído
      return (
        <div title="Leído">
          <CheckCheck className="w-3 h-3 text-blue-500" />
        </div>
      )
    } else if (message.entregado_en) {
      // Mensaje entregado pero no leído
      return (
        <div title="Entregado">
          <Check className="w-3 h-3 text-gray-400" />
        </div>
      )
    } else {
      // Mensaje enviado pero no entregado
      return (
        <div title="Enviado">
          <Clock className="w-3 h-3 text-gray-300" />
        </div>
      )
    }
    // no-op - failure handled earlier
  }

  if (!activeRoom) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Bienvenido al Chat</h3>
          <p className="text-sm">Selecciona una sala para comenzar a chatear</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col min-w-0 bg-[#f8f9fa] relative h-full ${isMobile ? 'max-h-[calc(100vh-88px)]' : 'max-h-[calc(100vh-120px)]'}`}>
      {/* Header de la sala activa */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#00246a] rounded-xl">
            {getRoomIcon(activeRoom.tipo)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{activeRoom.nombre}</h3>
          {!isMobile && <p className="text-xs text-gray-500 font-medium">{activeRoom.descripcion || 'Sin descripción'}</p>}
          </div>
        </div>
      <div className={`${isMobile ? 'hidden' : 'flex'} items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100`}>
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">{participants.length}</span>
        </div>
      </div>

      {/* Mensajes */}
    <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3 space-y-3' : 'p-6 space-y-6'} min-h-0 custom-scrollbar relative overscroll-contain`} aria-busy={isBusy} aria-live="polite">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300246a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 z-10 relative">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageCircle className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-gray-600">No hay mensajes aún</p>
            <p className="text-sm text-gray-400 mt-1">Sé el primero en escribir en esta sala</p>
          </div>
        ) : (
          <>
            {failedReadIds?.length > 0 && (
              <div className="mb-4 sticky top-0 z-20">
                <FeedbackAlert type="warning"> 
                  Algunos mensajes no pudieron marcarse como leídos. 
                  <button onClick={() => failedReadIds.forEach(id => markMessageAsRead(id))} className="ml-3 underline font-medium hover:text-yellow-800">Reintentar</button>
                </FeedbackAlert>
              </div>
            )}
            {messages.map((message, index) => {
              if (message.tipo === 'SISTEMA') {
                return (
                  <div key={message.id || index} className="flex justify-center my-4">
                    <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                      {message.contenido}
                    </div>
                  </div>
                )
              }
              
              const myIdNum = Number(session?.user?.id)
              const myIdStr = String(session?.user?.id)
              const isMyMessage = message.usuario_id === myIdNum || (message.usuario && message.usuario.id === myIdNum) || (message.senderId && String(message.senderId) === myIdStr) || (message.usuario && message.usuario.email && message.usuario.email === session?.user?.email) || (message.senderEmail && message.senderEmail === session?.user?.email)
              
            const showAvatar = !isMyMessage && !isMobile && (index === 0 || messages[index - 1].usuario_id !== message.usuario_id)

              return (
                <div
                  key={message.id || index}
                  className={`flex gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'} group animate-fade-in`}
                >
                  {!isMyMessage && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-opacity ${showAvatar ? 'bg-gradient-to-br from-gray-500 to-gray-600 opacity-100' : 'opacity-0'}`}>
                      {showAvatar && (message.usuario?.nombre?.charAt(0)?.toUpperCase() || 'U')}
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {!isMyMessage && showAvatar && (
                      <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">
                        {message.usuario?.nombre || message.senderName || message.senderId || 'Usuario'}
                      </span>
                    )}
                    
                    <div
                      className={`chat-message-content px-4 py-2.5 shadow-sm relative transition-all ${
                        isMyMessage
                          ? 'bg-[#00246a] text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.contenido}</p>
                      
                      { !isMobile && (
                        <div className={`flex items-center gap-1 mt-1 ${isMyMessage ? 'justify-end text-blue-200' : 'justify-end text-gray-400'}`}>
                          <span className="text-[10px] font-medium opacity-80">
                            {formatTime(message.enviado_en || message.created_at)}
                          </span>
                          {getMessageStatusIcon(message)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      {/* Nota: Podríamos extraer esto a ChatInput.tsx si queremos más granularidad */}
    </div>
  )
}
