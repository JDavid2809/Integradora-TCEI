# Gamificación y mejoras de formato - Implementadas

## Mejoras Implementadas

### 1. **Sistema de Gamificación con Badges**

#### Badges Disponibles:

| Badge | Icono | Condición | Color |
|-------|-------|-----------|-------|
| **Primera Guía** | Target | Generar 1 guía de estudio | Azul |
| **Maestro del Estudio** | BookOpen | Generar 5 guías | Púrpura |
| **Quiz Master** | Trophy | 3 calificaciones perfectas (100%) en quizzes | Amarillo |
| **7 Días Seguidos** | Flame | Estudiar 7 días consecutivos | Naranja |
| **Dedicado** | Star | Completar 10 guías de estudio | Verde |

#### Características del Sistema:

```typescript
type UserStats = {
  totalGuides: number         // Total de guías generadas
  completedGuides: number     // Guías completadas al 100%
  perfectQuizzes: number      // Quizzes con score 100%
  currentStreak: number       // Días consecutivos estudiando
  lastActiveDate: string | null
}
```

text
**Almacenamiento**: `localStorage` con clave `study_guide_stats`

**Triggers de Badges**:


- [x] Al generar guía 1 o 5 → Muestra panel de logros automáticamente

- [x] Al completar quiz con 100% → Actualiza contador de perfectQuizzes

- [x] Al completar todas las secciones → Actualiza completedGuides

#### UI del Sistema de Logros:

**Botón de Logros** (Header):
```tsx
<button>
  <Award size={20} />
  Logros ({unlockedBadges.length}/{badges.length})
  {/* Badge verde con número de logros desbloqueados */}
</button>
```

text
**Panel de Logros** (Expandible):

- Gradiente azul-púrpura de fondo

- Grid responsive (1-2-3 columnas según viewport)

- Badges desbloqueados: fondo blanco, borde verde, ícono coloreado

- Badges bloqueados: fondo gris, borde gris, ícono gris, opacidad 60%

- Indicador "✓ Desbloqueado" en verde

- Sección "Próximo logro" con el siguiente badge a desbloquear

---

### 2. **Corrección del Renderizado de Guías JSON** 📝

#### Problema Anterior:

Las guías generadas por la IA se almacenan como JSON, pero se mostraba el **texto JSON crudo** en lugar del componente interactivo.

#### Solución Implementada:

**Función `tryParseJson()` Robusta**:
```typescript
function tryParseJson(str: string): { sections: any[] } | null {
  if (!str) return null

  // Intento 1: Parse directo
  try {
    const parsed = JSON.parse(str)
    if (parsed?.sections && Array.isArray(parsed.sections)) {
      return parsed
    }
  } catch (e) {}

  // Intento 2: Limpieza + Parse
  try {
    let cleaned = str
      .replace(/^```

json\s*/i, '')  // Quitar
```json
      .replace(/^```

\s*/, '')        // Quitar ```
      .replace(/\s*```$/g, '')       // Quitar ``` al final
      .trim()

    // Extraer JSON si está envuelto en texto
    const match = cleaned.match(/\{[\s\S]*"sections"[\s\S]*\}/)
    if (match) {
      cleaned = match[0]
    }

    const parsed = JSON.parse(cleaned)
    if (parsed?.sections && Array.isArray(parsed.sections)) {
      return parsed
    }
  } catch (e) {}

  return null
}
```text
**Lógica de Renderizado**:
```

tsx
{tryParseJson(selectedGuide.content) ? (
  // - [x] Renderizar componente interactivo
  <InteractiveGuide
    content={tryParseJson(selectedGuide.content)!}
    guideId={selectedGuide.id}
    onQuizComplete={(score) => { /* actualizar stats */ }}
    onGuideComplete={() => { /* actualizar stats */ }}
  />
) : (
  //  Fallback a Markdown
  <>
    {/* Keywords extraídas del markdown */}
    <ReactMarkdown>{selectedGuide.content}</ReactMarkdown>
  </>
)}
```text
**Estrategias de Parsing**:

1. [x] Parse directo del JSON

2. [x] Limpieza de bloques markdown (bloques ```

