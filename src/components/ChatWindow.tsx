"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { 
  MessageCircle, 
  Send, 
  Users, 
  Plus, 
  Settings,
  X,
  Hash,
  Lock,
  Globe,
  HeadphonesIcon,
  Minimize2,
  Maximize2,
  Maximize,
  Circle,
  UserPlus,
  LogOut,
  Search,
  User,
  Move,
  CornerDownRight,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCheck,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useSession } from 'next-auth/react'

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
    loadChatRooms,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom,
    markAsRead,
    markMessageAsDelivered,
    markMessageAsRead,
    startPrivateChat,
    searchUsers,
    updateUserStatus
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
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isChatListMinimized, setIsChatListMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatListMinimized') === 'true'
    }
    return false
  })

  // Estados para posición y tamaño de la ventana
  const [position, setPosition] = useState(() => ({
    x: Math.max(0, window.innerWidth - 420),
    y: Math.max(0, window.innerHeight - 650)
  }))
  const [size, setSize] = useState({ width: 384, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 })
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, 
    y: 0, 
    startWidth: 0, 
    startHeight: 0, 
    startX: 0, 
    startY: 0 
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id)
      markAsRead(activeRoom.id)
    }
  }, [activeRoom])

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
        !msg.lecturas?.some(lectura => lectura.usuario_id === Number(session?.user?.id))
      )

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
      console.log(`🔍 Searching users with query: "${query}"`)
      
      let results
      if (query.trim()) {
        results = await searchUsers(query)
      } else {
        results = await searchUsers('')
      }

      // En desarrollo, mostrar información adicional
      if (process.env.NODE_ENV === 'development' && results) {
        console.log(`✅ Search results:`, {
          query,
          count: Array.isArray(results) ? results.length : (results as any).users?.length || 0,
          results: Array.isArray(results) ? results : (results as any).users || []
        })
      }

      // Manejar tanto formato antiguo (array) como nuevo (objeto con debug)
      const usersList = Array.isArray(results) ? results : (results as any).users || []
      setSearchResults(usersList)
      
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
      
      // En desarrollo, mostrar más detalles del error
      if (process.env.NODE_ENV === 'development') {
        alert(`Error buscando usuarios: ${(error as Error).message}`)
      }
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

  const isUserInRoom = (roomId: number) => {
    const room = chatRooms.find(r => r.id === roomId)
    return room?.participantes?.some(p => p.usuario_id === Number(session?.user?.id))
  }

  // Obtener el icono de estado del mensaje
  const getMessageStatusIcon = (message: any) => {
    const isMyMessage = message.usuario_id === Number(session?.user?.id)
    
    if (!isMyMessage) return null // Solo mostrar estado en mis mensajes
    
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
  }

  // Obtener indicador de conexión
  const getConnectionStatus = () => {
    return isConnected ? (
      <div title="Conectado">
        <Wifi className="w-4 h-4 text-green-500" />
      </div>
    ) : (
      <div title="Desconectado">
        <WifiOff className="w-4 h-4 text-red-500" />
      </div>
    )
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
      setSize({ width: 384, height: 600 })
    }
  }, [isMinimized])

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

  if (!isOpen) return null

  return (
    <div 
      ref={chatWindowRef}
      className={`fixed z-50 ${isDragging || isResizing ? 'select-none' : ''} ${
        isFullScreen ? 'inset-0' : ''
      }`}
      style={isFullScreen ? {
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        transition: 'all 0.3s ease',
      } : {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
      }}
    >
      <div className={`bg-white h-full flex flex-col overflow-hidden ${
        isFullScreen ? 'rounded-none border-0' : 'rounded-xl shadow-2xl border-2'
      } ${
        isDragging ? 'border-[#00246a] shadow-3xl' : 'border-gray-200'
      } ${isResizing ? 'border-[#e30f28]' : ''}`}>
        {/* Header */}
        <div 
          className={`flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#00246a] to-[#003875] text-white ${
            isFullScreen ? 'rounded-none' : 'rounded-t-xl'
          } ${
            isDragging && !isFullScreen ? 'cursor-grabbing' : !isFullScreen ? 'cursor-move' : 'cursor-default'
          }`}
          onMouseDown={!isFullScreen ? handleMouseDown : undefined}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg">Chat</span>
              <div className="flex items-center gap-2 text-sm text-white/80">
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400" />
                )}
                <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                {participants.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{participants.length} usuarios</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isFullScreen ? "Salir de pantalla completa (Esc)" : "Ver en pantalla completa"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-1 min-h-0">
            {/* Sidebar de salas */}
            <div className={`${isChatListMinimized ? 'w-16' : 'w-64'} border-r border-gray-200 flex flex-col bg-gray-50/50 min-w-0 transition-all duration-300`}>
              {/* Header de salas */}
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  {!isChatListMinimized && <span className="font-semibold text-[#00246a]">Salas de Chat</span>}
                  <div className="flex items-center gap-1">
                    {!isChatListMinimized && (
                      <>
                        <button
                          onClick={handleToggleSearchMode}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            isSearchMode 
                              ? 'bg-[#e30f28] text-white' 
                              : 'hover:bg-[#e30f28] hover:text-white text-[#00246a]'
                          }`}
                          title={isSearchMode ? "Cancelar búsqueda" : "Buscar usuarios"}
                        >
                          {isSearchMode ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setShowCreateRoom(true)}
                          className="p-2 hover:bg-[#e30f28] hover:text-white rounded-lg transition-all duration-200 text-[#00246a]"
                          title="Crear sala"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsChatListMinimized(!isChatListMinimized)}
                      className="p-2 hover:bg-[#e30f28] hover:text-white rounded-lg transition-all duration-200 text-[#00246a]"
                      title={isChatListMinimized ? "Expandir lista de chats" : "Minimizar lista de chats"}
                    >
                      {isChatListMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones de acceso rápido cuando está minimizado */}
              {isChatListMinimized && (
                <div className="p-2 space-y-2 border-b border-gray-200">
                  <button
                    onClick={handleToggleSearchMode}
                    className={`w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      isSearchMode 
                        ? 'bg-[#e30f28] text-white' 
                        : 'hover:bg-[#e30f28] hover:text-white text-[#00246a]'
                    }`}
                    title={isSearchMode ? "Cancelar búsqueda" : "Buscar usuarios"}
                  >
                    {isSearchMode ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowCreateRoom(true)}
                    className="w-full p-2 hover:bg-[#e30f28] hover:text-white rounded-lg transition-all duration-200 text-[#00246a] flex items-center justify-center"
                    title="Crear sala"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Barra de búsqueda */}
              {isSearchMode && (
                <div className="p-2 border-b border-gray-200">
                  {!isChatListMinimized ? (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] text-sm"
                      placeholder="Buscar usuarios por nombre o email..."
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleUserSearch(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00246a]"
                        placeholder="Buscar..."
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Lista de salas o resultados de búsqueda */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
                {isSearchMode ? (
                  // Mostrar resultados de búsqueda
                  <div className="space-y-2">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium mb-2">
                          {searchQuery ? 'No se encontraron usuarios' : 'Escribe para buscar usuarios'}
                        </p>
                        {searchQuery && !isChatListMinimized && (
                          <div className="text-xs space-y-1">
                            <p>• Verifica que el nombre o email sea correcto</p>
                            <p>• Solo se muestran usuarios verificados</p>
                            {process.env.NODE_ENV === 'development' && (
                              <p className="text-orange-500">
                                • En desarrollo: También se muestran usuarios no verificados
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      searchResults.map(user => (
                        <div
                          key={user.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#00246a] text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              {!isChatListMinimized && (
                                <div>
                                  <p className="font-medium text-gray-900">{user.nombre}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                  <p className="text-xs text-gray-400 capitalize">{user.role?.toLowerCase()}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleStartPrivateChat(user.id)}
                              className="px-3 py-1 bg-[#00246a] text-white text-sm rounded-lg hover:bg-[#003875] transition-colors"
                              title={isChatListMinimized ? (user.hasExistingChat ? 'Abrir Chat' : 'Iniciar Chat') : undefined}
                            >
                              {isChatListMinimized ? '💬' : (user.hasExistingChat ? 'Abrir Chat' : 'Iniciar Chat')}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className={`${isChatListMinimized ? 'w-6 h-6' : 'w-8 h-8'} animate-spin mx-auto mb-2`} />
                    {!isChatListMinimized && <p className="text-sm">Cargando salas...</p>}
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className={`${isChatListMinimized ? 'w-6 h-6' : 'w-8 h-8'} mx-auto mb-2 opacity-50`} />
                    {!isChatListMinimized && (
                      <>
                        <p className="text-sm font-medium">No hay salas disponibles</p>
                        <p className="text-xs text-gray-400 mt-1">Crea una nueva sala para empezar</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {chatRooms.map(room => (
                      <div key={room.id} className="relative group">
                        <button
                          onClick={() => setActiveRoom(room)}
                          className={`w-full ${isChatListMinimized ? 'p-2' : 'p-3'} text-left rounded-lg transition-all duration-200 ${
                            activeRoom?.id === room.id 
                              ? 'bg-gradient-to-r from-[#00246a]/10 to-[#e30f28]/10 border border-[#e30f28]/30' 
                              : 'hover:bg-white/80'
                          }`}
                          title={isChatListMinimized ? room.nombre : undefined}
                        >
                          {isChatListMinimized ? (
                            // Vista minimizada - solo icono
                            <div className="flex items-center justify-center relative">
                              <div className={`p-2 rounded-lg transition-all duration-200 ${
                                activeRoom?.id === room.id 
                                  ? 'bg-[#e30f28] text-white' 
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-[#00246a] group-hover:text-white'
                              }`}>
                                {getRoomIcon(room.tipo)}
                              </div>
                              {(room.mensajes_no_leidos ?? 0) > 0 && (
                                <div className="absolute -top-1 -right-1 bg-[#e30f28] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                  {(room.mensajes_no_leidos ?? 0) > 9 ? '9+' : room.mensajes_no_leidos}
                                </div>
                              )}
                            </div>
                          ) : (
                            // Vista expandida - completa
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg transition-all duration-200 ${
                                activeRoom?.id === room.id 
                                  ? 'bg-[#e30f28] text-white' 
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-[#00246a] group-hover:text-white'
                              }`}>
                                {getRoomIcon(room.tipo)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-medium text-sm truncate ${
                                    activeRoom?.id === room.id ? 'text-[#00246a]' : 'text-gray-900'
                                  }`}>
                                    {room.nombre}
                                  </span>
                                  {(room.mensajes_no_leidos ?? 0) > 0 && (
                                    <span className="bg-[#e30f28] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium">
                                      {room.mensajes_no_leidos}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{room.descripcion || 'Sin descripción'}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Users className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-400">
                                    {room.participantes?.length || 0} participantes
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                        
                        {/* Botones de acciones en hover - solo en vista expandida */}
                        {!isChatListMinimized && room.tipo !== 'PRIVADO' && (
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUserInRoom(room.id) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLeaveRoom(room.id)
                                }}
                                className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                                title="Salir de la sala"
                              >
                                <LogOut className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJoinRoom(room.id)
                                }}
                                className="p-1 bg-green-100 hover:bg-green-200 text-green-600 rounded transition-colors"
                                title="Unirse a la sala"
                              >
                                <UserPlus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Área principal de chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeRoom ? (
                <>
                  {/* Header de la sala activa */}
                  <div className="p-3 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {getRoomIcon(activeRoom.tipo)}
                      <div>
                        <h3 className="font-medium text-gray-900">{activeRoom.nombre}</h3>
                        <p className="text-xs text-gray-500">{activeRoom.descripcion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{participants.length}</span>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay mensajes en esta sala</p>
                        <p className="text-xs text-gray-400">¡Sé el primero en enviar un mensaje!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.usuario_id === Number(session?.user?.id) ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              message.usuario_id === Number(session?.user?.id)
                                ? 'bg-[#00246a] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.usuario_id !== Number(session?.user?.id) && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {message.usuario?.nombre || 'Usuario'}
                              </p>
                            )}
                            <p className="text-sm">{message.contenido}</p>
                            <div className={`flex items-center justify-between text-xs mt-1 ${
                              message.usuario_id === Number(session?.user?.id)
                                ? 'text-white/70'
                                : 'text-gray-500'
                            }`}>
                              <span>{formatTime(message.enviado_en)}</span>
                              {getMessageStatusIcon(message)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de mensaje */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 flex-shrink-0">
                    <div className="flex gap-2">
                      <input
                        ref={messageInputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Bienvenido al Chat</h3>
                    <p className="text-sm">Selecciona una sala para comenzar a chatear</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controles de redimensionamiento */}
        {!isMinimized && !isFullScreen && (
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
        )}

        {/* Modal para crear sala */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
              <h3 className="text-lg font-semibold mb-4 text-[#00246a]">Crear Nueva Sala</h3>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la sala
                  </label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a]"
                    placeholder="Ej: Sala General"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] resize-none"
                    rows={3}
                    placeholder="Descripción de la sala..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de sala
                  </label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as 'GENERAL' | 'SOPORTE' | 'CLASE')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a]"
                  >
                    <option value="GENERAL">General</option>
                    <option value="SOPORTE">Soporte</option>
                    <option value="CLASE">Clase</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateRoom(false)
                      setNewRoomName('')
                      setNewRoomDescription('')
                      setNewRoomType('GENERAL')
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newRoomName.trim()}
                    className="flex-1 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-[#003875] disabled:opacity-50 transition-colors"
                  >
                    Crear Sala
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}