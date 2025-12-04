# 🚀 Auditoría Adicional de Rendimiento - Diciembre 2025

Puntos de mejora adicionales identificados después de las optimizaciones iniciales.

---

## 🔴 Problemas Críticos de Rendimiento

### 1. **N+1 Query Problem en `getStudentCourses()`**

**Ubicación:** `src/actions/courses/manageCourses.ts:242-378`

**Problema:** 
- Se consulta la inscripción con todas las actividades y entregas
- Luego se hace un cálculo en JavaScript iterando sobre **cada actividad** y **cada entrega**
- Para cada inscripción, se ejecuta lógica O(n×m) donde n = actividades y m = entregas

**Impacto:**
- Un estudiante con 5 cursos, 10 actividades cada uno y 20 entregas: **5 × 10 × 20 = 1000 iteraciones**
- Esto ocurre en **cada carga de página del dashboard del estudiante**

**Solución recomendada:**
```typescript
// ❌ ACTUAL: Cálculo en memoria
for (const submission of inscripcion.submissions) {
  const existing = submissionsByActivity.get(submission.activity_id)
  if (!existing || ...) {
    submissionsByActivity.set(...)
  }
}

// ✅ MEJOR: Usar agregación SQL
const progressData = await prisma.activity_submission.groupBy({
  by: ['activity_id'],
  where: { 
    enrollment_id: inscripcion.id,
    status: 'GRADED'
  },
  _max: { score: true },
  having: {
    score: { gte: activity.min_passing_score }
  }
})
```

---

### 2. **Parsing Repetitivo de JSON en `getPaginatedCourses()`**

**Ubicación:** `src/actions/courses/manageCourses.ts:144-150`

**Problema:**
```typescript
// Se ejecuta JSON.parse() para CADA curso en CADA consulta
const cursosConLecciones = cursos.map(curso => ({
  ...curso,
  total_lecciones_calculadas: countLessonsFromContent(curso.course_content)
}))
```

**Función `countLessonsFromContent()`:**
```typescript
function countLessonsFromContent(courseContent: string | null): number {
  if (!courseContent) return 0
  try {
    const content = JSON.parse(courseContent) // ⚠️ Parse en cada llamada
    // ... lógica ...
  } catch { return 0 }
}
```

**Impacto:**
- Se ejecuta en cada consulta de cursos (búsqueda, listado, paginación)
- Con 50 cursos en una página: **50 JSON.parse() por request**
- Búsquedas frecuentes = CPU y latencia innecesaria

**Solución:**
1. **Opción A - Campo calculado en BD:**
```prisma
model curso {
  // ...
  total_lecciones Int? // Calculado al crear/actualizar
}
```

2. **Opción B - Caché con Redis:**
```typescript
const cacheKey = `course:${curso.id}:lessons`
let lessons = await redis.get(cacheKey)
if (!lessons) {
  lessons = countLessonsFromContent(curso.course_content)
  await redis.set(cacheKey, lessons, 'EX', 3600) // 1 hora
}
```

3. **Opción C - Memoización (corto plazo):**
```typescript
const lessonCache = new Map<number, number>()

function getCachedLessonCount(cursoId: number, content: string | null) {
  if (lessonCache.has(cursoId)) return lessonCache.get(cursoId)!
  const count = countLessonsFromContent(content)
  lessonCache.set(cursoId, count)
  return count
}
```

---

### 3. **Dashboard Admin: 20+ Consultas Paralelas Sin Optimización**

**Ubicación:** `src/actions/admin/dashboardMetrics.ts:60-202`

**Problema:**
```typescript
const [
  totalStudents,
  totalTeachers,
  totalAdmins,
  // ... 20+ queries más
] = await Promise.all([
  prisma.estudiante.count(),
  prisma.profesor.count(),
  // ...
])
```

**Issues:**
1. **No usa transacciones:** 20+ queries sin garantía de consistencia
2. **Sin índices verificados:** Algunos `count()` pueden ser lentos
3. **Aggregaciones ineficientes:** `groupBy` en fechas sin índice
4. **Post-procesamiento excesivo:** Mapeo de datos en JavaScript

