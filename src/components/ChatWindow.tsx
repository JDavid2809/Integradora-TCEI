"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { useSession } from 'next-auth/react'
import { useChatWindow } from '@/hooks/useChatWindow'
import ChatHeader from './chat/ChatHeader'
import ChatRoomList from './chat/ChatRoomList'
import ChatMessageList from './chat/ChatMessageList'
import ChatInput from './chat/ChatInput'
import CreateRoomModal from './chat/CreateRoomModal'
import ResizeControls from './chat/ResizeControls'

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

export default function ChatWindow({ isOpen, onClose, isMinimized, onToggleMinimize }: ChatWindowProps) {
  const { data: session } = useSession()
  const {
    chatRooms,
    activeRoom,
    messages,
    participants,
    loading,
    isConnected,
    setActiveRoom,
    sendMessage,
    loadMessages,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom,
    markAsRead,
    markMessageAsRead,
    startPrivateChat,
    searchUsers,
    updateUserStatus
    , pendingReadIds, joiningRoomIds
  } = useChat()

  const [newMessage, setNewMessage] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDescription, setNewRoomDescription] = useState('')
  const [newRoomType, setNewRoomType] = useState<'GENERAL' | 'SOPORTE' | 'CLASE'>('GENERAL')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showPrivateChat, setShowPrivateChat] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showRoomsMobile, setShowRoomsMobile] = useState(false)
  const [topOffset, setTopOffset] = useState(0)
  const [bottomOffset, setBottomOffset] = useState(0)
  const [navZIndex, setNavZIndex] = useState<number | null>(null)
  const [isChatListMinimized, setIsChatListMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatListMinimized') === 'true'
    }
    return false
  })

  const {
    position,
    size,
    isDragging,
    isResizing,
    resizeDirection,
    handleMouseDown,
    handleResizeMouseDown
  } = useChatWindow(isOpen, isMinimized, isFullScreen)

  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id)
      markAsRead(activeRoom.id)
    }
  }, [activeRoom])

  // Detect mobile view and switch automatically to full-screen / mobile layout
  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateIsMobile = () => {
      const mobile = window.innerWidth <= 640
      setIsMobile(mobile)
      if (mobile) {
        setIsFullScreen(true)
      }
    }
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  // Compute top offset to respect navbar height and avoid overlaying it on mobile
  useEffect(() => {
    if (!isMobile) return
    const computeTopOffset = () => {
      const fixedTopEl = Array.from(document.querySelectorAll('body *')).find((el) => {
        const s = window.getComputedStyle(el)
        const r = (el as HTMLElement).getBoundingClientRect()
        return (s.position === 'fixed' || s.position === 'sticky') && r.top === 0 && r.height > 0
      }) as HTMLElement | undefined
      if (fixedTopEl) {
        setTopOffset(Math.ceil(fixedTopEl.getBoundingClientRect().height))
        // try to read z-index too for overlay placement
        const z = window.getComputedStyle(fixedTopEl).zIndex
        const zNum = z && !isNaN(Number(z as any)) ? Number(z) : null
        setNavZIndex(zNum)
      } else {
        setTopOffset(0)
        setNavZIndex(null)
      }
      // compute bottom offset for any fixed bottom navs (mobile tabs)
      const fixedBottomEl = Array.from(document.querySelectorAll('body *')).find((el) => {
        const s = window.getComputedStyle(el)
        const r = (el as HTMLElement).getBoundingClientRect()
        return (s.position === 'fixed' || s.position === 'sticky') && Math.round(r.bottom) === window.innerHeight && r.height > 0
      }) as HTMLElement | undefined
      if (fixedBottomEl) {
        setBottomOffset(Math.ceil(fixedBottomEl.getBoundingClientRect().height))
      } else {
        setBottomOffset(0)
      }
    }
    computeTopOffset()
    window.addEventListener('resize', computeTopOffset)
    return () => window.removeEventListener('resize', computeTopOffset)
  }, [isMobile])

  // Guardar estado de minimización en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatListMinimized', isChatListMinimized.toString())
    }
  }, [isChatListMinimized])

  // Actualizar estado de conexión cuando se abre/cierra el chat
  useEffect(() => {
    if (session?.user) {
      updateUserStatus(isOpen)
    }
  }, [isOpen, session])

  // Marcar mensajes como leídos automáticamente cuando se ve la sala activa
  useEffect(() => {
    if (activeRoom && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        msg.usuario_id !== Number(session?.user?.id) && 
        !msg.lecturas?.some((lectura: any) => lectura.usuario_id === Number(session?.user?.id))
      )
      // Only mark as read if the user is participant of the room
      const userId = Number(session?.user?.id)
      const isParticipant = activeRoom.participantes?.some((p: any) => p.usuario?.id === userId && p.activo)
      if (!isParticipant) return

      // Marcar como leídos después de un pequeño delay
      const timer = setTimeout(() => {
        unreadMessages.forEach(msg => {
          markMessageAsRead(msg.id)
        })
      }, 1000) // 1 segundo de delay para simular que el usuario leyó

      return () => clearTimeout(timer)
    }
  }, [activeRoom, messages, session])

  // Actualizar último visto cuando cambia la sala activa
  useEffect(() => {
    if (activeRoom && session?.user) {
      markAsRead(activeRoom.id)
    }
  }, [activeRoom, session])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeRoom) return

    try {
      await sendMessage(newMessage.trim())
      setNewMessage('')
      messageInputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return

    try {
      const room = await createChatRoom(newRoomName.trim(), newRoomDescription.trim() || undefined, newRoomType)
      if (room) {
        setActiveRoom(room)
        setShowCreateRoom(false)
        setNewRoomName('')
        setNewRoomDescription('')
        setNewRoomType('GENERAL')
      }
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const handleJoinRoom = async (roomId: number) => {
    const success = await joinChatRoom(roomId)
    if (success) {
      const room = chatRooms.find(r => r.id === roomId)
      if (room) setActiveRoom(room)
    }
  }

  const handleLeaveRoom = async (roomId: number) => {
    const success = await leaveChatRoom(roomId)
    if (success && activeRoom?.id === roomId) {
      setActiveRoom(null)
    }
  }

  const handleUserSearch = async (query: string) => {
    setSearchQuery(query)
    
    // Si hay una búsqueda y la lista está minimizada, expandir automáticamente
    if (query.trim() && isChatListMinimized) {
      setIsChatListMinimized(false)
    }
    
    try {
      let results
      if (query.trim()) {
        results = await searchUsers(query)
      } else {
        results = await searchUsers('')
      }

      // Manejar tanto formato antiguo (array) como nuevo (objeto con debug)
      const usersList = Array.isArray(results) ? results : (results as any).users || []
      setSearchResults(usersList)
      
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    }
  }

  const handleToggleSearchMode = () => {
    // Si se está activando el modo búsqueda y la lista está minimizada, expandir automáticamente
    if (!isSearchMode && isChatListMinimized) {
      setIsChatListMinimized(false)
    }
    setIsSearchMode(!isSearchMode)
  }

  const handleStartPrivateChat = async (userId: number) => {
    try {
      const room = await startPrivateChat(userId)
      if (room) {
        setActiveRoom(room)
        setIsSearchMode(false)
        setShowPrivateChat(false)
        setSearchQuery('')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error starting private chat:', error)
    }
  }

  const isUserInRoom = (roomId: number) => {
    const room = chatRooms.find(r => r.id === roomId)
    return !!room?.participantes?.some((p: any) => p.usuario_id === Number(session?.user?.id))
  }

  useEffect(() => {
    if (!isSearchMode) {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isSearchMode])

  // Manejar tecla Escape para salir de pantalla completa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
    }

    if (isFullScreen) {
      document.addEventListener('keydown', handleKeyDown)
      // También deshabilitar scroll del body
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullScreen])

  if (!isOpen) return null

  return (
    <div 
    ref={chatWindowRef}
    className={`fixed ${isMobile ? '' : 'z-50'} ${isDragging || isResizing ? 'select-none' : ''} ${
        isFullScreen ? 'inset-0' : ''
      }`}
      role={isFullScreen || isMobile ? 'dialog' : undefined}
      aria-modal={isFullScreen || isMobile}
      style={isFullScreen ? {
        left: 0,
        top: isMobile ? topOffset : 0,
        width: '100vw',
        height: isMobile ? `calc(100vh - ${topOffset + bottomOffset}px)` : '100vh',
        bottom: isMobile ? bottomOffset : undefined,
        zIndex: isMobile && navZIndex ? Math.max(1, navZIndex - 1) : undefined,
        transition: 'all 0.3s ease',
      } : {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
      }}
    >
      <div className={`bg-white h-full flex flex-col overflow-hidden max-h-screen ${
        isFullScreen ? 'rounded-none border-0' : 'rounded-xl shadow-2xl border-2'
      } ${
        isDragging ? 'border-[#00246a] shadow-3xl' : 'border-gray-200'
      } ${isResizing ? 'border-[#e30f28]' : ''}`} style={{ boxSizing: 'border-box', maxHeight: '100vh', overflow: 'hidden' }}>
        
        <ChatHeader 
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          onClose={onClose}
          isDragging={isDragging}
          isConnected={isConnected}
          isJoining={Boolean(activeRoom && joiningRoomIds?.includes(activeRoom.id))}
          participantsCount={participants.length}
          isMobile={isMobile}
          onOpenRooms={() => setShowRoomsMobile(true)}
          onMouseDown={handleMouseDown}
        />

        {!isMinimized && (
          <div className="flex flex-1 min-h-0">
            {(!isMobile || showRoomsMobile) && (
            <ChatRoomList 
              isChatListMinimized={isChatListMinimized}
              setIsChatListMinimized={setIsChatListMinimized}
              isSearchMode={isSearchMode}
              handleToggleSearchMode={handleToggleSearchMode}
              setShowCreateRoom={setShowCreateRoom}
              searchQuery={searchQuery}
              handleUserSearch={handleUserSearch}
              searchResults={searchResults}
              loading={loading}
              chatRooms={chatRooms}
              activeRoom={activeRoom}
              setActiveRoom={setActiveRoom}
              handleStartPrivateChat={handleStartPrivateChat}
              handleJoinRoom={handleJoinRoom}
              handleLeaveRoom={handleLeaveRoom}
              isUserInRoom={isUserInRoom}
              // Mobile overlay behavior
              isMobile={isMobile}
              openMobile={showRoomsMobile}
              onCloseMobile={() => setShowRoomsMobile(false)}
            />
            )}

            <div className="flex-1 flex flex-col min-w-0">
              <ChatMessageList 
                activeRoom={activeRoom}
                participants={participants}
                messages={messages}
                session={session}
                loading={loading}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                messageInputRef={messageInputRef}
                messagesEndRef={messagesEndRef}
                isMobile={isMobile}
              />
              
              {activeRoom && (
                <ChatInput 
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  loading={loading}
                  messageInputRef={messageInputRef}
                  onFocus={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                />
              )}
            </div>
          </div>
        )}

        <ResizeControls 
          isMinimized={isMinimized}
          isFullScreen={isFullScreen}
          isResizing={isResizing}
          resizeDirection={resizeDirection}
          handleResizeMouseDown={handleResizeMouseDown}
        />

        <CreateRoomModal 
          showCreateRoom={showCreateRoom}
          setShowCreateRoom={setShowCreateRoom}
          newRoomName={newRoomName}
          setNewRoomName={setNewRoomName}
          newRoomDescription={newRoomDescription}
          setNewRoomDescription={setNewRoomDescription}
          newRoomType={newRoomType}
          setNewRoomType={setNewRoomType}
          handleCreateRoom={handleCreateRoom}
        />

      </div>
    </div>
  )
}