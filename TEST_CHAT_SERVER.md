# SERVIDOR DE CHAT WEBSOCKET - RESUMEN DE INTEGRACIÓN (Archivo movido)

Este archivo ha sido movido a `docs/chat/TEST_CHAT_SERVER.md`.
Por favor revisa la versión actualizada y centralizada en el directorio `docs/`.

El servidor de chat WebSocket está **funcionando correctamente** e integrado con tu sistema de aprendizaje de inglés.

---

## Servicios Activos

| Servicio | URL | Estado |
|----------|-----|--------|
| **Chat Server** | http://localhost:3001 | Activo |
| **WebSocket** | ws://localhost:3001/ws/chat | Activo |
| **Health Check** | http://localhost:3001/health | Verificado |
| **MongoDB Chat** | localhost:27018 | Activo |
| **Redis** | localhost:6380 | Activo |
| **MongoDB Express** | http://localhost:8081 | Activo |

---

## CÓMO PROBAR EL CHAT

### Opción 1: Página de Prueba (Recomendado)

1. **Inicia tu aplicación Next.js:**
   ```bash
   npm run dev
   ```

2. **Accede a la página de prueba:**
   ```
   http://localhost:3000/test-chat
   ```

3. **Verifica que aparezca:**
  - Estado: "Conectado"
  - Token JWT obtenido
  - Tu email y rol

4. **Prueba enviar mensajes:**
   - Escribe un mensaje y presiona "Enviar"
   - Debe aparecer en la lista de mensajes

5. **Prueba con múltiples usuarios:**
   - Abre otra ventana de navegador en modo incógnito
   - Inicia sesión con otro usuario
   - Abre http://localhost:3000/test-chat
   - Envía mensajes desde ambas ventanas
  - Los mensajes deben aparecer en tiempo real en ambas ventanas

### Opción 2: Consola del Navegador

1. Abre tu app en http://localhost:3000 e inicia sesión
2. Abre la consola del navegador (F12)
3. Ejecuta:

```javascript
// Obtener token
fetch('/api/chat/token')
  .then(r => r.json())
  .then(data => {
    console.log('Token:', data.token);
    
    // Conectar WebSocket
    const ws = new WebSocket(`ws://localhost:3001/ws/chat?token=${data.token}`);
    
    ws.onopen = () => {
      console.log('Conectado al chat');
      
      // Unirse a sala
      ws.send(JSON.stringify({
        type: 'join',
        room: 'test_room',
        id: 'join-' + Date.now()
      }));
    };
    
    ws.onmessage = (e) => {
      console.log('Mensaje recibido:', JSON.parse(e.data));
    };
    
    // Guardar para enviar mensajes
    window.chatWs = ws;
  });

// Enviar mensaje de prueba:
window.chatWs.send(JSON.stringify({
  type: 'message',
  room: 'test_room',
  content: '¡Hola desde la consola!',
  id: 'msg-' + Date.now()
}));
```

---

## Archivos Creados e Integrados

### Backend (Servidor Go)
- `chat-server-go/main.go` - Servidor principal
- `chat-server-go/internal/auth/jwt.go` - Autenticación JWT
- `chat-server-go/internal/ws/hub.go` - Hub WebSocket
- `chat-server-go/internal/store/mongo.go` - Store MongoDB
- `chat-server-go/internal/pubsub/redis.go` - Redis Pub/Sub
- `chat-server-go/docker-compose.yml` - Configuración Docker
- `chat-server-go/.env` - Variables de entorno

### Frontend (Next.js)
- `src/hooks/useWebSocket.ts` - Hook de WebSocket
- `src/lib/chatToken.ts` - Generación de tokens JWT
- `src/app/api/chat/token/route.ts` - Endpoint de tokens
- `src/app/test-chat/page.tsx` - Página de pruebas

### Documentación
- `chat-server-go/README.md` - Documentación principal
- `chat-server-go/docs/API.md` - API completa
- `chat-server-go/docs/DEPLOYMENT.md` - Guía de deployment
- `chat-server-go/docs/ARCHITECTURE.md` - Arquitectura
- `CHAT_SERVER_STATUS.md` - Estado y guía
- `CHAT_INTEGRATION.md` - Guía de integración

---

## Comandos Útiles

### Ver logs del servidor:
```bash
cd chat-server-go
docker-compose logs -f chat-server
```

### Reiniciar servidor:
```bash
cd chat-server-go
docker-compose restart chat-server
```

### Detener servicios:
```bash
cd chat-server-go
docker-compose down
```

### Iniciar servicios:
```bash
cd chat-server-go
docker-compose up -d
```

### Verificar salud:
```bash
curl http://localhost:3001/health
```

---

## ✨ Características Implementadas

- **Autenticación JWT** - Integrada con NextAuth
- **Rooms** - Salas de chat por curso/clase
- **Mensajes Directos** - Chat privado entre usuarios
- **Typing Indicators** - Indicadores de escritura
- **Presencia** - Estado online/offline
- **ACKs** - Confirmación de mensajes entregados
- **Historial** - Almacenamiento en MongoDB
- **Paginación** - Carga de mensajes antiguos
- **Rate Limiting** - Protección contra spam
- **Sanitización** - Contenido seguro (XSS protection)
- **Redis Pub/Sub** - Escalado horizontal
- **CORS** - Configurado para tu dominio
- **Reconexión Automática** - Manejo de desconexiones

---

## Próximos Pasos

### 1. Integrar con ChatWindow Existente

Actualiza tu componente `ChatWindow` actual para usar el nuevo servidor WebSocket:

```typescript
// src/contexts/ChatContext.tsx