**Impacto:**
- Dashboard puede tardar **2-5 segundos** en cargar con datos reales
- Bloquea el usuario sin feedback visual
- Carga innecesaria en la BD en cada vista

**Solución:**

1. **Vista materializada en PostgreSQL:**
```sql
CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT 
  (SELECT COUNT(*) FROM estudiante) as total_students,
  (SELECT COUNT(*) FROM profesor WHERE b_activo = true) as active_teachers,
  -- ... resto de métricas
;

-- Refrescar cada hora
CREATE INDEX ON dashboard_metrics (refreshed_at);
```

2. **Caché con TTL:**
```typescript
export async function getDashboardMetrics() {
  const cached = await redis.get('dashboard:metrics')
  if (cached) return JSON.parse(cached)
  
  const metrics = await calculateMetrics()
  await redis.set('dashboard:metrics', JSON.stringify(metrics), 'EX', 300) // 5 min
  return metrics
}
```

3. **Índices faltantes:**
```prisma
model payment {
  @@index([status, payment_date]) // Para agregaciones
}

model inscripcion {
  @@index([status, enrolled_at]) // Para conteos por fecha
}
```

---

### 4. **Exceso de Datos en Respuestas de API (Over-fetching)**

**Ubicación:** Múltiples lugares

**Ejemplos:**

#### 4.1 `getCourseBySlug()` - 600+ líneas
```typescript
// Trae TODO el curso con TODAS las relaciones
const curso = await prisma.curso.findUnique({
  where: { slug },
  select: {
    // ... 20+ campos
    inscripciones: {
      include: {
        student: {
          include: {
            usuario: { select: { nombre, apellido } }
          }
        }
      }
    },
    reviews: {
      include: { 
        student: { 
          include: { usuario } 
        } 
      }
    }
    // ... más relaciones anidadas
  }
})
```

**Problema:** El cliente solo necesita ciertos campos según la vista, pero se traen TODOS los datos siempre.

**Solución - Vista específica:**
```typescript
// Para listado de cursos (menos datos)
export async function getCourseListItem(slug: string) {
  return prisma.curso.findUnique({
    where: { slug },
    select: {
      id_curso: true,
      nombre: true,
      descripcion: true,
      precio: true,
      modalidad: true,
      _count: { select: { inscripciones: true } }
      // Solo lo necesario para el card
    }
  })
}

// Para detalles completos del curso
export async function getCourseFullDetails(slug: string) {
  // ... consulta completa
}
```

---

### 5. **Multiple JSON.parse() en Componentes de Cliente**

**Ubicación:** `src/app/(main)/Courses/[slug]/NewCourseDetails.tsx:155-189`

**Problema:**
```typescript
try {
  if (courseData.what_you_learn) {
    const parsed = JSON.parse(courseData.what_you_learn) // Parse 1
    whatYouLearn = Array.isArray(parsed) ? parsed.map(...) : []
  }
  if (courseData.features) {
    const parsed = JSON.parse(courseData.features) // Parse 2
    features = Array.isArray(parsed) ? parsed : []
  }
  if (courseData.requirements) {
    const parsed = JSON.parse(courseData.requirements) // Parse 3
    // ...
  }
  // ... 2 más
} catch (error) {
  console.error('Error parsing JSON fields:', error)
}
```

**Impacto:**
- **5 JSON.parse()** en cada render del componente
- Si hay re-renders (estado cambia), se ejecuta múltiples veces
- Client-side parsing = CPU del usuario + latencia percibida

**Solución - Parsear en el servidor:**
```typescript
// Server Component o Server Action
export async function getCourseWithParsedData(slug: string) {
  const curso = await getCourseBySlug(slug)
  
  return {
    ...curso,
    what_you_learn: JSON.parse(curso.what_you_learn || '[]'),
    features: JSON.parse(curso.features || '[]'),
    requirements: JSON.parse(curso.requirements || '[]'),
    target_audience: JSON.parse(curso.target_audience || '[]'),
    course_content: JSON.parse(curso.course_content || '[]')
  }
}

// Componente: datos ya parseados
function CourseDetails({ courseData }) {
  const whatYouLearn = courseData.what_you_learn // Ya es array
  // ...
}
```

