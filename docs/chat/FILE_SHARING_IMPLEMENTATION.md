# Implementación de Compartir Archivos

## Descripción
Se ha implementado la funcionalidad de compartir archivos e imágenes en el chat.

## Características
- ✅ Subida de imágenes y archivos a Cloudinary
- ✅ Visualización de imágenes directamente en el chat
- ✅ Enlaces de descarga para otros tipos de archivos
- ✅ Indicador de carga durante la subida
- ✅ Integración con el sistema de mensajes existente

## Detalles Técnicos

### Frontend
- Se utiliza `fetch` directo a la API de Cloudinary para evitar sobrecarga en el servidor Next.js.
- Se usa el `upload_preset` configurado en las variables de entorno.
- Se detecta automáticamente si es imagen o archivo genérico.

### Backend
- El endpoint `POST /api/chat/rooms/[roomId]/messages` ya soportaba `archivo_url` y `archivo_nombre`.
- Se actualizó `ChatContext` para pasar estos parámetros.

### Componentes Modificados
- `src/components/ChatWindow.tsx`: Añadido botón de adjuntar, input oculto, lógica de subida y renderizado de adjuntos.
- `src/contexts/ChatContext.tsx`: Actualizada la función `sendMessage` para aceptar metadatos de archivos.

## Configuración Requerida
Asegurarse de tener las siguientes variables de entorno:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```
