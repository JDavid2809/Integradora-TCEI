# Sistema de Estados de Mensajes y Conexión - Documentación

## Descripción General
Se ha implementado un sistema completo de estados para mensajes (entregado/visto) y estado de conexión de usuarios en el sistema de chat. Esta funcionalidad mejora significativamente la experiencia de usuario proporcionando retroalimentación visual sobre el estado de los mensajes y la conectividad.

## ✅ Características Implementadas

### 1. **Sistema de Estados de Mensajes**

#### Base de Datos
- **`entregado_en`**: Timestamp cuando el mensaje fue entregado
- **`visto_en`**: Timestamp cuando el mensaje fue visto por última vez
- **Tabla `chat_message_read`**: Registra individualmente qué usuarios han leído cada mensaje

#### Estados Visuales
- **📤 Enviado**: Icono de reloj (`Clock`) - El mensaje fue enviado pero no entregado
- **✅ Entregado**: Icono de check simple (`Check`) - El mensaje llegó al servidor
- **✅✅ Leído**: Icono de doble check azul (`CheckCheck`) - Al menos un usuario leyó el mensaje

### 2. **Sistema de Estado de Conexión**

#### Indicadores Visuales
- **🟢 Conectado**: Icono WiFi verde - Usuario en línea y chat activo
- **🔴 Desconectado**: Icono WiFi cortado rojo - Usuario offline o sin conexión

#### Funcionalidades
- Actualización automática de estado al abrir/cerrar chat
- Tracking de último visto en participaciones de salas
- Indicador en tiempo real en el header del chat

### 3. **Marcado Automático de Mensajes**

#### Auto-lectura
- Los mensajes se marcan como leídos automáticamente después de 1 segundo de estar visibles
- Solo marca como leídos mensajes de otros usuarios
- Actualiza registros individuales de lectura por usuario

#### Auto-entrega
- Mensajes se marcan como entregados inmediatamente al crearse
- Timestamp automático de entrega en el servidor

## 🚀 Archivos Modificados/Creados

### Backend - API Routes
1. **`/api/chat/messages/[messageId]/delivered`** - Marcar mensaje como entregado
2. **`/api/chat/messages/[messageId]/read`** - Marcar mensaje como leído
3. **`/api/chat/status`** - Actualizar estado de conexión del usuario

### Base de Datos - Schema
```prisma
model chat_message {
  // ... campos existentes
  entregado_en       DateTime?          // Nuevo: timestamp de entrega
  visto_en           DateTime?          // Nuevo: timestamp de visto
  lecturas           chat_message_read[] // Nuevo: relación a lecturas
}

model chat_message_read {
  id                 Int                @id @default(autoincrement())
  mensaje_id         Int
  usuario_id         Int
  leido_en           DateTime           @default(now())
  
  // Relaciones
  mensaje            chat_message       @relation(fields: [mensaje_id], references: [id], onDelete: Cascade)
  usuario            usuario            @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
  
  @@unique([mensaje_id, usuario_id])
}
```

### Frontend - Contexto y Componentes

#### ChatContext.tsx - Nuevas Funciones
- `markMessageAsDelivered(messageId)`: Marcar mensaje como entregado
- `markMessageAsRead(messageId)`: Marcar mensaje como leído individual
- `updateUserStatus(isOnline)`: Actualizar estado de conexión

#### ChatWindow.tsx - Mejoras UI
- Función `getMessageStatusIcon()`: Genera iconos de estado según el mensaje
- Función `getConnectionStatus()`: Muestra estado de conexión
- Auto-marcado de mensajes como leídos
- Actualización automática de estado de conexión

## 📊 Flujo de Estados

### Ciclo de Vida de un Mensaje
```
1. Usuario escribe mensaje
   ↓
2. POST /api/chat/rooms/[id]/messages
   ↓ 
3. Mensaje creado con entregado_en = now()
   ↓
4. Mensaje aparece con ícono ✅ (entregado)
   ↓
5. Otro usuario ve la sala activa
   ↓
6. Auto-trigger markMessageAsRead() después 1s
   ↓
7. PUT /api/chat/messages/[id]/read
   ↓
8. Mensaje aparece con ícono ✅✅ (leído)
```

### Ciclo de Estado de Conexión
```
1. Usuario abre chat window
   ↓
2. useEffect detecta isOpen = true
   ↓
3. Ejecuta updateUserStatus(true)
   ↓
4. PUT /api/chat/status con isOnline: true
   ↓
5. Actualiza ultimo_visto en participaciones
   ↓
6. Header muestra 🟢 Conectado

Al cerrar:
7. useEffect detecta isOpen = false
   ↓
8. Ejecuta updateUserStatus(false)
   ↓
9. Header muestra 🔴 Desconectado
```

## 🎯 Configuración Técnica

### Intervalos y Timings
- **Auto-lectura**: 1 segundo después de ver mensaje
- **Polling de mensajes**: 3 segundos (contexto existente)
- **Actualización de estado**: Inmediata al cambiar sala

### Optimizaciones Implementadas
- Solo mostrar estados en mensajes propios
- Upsert para evitar duplicados en lecturas
- Batch updates en participaciones activas
- Estado local optimista para mejor UX

## 🧪 Testing y Datos de Prueba

### Script de Seed
- **`scripts/seed-chat-status.js`**: Pobla la DB con mensajes de ejemplo
- Crea salas General y Soporte automáticamente
- Simula lecturas aleatorias para testing
- Genera datos realistas de timestamps

### Cómo Probar
1. Ejecutar seed: `node scripts/seed-chat-status.js`
2. Abrir chat con usuario 1
3. Enviar mensaje
4. Ver estado "entregado" (✅)
5. Cambiar a usuario 2
6. Abrir misma sala
7. Ver mensaje marcado como "leído" (✅✅)
8. Verificar indicadores de conexión en header

## 🔧 Configuración de Desarrollo

### Variables de Entorno Requeridas
```env
DATABASE_URL="postgresql://..."  # Base de datos PostgreSQL
NEXTAUTH_SECRET="..."           # Para autenticación
```

### Dependencias Agregadas
- Ninguna nueva (usa Lucide icons existentes)
- Aprovecha Prisma y Next-Auth ya configurados

## 🚀 Funcionalidades Futuras Sugeridas

### WebSockets (Reemplazar Polling)
- Eventos en tiempo real para estados de mensajes
- Notificaciones push de conexión de usuarios
- Sincronización instantánea entre clientes

### Estados Avanzados
- "Escribiendo..." indicators
- Estados de mensaje: Editado, Eliminado
- Tiempo estimado de lectura para mensajes largos

### Métricas y Analytics
- Tiempo promedio de respuesta
- Patrones de uso de salas
- Estadísticas de engagement

## 📋 Checklist de Funcionalidad Completada

- ✅ Base de datos: Columnas de estado agregadas
- ✅ Migración: Schema actualizado correctamente  
- ✅ Backend: APIs de entregado/leído/estado
- ✅ Frontend: Iconos de estado en mensajes
- ✅ Frontend: Indicador de conexión en header
- ✅ Auto-marcado: Mensajes como leídos automáticamente
- ✅ Auto-estado: Conexión basada en apertura de chat
- ✅ Testing: Datos de prueba poblados
- ✅ UX: Transiciones suaves y feedback visual
- ✅ Performance: Optimizaciones de consultas DB
- ✅ Documentación: Guías completas de implementación

La implementación está **100% funcional** y lista para producción con todas las mejores prácticas aplicadas.