json y ```)

3. [x] Extracción regex si JSON está envuelto en texto

4. [x] Validación de estructura (`sections` array)

5. [x] Fallback a ReactMarkdown si todo falla

---

### 3. **Callbacks de Eventos para Gamificación**

#### Props Nuevos en `InteractiveGuide`:

```typescript
type InteractiveGuideProps = {
  content: { sections: Section[] }
  guideId: number
  onQuizComplete?: (score: number) => void
  onGuideComplete?: () => void
}
```

text
#### Flujo de Eventos:

**Quiz Completado**:
```typescript
// En QuizSection.handleCheck()
const correctAnswers = questions.filter((q, idx) =>
  answers[idx] === q.correctAnswer
).length
const score = Math.round((correctAnswers / questions.length) * 100)

if (onQuizComplete) {
  onQuizComplete(score) // Envía score al padre
}
```

text
**Guía Completada**:
```typescript
// En InteractiveGuide useEffect
useEffect(() => {
  if (content?.sections && Object.keys(progress).length === content.sections.length) {
    const allCompleted = Object.values(progress).every(Boolean)
    if (allCompleted && onGuideComplete) {
      onGuideComplete() // Notifica completación 100%
    }
  }
}, [progress, content, onGuideComplete])
```

text
**Actualización de Stats en StudyGuideContent**:
```typescript
onQuizComplete={(score) => {
  if (score === 100) {
    const newPerfect = userStats.perfectQuizzes + 1
    updateStats({ perfectQuizzes: newPerfect })

    // Mostrar panel si desbloquea badge
    if (newPerfect === 3) {
      setTimeout(() => setShowBadges(true), 1000)
    }
  }
}}

onGuideComplete={() => {
  const newCompleted = userStats.completedGuides + 1
  updateStats({ completedGuides: newCompleted })

  if (newCompleted === 10) {
    setTimeout(() => setShowBadges(true), 1000)
  }
}}
```

text
---

##  Mejoras Visuales

### Panel de Logros:


- **Animación**: Framer Motion con `initial={{ opacity: 0, height: 0 }}` → `animate={{ opacity: 1, height: 'auto' }}`

- **Gradiente**: `bg-gradient-to-br from-blue-50 to-purple-50`

- **Badges desbloqueados**: Borde verde + sombra + ícono coloreado

- **Badges bloqueados**: Opacidad 60% + escala de grises

- **Contador visual**: Badge rojo en botón con número de logros

### Botón de Logros:


- Posicionamiento: Header derecha, al lado de "Nueva Guía"

- Badge de notificación: Círculo verde `-top-1 -right-1` con número

- Hover: `hover:bg-slate-50`

---

##  Flujo de Usuario Mejorado

### Escenario 1: Primera Guía Generada


1. Usuario crea primera guía

2. Stats actualizadas: `totalGuides: 0 → 1`

3. Badge " Primera Guía" desbloqueado

4. **Panel de logros se abre automáticamente** después de 1 segundo

5. Confeti o animación celebratoria (opcional, no implementado aún)

### Escenario 2: Quiz Perfecto


1. Usuario completa quiz con todas las respuestas correctas

2. `onQuizComplete(100)` ejecutado

3. Stats actualizadas: `perfectQuizzes++`

4. Si `perfectQuizzes === 3` → Badge " Quiz Master" desbloqueado

5. Panel de logros se muestra automáticamente

### Escenario 3: Guía Completada


1. Usuario completa todas las secciones (100% progreso)

2. `onGuideComplete()` ejecutado

3. Stats actualizadas: `completedGuides++`

4. Si `completedGuides === 10` → Badge " Dedicado" desbloqueado

---

##  Arquitectura Técnica

### Estados Locales:

```typescript
const [userStats, setUserStats] = useState<UserStats>({
  totalGuides: 0,
  completedGuides: 0,
  perfectQuizzes: 0,
  currentStreak: 0,
  lastActiveDate: null
})
const [showBadges, setShowBadges] = useState(false)
```

text
### Persistencia:

```typescript
// Cargar stats
const loadUserStats = () => {
  const stats = localStorage.getItem('study_guide_stats')
  if (stats) setUserStats(JSON.parse(stats))
}

