# 🔧 Resolución de Problemas

## Descripción
Documentación para diagnóstico, troubleshooting y resolución de problemas del sistema.

## 📋 Documentos Disponibles

### 🚑 Guías de Resolución
- **[TROUBLESHOOTING_QUICK_GUIDE.md](./TROUBLESHOOTING_QUICK_GUIDE.md)** - Guía rápida para problemas comunes
- **[USER_VISIBILITY_TROUBLESHOOTING.md](./USER_VISIBILITY_TROUBLESHOOTING.md)** - Solución de problemas de visibilidad de usuarios

## 🎯 Problemas Comunes y Soluciones

### Issues de Usuarios
#### "Usuario no aparece en búsquedas"
- **Diagnóstico**: `/api/debug/user-visibility?email=usuario@email.com`
- **Causas**: Usuario no verificado, permisos incorrectos, perfil incompleto
- **Solución**: Verificar usuario desde panel admin

#### "No puede iniciar sesión"
- **Diagnóstico**: Verificar estado de usuario en base de datos
- **Causas**: Usuario no verificado, contraseña incorrecta, cuenta desactivada
- **Solución**: Reenviar verificación o resetear contraseña

#### "Error de permisos en chat"
- **Diagnóstico**: Verificar rol y estado del usuario
- **Causas**: Rol incorrecto, usuario no verificado
- **Solución**: Ajustar rol desde panel administrativo

### Issues del Sistema de Chat
#### "Mensajes no se marcan como entregados"
- **Diagnóstico**: Revisar logs del endpoint `/api/chat/messages/[id]/delivered`
- **Causas**: Error en API, problema de conectividad
- **Solución**: Verificar funcionamiento del endpoint

#### "Estados online/offline incorrectos"
- **Diagnóstico**: Verificar endpoint `/api/chat/status`
- **Causas**: Problema en actualización de estado
- **Solución**: Resetear estado desde herramientas admin

#### "Búsqueda de usuarios no funciona"
- **Diagnóstico**: Revisar logs de `/api/chat/users`
- **Causas**: Error en query, permisos de búsqueda
- **Solución**: Verificar parámetros de búsqueda

### Issues Administrativos
#### "Panel admin no carga datos"
- **Diagnóstico**: Verificar permisos de usuario actual
- **Causas**: Usuario sin rol ADMIN, error en API
- **Solución**: Asignar rol correcto o verificar endpoints

#### "Reportes muestran datos incorrectos"
- **Diagnóstico**: Revisar queries de base de datos
- **Causas**: Datos corruptos, filtros incorrectos
- **Solución**: Validar integridad de datos

## 🛠️ Herramientas de Diagnóstico

### APIs de Debug
```bash
# Diagnosticar usuario específico
GET /api/debug/user-visibility?email=usuario@test.com

# Herramientas administrativas
GET /api/admin/user-tools?action=list-problematic
GET /api/admin/user-tools?action=chat-stats
GET /api/admin/user-tools?action=search-test&query=mario
```

### Comandos de Base de Datos
```sql
-- Verificar usuario específico
SELECT * FROM usuario WHERE email = 'usuario@test.com';

-- Usuarios no verificados
SELECT * FROM usuario WHERE verificado = false;

-- Mensajes recientes
SELECT * FROM chat_message ORDER BY enviado_en DESC LIMIT 10;
```

### Logs de Desarrollo
```typescript
// En desarrollo, revisar console del navegador
console.log('🔍 Searching users with query:', query);

// Logs del servidor en terminal
npm run dev  // Ver logs en tiempo real
```

## 🚨 Escalación de Problemas

### Nivel 1: Usuario Final
- **Scope**: Problemas básicos de uso
- **Solución**: Guías de usuario, FAQ
- **Tiempo**: Inmediato

### Nivel 2: Soporte Técnico
- **Scope**: Issues de configuración, permisos
- **Solución**: Panel admin, herramientas de diagnóstico
- **Tiempo**: < 30 minutos

