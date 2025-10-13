# Soluciones para Usuarios No Visibles - Guía de Troubleshooting

## 🔍 Problemas Comunes y Soluciones

### 1. **Usuario No Aparece en Búsqueda de Chat**

#### Causas Posibles:
- Usuario no verificado (`verificado: false`)
- Usuario inactivo (`b_activo: false`)
- Problemas en la consulta de búsqueda
- Filtros restrictivos

#### Solución Implementada:
```typescript
// Mejorar la API de búsqueda para incluir más información
// En /api/chat/users
```

### 2. **Usuario No Aparece en Lista de Administración**

#### Causas Posibles:
- Filtros activos (rol, verificación)
- Paginación (usuario en otra página)
- Problemas de búsqueda por texto

#### Soluciones:
- Mejorar feedback de filtros activos
- Agregar indicadores de paginación más claros
- Mejorar algoritmo de búsqueda

### 3. **Usuario No Aparece en Chat/Mensajes**

#### Causas Posibles:
- No es participante de la sala
- Sala privada sin acceso
- Usuario no tiene permisos

#### Soluciones:
- Verificar participaciones
- Mejorar mensajes de error
- Auto-agregar a salas públicas

## 🛠 Mejoras Implementadas

### 1. **API de Depuración para Usuarios**
Endpoint para diagnosticar por qué un usuario no aparece.

### 2. **Mejor Logging y Feedback**
- Logs detallados en búsquedas
- Mensajes de error más informativos
- Indicadores visuales de estado

### 3. **Validación y Auto-corrección**
- Auto-verificación de usuarios en desarrollo
- Auto-participación en salas públicas
- Corrección automática de estados inconsistentes

## 📋 Checklist de Verificación

Cuando un usuario no aparece, verificar:

1. **Estado del Usuario:**
   - [ ] `verificado = true`
   - [ ] `b_activo = true` (para estudiantes/profesores)
   - [ ] Email válido y único

2. **Permisos y Roles:**
   - [ ] Rol asignado correctamente
   - [ ] Permisos de la sesión actual
   - [ ] Autorización para ver el usuario

3. **Filtros Activos:**
   - [ ] Búsqueda por texto
   - [ ] Filtro por rol
   - [ ] Filtro por verificación
   - [ ] Paginación

4. **Base de Datos:**
   - [ ] Usuario existe en la tabla
   - [ ] Relaciones correctas (estudiante/profesor/admin)
   - [ ] Integridad referencial

## 🔧 Herramientas de Diagnóstico

### 1. **Endpoint de Debug**
```
GET /api/debug/user-visibility?email=usuario@test.com
```

### 2. **Logs Mejorados**
Logs automáticos en consola del servidor con información detallada.

### 3. **Panel de Estado**
Indicadores visuales del estado del usuario en la interfaz.