// src/app/test-chat/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket, WSMessage } from '@/hooks/useWebSocket';

export default function TestChatPage() {
  const { data: session } = useSession();
  const [token, setToken] = useState<string>('');
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomName, setRoomName] = useState<string>('');

  // Obtener token de chat
  useEffect(() => {
    if (session) {
      fetch('/api/chat/token')
        .then(res => res.json())
          .then(data => {
          console.log('Token obtenido:', data);
          setToken(data.token);
        })
        .catch(err => console.error('Error obteniendo token:', err));
    }
  }, [session]);

  // Configurar WebSocket
  const {
    isConnected,
    lastMessage,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    sendTyping
  } = useWebSocket({
    url: process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:3001/ws/chat',
    token,
    enabled: !!token && !!session,
      onMessage: (msg) => {
      console.log('Mensaje recibido:', msg);
      if (msg.type === 'message' || msg.type === 'system') {
        setMessages(prev => [...prev, msg]);
      }
    },
    onConnect: () => {
      console.log('Conectado al chat WebSocket');
    },
    onDisconnect: () => {
      console.log('Desconectado del chat WebSocket');
    },
    onError: (error) => {
      console.error('Error WebSocket:', error);
    }
  });

  // Obtener primeras salas disponibles y establecer roomId
  useEffect(() => {
    if (session) {
      fetch('/api/chat/rooms', { credentials: 'include' })
        .then(res => res.json())
        .then(rooms => {
          if (Array.isArray(rooms) && rooms.length > 0) {
            const r = rooms[0]
            setRoomId(r.id)
            setRoomName(String(r.id))
          }
        })
        .catch(err => console.error('Error fetching rooms:', err))
    }
  }, [session]);

  // Unirse a la sala cuando se conecte
  useEffect(() => {
    if (!isConnected || !roomId) return;

    const joinSequence = async () => {
      console.log(`Uniéndose a sala: ${roomId}`);
      try {
        const res = await fetch(`/api/chat/rooms/${roomId}/join`, { method: 'POST', credentials: 'include' })
        if (!res.ok) {
          console.warn('No se pudo crear la participación en la sala (REST)', res.status)
        } else {
          // Solo unirse por WebSocket si la join REST fue exitosa
          await joinRoom(String(roomId));
        }
      } catch (err) {
        console.error('Error al unirse via REST:', err);
      }
    };

    joinSequence();

    return () => {
      if (isConnected && roomId) {
        leaveRoom(String(roomId));
      }
    };
  }, [isConnected, roomId, joinRoom, leaveRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;

    const success = sendChatMessage(String(roomId), inputValue.trim());
    if (success) {
      setInputValue('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!roomId) return;
    if (e.target.value.length > 0) {
      sendTyping(String(roomId), true);
    } else {
      sendTyping(String(roomId), false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
          <a href="/Login" className="text-blue-600 hover:underline">
            Ir a Login
          </a>
        </div>
      </div>
    );
  }

  const handleMarkAllRead = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/read`, { method: 'POST', credentials: 'include' })
      console.log('markAllRead status:', res.status)
    } catch (err) { console.error('Error marking all read:', err) }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">Test del Chat WebSocket</h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
            <div>Sala: <span className="font-mono">{roomName || roomId}</span></div>
            <div>Usuario: {session.user?.email}</div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="font-semibold mb-2">Estado del Sistema:</h2>
          <ul className="text-sm space-y-1">
            <li>Token JWT: {token ? 'Obtenido (' + token.substring(0, 20) + '...)' : 'Esperando...'}</li>
            <li>WebSocket URL: {process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:3001/ws/chat'}</li>
            <li>Sesión: {session.user?.email}</li>
            <li>Rol: {session.user?.rol}</li>
            <li className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Conectado al servidor' : 'No conectado'}
            </li>
            <li>
              <button onClick={handleMarkAllRead} className="px-2 py-1 bg-blue-600 text-white rounded">Marcar todo como leído</button>
            </li>
          </ul>
        </div>

        {/* Mensajes */}
        <div className="h-96 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No hay mensajes aún</p>
              <p className="text-sm mt-2">Envía un mensaje para empezar</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`p-3 rounded-lg ${
                  msg.type === 'system'
                    ? 'bg-gray-200 text-center text-gray-700'
                    : msg.senderId === String(session.user?.id)
                    ? 'bg-blue-600 text-white ml-auto max-w-md'
                    : 'bg-white border mr-auto max-w-md'
                }`}
              >
                {msg.type !== 'system' && (
                  <div className="text-xs opacity-70 mb-1">
                    {msg.senderName || msg.senderId}
                  </div>
                )}
                <div>{msg.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleTyping}
              placeholder="Escribe un mensaje..."
              disabled={!isConnected}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!isConnected || !inputValue.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
            <div className="text-xs text-gray-500 mt-2">
            {!isConnected && 'No conectado al servidor'}
            {isConnected && !inputValue && 'Escribe algo para empezar'}
          </div>
        </form>

        {/* Instrucciones */}
        <div className="bg-blue-50 p-4 text-sm">
          <h3 className="font-semibold mb-2">Instrucciones de Prueba:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Verifica que el estado muestre "Conectado"</li>
            <li>Abre esta página en otra ventana/navegador con otro usuario</li>
            <li>Envía mensajes desde ambas ventanas</li>
            <li>Los mensajes deben aparecer en tiempo real en ambas ventanas</li>
            <li>Verifica que los indicadores de "typing" funcionen</li>
          </ol>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-gray-800 text-gray-100 rounded-lg font-mono text-xs">
        <h3 className="text-sm font-bold mb-2">Debug Info:</h3>
        <pre className="overflow-x-auto">
          {JSON.stringify({
            connected: isConnected,
            lastMessage: lastMessage ? {
              type: lastMessage.type,
              timestamp: new Date(lastMessage.timestamp).toISOString(),
              hasContent: !!lastMessage.content
            } : null,
            messagesCount: messages.length,
            roomId,
            roomName,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
