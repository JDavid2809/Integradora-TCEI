# Funcionalidad de Minimización de Lista de Chats

## Descripción
Se ha implementado la funcionalidad para minimizar la lista de chats en el sistema de chat, permitiendo a los usuarios optimizar el espacio de la interfaz mientras mantienen acceso completo a las funcionalidades del chat.

## Características Implementadas

### 1. **Botón de Minimización**
- Ubicado en el header de la lista de salas de chat
- Icono dinámico que cambia entre `ChevronLeft` (minimizar) y `ChevronRight` (expandir)
- Tooltip informativo que indica la acción disponible

### 2. **Vista Minimizada**
- **Ancho reducido**: La lista se reduce de 256px (w-64) a 64px (w-16)
- **Solo iconos**: Muestra únicamente los iconos de las salas de chat
- **Notificaciones preservadas**: Los contadores de mensajes no leídos se mantienen visibles como badges pequeños
- **Tooltips**: Al hacer hover sobre una sala minimizada, se muestra el nombre completo

### 3. **Vista Expandida (Normal)**
- Información completa de cada sala: nombre, descripción, participantes
- Botones de acciones (unirse/salir) visibles en hover
- Contadores de mensajes no leídos completos

### 4. **Accesos Rápidos en Vista Minimizada**
- **Botón de Búsqueda**: Acceso directo para buscar usuarios
- **Botón de Crear Sala**: Acceso directo para crear nuevas salas
- Ubicados en la parte superior de la lista minimizada

### 5. **Persistencia de Estado**
- El estado de minimización se guarda en `localStorage`
- La preferencia del usuario se mantiene entre sesiones
- Key utilizada: `'chatListMinimized'`

### 6. **Transiciones Suaves**
- Animación de 300ms para el cambio de tamaño
- Transiciones suaves para todos los elementos
- Experiencia de usuario fluida

## Archivos Modificados

### `src/components/ChatWindow.tsx`
- **Imports añadidos**: `ChevronLeft`, `ChevronRight`
- **Estado añadido**: `isChatListMinimized` con inicialización desde localStorage
- **useEffect añadido**: Para guardar estado en localStorage
- **Botón de minimización**: En el header de salas
- **Lógica condicional**: Para mostrar vista minimizada vs expandida
- **Botones de acceso rápido**: En vista minimizada

## Comportamiento Detallado

### Estados de la Lista
1. **Expandida** (`isChatListMinimized = false`)
   - Ancho: 256px
   - Muestra: Título "Salas de Chat", botones de acción, información completa de salas
   
2. **Minimizada** (`isChatListMinimized = true`)
   - Ancho: 64px
   - Muestra: Solo botón de expandir, botones de acceso rápido, iconos de salas

### Interacciones del Usuario
- **Click en botón minimizar/expandir**: Alterna entre estados
- **Click en sala (minimizada)**: Abre la sala normalmente
- **Hover en sala (minimizada)**: Muestra tooltip con nombre
- **Click en accesos rápidos**: Abre modales correspondientes

### Responsive Design
- La funcionalidad es completamente responsive
- Se adapta correctamente a diferentes tamaños de ventana de chat
- Mantiene la funcionalidad de redimensionamiento existente

## Testing
La funcionalidad ha sido probada para:
- ✅ Cambio entre estados minimizado/expandido
- ✅ Persistencia en localStorage
- ✅ Funcionalidad de accesos rápidos
- ✅ Tooltips informativos
- ✅ Transiciones suaves
- ✅ Compatibilidad con funcionalidades existentes

## Uso
1. En el sistema de chat, localizar el botón de minimización en la esquina superior derecha del área de salas
2. Click para minimizar la lista de chats
3. En estado minimizado, usar los botones de acceso rápido para buscar usuarios o crear salas
4. Click en el botón de expandir para restaurar la vista completa

La funcionalidad mejora significativamente la experiencia de usuario al permitir un mejor aprovechamiento del espacio de pantalla sin sacrificar funcionalidad.