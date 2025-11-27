import React, { useRef } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { Send } from 'lucide-react'

interface ChatInputProps {
  newMessage: string
  setNewMessage: (msg: string) => void
  handleSendMessage: (e: React.FormEvent) => void
  loading: boolean
  messageInputRef: React.RefObject<HTMLInputElement | null>
  onFocus?: () => void
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  loading,
  messageInputRef
  , onFocus
}: ChatInputProps) {
  const { activeRoom, joiningRoomIds, sendTyping } = useChat()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  return (
    <form onSubmit={(e) => { handleSendMessage(e); if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); try { sendTyping(false) } catch (err) {} }} className="p-4 border-t bg-white flex-shrink-0 z-20 sticky bottom-0 safe-area-bottom">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <input
            ref={messageInputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              try {
                sendTyping(true)
              } catch (err) {
                // Ignore if not connected
              }
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
              typingTimeoutRef.current = setTimeout(() => {
                try { sendTyping(false) } catch (err) {}
              }, 1500)
            }}
            placeholder="Escribe un mensaje..."
            aria-label="Escribe un mensaje"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00246a]/20 focus:border-[#00246a] transition-all resize-none"
            disabled={loading}
            onFocus={() => { if (onFocus) onFocus() }}
          />
        </div>
        <button
          type="submit"
          disabled={!newMessage.trim() || loading || !!(activeRoom && joiningRoomIds?.includes(activeRoom.id))}
          className="p-3 bg-[#00246a] text-white rounded-full hover:bg-[#003875] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          aria-label="Enviar mensaje"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </form>
  )
}
