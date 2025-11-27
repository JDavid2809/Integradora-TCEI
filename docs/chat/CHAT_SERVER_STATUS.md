`
```markdown
# Guía de Integración y Pruebas - Servidor de Chat WebSocket

## Estado Actual

El servidor de chat WebSocket está **instalado y funcionando** correctamente en tu sistema.

### Servicios Activos

```

text
Chat Server:      http://localhost:3001
WebSocket:        ws://localhost:3001/ws/chat
Health Check:     http://localhost:3001/health (Verificado)
MongoDB:          localhost:27018 (para evitar conflicto con MongoDB principal)
Redis:            localhost:6380 (para evitar conflicto con Redis principal)
MongoDB Express:  http://localhost:8081 (admin/pass)
```text
## Pruebas Realizadas

### 1. Health Check

```

bash
curl http://localhost:3001/health
# Response: {"status":"ok","time":1763926241}

```text
### 2. Servicios Docker


- MongoDB conectado

- Redis Pub/Sub conectado

- Servidor Fiber iniciado en puerto 3001

## 🔌 Integración con tu Aplicación Next.js

### Paso 1: Variables de Entorno

Agrega a tu `.env.local`:

```

env
# Chat WebSocket Server

NEXT_PUBLIC_CHAT_WS_URL=ws://localhost:3001/ws/chat
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001/api

# JWT Secret (usa el mismo que NEXTAUTH_SECRET)

JWT_SECRET=${NEXTAUTH_SECRET}
```text
### Paso 2: Instalar Dependencias

```

bash
npm install jsonwebtoken @types/jsonwebtoken
```text
### Paso 3: Usar el Hook de WebSocket

Copia el archivo creado `src/hooks/useWebSocket.ts` que ya está en tu proyecto.

### Paso 4: Obtener Token de Chat

Ya existe el endpoint `/api/chat/token` que genera tokens JWT para el chat.

### Ejemplo de Uso

```

typescript
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';

export default function ChatComponent() {
  const [token, setToken] = useState<string>('');
  const [room] = useState('general_chat');

  // Obtener token
  useEffect(() => {
    fetch('/api/chat/token')
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, []);

  // Conectar WebSocket
  const {
    isConnected,
    lastMessage,
    joinRoom,
    sendChatMessage,
    sendTyping
  } = useWebSocket({
    url: process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:3001/ws/chat',
    token,
    enabled: !!token,
    onMessage: (msg) => {
      console.log('Mensaje recibido:', msg);
    },
    onConnect: () => {
      console.log('Conectado al chat');
      joinRoom(room);
    }
  });

  const handleSend = (message: string) => {
    sendChatMessage(room, message);
  };

  return (
    <div>
      <div>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>
      {/* Tu UI de chat aquí */}
    </div>
  );
}
```text
## 🧪 Pruebas Manuales

### Test 1: Health Check

```

bash
curl http://localhost:3001/health
```text
**Resultado esperado:**
```

json
{"status":"ok","time":1763926241}
```text
### Test 2: Obtener Token de Chat

```

bash
# Con sesión activa en tu app Next.js

curl http://localhost:3000/api/chat/token \
  -H "Cookie: next-auth.session-token=TU_SESSION_TOKEN"
```text
**Resultado esperado:**
```

json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "1",
  "email": "user@example.com",
  "role": "ESTUDIANTE"
}
```text
### Test 3: Conectar WebSocket (con navegador)


1. Abre la consola del navegador (F12)

2. Ejecuta:

```

javascript
// Primero obtén el token
fetch('/api/chat/token')
  .then(r => r.json())
  .then(data => {
    const token = data.token;
    const ws = new WebSocket(`ws://localhost:3001/ws/chat?token=${token}`);

    ws.onopen = () => {
      console.log('Conectado');

      // Unirse a sala
      ws.send(JSON.stringify({
        type: 'join',
        room: 'test_room',
        id: 'join-' + Date.now()
      }));
    };

    ws.onmessage = (e) => {
      console.log('Mensaje:', JSON.parse(e.data));
    };

    // Guardar para enviar mensajes
    window.chatWs = ws;
  });