import { useWebSocket } from '@/hooks/useWebSocket';

// En tu ChatProvider:
const [token, setToken] = useState('');

useEffect(() => {
  fetch('/api/chat/token')
    .then(r => r.json())
    .then(data => setToken(data.token));
}, [session]);

const ws = useWebSocket({
  url: process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:3001/ws/chat',
  token,
  enabled: !!token,
  onMessage: (msg) => {
    // Procesar mensajes
  }
});
```

### 2. Agregar Variables de Entorno

Agrega a tu `.env.local`:

```env
NEXT_PUBLIC_CHAT_WS_URL=ws://localhost:3001/ws/chat
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001/api
```

### 3. Probar en Producción

Para deployment en producción, revisa:
- `chat-server-go/docs/DEPLOYMENT.md` - Guías de Nginx, Caddy, Traefik
- Usar WSS (WebSocket Secure) con HTTPS
- Configurar CORS correctamente
- Usar secreto JWT fuerte

---

## 🐛 Troubleshooting

### Error: "Cannot connect to WebSocket"
**Solución:**
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/health

# Ver logs
cd chat-server-go
docker-compose logs chat-server
```

### Error: "Invalid token"
**Solución:**
1. Verificar que `JWT_SECRET` coincida en ambos servidores
2. Obtener nuevo token: `GET /api/chat/token`
3. Verificar que el token no haya expirado

### Error: "Port already in use"
**Solución:**
Ya configurado para usar puertos alternativos:
- MongoDB: 27018 (en lugar de 27017)
- Redis: 6380 (en lugar de 6379)

---

## Documentación Completa

- **README**: `chat-server-go/README.md`
- **API Reference**: `chat-server-go/docs/API.md`
- **Deployment**: `chat-server-go/docs/DEPLOYMENT.md`
- **Architecture**: `chat-server-go/docs/ARCHITECTURE.md`
- **Client Example**: `chat-server-go/examples/nextjs-client/README.md`

---

## Checklist de Integración

- [x] Servidor Go creado
- [x] Docker containers iniciados
- [x] MongoDB y Redis conectados
- [x] Health check verificado (200 OK)
- [x] Hook useWebSocket creado
- [x] Endpoint /api/chat/token creado
- [x] Generación de JWT implementada
- [x] Página de prueba creada
- [x] Documentación completa
- [ ] Probar con múltiples usuarios
- [ ] Integrar con ChatWindow existente
- [ ] Configurar para producción

---

## Test Rápido (5 minutos)

1. Servidor corriendo: `curl http://localhost:3001/health`
2. App Next.js: `npm run dev`
3. Abrir: http://localhost:3000/test-chat
4. Verificar conexión: debe mostrar "Conectado"
5. Enviar mensaje: debe aparecer en la lista
6. Abrir en otra ventana: mensajes en tiempo real

---

**¡El servidor de chat WebSocket está listo y funcionando!**

Para cualquier duda, consulta la documentación en `chat-server-go/docs/` o revisa los logs con `docker-compose logs -f chat-server`.
