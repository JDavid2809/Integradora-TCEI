"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface ChatMessage {
  id: number
  chat_room_id: number
  usuario_id: number
  contenido: string
  tipo: 'TEXTO' | 'IMAGEN' | 'ARCHIVO' | 'SISTEMA'
  archivo_url?: string
  archivo_nombre?: string
  enviado_en: string
  editado_en?: string
  eliminado: boolean
  entregado_en?: string
  visto_en?: string
  lecturas?: ChatMessageRead[]
  usuario: {
    id: number
    nombre: string
    apellido: string
    rol: string
  }
}

interface ChatMessageRead {
  id: number
  mensaje_id: number
  usuario_id: number
  leido_en: string
  usuario: {
    id: number
    nombre: string
    apellido: string
    rol: string
  }
}

interface ChatRoom {
  id: number
  nombre: string
  descripcion?: string
  tipo: 'GENERAL' | 'CLASE' | 'PRIVADO' | 'SOPORTE'
  creado_por: number
  creado_en: string
  activo: boolean
  ultimo_mensaje?: ChatMessage
  mensajes_no_leidos?: number
  participantes?: ChatParticipant[]
}

interface ChatParticipant {
  id: number
  chat_room_id: number
  usuario_id: number
  unido_en: string
  ultimo_visto?: string
  activo: boolean
  usuario: {
    id: number
    nombre: string
    apellido: string
    rol: string
  }
}

interface ChatContextType {
  // Estados
  chatRooms: ChatRoom[]
  activeRoom: ChatRoom | null
  messages: ChatMessage[]
  participants: ChatParticipant[]
  loading: boolean
  isConnected: boolean
  
  // Acciones
  setActiveRoom: (room: ChatRoom | null) => void
  sendMessage: (contenido: string, tipo?: 'TEXTO' | 'IMAGEN' | 'ARCHIVO') => Promise<void>
  loadMessages: (roomId: number) => Promise<void>
  loadChatRooms: () => Promise<void>
  createChatRoom: (nombre: string, descripcion?: string, tipo?: 'GENERAL' | 'CLASE' | 'PRIVADO' | 'SOPORTE') => Promise<ChatRoom | null>
  joinChatRoom: (roomId: number) => Promise<boolean>
  leaveChatRoom: (roomId: number) => Promise<boolean>
  markAsRead: (roomId: number) => Promise<void>
  markMessageAsDelivered: (messageId: number) => Promise<void>
  markMessageAsRead: (messageId: number) => Promise<void>
  
  // Chat privado
  startPrivateChat: (targetUserId: number) => Promise<ChatRoom | null>
  searchUsers: (query: string) => Promise<any[]>
  
