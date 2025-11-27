// src/hooks/useWebSocket.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type MessageType = 'join' | 'leave' | 'message' | 'ack' | 'typing' | 'presence' | 'system' | 'direct';

export interface WSMessage {
  type: MessageType;
  id?: string;
  room?: string;
  content?: string;
  senderId?: string;
  senderName?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface UseWebSocketOptions {
  url: string;
  token: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  enabled?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    token,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectDelay = 3000,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const manualDisconnectRef = useRef(false);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const connect = useCallback(() => {
    if (!enabled || !token) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Add token to URL as query parameter
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        manualDisconnectRef.current = false;
        onConnect?.();
        // Rejoin rooms after (re)connection
        setTimeout(() => {
          joinedRoomsRef.current.forEach((room) => {
            try {
              ws.send(JSON.stringify({ type: 'join', room, id: `join-${Date.now()}` }));
            } catch (e) {
              console.warn('Failed to rejoin room', room, e);
            }
          });
        }, 300);
        // Start heartbeat (presence ping) every 25 seconds
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          joinedRoomsRef.current.forEach((room) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'presence', room, content: 'online', timestamp: Date.now() }));
            }
          });
        }, 25000);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        // Auto reconnect if not manually disconnected
        if (autoReconnect && !manualDisconnectRef.current && enabled) {
          const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
        // clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = undefined;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [url, token, onConnect, onDisconnect, onError, onMessage, autoReconnect, reconnectDelay, enabled]);

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
  }, []);

  const sendMessage = useCallback((message: Partial<WSMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WSMessage = {
        ...message,
        timestamp: Date.now(),
      } as WSMessage;

      wsRef.current.send(JSON.stringify(fullMessage));
      return true;
    }
    console.warn('WebSocket not connected, message not sent');
    return false;
  }, []);

  const joinRoom = useCallback((room: string) => {
    // add to desired rooms to rejoin after reconnect
    joinedRoomsRef.current.add(room);
    return sendMessage({
      type: 'join',
      room,
      id: `join-${Date.now()}`,
    });
  }, [sendMessage]);

  const leaveRoom = useCallback((room: string) => {
    joinedRoomsRef.current.delete(room);
    return sendMessage({
      type: 'leave',
      room,
    });
  }, [sendMessage]);

  const sendChatMessage = useCallback((room: string, content: string, metadata?: Record<string, any>) => {
    return sendMessage({
      type: 'message',
      room,
      content,
      metadata,
      id: `msg-${Date.now()}`,
    });
  }, [sendMessage]);

  const sendDirectMessage = useCallback((targetId: string, content: string, metadata?: Record<string, any>) => {
    return sendMessage({
      type: 'direct',
      targetId,
      content,
      metadata,
      id: `dm-${Date.now()}`,
    });
  }, [sendMessage]);

  const sendTyping = useCallback((room: string, isTyping: boolean) => {
    return sendMessage({
      type: 'typing',
      room,
      content: isTyping.toString(),
    });
  }, [sendMessage]);

  useEffect(() => {
    if (enabled && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token]); // Solo reconectar si cambia enabled o token

  return {
    isConnected,
    lastMessage,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    sendDirectMessage,
    sendTyping,
    connect,
    disconnect,
  };
}
