# Sistema de Chat - Documentación Completa

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelos de Base de Datos](#modelos-de-base-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Componentes Frontend](#componentes-frontend)
6. [Contexto y Estado Global](#contexto-y-estado-global)
7. [Tipos de Salas de Chat](#tipos-de-salas-de-chat)
8. [Funcionalidades Principales](#funcionalidades-principales)
9. [Flujo de Trabajo](#flujo-de-trabajo)
10. [Configuración y Deployment](#configuración-y-deployment)

---

## Visión General

El sistema de chat integrado en la plataforma de inglés permite la comunicación en tiempo real entre usuarios (estudiantes, profesores y administradores) a través de diferentes tipos de salas de chat.

### Características Principales
- ✅ Chat en tiempo real
- ✅ Múltiples tipos de salas (General, Clase, Privado, Soporte)
- ✅ Gestión de participantes
- ✅ Mensajes con diferentes tipos (texto, imagen, archivo, sistema)
- ✅ Sistema de notificaciones
- ✅ Historial de mensajes
- ✅ Control de acceso por roles
- ✅ Chat privado entre usuarios
- ✅ Interfaz responsive y amigable

---

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Base de Datos │
│   (React/Next)  │◄──►│   (Next.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ChatContext     │    │ Prisma ORM      │    │ Tablas Chat:    │
│ (Estado Global) │    │ (Data Layer)    │    │ - chat_room     │
│                 │    │                 │    │ - chat_message  │
│ ChatWindow      │    │ Middlewares:    │    │ - chat_participant│
│ (UI Component)  │    │ - Auth          │    └─────────────────┘
└─────────────────┘    │ - Session       │
                       │ - Validation    │
                       └─────────────────┘
```

---

## Modelos de Base de Datos

### 1. `chat_room` - Salas de Chat

```prisma
model chat_room {
  id                 Int                @id @default(autoincrement())
  nombre             String             @db.VarChar(100)
  descripcion        String?            @db.VarChar(255)
  tipo               TipoChatRoom       @default(GENERAL)
  creado_por         Int
  creado_en          DateTime           @default(now())
  activo             Boolean            @default(true)
  
  // Relaciones
  creador            usuario            @relation("ChatCreador", fields: [creado_por], references: [id])
  participantes      chat_participant[]
  mensajes           chat_message[]
}
```

### 2. `chat_participant` - Participantes

```prisma
model chat_participant {
  id                 Int                @id @default(autoincrement())
  chat_room_id       Int
  usuario_id         Int
  unido_en           DateTime           @default(now())
  ultimo_visto       DateTime?
  activo             Boolean            @default(true)
  
  // Relaciones
  chat_room          chat_room          @relation(fields: [chat_room_id], references: [id], onDelete: Cascade)
  usuario            usuario            @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
  
  @@unique([chat_room_id, usuario_id])
}
```

### 3. `chat_message` - Mensajes

```prisma
model chat_message {
  id                 Int                @id @default(autoincrement())
  chat_room_id       Int
  usuario_id         Int
  contenido          String             @db.Text
  tipo               TipoMensaje        @default(TEXTO)
  archivo_url        String?            @db.VarChar(255)
  archivo_nombre     String?            @db.VarChar(100)
  enviado_en         DateTime           @default(now())
  editado_en         DateTime?
  eliminado          Boolean            @default(false)
  
  // Relaciones
  chat_room          chat_room          @relation(fields: [chat_room_id], references: [id], onDelete: Cascade)
  usuario            usuario            @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
}
```

### Enums

```prisma
enum TipoChatRoom {
  GENERAL       // Chat general para todos
  CLASE         // Chat específico de una clase
  PRIVADO       // Chat privado entre usuarios
  SOPORTE       // Chat de soporte con admin
}

enum TipoMensaje {
  TEXTO         // Mensaje de texto normal
  IMAGEN        // Imagen compartida
  ARCHIVO       // Archivo adjunto
  SISTEMA       // Mensaje del sistema (ej: usuario se unió)
}
```

---

## API Endpoints

### 1. Gestión de Salas (`/api/chat/rooms`)

#### `GET /api/chat/rooms`
Obtiene todas las salas de chat del usuario autenticado.

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "General",
    "descripcion": "Sala de chat general",
    "tipo": "GENERAL",
    "creado_por": 1,
    "creado_en": "2024-01-01T00:00:00.000Z",
    "activo": true,
    "ultimo_mensaje": {
      "contenido": "Último mensaje...",
      "enviado_en": "2024-01-01T12:00:00.000Z",
      "usuario": { "nombre": "Juan", "apellido": "Pérez" }
    },
    "mensajes_no_leidos": 3,
    "participantes": [...]
  }
]
```

#### `POST /api/chat/rooms`
Crea una nueva sala de chat.

**Body:**
```json
{
  "nombre": "Nueva Sala",
  "descripcion": "Descripción opcional",
  "tipo": "GENERAL"
}
```

### 2. Gestión de Mensajes (`/api/chat/rooms/[roomId]/messages`)

#### `GET /api/chat/rooms/[roomId]/messages`
Obtiene mensajes de una sala específica con paginación.

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Mensajes por página (default: 50)

#### `POST /api/chat/rooms/[roomId]/messages`
Envía un nuevo mensaje a la sala.

**Body:**
```json
{
  "contenido": "Contenido del mensaje",
  "tipo": "TEXTO"
}
```

### 3. Gestión de Participantes

#### `POST /api/chat/rooms/[roomId]/join`
El usuario se une a una sala de chat.

#### `POST /api/chat/rooms/[roomId]/leave`
El usuario abandona una sala de chat.

#### `PUT /api/chat/rooms/[roomId]/read`
Marca mensajes como leídos hasta una fecha específica.

### 4. Chat Privado (`/api/chat/private`)

#### `POST /api/chat/private`
Inicia un chat privado con otro usuario.

**Body:**
```json
{
  "otherUserId": 123
}
```

### 5. Búsqueda de Usuarios (`/api/chat/users`)

#### `GET /api/chat/users`
Busca usuarios disponibles para chat privado.

**Query Parameters:**
- `q`: Término de búsqueda
- `excludeExisting`: Excluir chats existentes (default: false)

---

## Componentes Frontend

### 1. `ChatWindow.tsx`
Componente principal de la interfaz de chat.

**Props:**
```typescript
interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}
```

**Características:**
- Gestión completa de la UI del chat
- Lista de salas de chat
- Área de mensajes con scroll infinito
- Formulario de envío de mensajes
- Gestión de participantes
- Creación de salas y chats privados

### 2. `Navbar.tsx`
Integra el botón de chat en la navegación principal.

**Estados:**
- `isChatOpen`: Control de apertura del chat
- `isChatMinimized`: Control de minimización

### 3. `Chatbot.tsx`
Sistema de chatbot con IA para soporte automático.

**Características:**
- Integración con API de chatbot
- Interfaz de conversación
- Historial de mensajes
- Reset de conversación

---

## Contexto y Estado Global

### `ChatContext.tsx`

Maneja el estado global del sistema de chat usando React Context.

**Estado Principal:**
```typescript
interface ChatContextType {
  // Estado de datos
  chatRooms: ChatRoom[]
  activeRoom: number | null
  messages: ChatMessage[]
  participants: ChatParticipant[]
  
  // Estado de UI
  loading: boolean
  error: string | null
  isConnected: boolean
  
  // Acciones
  setActiveRoom: (roomId: number | null) => void
  sendMessage: (content: string, type?: MessageType) => Promise<void>
  loadMessages: (roomId: number, page?: number) => Promise<void>
  loadChatRooms: () => Promise<void>
  createChatRoom: (data: CreateRoomData) => Promise<void>
  joinChatRoom: (roomId: number) => Promise<void>
  leaveChatRoom: (roomId: number) => Promise<void>
  searchUsers: (query: string) => Promise<SearchUser[]>
  startPrivateChat: (userId: number) => Promise<void>
}
```

**Funcionalidades Clave:**
- Gestión de estado reactivo
- Carga automática de datos
- Polling para mensajes en tiempo real
- Manejo de errores centralizados
- Optimización de rendimiento con useMemo/useCallback

---

## Tipos de Salas de Chat

### 1. **GENERAL**
- Acceso: Todos los usuarios registrados
- Uso: Comunicación general entre la comunidad
- Creación: Administradores
- Ejemplo: "Sala General", "Avisos"

### 2. **CLASE**
- Acceso: Estudiantes y profesores de una clase específica
- Uso: Comunicación relacionada con una clase
- Creación: Profesores o administradores
- Ejemplo: "English A1 - Grupo 1"

### 3. **PRIVADO**
- Acceso: Solo dos usuarios específicos
- Uso: Conversaciones privadas
- Creación: Cualquier usuario
- Ejemplo: Chat entre estudiante y profesor

### 4. **SOPORTE**
- Acceso: Usuario y administradores
- Uso: Soporte técnico y ayuda
- Creación: Automática al contactar soporte
- Ejemplo: "Soporte - Juan Pérez"

---

## Funcionalidades Principales

### 1. **Sistema de Mensajes**
```typescript
// Tipos de mensajes soportados
enum TipoMensaje {
  TEXTO = 'TEXTO',          // Mensaje de texto normal
  IMAGEN = 'IMAGEN',        // Imagen compartida
  ARCHIVO = 'ARCHIVO',      // Archivo adjunto
  SISTEMA = 'SISTEMA'       // Mensaje automático del sistema
}
```

### 2. **Gestión de Participantes**
- Unirse/Salir de salas automáticamente
- Control de usuarios activos
- Último visto por participante
- Sistema de notificaciones

### 3. **Búsqueda y Filtrado**
- Búsqueda de usuarios para chat privado
- Filtrado de mensajes por tipo
- Búsqueda en historial de mensajes

### 4. **Notificaciones**
- Contador de mensajes no leídos
- Indicadores visuales de actividad
- Notificaciones en tiempo real

---

## Flujo de Trabajo

### 1. **Inicialización del Chat**
```
Usuario inicia sesión
       ↓
ChatContext se inicializa
       ↓
Carga salas de chat del usuario
       ↓
Establece conexión para actualizaciones
```

### 2. **Envío de Mensajes**
```
Usuario escribe mensaje
       ↓
Validación en frontend
       ↓
POST /api/chat/rooms/[id]/messages
       ↓
Validación de permisos
       ↓
Guardado en base de datos
       ↓
Actualización en UI
```

### 3. **Chat Privado**
```
Usuario busca otro usuario
       ↓
POST /api/chat/private
       ↓
Sistema verifica sala existente
       ↓
Crea nueva sala si no existe
       ↓
Agrega participantes
       ↓
Redirige a la sala
```

---

## Configuración y Deployment

### 1. **Variables de Entorno**
```env
# Base de datos
DATABASE_URL="postgresql://..."

# Autenticación
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Chat (opcional)
CHAT_POLLING_INTERVAL=3000  # ms para polling de mensajes
CHAT_MESSAGE_LIMIT=50       # mensajes por página
```

### 2. **Scripts de Inicialización**

#### Seed de Salas Predeterminadas
```bash
npm run seed:chat
```

#### Ejecutar Migraciones
```bash
npx prisma migrate dev
```

### 3. **Optimización de Rendimiento**

#### Base de Datos
- Índices en campos frecuentemente consultados
- Paginación en consultas de mensajes
- Soft delete para mantener historial

#### Frontend
- Lazy loading de mensajes antiguos
- Debounce en búsquedas
- Virtualización para listas largas
- Memoización de componentes

---

## Seguridad y Permisos

### 1. **Autenticación**
- Validación de sesión en todos los endpoints
- Verificación de permisos por rol
- Protección CSRF

### 2. **Autorización**
```typescript
// Ejemplo de validación de acceso a sala
const canAccessRoom = (user: User, room: ChatRoom): boolean => {
  // Admin puede acceder a todo
  if (user.rol === 'ADMIN') return true
  
  // Sala privada: solo participantes
  if (room.tipo === 'PRIVADO') {
    return room.participantes.some(p => p.usuario_id === user.id)
  }
  
  // Sala de clase: estudiantes matriculados o profesores
  if (room.tipo === 'CLASE') {
    return isEnrolledOrTeacher(user, room)
  }
  
  // Sala general: todos los usuarios activos
  return user.b_activo
}
```

### 3. **Validación de Datos**
- Sanitización de contenido de mensajes
- Validación de tipos de archivo
- Límites de tamaño de mensaje

---

## Mantenimiento y Monitoreo

### 1. **Logs del Sistema**
```typescript
// Ejemplo de logging en mensajes
console.log(`[CHAT] Usuario ${userId} envió mensaje en sala ${roomId}`)
```

### 2. **Métricas Importantes**
- Mensajes enviados por día
- Salas más activas
- Usuarios más participativos
- Errores de envío

### 3. **Limpieza de Datos**
```sql
-- Eliminar mensajes muy antiguos (opcional)
DELETE FROM chat_message 
WHERE enviado_en < NOW() - INTERVAL '1 year' 
AND eliminado = true;

-- Desactivar salas sin actividad
UPDATE chat_room 
SET activo = false 
WHERE id NOT IN (
  SELECT DISTINCT chat_room_id 
  FROM chat_message 
  WHERE enviado_en > NOW() - INTERVAL '6 months'
);
```

---

## Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **WebSockets para tiempo real**: Eliminar polling
- [ ] **Reacciones a mensajes**: Like, dislike, emoji
- [ ] **Menciones**: @usuario en mensajes
- [ ] **Respuestas directas**: Threading de mensajes
- [ ] **Búsqueda avanzada**: Filtros por fecha, usuario, tipo
- [ ] **Moderación**: Reportes y bloqueos
- [ ] **Archivos multimedia**: Soporte para video/audio
- [ ] **Traducción automática**: Para estudiantes de diferentes idiomas
- [ ] **Bot integrado**: Comandos automáticos
- [ ] **Estadísticas de chat**: Dashboard para administradores

### Mejoras de UX
- [ ] **Modo oscuro**: Tema dark para el chat
- [ ] **Notificaciones push**: Alertas del navegador
- [ ] **Shortcuts de teclado**: Navegación rápida
- [ ] **Arrastrar y soltar**: Para archivos
- [ ] **Vista móvil mejorada**: Optimización responsive
- [ ] **Indicador de escritura**: "Usuario está escribiendo..."

---

*Documentación actualizada: Octubre 2024*
*Versión del sistema: 1.0.0*