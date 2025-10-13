# 📚 Sistema de Cursos

## Descripción
Documentación del sistema de gestión de cursos, inscripciones y seguimiento académico.

## 📋 Documentos Disponibles

### 📝 Estructura de Inscripciones
- **[NUEVA_ESTRUCTURA_INSCRIPCIONES.md](./NUEVA_ESTRUCTURA_INSCRIPCIONES.md)** - Nueva arquitectura del sistema de inscripciones

## 🎯 Funcionalidades del Sistema

### Gestión de Cursos
- ✅ **CRUD completo**: Crear, leer, actualizar, eliminar cursos
- ✅ **Modalidades**: Presencial, virtual, híbrida
- ✅ **Niveles**: Básico, intermedio, avanzado
- ✅ **Horarios**: Gestión flexible de horarios por curso
- ✅ **Contenido**: Descripción y material del curso

### Sistema de Inscripciones
- ✅ **Proceso simplificado**: Registro rápido de estudiantes
- ✅ **Validaciones**: Verificación de prerrequisitos
- ✅ **Estados**: Pendiente, confirmada, cancelada
- ✅ **Capacidad**: Control de cupos por curso
- ✅ **Pagos**: Integración con sistema de pagos

### Seguimiento Académico
- ✅ **Progreso**: Tracking del avance de estudiantes
- ✅ **Asistencias**: Control de presencia en clases
- ✅ **Calificaciones**: Sistema de evaluación
- ✅ **Certificados**: Generación automática al completar

### Categorías y Niveles
- ✅ **Categorías por edad**: Agrupación por rangos etarios
- ✅ **Niveles de inglés**: Principiante a avanzado
- ✅ **Cursos especializados**: Business, conversacional, preparación exámenes
- ✅ **Programas intensivos**: Cursos de verano, inmersión

## 🗃️ Estructura de Datos

### Modelo de Curso
```typescript
interface Curso {
  id: number
  nombre: string
  descripcion?: string
  modalidad: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA'
  inicio?: Date
  fin?: Date
  nivel_id?: number
  capacidad_maxima?: number
  precio?: number
  activo: boolean
}
```

### Modelo de Inscripción
```typescript
interface Inscripcion {
  id: number
  estudiante_id: number
  curso_id: number
  fecha_inscripcion: Date
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'
  fecha_pago?: Date
  monto_pagado?: number
}
```

### Relaciones Principales
- **Curso ↔ Inscripciones**: Un curso tiene muchas inscripciones
- **Estudiante ↔ Inscripciones**: Un estudiante puede tener múltiples inscripciones
- **Curso ↔ Horarios**: Un curso puede tener múltiples horarios
- **Nivel ↔ Cursos**: Un nivel puede tener múltiples cursos

## 📊 Funcionalidades Administrativas

### Dashboard de Cursos
- ✅ **Vista general**: Estadísticas de todos los cursos
- ✅ **Inscripciones activas**: Conteo en tiempo real
- ✅ **Capacidad**: Visualización de cupos disponibles
- ✅ **Ingresos**: Métricas financieras por curso

### Gestión de Estudiantes
- ✅ **Lista de inscritos**: Por curso específico
- ✅ **Historial académico**: Cursos previos del estudiante
- ✅ **Seguimiento**: Progreso y asistencias
- ✅ **Comunicación**: Notificaciones y anuncios

### Reportes y Analytics
- ✅ **Popularidad de cursos**: Más demandados
- ✅ **Tasas de finalización**: Porcentaje de completación
- ✅ **Ingresos por período**: Análisis financiero
- ✅ **Satisfacción**: Encuestas y feedback

## 🔧 APIs Principales

### Cursos
- `GET /api/courses` - Listar cursos disponibles
- `POST /api/courses` - Crear nuevo curso
- `PUT /api/courses/[id]` - Actualizar curso
- `DELETE /api/courses/[id]` - Eliminar curso

### Inscripciones
- `GET /api/enrollments` - Listar inscripciones
- `POST /api/enrollments` - Nueva inscripción
- `PUT /api/enrollments/[id]` - Actualizar estado
- `GET /api/enrollments/student/[id]` - Inscripciones por estudiante

### Niveles y Categorías
- `GET /api/levels` - Listar niveles disponibles
- `GET /api/age-categories` - Categorías por edad

## 📈 Mejoras Implementadas

### Nueva Estructura de Inscripciones
- ✅ **Optimización**: Queries más eficientes
- ✅ **Flexibilidad**: Soporte para múltiples modalidades
- ✅ **Escalabilidad**: Preparado para crecimiento
- ✅ **Integraciones**: APIs listas para terceros

### Automatizaciones
- ✅ **Notificaciones**: Emails automáticos de confirmación
- ✅ **Recordatorios**: Avisos de clases próximas
- ✅ **Certificados**: Generación automática al completar
- ✅ **Renovaciones**: Sugerencias de cursos siguientes

## 🚀 Acceso Rápido

### Para Administradores:
1. **Estructura**: [NUEVA_ESTRUCTURA_INSCRIPCIONES.md](./NUEVA_ESTRUCTURA_INSCRIPCIONES.md)
2. **Gestión**: Ver [/admin](../admin/) para herramientas administrativas

### Para Desarrolladores:
1. **Arquitectura**: [NUEVA_ESTRUCTURA_INSCRIPCIONES.md](./NUEVA_ESTRUCTURA_INSCRIPCIONES.md)
2. **APIs**: Ver documentación de endpoints

### Para Soporte:
1. **Inscripciones**: Procesos y validaciones
2. **Troubleshooting**: Ver [/troubleshooting](../troubleshooting/)

## 📊 Estado Actual

- **Sistema CRUD**: Completamente funcional ✅
- **Inscripciones**: Nueva estructura implementada ✅
- **Validaciones**: Sistema robusto ✅
- **Reportes**: Disponibles en admin panel ✅

---
**📅 Última actualización**: Enero 2025  
**📁 Documentos**: 1 archivo especializado