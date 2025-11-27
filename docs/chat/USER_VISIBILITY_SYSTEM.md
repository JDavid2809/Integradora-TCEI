# Sistema de Visibilidad de Usuarios - Guía Completa

## Resumen General

El sistema de chat ha sido mejorado con herramientas avanzadas de diagnóstico para resolver problemas cuando los usuarios no aparecen en las búsquedas o interfaces administrativas. Esta documentación detalla todas las funcionalidades implementadas.

## 📋 Funcionalidades Completadas

### 1. - [x] Sistema de Estado de Mensajes


- **Entregado**: Mensajes marcados como entregados con timestamp

- **Visto**: Seguimiento individual de lecturas por usuario

- **Iconos visuales**: Indicadores claros en la interfaz

### 2. - [x] Estado de Conexión de Usuarios


- **En línea/Desconectado**: Indicadores de estado en tiempo real

- **Última conexión**: Tracking de actividad de usuarios

### 3. - [x] Sistema de Diagnóstico de Visibilidad

#### Endpoint de Debug: `/api/debug/user-visibility`

**Parámetros:**

- `email` (required): Email del usuario a diagnosticar

- `includeSystemUsers` (optional): Incluir usuarios del sistema

- `verbose` (optional): Salida detallada

**Ejemplo de uso:**
```bash
curl "http://localhost:3000/api/debug/user-visibility?email=estudiante@test.com"
```

text
**Respuesta de ejemplo:**
```json
{
  "found": true,
  "diagnosis": {
    "user": {
      "id": 2,
      "email": "estudiante@test.com",
      "nombre": "Estudiante Test",
      "apellido": "Perez Gomez",
      "rol": "ESTUDIANTE",
      "verificado": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "issues": [
      "Usuario no verificado - puede afectar visibilidad en algunas búsquedas"
    ],
    "recommendations": [
      "Verificar email del usuario desde el panel administrativo",
      "Confirmar que el usuario tiene los permisos correctos"
    ],
    "searchability": {
      "chatSearch": true,
      "adminPanel": true,
      "publicDirectory": false
    },
    "metadata": {
      "lastLogin": null,
      "profileComplete": false,
      "permissions": ["chat.send", "chat.receive"]
    }
  }
}
```

text
### 4. - [x] Búsqueda Mejorada de Usuarios

#### Características:


- **Búsqueda inclusiva**: Incluye usuarios no verificados por defecto

- **Logging detallado**: Información de debug en desarrollo

- **Manejo de errores**: Mensajes informativos para diferentes escenarios

#### Mensajes de estado:


- "No se encontraron usuarios": Cuando la búsqueda no devuelve resultados

- "Buscando usuarios...": Durante la carga

- Información específica para desarrolladores en modo desarrollo

##  Casos de Uso para Diagnóstico

### Problema: "Un usuario no aparece en la búsqueda"


1. **Usar el endpoint de debug:**

```bash
   curl "http://localhost:3000/api/debug/user-visibility?email=usuario@email.com"
   ```




2. **Revisar la respuesta:**

   - Si `found: false`: El usuario no existe en la base de datos

   - Si `found: true`: Revisar el array `issues` para problemas específicos


3. **Problemas comunes identificados:**

   - Usuario no verificado (`verificado: false`)

   - Rol restringido que limita la visibilidad

   - Problemas de permisos de chat

   - Perfil incompleto

### Problema: "El usuario existe pero no puede usar el chat"


1. **Verificar permisos en el diagnóstico:**

```json
   "permissions": ["chat.send", "chat.receive"]
   ```




2. **Revisar `searchability`:**

```json
   "searchability": {
     "chatSearch": true,
     "adminPanel": true
   }
   ```



### Problema: "Usuario aparece en admin pero no en chat"


- Revisar `searchability.chatSearch`

- Verificar estado de verificación

- Comprobar permisos específicos de chat

## 🛠️ API Endpoints Relacionados

### Chat y Mensajes


- `GET /api/chat/users` - Búsqueda de usuarios para chat

- `PUT /api/chat/messages/[id]/delivered` - Marcar como entregado

- `PUT /api/chat/messages/[id]/read` - Marcar como leído

- `PUT /api/chat/status` - Actualizar estado de conexión

### Administración


- `GET /api/admin/users` - Lista de usuarios administrativos

- `GET /api/debug/user-visibility` - Diagnóstico de visibilidad

##  Base de Datos - Esquemas Relevantes

### Tabla `usuario`

```prisma
model usuario {
  id          Int     @id @default(autoincrement())
  email       String  @unique
  nombre      String
  apellido    String
  rol         Role
  verificado  Boolean @default(false)
  createdAt   DateTime @default(now())
  // ... otros campos
}
```

text
### Tabla `chat_message`

```prisma
model chat_message {
  id              Int       @id @default(autoincrement())
  contenido       String
  entregado_en    DateTime?
  visto_en        DateTime?
  // ... otros campos
}
```

text
### Tabla `chat_message_read`

```prisma
model chat_message_read {
  id         Int          @id @default(autoincrement())
  message_id Int
  user_id    Int
  read_at    DateTime     @default(now())
  // ... relaciones
}
```

text
## 🔍 Logging y Monitoreo

### En Desarrollo


- Logs detallados de búsquedas de usuarios

- Información de debug en consola del navegador

- Mensajes específicos para desarrolladores

### En Producción


- Logs de errores únicamente

- Métricas de uso del sistema de chat

- Alertas para problemas de visibilidad recurrentes

## 📝 Notas Técnicas

### Compatibilidad con Next.js 15


- Uso de `params: Promise<{}>` en API routes

- Manejo correcto de parámetros asincrónicos

- Compatibilidad con Turbopack

### Optimizaciones


- Búsquedas eficientes con índices de base de datos

- Cache de resultados de diagnóstico

- Lazy loading de información de usuarios

##  Próximas Mejoras Sugeridas


1. **Dashboard de diagnóstico**: Interfaz visual para el endpoint de debug

2. **Alertas automáticas**: Notificaciones cuando usuarios tienen problemas de visibilidad

3. **Métricas de chat**: Estadísticas de uso y problemas comunes

4. **Auto-reparación**: Scripts automáticos para resolver problemas comunes

## 📞 Soporte

Para problemas específicos:

1. Usar el endpoint de debug primero

2. Revisar logs del servidor

3. Verificar configuración de base de datos

4. Comprobar permisos de usuario

---

**Estado del sistema**: - [x] Totalmente funcional
**Última actualización**: Enero 2024
**Versión**: 1.0.0
