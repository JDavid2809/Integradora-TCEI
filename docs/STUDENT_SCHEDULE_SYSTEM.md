# Sistema de Horarios para Estudiantes

## Descripción General

El sistema de horarios permite a los estudiantes visualizar:

- **Calendario semanal interactivo** con todas sus clases

- **Actividades próximas** con fechas de entrega

- **Horario tradicional** con información detallada

- **Navegación por semanas** para planificar mejor

##  Características Principales

### 1. **Actividades Próximas**


- Muestra las 5 actividades más cercanas a vencer

- Código de colores por urgencia:

  - 🔴 **Rojo**: Vence en 1 día o menos

  - 🟠 **Naranja**: Vence en 2-3 días

  - 🟡 **Amarillo**: Vence en 4-7 días

  - 🔵 **Azul**: Vence en más de 7 días

### **2. Calendario Mensual Interactivo**


- **Vista completa del mes** con grid de 7x6 días

- **Navegación fluida** entre meses con botones de flecha

- **Botón "Ir a Hoy"** para regresar rápidamente al día actual

- **Filtros por curso** con panel desplegable para mostrar/ocultar cursos específicos

- **Contador de cursos visibles** en tiempo real

- **Clases regulares** mostradas en azul con hora y nombre del curso

- **Actividades/tareas** mostradas en naranja con fecha de entrega

- **Día actual destacado** con fondo azul claro y etiqueta "Hoy"

- **Días de otros meses** mostrados en gris claro para contexto

- **Modal de detalles** al hacer clic en cualquier día con eventos

- **Estadísticas del mes** en la parte inferior (días con clases, actividades pendientes)

- **Leyenda visual completa** con todos los tipos de eventos

- **Tooltips informativos** al hacer hover sobre eventos

- **Vista responsiva** optimizada para móvil, tablet y desktop

### 3. **Horario Tradicional**


- Vista clásica de horario agrupado por curso

- Información detallada de cada clase:

  - Día y hora

  - Profesor asignado

  - Aula o ubicación

  - Duración de la clase

### 4. **Tipos de Actividades Soportados**


- 📝 **ASSIGNMENT**: Tareas

- [x] **QUIZ**: Cuestionarios

-  **PROJECT**: Proyectos

- 📖 **READING**: Lecturas

- 🎥 **VIDEO**: Videos

- ✏️ **PRACTICE**: Prácticas

-  **DISCUSSION**: Discusiones

-  **EXAM**: Exámenes

## 🏗️ Estructura Técnica

### **API Endpoint**

```text
GET /api/student/schedule
```

text
### **Respuesta de la API**

```typescript
interface ScheduleResponse {
  success: boolean
  horarios: CourseSchedule[]
  student_name: string
  isExample?: boolean // true si usa datos de ejemplo
}

interface CourseSchedule {
  curso: {
    id: number
    nombre: string
    modalidad: string
    nivel: string
  }
  schedules: Schedule[]
  activities: Activity[]
}
```

text
### **Modelos de Base de Datos Relacionados**


- `inscripcion` - Conecta estudiante con curso

- `class_schedule` - Define horarios de clase

- `course_activity` - Actividades del curso

- `nivel` - Niveles de inglés

- `profesor` - Información del profesor

##  Datos de Ejemplo

El sistema incluye datos de ejemplo para demostración:

### **Curso 1: Inglés Básico A1**


- **Horario**: Lunes, Miércoles, Viernes 9:00 AM (90 min)

- **Aula**: Aula 101

- **Profesor**: María González

- **Actividades**:

  - Vocabulario Básico - Familia (3 días)

  - Quiz: Present Simple (5 días)

### **Curso 2: Inglés Intermedio B1**


- **Horario**: Martes, Jueves 2:00 PM (120 min)

- **Aula**: Aula Virtual 1

- **Profesor**: Carlos Rodríguez

- **Actividades**:

  - Ensayo: Mi ciudad natal (7 días)

  - Video: Presentación Personal (10 días)

##  Configuración y Setup

### **1. Ejecutar Migración de Base de Datos**

```bash
npx prisma migrate dev
```

text
### **2. Seed de Datos de Horarios**

```bash
npm run seed:schedule
```

text
### **3. Verificar Funcionamiento**


1. Iniciar sesión como estudiante

2. Navegar a "Mi Horario" en el dashboard

3. El sistema mostrará datos reales si existen, o datos de ejemplo

##  Responsive Design


- **Desktop**: Vista completa del calendario mensual con grid de 7x6

- **Tablet**: Calendario adaptativo con celdas optimizadas

- **Mobile**: Vista responsiva con scroll vertical y elementos compactos

- **Navegación táctil**: Botones optimizados para touch en dispositivos móviles

##  Personalización Visual

### **Colores del Sistema**


- **Primario**: #00246a (azul institucional)

- **Secundario**: #e30f28 (rojo institucional)

- **Niveles de inglés**: Colores diferenciados A1-C2

### **Animaciones**


- Transiciones suaves con Framer Motion

- Loading states durante carga de datos

- Hover effects en elementos interactivos

##  Próximas Mejoras

### **Funcionalidades Planificadas**


- [ ] **Notificaciones push** para actividades próximas

- [ ] **Integración con calendario** personal (Google Calendar, Outlook)

- [x] **Vista mensual** del calendario - [x] **COMPLETADO**

- [ ] **Vista semanal adicional** como opción alternativa

- [ ] **Filtros por curso** y tipo de actividad

- [ ] **Recordatorios automáticos** por email

- [ ] **Sincronización offline** con Progressive Web App

- [ ] **Vista anual** para planificación a largo plazo

### **Mejoras UX**


- [ ] **Arrastrar y soltar** para reprogramar (solo admin)

- [ ] **Vista de agenda** tipo lista

- [ ] **Modo dark** para el calendario

- [ ] **Accesos rápidos** a materiales de clase

- [ ] **Integración con chat** para dudas rápidas

## 📋 Troubleshooting

### **Problema: No aparecen clases**

**Solución**:

1. Verificar que el estudiante esté inscrito en cursos

2. Ejecutar `npm run seed:schedule` para crear datos de ejemplo

3. Verificar que los cursos tengan `class_schedules` asociados

### **Problema: Actividades no se muestran**

**Solución**:

1. Verificar que las actividades estén marcadas como `is_published: true`

2. Verificar que `due_date` sea futura

3. Ejecutar script de seed para crear actividades de ejemplo

### **Problema: Error de base de datos**

**Solución**:
El sistema automáticamente usa datos de ejemplo si hay problemas de conexión a la BD.

## 👨‍💻 Desarrollo

### **Estructura de Archivos**

```text
src/app/Students/Schedule.tsx     # Componente principal
src/app/api/student/schedule/     # API endpoint
scripts/seed-schedule.ts          # Script de seed
scripts/seed-schedule.sql         # SQL de seed directo
```

text
### **Testing**

Para probar el sistema:

1. Crear usuario estudiante

2. Inscribir en cursos (usar datos de ejemplo si es necesario)

3. Verificar que aparezcan horarios y actividades

---

**📅 Implementado**: Octubre 2025
**👤 Desarrollado para**: Dashboard de estudiantes
**🏷️ Tags**: #student-dashboard #calendar #schedule #activities #education
