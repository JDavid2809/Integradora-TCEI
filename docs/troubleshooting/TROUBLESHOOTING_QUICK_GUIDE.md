# 🔧 Guía Rápida - Resolución de Problemas de Usuarios

## Problema Común: "Un usuario no aparece en la búsqueda del chat"

### Paso 1: Diagnóstico Inicial
```bash
# Usar el endpoint de debug (requiere servidor en ejecución)
curl "http://localhost:3000/api/debug/user-visibility?email=usuario@problema.com"
```

### Paso 2: Interpretar Resultados

#### Si `"found": false`
- El usuario NO existe en la base de datos
- **Solución**: Verificar que el usuario se registró correctamente

#### Si `"found": true` pero hay problemas
Revisa el array `issues`:

```json
{
  "issues": [
    "Usuario no verificado - puede afectar visibilidad en algunas búsquedas"
  ]
}
```

### Paso 3: Soluciones Rápidas

#### Para verificar un usuario:
```bash
# Método 1: Por ID de usuario
curl "http://localhost:3000/api/admin/user-tools?action=verify-user&userId=123"

# Método 2: Por email
curl "http://localhost:3000/api/admin/user-tools?action=verify-user&email=usuario@email.com"
```

#### Para ver usuarios problemáticos:
```bash
curl "http://localhost:3000/api/admin/user-tools?action=list-problematic"
```

#### Para probar búsquedas:
```bash
curl "http://localhost:3000/api/admin/user-tools?action=search-test&query=mario"
```

### Paso 4: Verificación Final
Después de aplicar soluciones, volver a ejecutar el diagnóstico:
```bash
curl "http://localhost:3000/api/debug/user-visibility?email=usuario@problema.com"
```

## Comandos Útiles de Administración

### Ver estadísticas del chat:
```bash
curl "http://localhost:3000/api/admin/user-tools?action=chat-stats"
```

### Verificar múltiples usuarios (POST):
```bash
curl -X POST "http://localhost:3000/api/admin/user-tools" \
  -H "Content-Type: application/json" \
  -d '{"action": "bulk-verify", "userIds": [1, 2, 3]}'
```

## Interpretación de Estados

### ✅ Usuario Funcional
```json
{
  "found": true,
  "issues": [],
  "searchability": {
    "chatSearch": true,
    "adminPanel": true
  }
}
```

### ⚠️ Usuario con Problemas Menores
```json
{
  "found": true,
  "issues": ["Usuario no verificado"],
  "recommendations": ["Verificar email del usuario"]
}
```

### ❌ Usuario con Problemas Graves
```json
{
  "found": true,
  "issues": [
    "Usuario no verificado",
    "Perfil incompleto",
    "Sin permisos de chat"
  ],
  "searchability": {
    "chatSearch": false,
    "adminPanel": true
  }
}
```

## Checklist de Resolución

- [ ] Usuario existe en la base de datos
- [ ] Usuario está verificado (`verificado: true`)
- [ ] Usuario tiene nombre y apellido completos
- [ ] Usuario tiene el rol correcto
- [ ] Usuario puede aparecer en búsquedas de chat
- [ ] Usuario puede aparecer en panel administrativo

---
**💡 Tip**: Usa siempre el endpoint de debug antes de hacer cambios manuales en la base de datos.