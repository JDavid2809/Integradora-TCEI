`
```markdown
# Configuración para integración del Chat WebSocket

## Variables de entorno adicionales para .env.local

```

env
# Chat WebSocket Server Configuration

NEXT_PUBLIC_CHAT_WS_URL=ws://localhost:3001/ws/chat
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001/api

# JWT Secret (debe coincidir con el servidor de chat)

# Si no tienes NEXTAUTH_SECRET, genera uno:

# openssl rand -base64 32

JWT_SECRET=${NEXTAUTH_SECRET}
```text
## Para producción

```

env
# Producción - Usa WSS (WebSocket Secure)

NEXT_PUBLIC_CHAT_WS_URL=wss://chat.tudominio.com/ws/chat
NEXT_PUBLIC_CHAT_API_URL=https://chat.tudominio.com/api

# Asegúrate de usar el mismo JWT_SECRET en ambos servidores

JWT_SECRET=tu-secreto-super-seguro-de-produccion-min-32-caracteres
```text
## Servidor de Chat (.env en chat-server-go/)

```

env
PORT=3001
ENVIRONMENT=production
MONGODB_URI=mongodb://tu-mongodb-uri
MONGODB_DATABASE=chat_db
JWT_SECRET=mismo-secreto-que-nextauth
REDIS_URL=redis://tu-redis-uri
ORIGIN_WHITELIST=https://tudominio.com,https://www.tudominio.com
```text
## Verificación rápida

Ejecuta en tu terminal:

```

bash
# Verificar que las variables estén configuradas

grep "CHAT_WS_URL" .env.local
grep "JWT_SECRET" .env.local

# Verificar servidor de chat

curl http://localhost:3001/health
```text
```

`