// Actualizar stats
const updateStats = (updates: Partial<UserStats>) => {
  const newStats = { ...userStats, ...updates }
  setUserStats(newStats)
  localStorage.setItem('study_guide_stats', JSON.stringify(newStats))
}
```

text
### Cálculo de Badges:

```typescript
const unlockedBadges = badges.filter(b => b.condition(userStats))
const nextBadge = badges.find(b => !b.condition(userStats))
```

text
---

##  Próximas Mejoras Sugeridas

### A. Animación de Celebración

Agregar confeti al desbloquear badge:
```bash
npm install react-confetti
```

text
```typescript
import Confetti from 'react-confetti'

{showCelebration && <Confetti recycle={false} numberOfPieces={200} />}
```

text
### B. Streaks (Rachas)

Calcular días consecutivos:
```typescript
const updateStreak = () => {
  const today = new Date().toDateString()
  const lastActive = userStats.lastActiveDate

  if (lastActive === today) return // Ya se contó hoy

  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const newStreak = lastActive === yesterday
    ? userStats.currentStreak + 1
    : 1

  updateStats({
    currentStreak: newStreak,
    lastActiveDate: today
  })
}
```

text
### C. Leaderboard (Tabla de Posiciones)

Agregar endpoint backend:
```typescript
// API: GET /api/students/leaderboard
// Retorna: top 10 estudiantes por perfectQuizzes, completedGuides, etc.
```

text
### D. Notificaciones Push

Recordatorio diario para mantener streak:
```typescript
// Service Worker + Web Push API
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('¡No pierdas tu racha! ', {
    body: 'Estudia hoy para mantener tu racha de 7 días',
    icon: '/logos/logo.png'
  })
}
```

text
### E. Exportar Certificado de Logros

Generar PDF con badges desbloqueados:
```typescript
import jsPDF from 'jspdf'

const generateCertificate = () => {
  const doc = new jsPDF()
  doc.text('Certificado de Logros', 20, 20)
  doc.text(`Badges desbloqueados: ${unlockedBadges.length}`, 20, 40)
  // ... agregar badges con íconos
  doc.save('mis-logros.pdf')
}
```

text
---

## Checklist de Implementación


- [x] Tipos TypeScript para Badge y UserStats

- [x] Estado local para stats y showBadges

- [x] Función loadUserStats() con localStorage

- [x] Función updateStats() con persistencia

- [x] Array de badges con condiciones

- [x] Cálculo de unlockedBadges y nextBadge

- [x] Botón "Logros" en header con contador

- [x] Panel expandible con grid de badges

- [x] Animación Framer Motion para panel

- [x] Callback onQuizComplete en InteractiveGuide

- [x] Callback onGuideComplete en InteractiveGuide

- [x] Cálculo de score en QuizSection

- [x] useEffect para detectar guía completada

- [x] Función tryParseJson() robusta

- [x] Lógica condicional de renderizado (JSON vs Markdown)

- [x] Trigger automático de panel al desbloquear badge

- [x] Sin errores TypeScript/ESLint

---

## Testing Recomendado

### Test 1: Primera Guía


1. Usuario sin stats previas

2. Generar primera guía

3. Verificar: Badge "Primera Guía" desbloqueado

4. Verificar: Panel de logros se abre automáticamente

### Test 2: Quiz Perfecto


1. Completar quiz con 100% correcto

2. Verificar: `perfectQuizzes` incrementa en localStorage

3. Repetir 2 veces más

4. Verificar: Badge "Quiz Master" desbloqueado al 3er quiz

### Test 3: Renderizado JSON


1. Generar nueva guía (AI genera JSON)

2. Verificar: Se muestra InteractiveGuide, NO texto JSON crudo

3. Verificar: Secciones colapsables funcionan

4. Verificar: Keywords aparecen

### Test 4: Persistencia


1. Desbloquear badges

2. Refrescar página (F5)

3. Verificar: Badges siguen desbloqueados

4. Verificar: Stats mantienen valores

---

**Fecha de implementación**: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
**Versión**: 2.1 (Gamificación + Formato)
**Archivos modificados**:

- `src/app/Students/StudyGuideContent.tsx` (+150 líneas)

- `src/app/Students/InteractiveGuide.tsx` (+40 líneas)