// Después de conectar, enviar mensaje:
window.chatWs.send(JSON.stringify({
  type: 'message',
  room: 'test_room',
  content: '¡Hola desde el navegador!',
  id: 'msg-' + Date.now()
}));
```text
## Integración con ChatWindow Existente

Tu aplicación ya tiene un componente `ChatWindow` que usa el sistema de chat actual. Para integrarlo con el nuevo servidor WebSocket:

### Opción 1: Migración Gradual

Mantén ambos sistemas y migra gradualmente:

```

typescript
// src/contexts/ChatContext.tsx

const USE_WEBSOCKET = process.env.NEXT_PUBLIC_USE_WEBSOCKET === 'true';

if (USE_WEBSOCKET) {
  // Usar nuevo servidor WebSocket
  const ws = useWebSocket({...});
} else {
  // Usar sistema actual (polling)
  useEffect(() => {
    // Tu implementación actual
  }, []);
}
```text
### Opción 2: Reemplazo Completo

Actualiza `ChatContext` para usar completamente el nuevo servidor WebSocket.

## Comandos Útiles

### Ver Logs del Servidor

```

bash
cd chat-server-go
docker-compose logs -f chat-server
```text
### Reiniciar Servidor

```

bash
cd chat-server-go
docker-compose restart chat-server
```text
### Detener Servicios

```

bash
cd chat-server-go
docker-compose down
```text
### Iniciar Servicios

```

bash
cd chat-server-go
docker-compose up -d
```text
### Ver Estado de Contenedores

```

bash
cd chat-server-go
docker-compose ps
```text
## Monitoreo

### MongoDB Express


- URL: http://localhost:8081

- Usuario: `admin`

- Password: `pass`

- Base de datos: `chat_db`

- Colección: `chat_messages`

### Logs en Tiempo Real

```

bash
# Todos los servicios

docker-compose logs -f

# Solo chat server

docker-compose logs -f chat-server

# Solo MongoDB

docker-compose logs -f mongo
```text
## Seguridad

### JWT Secret

El servidor usa el mismo `JWT_SECRET` que tu aplicación Next.js para validar tokens. Asegúrate de que:


1. `JWT_SECRET` en `chat-server-go/.env` coincida con `NEXTAUTH_SECRET` en tu `.env.local`

2. Los tokens tengan el formato correcto con campos: `userId`, `email`, `role`

### CORS

El servidor acepta conexiones desde:
```

text
http://localhost:3000
https://yourdomain.com
```text
Para agregar más orígenes, edita `ORIGIN_WHITELIST` en `chat-server-go/.env`.

##  Troubleshooting

### Error: "Port already allocated"

Si MongoDB (27017) o Redis (6379) ya están en uso, el docker-compose ya está configurado para usar:

- MongoDB: puerto 27018

- Redis: puerto 6380

### Error: "WebSocket connection failed"


1. Verifica que el servidor esté corriendo: `curl http://localhost:3001/health`

2. Verifica el token JWT: debe ser válido y no estar expirado

3. Revisa CORS: tu origen debe estar en `ORIGIN_WHITELIST`

### Error: "Invalid token"


1. Verifica que `JWT_SECRET` coincida en ambos servidores

2. Obtén un nuevo token: `GET /api/chat/token`

3. Verifica que el token no haya expirado (24h)

## Próximos Pasos


1. Servidor instalado y funcionando

2. ⏭️ Integrar con tu componente `ChatWindow`

3. ⏭️ Probar en desarrollo con múltiples usuarios

4. ⏭️ Configurar para producción con HTTPS/WSS

5. ⏭️ Agregar características adicionales (archivos, reacciones, etc.)

## Características Disponibles


- Autenticación JWT

- Rooms por curso/clase

- Mensajes directos (DM)

- Typing indicators

- Presencia online/offline

- ACKs de mensajes

- Historial de mensajes

- Paginación

- Rate limiting

- Sanitización de contenido

- Redis Pub/Sub para escalado

- MongoDB para persistencia

## Documentación Adicional


- **API completa**: `chat-server-go/docs/API.md`

- **Deployment**: `chat-server-go/docs/DEPLOYMENT.md`

- **Arquitectura**: `chat-server-go/docs/ARCHITECTURE.md`

- **Cliente Next.js**: `chat-server-go/examples/nextjs-client/README.md`

---

**¿Necesitas ayuda?** Revisa los logs: `cd chat-server-go && docker-compose logs -f`

```

`
