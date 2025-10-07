# Documentación Técnica - Módulo Admin

## Roles y Permisos

- **ADMIN**: Puede leer, editar y eliminar cualquier dato. Puede crear usuarios, pagos y configuraciones. No puede crear cursos ni exámenes.
- **PROFESOR**: Acceso a sus propios cursos y estudiantes.
- **ESTUDIANTE**: Acceso a su información y resultados.
- **SUPERADMIN**: Acceso total a todo el sistema.

La definición centralizada está en `src/config/roles.ts`.

## Auditoría y Seguridad
- Todas las acciones críticas (creación, edición, eliminación) deben registrar el usuario que las ejecuta.
- Los endpoints de API validan el rol antes de permitir acciones.
- Inputs validados y sanitizados con Zod y react-hook-form.

## Buenas Prácticas
- Componentes y hooks reutilizables.
- Código tipado (TypeScript estricto, sin `any`).
- Paginación y búsqueda eficiente.
- Feedback inmediato al usuario (toasts, banners).
- Código legacy eliminado.

## Mejoras sugeridas
- Agregar logs de auditoría en endpoints y acciones críticas.
- Implementar skeleton loaders y toasts globales.
- Documentar flujos de permisos y roles en este archivo.

---

> Para dudas o contribuciones, contactar al responsable del módulo Admin.