  // Estado de conexión
  updateUserStatus: (isOnline: boolean) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  // Para simular conexión en tiempo real (en producción usarías WebSockets)
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  // API helper
  const api = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  // Cargar salas de chat
  const loadChatRooms = async () => {
    if (!session?.user) return
    
    try {
      setLoading(true)
      const rooms = await api('/api/chat/rooms')
      setChatRooms(rooms)
    } catch (error) {
      console.error('Error loading chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar mensajes de una sala
  const loadMessages = async (roomId: number) => {
    try {
      const data = await api(`/api/chat/rooms/${roomId}/messages`)
      setMessages(data.messages || [])
      setParticipants(data.participants || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Enviar mensaje
  const sendMessage = async (contenido: string, tipo: 'TEXTO' | 'IMAGEN' | 'ARCHIVO' = 'TEXTO') => {
    if (!activeRoom || !session?.user) return
    
    try {
      const newMessage = await api(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ contenido, tipo })
      })
      
      setMessages(prev => [...prev, newMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Crear sala de chat
  const createChatRoom = async (
    nombre: string, 
    descripcion?: string, 
    tipo: 'GENERAL' | 'CLASE' | 'PRIVADO' | 'SOPORTE' = 'GENERAL'
  ): Promise<ChatRoom | null> => {
    if (!session?.user) return null
    
    try {
      const newRoom = await api('/api/chat/rooms', {
        method: 'POST',
        body: JSON.stringify({ nombre, descripcion, tipo })
      })
      
      setChatRooms(prev => [...prev, newRoom])
      return newRoom
    } catch (error) {
      console.error('Error creating chat room:', error)
      return null
    }
  }

  // Unirse a sala
  const joinChatRoom = async (roomId: number): Promise<boolean> => {
    if (!session?.user) return false
    
    try {
      await api(`/api/chat/rooms/${roomId}/join`, { method: 'POST' })
      await loadChatRooms() // Recargar para actualizar la lista
      return true
    } catch (error) {
      console.error('Error joining chat room:', error)
      return false
    }
  }

  // Salir de sala
  const leaveChatRoom = async (roomId: number): Promise<boolean> => {
    if (!session?.user) return false
    
    try {
      await api(`/api/chat/rooms/${roomId}/leave`, { method: 'POST' })
      await loadChatRooms()
      if (activeRoom?.id === roomId) {
        setActiveRoom(null)
        setMessages([])
        setParticipants([])
      }
      return true
    } catch (error) {
      console.error('Error leaving chat room:', error)
      return false
    }
  }

  // Marcar como leído
  const markAsRead = async (roomId: number) => {
    if (!session?.user) return
    
    try {
      await api(`/api/chat/rooms/${roomId}/read`, { method: 'POST' })
      // Actualizar el contador de no leídos localmente
      setChatRooms(prev => 
        prev.map(room => 
          room.id === roomId 
            ? { ...room, mensajes_no_leidos: 0 }
            : room
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Iniciar chat privado
  const startPrivateChat = async (targetUserId: number): Promise<ChatRoom | null> => {
    if (!session?.user) return null
    
    try {
      const chatRoom = await api('/api/chat/private', {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      })
      
      // Agregar a la lista de salas si es nueva
      setChatRooms(prev => {
        const exists = prev.find(room => room.id === chatRoom.id)
        if (exists) return prev
        return [...prev, chatRoom]
      })
      
      return chatRoom
    } catch (error) {
      console.error('Error starting private chat:', error)
      return null
    }
  }

  // Buscar usuarios
  const searchUsers = async (query: string): Promise<any[]> => {
    if (!session?.user) return []
    
    try {
      const users = await api(`/api/chat/users?q=${encodeURIComponent(query)}`)
      return users
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  // Marcar mensaje como entregado
  const markMessageAsDelivered = async (messageId: number): Promise<void> => {
    if (!session?.user) return
    
    try {
      await api(`/api/chat/messages/${messageId}/delivered`, { method: 'PUT' })
      
      // Actualizar el mensaje en el estado local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, entregado_en: new Date().toISOString() }
          : msg
      ))
    } catch (error) {
      console.error('Error marking message as delivered:', error)
    }
  }

  // Marcar mensaje como leído
  const markMessageAsRead = async (messageId: number): Promise<void> => {
    if (!session?.user) return
    
    try {
      await api(`/api/chat/messages/${messageId}/read`, { method: 'PUT' })
      
      // Actualizar el mensaje en el estado local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              visto_en: new Date().toISOString(),
              lecturas: [
                ...(msg.lecturas || []),
                {
                  id: Date.now(), // Temporal ID
                  mensaje_id: messageId,
                  usuario_id: Number(session.user.id),
                  leido_en: new Date().toISOString(),
                  usuario: {
                    id: Number(session.user.id),
                    nombre: session.user.name || '',
                    apellido: session.user.apellido || '',
                    rol: session.user.rol || ''
                  }
                }
              ]
            }
          : msg
      ))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  // Actualizar estado de usuario (conectado/desconectado)
  const updateUserStatus = async (isOnline: boolean): Promise<void> => {
    if (!session?.user) return
    
    try {
      await api('/api/chat/status', {
        method: 'PUT',
        body: JSON.stringify({ isOnline })
      })
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Polling para simular tiempo real (en producción usarías WebSockets)
  useEffect(() => {
    if (!session?.user || !activeRoom) return
    
    const startPolling = () => {
      pollInterval.current = setInterval(async () => {
        try {
          const data = await api(`/api/chat/rooms/${activeRoom.id}/messages`)
          setMessages(data.messages || [])
        } catch (error) {
          console.error('Error polling messages:', error)
        }
      }, 3000) // Cada 3 segundos
    }

    startPolling()
    setIsConnected(true)

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current)
        pollInterval.current = null
      }
      setIsConnected(false)
    }
  }, [session, activeRoom])

  // Cargar salas al montar
  useEffect(() => {
    if (session?.user) {
      loadChatRooms()
    }
  }, [session])

  const value: ChatContextType = {
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
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}