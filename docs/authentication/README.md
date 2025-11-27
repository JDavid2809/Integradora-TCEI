# Sistema de Autenticación

## Descripción

Documentación del sistema de autenticación, verificación de usuarios y gestión de accesos.

## Documentos Disponibles

###  Verificación por Email


- **[EMAIL_VERIFICATION_SYSTEM.md](./EMAIL_VERIFICATION_SYSTEM.md)** - Sistema completo de verificación por correo electrónico

## Funcionalidades de Autenticación


- ### Sistema de Login


- **NextAuth.js**: Autenticación robusta y segura

- **Credenciales**: Login con email y password

- [x] **Sesiones**: Gestión automática de sesiones

- [x] **Middleware**: Protección de rutas automática

### Verificación de Email


- [x] **Tokens únicos**: Generación de tokens de verificación seguros

- [x] **Expiración**: Control de tiempo de vida de tokens

- [x] **Templates**: Emails HTML responsivos

- [x] **Reenvío**: Posibilidad de reenviar verificación

### Gestión de Usuarios


- [x] **Registro**: Proceso completo de alta de usuarios

- [x] **Roles**: Sistema de roles (ADMIN, PROFESOR, ESTUDIANTE)

- [x] **Estados**: Control de usuarios activos/verificados

- [x] **Recuperación**: Sistema de reset de contraseñas

### Seguridad


- [x] **Hashing**: Contraseñas hasheadas con bcrypt

- [x] **Tokens JWT**: Sesiones seguras

- [x] **Rate Limiting**: Prevención de ataques de fuerza bruta

- [x] **Validación**: Validación robusta en cliente y servidor

## Flujos Principales

### Registro de Usuario

```text
1. Usuario completa formulario →

2. Sistema crea usuario (no verificado) →

3. Envía email de verificación →

4. Usuario hace clic en enlace →

5. Token validado → Usuario verificado
```

text
### Login

```text
1. Usuario ingresa credenciales →

2. Validación de email/password →

3. Verificación de estado activo →

4. Creación de sesión →

5. Redirección a dashboard
```

text
### Verificación por Email

```text
1. Generación de token único →

2. Envío de email con enlace →

3. Usuario accede al enlace →

4. Validación de token y expiración →

5. Activación de cuenta
```

text
## Sistema de Emails

### Configuración SMTP


- **Proveedor**: Configurable (Gmail, SendGrid, etc.)

- **Templates**: HTML responsivos y profesionales

- **Personalización**: Logos y branding del instituto

### Tipos de Emails


- [x] **Verificación**: Email inicial de registro

- [x] **Reenvío**: Nueva verificación si expiró

- [x] **Recuperación**: Reset de contraseña

- [x] **Notificaciones**: Cambios en cuenta

## Seguridad Implementada

### Tokens


- **Generación**: UUID v4 único por usuario

- **Expiración**: Configurable (default: 24 horas)

- **Un solo uso**: Token se invalida después del uso

- **Asociación**: Vinculado específicamente a email de usuario

### Validaciones


- **Email único**: Previene duplicados en registro

- **Formato email**: Validación regex en cliente y servidor

- **Fuerza contraseña**: Mínimo 8 caracteres

- **Sanitización**: Prevención XSS en inputs

### Protección de Rutas


- **Middleware**: Verificación automática de autenticación

- **Roles**: Acceso basado en tipo de usuario

- **Redirecciones**: Automáticas según estado de auth

## Acceso Rápido

### Para Desarrolladores:


1. **Implementación**: [EMAIL_VERIFICATION_SYSTEM.md](./EMAIL_VERIFICATION_SYSTEM.md)

### Para Administradores:


1. **Configuración**: Ver sección SMTP en documentación

2. **Gestión usuarios**: Ver [/admin](../admin/)

### Para Soporte:


1. **Problemas verificación**: [EMAIL_VERIFICATION_SYSTEM.md](./EMAIL_VERIFICATION_SYSTEM.md)

2. **Troubleshooting**: Ver [/troubleshooting](../troubleshooting/)

##  Estado Actual


- **NextAuth.js**: Configurado y funcional

- **Verificación Email**: Sistema completo

- **SMTP**: Configurado y probado

- **Seguridad**: Implementaciones completadas

---
**📅 Última actualización**: Enero 2025
** Documentos**: 1 archivo especializado
