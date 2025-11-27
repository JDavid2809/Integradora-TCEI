# Documentación del Sistema - Índice General

## 🗂️ Organización por Áreas

###  [1. Administración (`/admin/`)](./admin/)

Documentación del panel administrativo y funcionalidades de gestión.


- **[ADMIN_FINAL_GUIDE.md](./admin/ADMIN_FINAL_GUIDE.md)** - Guía completa del panel administrativo

- **[ADMIN_CRUD_DOCUMENTATION.md](./admin/ADMIN_CRUD_DOCUMENTATION.md)** - Operaciones CRUD administrativas

- **[ADMIN_REFACTOR.md](./admin/ADMIN_REFACTOR.md)** - Refactorización del sistema admin

- **[ADMIN_REQUIREMENTS_AUDIT.md](./admin/ADMIN_REQUIREMENTS_AUDIT.md)** - Auditoría de requerimientos

- **[ADMIN_VERIFICATION_STATUS.md](./admin/ADMIN_VERIFICATION_STATUS.md)** - Estado de verificación

- **[ADMIN_ATTENDANCE_IMPLEMENTATION.md](./admin/ADMIN_ATTENDANCE_IMPLEMENTATION.md)** - Sistema de asistencias

- **[README_ADMIN.md](./admin/README_ADMIN.md)** - Documentación de área administrativa

- **[AreaAdmin.md](./admin/AreaAdmin.md)** - Descripción del área administrativa

###  [2. Sistema de Chat (`/chat/`)](./chat/)

Documentación completa del sistema de mensajería y comunicación.


- **[SISTEMA_CHAT.md](./chat/SISTEMA_CHAT.md)** - Arquitectura general del chat

- **[MESSAGE_STATUS_SYSTEM.md](./chat/MESSAGE_STATUS_SYSTEM.md)** - Sistema de estados de mensajes

- **[CHAT_LIST_MINIMIZATION_FEATURE.md](./chat/CHAT_LIST_MINIMIZATION_FEATURE.md)** - Función de minimización

- **[SEARCH_INTEGRATION_UPDATE.md](./chat/SEARCH_INTEGRATION_UPDATE.md)** - Búsqueda integrada

- **[FULLSCREEN_MODE_IMPLEMENTATION.md](./chat/FULLSCREEN_MODE_IMPLEMENTATION.md)** - Modo pantalla completa

- **[USER_VISIBILITY_SYSTEM.md](./chat/USER_VISIBILITY_SYSTEM.md)** - Sistema de visibilidad

###  [3. Autenticación (`/authentication/`)](./authentication/)

Sistema de autenticación, verificación y gestión de usuarios.


- **[EMAIL_VERIFICATION_SYSTEM.md](./authentication/EMAIL_VERIFICATION_SYSTEM.md)** - Verificación por email

###  [4. UI/UX (`/ui-ux/`)](./ui-ux/)

Documentación de interfaces de usuario y experiencia.


- **[LUCIDE_ICONS_GUIDE.md](./ui-ux/LUCIDE_ICONS_GUIDE.md)** - Guía de iconografía

- **[UI_VIEWS_SUMMARY.md](./ui-ux/UI_VIEWS_SUMMARY.md)** - Resumen de vistas

### 📚 [5. Cursos (`/courses/`)](./courses/)

Documentación del sistema de cursos e inscripciones.


- **[NUEVA_ESTRUCTURA_INSCRIPCIONES.md](./courses/NUEVA_ESTRUCTURA_INSCRIPCIONES.md)** - Nueva estructura de inscripciones

###  [6. Implementaciones (`/implementation/`)](./implementation/)

Resúmenes y documentación de implementaciones completadas.


- **[IMPLEMENTATION_COMPLETE_SUMMARY.md](./implementation/IMPLEMENTATION_COMPLETE_SUMMARY.md)** - Resumen completo

- **[IMPLEMENTACION_COMPLETADA.md](./implementation/IMPLEMENTACION_COMPLETADA.md)** - Implementaciones finalizadas

- **[IMPLEMENTATION_SUMMARY.md](./implementation/IMPLEMENTATION_SUMMARY.md)** - Resumen de implementaciones

###  [7. Resolución de Problemas (`/troubleshooting/`)](./troubleshooting/)

Guías para diagnóstico y resolución de issues.


- **[TROUBLESHOOTING_QUICK_GUIDE.md](./troubleshooting/TROUBLESHOOTING_QUICK_GUIDE.md)** - Guía rápida

- **[USER_VISIBILITY_TROUBLESHOOTING.md](./troubleshooting/USER_VISIBILITY_TROUBLESHOOTING.md)** - Problemas de visibilidad

---

##  Guías de Acceso Rápido

### Para Desarrolladores:


1. **Empezar**: [Implementation Summary](./implementation/IMPLEMENTATION_COMPLETE_SUMMARY.md)

2. **Chat**: [Sistema Chat](./chat/SISTEMA_CHAT.md)

3. **Admin**: [Admin Guide](./admin/ADMIN_FINAL_GUIDE.md)

4. **Issues**: [Troubleshooting](./troubleshooting/TROUBLESHOOTING_QUICK_GUIDE.md)

### Para Administradores:


1. **Panel Admin**: [Admin Final Guide](./admin/ADMIN_FINAL_GUIDE.md)

2. **Usuarios**: [User Visibility](./chat/USER_VISIBILITY_SYSTEM.md)

3. **Verificación**: [Email Verification](./authentication/EMAIL_VERIFICATION_SYSTEM.md)

4. **Asistencias**: [Attendance System](./admin/ADMIN_ATTENDANCE_IMPLEMENTATION.md)

### Para Soporte:


1. **Diagnóstico**: [Quick Troubleshooting](./troubleshooting/TROUBLESHOOTING_QUICK_GUIDE.md)

2. **Visibilidad**: [User Visibility Issues](./troubleshooting/USER_VISIBILITY_TROUBLESHOOTING.md)

3. **Chat Issues**: [Message Status](./chat/MESSAGE_STATUS_SYSTEM.md)

---

### 🧰 Scripts & Tests


- **Scripts**: `scripts/` contiene scripts utilitarios (seeders, migraciones manuales, migraciones auxiliares, utilidades de pruebas)

- **Tests**: `tests/` contiene todas las pruebas unitarias y de integración. `jest.config.js` está configurado para ejecutar pruebas desde esa carpeta.


##  Estadísticas de Documentación


- **Total de archivos**: 23 documentos

- **Áreas cubiertas**: 7 categorías principales

- **Última actualización**: Enero 2025

- **Estado**: Organización completada - [x]

---

##  Mantenimiento

### Nuevos documentos:

Agregar a la carpeta correspondiente según área temática.

### Actualizaciones:

Mantener este índice actualizado cuando se agreguen/muevan archivos.

### Convenciones:


- **Nombres**: PascalCase con guiones bajos

- **Estructura**: Markdown con headers consistentes

- **Enlaces**: Relativos dentro del repositorio

---

**📅 Última organización**: Enero 2025
**👤 Responsable**: Sistema de Documentación Centralizada