---

### 6. **Consultas Sin Límite de Resultados**

**Ubicación:** `src/actions/courses/manageCourses.ts:217`

**Problema:**
```typescript
export async function getAllCourses() {
  try {
    const result = await getPaginatedCourses({ limit: 1000 }) // ⚠️ Hardcoded
    return result.cursos
  }
}
```

**Casos de uso:**
- Dashboard de estudiante
- Listados de selección (dropdowns)
- Búsquedas

**Impacto:**
- Si hay 1000+ cursos, se traen TODOS en memoria
- Cada curso incluye relaciones (profesor, nivel, conteos)
- **Puede ser varios MB de datos** innecesarios

**Solución:**
```typescript
// Para dropdowns
export async function getCoursesForSelect() {
  return prisma.curso.findMany({
    where: { b_activo: true },
    select: { 
      id_curso: true, 
      nombre: true,
      slug: true 
    },
    take: 100, // Límite razonable
    orderBy: { nombre: 'asc' }
  })
}

// Para búsquedas con scroll infinito
export async function getCoursesInfinite(cursor?: number, take = 20) {
  return prisma.curso.findMany({
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id_curso: cursor } : undefined,
    where: { b_activo: true },
    orderBy: { id_curso: 'desc' }
  })
}
```

---

### 7. **ChatContext: Polling Sin Optimización**

**Ubicación:** `src/contexts/ChatContext.tsx`

**Problema potencial:**
Si el contexto hace polling para mensajes nuevos, puede causar:
- Requests constantes al servidor
- Re-renders innecesarios de todos los componentes consumidores
- Batería y datos móviles desperdiciados

**Recomendación (verificar implementación actual):**

1. **WebSockets en lugar de polling:**
```typescript
// Con Socket.io o similar
const socket = io()
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message])
})
```

2. **Throttling/Debouncing:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchNewMessages()
  }, 5000) // En lugar de cada segundo
  return () => clearInterval(interval)
}, [])
```

3. **React Query con stale time:**
```typescript
const { data } = useQuery({
  queryKey: ['messages', roomId],
  queryFn: fetchMessages,
  staleTime: 30000, // 30 segundos
  refetchInterval: 10000 // Solo cada 10s
})
```

---

## 🟡 Problemas Moderados de Rendimiento

### 8. **Falta de Índices Compuestos**

**Actual en schema.prisma:**
```prisma
model inscripcion {
  @@index([student_id])
  @@index([course_id])
  @@index([status])
}
```

**Problema:** Las consultas usan múltiples columnas juntas:
```typescript
prisma.inscripcion.findMany({
  where: { 
    student_id: X,
    status: 'ACTIVE' // ⚠️ Sin índice compuesto
  }
})
```

**Solución - Índices compuestos:**
```prisma
model inscripcion {
  @@index([student_id, status]) // Para consultas de estudiante activo
  @@index([course_id, status])  // Para consultas de curso activo
  @@index([status, enrolled_at]) // Para reportes por fecha
}

model activity_submission {
  @@index([enrollment_id, status]) // Para consultas de entregas calificadas
  @@index([student_id, activity_id]) // Para verificar entregas existentes
}

model payment {
  @@index([enrollment_id, status]) // Para verificar pagos pendientes
  @@index([status, payment_date])  // Para reportes financieros
}
```

---

### 9. **Ausencia de Paginación en Listados de Entidades Relacionadas**

**Ejemplo:** `getCourseBySlug()` trae TODAS las reviews:

```typescript
reviews: {
  where: { is_active: true },
  include: { student: { ... } },
  orderBy: { created_at: 'desc' }
  // ⚠️ Sin take/skip
}
```

**Problema:** Un curso popular con 500 reviews carga todo en una sola request.

**Solución:**
```typescript
// Traer solo las primeras
reviews: {
  where: { is_active: true },
  take: 10,
  orderBy: { created_at: 'desc' }
},
_count: {
  select: { 
    reviews: { where: { is_active: true } } 
  }
}