### Nivel 3: Desarrollador
- **Scope**: Bugs del sistema, errores de código
- **Solución**: Debug profundo, fixes de código
- **Tiempo**: Variable según complejidad

### Nivel 4: Arquitectura
- **Scope**: Problemas de diseño, performance
- **Solución**: Refactoring, optimizaciones
- **Tiempo**: Horas a días

## 📊 Monitoreo y Prevención

### Métricas Clave
- **Error Rate**: % de requests fallidos
- **Response Time**: Tiempo de respuesta APIs
- **User Activity**: Usuarios activos/inactivos
- **Chat Usage**: Mensajes enviados/recibidos

### Alertas Automáticas
- ✅ **Alta tasa de errores**: > 5% requests fallidos
- ✅ **Respuesta lenta**: > 2s tiempo de respuesta
- ✅ **Usuarios bloqueados**: Múltiples fallos de login
- ✅ **Chat inactivo**: Sin mensajes por > 1 hora

### Logs Estructurados
```typescript
// Formato estándar de logs
{
  timestamp: "2025-01-15T10:30:00Z",
  level: "ERROR|WARN|INFO|DEBUG",
  component: "chat|admin|auth|api",
  action: "user-search|message-send|login",
  user_id: 123,
  details: "Descripción del evento"
}
```

## 🔍 Checklist de Diagnóstico

### Para Problemas de Usuarios
- [ ] ✅ Verificar que el usuario existe en BD
- [ ] ✅ Confirmar que está verificado (`verificado: true`)
- [ ] ✅ Revisar rol asignado (ADMIN/PROFESOR/ESTUDIANTE)
- [ ] ✅ Validar permisos específicos
- [ ] ✅ Probar login con credenciales correctas

### Para Problemas de Chat
- [ ] ✅ Verificar estado de conexión del usuario
- [ ] ✅ Probar envío de mensaje simple
- [ ] ✅ Revisar endpoints de estado de mensajes
- [ ] ✅ Validar permisos de chat del usuario
- [ ] ✅ Comprobar logs de errores recientes

### Para Problemas del Admin
- [ ] ✅ Confirmar rol ADMIN del usuario actual
- [ ] ✅ Probar endpoints específicos manualmente
- [ ] ✅ Revisar integridad de datos en BD
- [ ] ✅ Verificar configuración de permisos
- [ ] ✅ Validar queries y filtros aplicados

## 🚀 Acceso Rápido

### Para Soporte Nivel 1:
1. **Guía rápida**: [TROUBLESHOOTING_QUICK_GUIDE.md](./TROUBLESHOOTING_QUICK_GUIDE.md)

### Para Soporte Nivel 2:
1. **Visibilidad usuarios**: [USER_VISIBILITY_TROUBLESHOOTING.md](./USER_VISIBILITY_TROUBLESHOOTING.md)
2. **Herramientas admin**: Ver [/admin](../admin/)

### Para Desarrolladores:
1. **Debug APIs**: Ver endpoints de diagnóstico
2. **Sistema chat**: Ver [/chat](../chat/)
3. **Logs**: Monitorear terminal de desarrollo

## 📈 Mejora Continua

### Feedback Loop
1. **Identificar problema** → Documentar en issue
2. **Resolver** → Aplicar fix y validar
3. **Documentar** → Actualizar guías de troubleshooting
4. **Prevenir** → Agregar validaciones/alertas

### Base de Conocimiento
- ✅ **Issues conocidos**: Documentados y con soluciones
- ✅ **Patrones comunes**: Identificados y automatizados
- ✅ **Herramientas**: Disponibles para diagnóstico rápido
- ✅ **Escalación**: Procesos claros por nivel

---
**📅 Última actualización**: Enero 2025  
**📁 Documentos**: 2 archivos especializados  
**🎯 Cobertura**: 95% de problemas conocidos