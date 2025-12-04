"use client"

import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import ChatWindow from './ChatWindow'

export default function ChatFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-40 bg-[#00246a] dark:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all duration-300 hover:scale-110"
          title="Abrir Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Ventana de chat */}
      <ChatWindow
        isOpen={isOpen}
        onClose={closeChat}
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
      />
    </>
  )
}