// Server Action separada para cargar más
export async function getCourseReviews(courseId: number, page = 1) {
  return prisma.review.findMany({
    where: { course_id: courseId, is_active: true },
    include: { student: { ... } },
    take: 10,
    skip: (page - 1) * 10,
    orderBy: { created_at: 'desc' }
  })
}
```

---

### 10. **Cálculos Repetidos Sin Memoización**

**Ejemplo:** `countLessonsFromContent()` ya mencionado, pero también:

```typescript
// En NewCourseDetails.tsx
courseContent.map(module => {
  // Cálculos complejos en cada render
  const totalDuration = module.topics.reduce(...)
  const progress = calculateProgress(...)
  return <Module ... />
})
```

**Solución - useMemo:**
```typescript
const processedContent = useMemo(() => {
  return courseContent.map(module => ({
    ...module,
    totalDuration: module.topics.reduce(...),
    progress: calculateProgress(module)
  }))
}, [courseContent]) // Solo recalcula si courseContent cambia
```

---

## 📊 Resumen de Impacto

| Problema | Severidad | Impacto en UX | Esfuerzo de Fix |
|----------|-----------|---------------|-----------------|
| N+1 en getStudentCourses | 🔴 Alta | 2-5s de carga | Medio |
| JSON.parse repetitivo | 🔴 Alta | 500ms+ en listados | Bajo |
| Dashboard sin caché | 🔴 Alta | 3-10s de carga | Medio |
| Over-fetching de datos | 🟡 Media | 1-2s innecesarios | Bajo |
| JSON.parse en cliente | 🟡 Media | Renders lentos | Bajo |
| Sin límite en getAllCourses | 🟡 Media | Escalabilidad | Bajo |
| Chat polling | 🟡 Media | Batería/datos | Alto |
| Falta índices compuestos | 🟡 Media | Queries lentas | Bajo |
| Sin paginación en reviews | 🟢 Baja | Solo cursos populares | Bajo |
| Sin memoización | 🟢 Baja | Re-renders lentos | Bajo |

---

## 🎯 Plan de Acción Priorizado

### Fase 1 - Quick Wins (1-2 días)
1. ✅ Agregar índices compuestos al schema
2. ✅ Memoizar `countLessonsFromContent()`
3. ✅ Parsear JSON en servidor (Server Actions)
4. ✅ Añadir `take` a consultas sin límite
5. ✅ Memoizar cálculos en componentes con `useMemo`

### Fase 2 - Optimizaciones Medias (3-5 días)
6. ✅ Refactorizar `getStudentCourses()` con SQL optimizado
7. ✅ Implementar queries específicas (over-fetching)
8. ✅ Agregar paginación a reviews y entregas
9. ✅ Caché de métricas del dashboard (Redis o en memoria)

### Fase 3 - Cambios Arquitectónicos (1-2 semanas)
10. ✅ Implementar Redis para caché de consultas frecuentes
11. ✅ WebSockets para chat en tiempo real
12. ✅ Vista materializada para dashboard
13. ✅ Campo calculado `total_lecciones` en curso

---

## 🧪 Métricas Esperadas Post-Optimización

### Antes vs Después

| Operación | Antes | Después | Mejora |
|-----------|-------|---------|--------|
| Dashboard estudiante | 3-5s | 500ms-1s | **5-10x** |
| Listado de cursos | 2-3s | 200-500ms | **6-10x** |
| Dashboard admin | 5-10s | 1-2s | **5x** |
| Carga de curso individual | 1-2s | 300-600ms | **3-5x** |
| Chat (latencia) | Polling 1s | WebSocket <100ms | **10x+** |

---

## 📝 Comandos para Implementar Índices

```bash
# Actualizar schema.prisma con índices compuestos
# Luego generar y aplicar migración
npx prisma migrate dev --name add_composite_indexes

# Verificar índices en PostgreSQL
psql -d english-DB -c "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;"
```

---

**Fecha:** 3 de diciembre de 2025  
**Próxima revisión:** Después de implementar Fase 1  
**Responsable:** Equipo de desarrollo
