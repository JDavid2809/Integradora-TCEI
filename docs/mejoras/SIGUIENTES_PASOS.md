# 🚀 SIGUIENTES PASOS - ROADMAP DEL PROYECTO

## 📊 **ESTADO ACTUAL**
- **Calificación Actual:** 92/100 ⭐⭐⭐⭐⭐
- **Calificación Objetivo:** 97-98/100
- **Nivel:** Proyecto Profesional
- **Status:** Production-Ready (con mejoras pendientes)

---

## 📅 **CRONOGRAMA GENERAL (8-10 SEMANAS)**

```
Semana 1-2:   ✅ Completar funcionalidades faltantes
Semana 3-4:   🧪 Implementar testing completo
Semana 5:     🚀 CI/CD y deployment
Semana 6:     ⚡ Optimización y performance
Semana 7:     🔒 Seguridad avanzada
Semana 8:     📊 Analytics y monitoreo
Semana 9-10:  🎨 Mejoras UX/UI
```

---

## 📋 **FASE 1: COMPLETAR FUNCIONALIDADES (1-2 semanas)**

### ✅ **Paso 1: Completar CRUD de Evaluaciones para Admin**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 2-3 días

#### **Tareas:**
1. **Crear endpoints de admin para historial_academico**
   ```
   - GET /api/admin/evaluations
   - GET /api/admin/evaluations/[id]
   - PUT /api/admin/evaluations/[id]
   - DELETE /api/admin/evaluations/[id]
   ```

2. **Crear componente AdminEvaluationsCrud.tsx**
   - Lista paginada de evaluaciones
   - Filtros por estudiante/curso/fecha
   - Edición de calificaciones
   - Eliminación con confirmación
   - Integrar con DataTable, Modal, Pagination

3. **Integrar en el panel de admin**
   - Agregar sección en AdminPanelFinal.tsx
   - Agregar ruta en el menú de navegación

#### **Archivos a crear:**
- `src/app/api/admin/evaluations/route.ts`
- `src/app/api/admin/evaluations/[id]/route.ts`
- `src/components/admin/AdminEvaluationsCrud.tsx`
- Actualizar `src/components/AdminPanelFinal.tsx`

#### **Modelo de datos:**
```typescript
interface Evaluacion {
  id_historial: number
  id_estudiante: number
  id_imparte: number
  calificacion?: number
  fecha?: Date
  tipo?: TipoEvaluacion
  comentario?: string
  asistencia?: number
  tipo_evaluacion?: TipoEvaluacionExamen
}
```

---

### ✅ **Paso 2: Completar Sistema de Asistencias para Admin**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 2-3 días

#### **Tareas:**
1. **Mejorar endpoints de asistencias**
   ```
   - GET /api/admin/attendance (verificar existente)
   - POST /api/admin/attendance/manual
   - PUT /api/admin/attendance/[id]
   - DELETE /api/admin/attendance/[id]
   - GET /api/admin/attendance/reports (reportes)
   ```

2. **Crear AdminAttendanceCrud.tsx**
   - Vista de asistencias por curso/estudiante
   - Registro manual de asistencias
   - Reportes de asistencia con gráficas
   - Exportar a PDF/Excel
   - Estadísticas: porcentaje de asistencia

3. **Agregar filtros avanzados**
   - Por rango de fechas
   - Por porcentaje de asistencia
   - Por curso/nivel
   - Por tipo de clase (presencial/remota)

#### **Archivos:**
- `src/app/api/admin/attendance/manual/route.ts`
- `src/app/api/admin/attendance/[id]/route.ts`
- `src/app/api/admin/attendance/reports/route.ts`
- `src/components/admin/AdminAttendanceCrud.tsx`

---

### ✅ **Paso 3: Sistema de Notificaciones por Email**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 2-3 días

#### **Tareas:**
1. **Configurar templates de email**
   - Email de bienvenida a profesor aprobado (con credenciales)
   - Email de rechazo con motivo detallado
   - Notificación de nueva solicitud a todos los admins
   - Recordatorios de clases (24h antes)
   - Notificación de nueva actividad asignada
   - Confirmación de inscripción a curso

2. **Implementar queue de emails (opcional)**
   - Usar librería como `bull` o `agenda`
   - Reintento automático en caso de fallo
   - Log de emails enviados

3. **Agregar preferencias de notificación**
   - Panel para usuarios: qué notificaciones recibir
   - Frecuencia de notificaciones (inmediato, diario, semanal)
   - Tabla en BD para preferencias

#### **Archivos a crear:**
- `src/lib/email-templates.ts` (todos los templates HTML)
- `src/lib/email-queue.ts` (sistema de cola)
- `src/app/api/notifications/preferences/route.ts`
- Actualizar `src/lib/mailer.ts`
- Actualizar `src/app/api/admin/teacher-requests/route.ts` (agregar envío de emails)

#### **Templates de Email:**
```typescript
- welcomeTeacherTemplate(name, email, password, loginUrl)
- rejectionTeacherTemplate(name, reason, contactEmail)
- newRequestAdminTemplate(teacherName, requestId, reviewUrl)
- classReminderTemplate(studentName, courseName, dateTime)
- newActivityTemplate(studentName, activityTitle, dueDate, courseUrl)
```

---

## 🧪 **FASE 2: TESTING (1-2 semanas)**

### ✅ **Paso 4: Implementar Tests Unitarios**
**Impacto:** Crítico | **Dificultad:** Media-Alta | **Tiempo:** 5-7 días

#### **Instalación:**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
npm install -D @types/jest ts-node ts-jest
```

#### **Configuración:**
Ya creados:
- ✅ `jest.config.js`
- ✅ `jest.setup.js`

#### **Tests a escribir (en orden de prioridad):**

**1. Hooks personalizados (Alta prioridad):**
```
src/hooks/__tests__/
├── useResourceList.test.ts
├── useDebounce.test.ts
├── useConfirmation.test.ts
└── useModal.test.ts
```

**2. Componentes comunes (Alta prioridad):**
```
src/components/admin/common/__tests__/
├── Modal.test.tsx
├── DataTable.test.tsx
├── Pagination.test.tsx
├── FilterBar.test.tsx
├── FeedbackAlert.test.tsx
└── ConfirmationModal.test.tsx
```

**3. Utilidades (Media prioridad):**
```
src/lib/__tests__/
├── apiClient.test.ts
├── prisma.test.ts
└── mailer.test.ts
```

**4. API Routes (Alta prioridad):**
```
src/app/api/__tests__/
├── teacher-request/route.test.ts
├── admin/users/route.test.ts
├── admin/courses/route.test.ts
└── auth/[...nextauth]/route.test.ts
```

**5. Validaciones (Media prioridad):**
```
src/validations/__tests__/
└── adminSchemas.test.ts
```

#### **Ejemplo de test básico:**
```typescript
// src/hooks/__tests__/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  jest.useFakeTimers()
  
  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )
    
    expect(result.current).toBe('initial')
    
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Still initial
    
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    expect(result.current).toBe('updated') // Now updated
  })
})
```

#### **Comandos:**
```bash
# Correr todos los tests
npm test

# Correr tests con coverage
npm test -- --coverage

# Correr tests en modo watch
npm test -- --watch

# Correr un test específico
npm test -- useDebounce
```

#### **Agregar scripts a package.json:**
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --maxWorkers=2"
}
```

#### **Objetivo de cobertura:**
- **Líneas:** 70%+
- **Funciones:** 70%+
- **Branches:** 70%+
- **Statements:** 70%+

---

### ✅ **Paso 5: Tests E2E con Playwright**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 3-4 días

#### **Instalación:**
```bash
npm install -D @playwright/test
npx playwright install
```

#### **Tests E2E críticos:**

**1. Autenticación:**
```
tests/e2e/auth/
├── login.spec.ts
├── register.spec.ts
├── forgot-password.spec.ts
└── email-verification.spec.ts
```

**2. Solicitud de Profesor:**
```
tests/e2e/teacher-request/
├── submit-request.spec.ts
└── check-status.spec.ts
```

**3. Admin:**
```
tests/e2e/admin/
├── approve-teacher.spec.ts
├── create-course.spec.ts
├── manage-users.spec.ts
└── view-statistics.spec.ts
```

**4. Chat:**
```
tests/e2e/chat/
├── send-message.spec.ts
├── create-room.spec.ts
└── search-messages.spec.ts
```

**5. Cursos:**
```
tests/e2e/courses/
├── enroll-course.spec.ts
├── view-course-details.spec.ts
└── submit-activity.spec.ts
```

#### **Ejemplo de test E2E:**
```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/Login')
    
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/Admin')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })
  
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/Login')
    
    await page.fill('input[name="email"]', 'wrong@test.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible()
  })
})
```

#### **Configuración Playwright:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 🚀 **FASE 3: CI/CD Y DEPLOYMENT (1 semana)**

### ✅ **Paso 6: GitHub Actions para CI/CD**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 2-3 días

#### **Archivo ya creado:**
- ✅ `.github/workflows/ci-cd.yml`

#### **Pipeline incluye:**
1. **Test Job:**
   - Setup PostgreSQL en Docker
   - Instalar dependencias
   - Correr migraciones de Prisma
   - Ejecutar linter
   - Ejecutar tests con coverage
   - Upload coverage a Codecov

2. **Build Job:**
   - Build de Next.js
   - Verificar que no hay errores de compilación
   - Archivar artefactos

3. **Deploy Staging:**
   - Deploy automático a staging cuando se hace push a `develop`

4. **Deploy Production:**
   - Deploy automático a producción cuando se hace push a `main`

#### **Configurar en GitHub:**
1. Ir a Settings → Secrets and variables → Actions
2. Agregar secrets:
   ```
   DATABASE_URL
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   SMTP_HOST
   SMTP_PORT
   SMTP_USER
   SMTP_PASS
   ```

#### **Agregar badge al README:**
```markdown
[![CI/CD](https://github.com/JDavid2809/Integradora-TCEI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/JDavid2809/Integradora-TCEI/actions/workflows/ci-cd.yml)
```

---

### ✅ **Paso 7: Deploy a Producción**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 2-3 días

#### **Opción 1: Vercel (Más Fácil) ⭐ RECOMENDADO**

**Pasos:**
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Importar repositorio desde GitHub
3. Configurar variables de entorno:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   NEXT_PUBLIC_URL=https://tu-dominio.vercel.app
   ```
4. Deploy automático en cada push a `main`
5. Configurar dominio personalizado (opcional)

**Ventajas:**
- ✅ Gratis para proyectos personales
- ✅ Deploy automático
- ✅ SSL incluido
- ✅ Edge functions
- ✅ CDN global

---

#### **Opción 2: Railway (Base de Datos + App)**

**Pasos:**
1. Crear cuenta en [railway.app](https://railway.app)
2. Crear nuevo proyecto
3. Provisionar PostgreSQL:
   - Add Service → Database → PostgreSQL
   - Copiar DATABASE_URL
4. Deploy app desde GitHub:
   - Add Service → GitHub Repo → Seleccionar repo
   - Configurar variables de entorno
5. Configurar dominio

**Ventajas:**
- ✅ Base de datos incluida
- ✅ $5 gratis al mes
- ✅ Fácil configuración
- ✅ Logs en tiempo real

---

#### **Opción 3: AWS/DigitalOcean (Más Control)**

**Pasos:**
1. Crear VPS (Droplet en DigitalOcean)
2. Instalar Docker y Docker Compose
3. Clonar repositorio
4. Configurar `.env` en producción
5. Configurar Nginx como reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
6. Configurar SSL con Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tu-dominio.com
   ```
7. Configurar Docker Compose para producción
8. Setup systemd para auto-restart

**Ventajas:**
- ✅ Control total
- ✅ Más económico a largo plazo
- ✅ Escalable
- ✅ Sin límites de uso

---

#### **Checklist Pre-Deployment:**
- [ ] Variables de entorno configuradas
- [ ] Base de datos en producción creada
- [ ] Migraciones de Prisma aplicadas
- [ ] SMTP configurado y probado
- [ ] SSL/HTTPS configurado
- [ ] Dominio apuntando al servidor
- [ ] Backups automáticos configurados
- [ ] Monitoreo básico configurado

---

## ⚡ **FASE 4: OPTIMIZACIÓN Y PERFORMANCE (1 semana)**

### ✅ **Paso 8: Optimización de Rendimiento**
**Impacto:** Medio | **Dificultad:** Media | **Tiempo:** 3-5 días

#### **1. React Performance:**

**Implementar React.memo:**
```typescript
// Componentes a optimizar:
- DataTable.tsx
- ChatWindow.tsx
- CourseCard.tsx
- StudentList.tsx
```

**Ejemplo:**
```typescript
import { memo } from 'react'

const DataTable = memo(({ data, columns }) => {
  // Componente
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data
})
```

**Usar useMemo y useCallback:**
```typescript
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name))
}, [data])

const handleClick = useCallback(() => {
  console.log('Clicked')
}, [])
```

---

#### **2. Next.js Optimizations:**

**Lazy Loading de componentes:**
```typescript
import dynamic from 'next/dynamic'

const ChatWindow = dynamic(() => import('@/components/ChatWindow'), {
  loading: () => <Spinner />,
  ssr: false
})
```

**Optimización de imágenes:**
```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Para imágenes above the fold
/>
```

**ISR (Incremental Static Regeneration):**
```typescript
// Para páginas de cursos
export const revalidate = 3600 // Revalidar cada hora

export async function generateStaticParams() {
  const courses = await prisma.curso.findMany()
  return courses.map((course) => ({
    slug: course.slug,
  }))
}
```

---

#### **3. Database Optimizations:**

**Agregar índices en Prisma:**
```prisma
model estudiante {
  // ...
  
  @@index([email])
  @@index([b_activo])
  @@index([id_categoria_edad])
}

model chat_message {
  // ...
  
  @@index([chat_room_id, enviado_en])
  @@index([usuario_id, enviado_en])
}
```

**Query Optimization:**
```typescript
// Usar select para traer solo campos necesarios
const users = await prisma.usuario.findMany({
  select: {
    id: true,
    email: true,
    nombre: true,
    // No traer password ni otros campos innecesarios
  }
})

// Usar pagination correctamente
const students = await prisma.estudiante.findMany({
  skip: (page - 1) * limit,
  take: limit,
  where: { b_activo: true }
})
```

**Caching con Redis (opcional):**
```bash
npm install redis
```

```typescript
import { Redis } from 'redis'

const redis = new Redis(process.env.REDIS_URL)

// Cache de queries frecuentes
const cachedCourses = await redis.get('courses:all')
if (cachedCourses) {
  return JSON.parse(cachedCourses)
}

const courses = await prisma.curso.findMany()
await redis.set('courses:all', JSON.stringify(courses), 'EX', 3600)
```

---

#### **4. Bundle Size Optimization:**

**Analizar bundle:**
```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // config
})
```

```bash
ANALYZE=true npm run build
```

**Tree shaking:**
```typescript
// ❌ Malo
import _ from 'lodash'

// ✅ Bueno
import debounce from 'lodash/debounce'
```

---

#### **5. Performance Monitoring:**

**Web Vitals:**
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 🔒 **FASE 5: SEGURIDAD AVANZADA (3-5 días)**

### ✅ **Paso 9: Implementar Medidas de Seguridad**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 2-3 días

#### **1. Rate Limiting:**

```bash
npm install express-rate-limit
```

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requests
  message: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
})
```

**Aplicar en rutas:**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { loginLimiter } from '@/middleware/rateLimiter'

export async function POST(req: Request) {
  // Aplicar rate limiting
  await loginLimiter(req, res)
  
  // Continuar con lógica
}
```

---

#### **2. Security Headers:**

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

---

#### **3. Content Security Policy:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  )
  
  return response
}
```

---

#### **4. Input Validation y Sanitization:**

```bash
npm install validator dompurify
```

```typescript
// src/lib/sanitize.ts
import validator from 'validator'
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeEmail(email: string): string {
  return validator.normalizeEmail(email) || ''
}

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html)
}

export function sanitizeInput(input: string): string {
  return validator.escape(input)
}
```

---

#### **5. CSRF Protection:**

```typescript
// Ya incluido en NextAuth, pero verificar configuración
// src/app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  // ...
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
```

---

#### **6. Auditoría de Seguridad:**

```bash
# Auditar dependencias
npm audit

# Fix vulnerabilidades automáticamente
npm audit fix

# Actualizar dependencias
npm update

# Verificar dependencias obsoletas
npm outdated
```

**Configurar Dependabot en GitHub:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

#### **7. Implementar 2FA (Opcional):**

```bash
npm install speakeasy qrcode
```

```typescript
// Generar secret para 2FA
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

const secret = speakeasy.generateSecret({
  name: 'English App'
})

// Generar QR code
const qrCode = await QRCode.toDataURL(secret.otpauth_url)

// Verificar token
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userToken
})
```

---

## 📊 **FASE 6: ANALYTICS Y MONITOREO (3-5 días)**

### ✅ **Paso 10: Implementar Monitoreo**
**Impacto:** Medio | **Dificultad:** Baja | **Tiempo:** 2-3 días

#### **1. Error Tracking con Sentry:**

```bash
npm install @sentry/nextjs
```

```bash
npx @sentry/wizard -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

---

#### **2. Analytics con Google Analytics:**

```bash
npm install @next/third-parties
```

```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

**O usar Plausible (privacy-friendly):**
```typescript
<script defer data-domain="tudominio.com" src="https://plausible.io/js/script.js"></script>
```

---

#### **3. Logging Estructurado con Winston:**

```bash
npm install winston
```

```typescript
// src/lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }))
}

export default logger
```

**Uso:**
```typescript
import logger from '@/lib/logger'

logger.info('Usuario creado', { userId: user.id, email: user.email })
logger.error('Error al crear usuario', { error: error.message })
```

---

#### **4. Uptime Monitoring:**

**Opciones:**
- [UptimeRobot](https://uptimerobot.com/) - Gratis para 50 monitores
- [Pingdom](https://www.pingdom.com/)
- [Better Uptime](https://betteruptime.com/)

**Configurar:**
1. Crear cuenta
2. Agregar monitor HTTP/HTTPS
3. Configurar alertas por email/SMS
4. Verificar cada 5 minutos

---

#### **5. Performance Monitoring:**

```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // Verificar BD
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 })
  }
}
```

---

#### **6. Custom Dashboard (opcional):**

```typescript
// src/app/api/admin/metrics/route.ts
export async function GET() {
  const metrics = {
    users: await prisma.usuario.count(),
    activeStudents: await prisma.estudiante.count({ where: { b_activo: true } }),
    courses: await prisma.curso.count({ where: { b_activo: true } }),
    revenueToday: await prisma.pago.aggregate({
      _sum: { monto: true },
      where: {
        fecha_pago: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    pendingRequests: await prisma.solicitud_profesor.count({
      where: { estado: 'PENDIENTE' }
    })
  }
  
  return Response.json(metrics)
}
```

---

## 🎨 **FASE 7: UX/UI ENHANCEMENTS (1 semana)**

### ✅ **Paso 11: Mejoras de UX/UI**
**Impacto:** Medio | **Dificultad:** Baja-Media | **Tiempo:** 5-7 días

#### **1. Skeleton Loaders Consistentes:**

```typescript
// src/components/ui/SkeletonLoader.tsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  )
}
```

---

#### **2. Animaciones Suaves:**

Ya tienes Framer Motion, optimizar uso:
```typescript
import { motion, AnimatePresence } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function Page() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
    </motion.div>
  )
}
```

---

#### **3. Dark Mode:**

```bash
npm install next-themes
```

```typescript
// src/providers/ThemeProvider.tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

```typescript
// src/components/ThemeToggle.tsx
'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  )
}
```

**Actualizar Tailwind:**
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

---

#### **4. Accesibilidad (A11y):**

```typescript
// Agregar ARIA labels
<button aria-label="Cerrar modal" onClick={onClose}>
  <X />
</button>

// Focus management
import { useRef, useEffect } from 'react'

const firstFocusableElement = useRef<HTMLButtonElement>(null)

useEffect(() => {
  firstFocusableElement.current?.focus()
}, [])

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') onClose()
  if (e.key === 'Tab') {
    // Trap focus dentro del modal
  }
}
```

**Verificar con:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

#### **5. Responsive Design Refinado:**

```typescript
// Breakpoints consistentes
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Mobile-first approach
<div className="
  flex flex-col
  md:flex-row
  lg:gap-8
">
  {/* Content */}
</div>
```

---

#### **6. PWA (Progressive Web App):**

```bash
npm install next-pwa
```

```javascript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // config
})
```

**Crear manifest.json:**
```json
{
  "name": "English App",
  "short_name": "English",
  "description": "Plataforma de aprendizaje de inglés",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

#### **7. Feedback Visual Mejorado:**

```typescript
// Toast notifications con Sonner
npm install sonner

// src/app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

// Uso
import { toast } from 'sonner'

toast.success('Usuario creado exitosamente')
toast.error('Error al crear usuario')
toast.loading('Procesando...')
```

---

## 📱 **FASE 8: FEATURES ADICIONALES (2-3 semanas) - OPCIONAL**

### ✅ **Paso 12: Notificaciones Push**
**Impacto:** Medio | **Dificultad:** Media-Alta | **Tiempo:** 5-7 días

```bash
npm install firebase
```

**Configurar Firebase:**
1. Crear proyecto en Firebase Console
2. Habilitar Cloud Messaging
3. Obtener credenciales

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    })
    
    // Guardar token en BD
    return token
  }
}
```

---

### ✅ **Paso 13: Sistema de Reportes Avanzados**
**Impacto:** Medio | **Dificultad:** Media | **Tiempo:** 5-7 días

#### **Exportar a PDF:**
```bash
npm install jspdf jspdf-autotable
```

```typescript
// src/lib/pdf-generator.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateStudentReport(student: Student, grades: Grade[]) {
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text('Reporte Académico', 20, 20)
  
  doc.setFontSize(12)
  doc.text(`Estudiante: ${student.nombre} ${student.paterno}`, 20, 40)
  doc.text(`Email: ${student.email}`, 20, 50)
  
  autoTable(doc, {
    startY: 60,
    head: [['Curso', 'Calificación', 'Fecha']],
    body: grades.map(g => [g.curso, g.calificacion, g.fecha]),
  })
  
  doc.save(`reporte-${student.id_estudiante}.pdf`)
}
```

---

#### **Exportar a Excel:**
```bash
npm install xlsx
```

```typescript
// src/lib/excel-generator.ts
import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
```

---

#### **Gráficas con Recharts:**
```bash
npm install recharts
```

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export function GradesChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="fecha" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="calificacion" stroke="#8884d8" />
    </LineChart>
  )
}
```

---

### ✅ **Paso 14: Sistema de Carga de Archivos**
**Impacto:** Alto | **Dificultad:** Media | **Tiempo:** 3-5 días

#### **Opción 1: Cloudinary**
```bash
npm install cloudinary next-cloudinary
```

```typescript
// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadFile(file: File) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({}, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    }).end(buffer)
  })
}
```

---

#### **Opción 2: AWS S3**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// src/lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(file: File, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  })
  
  await s3Client.send(command)
  
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}
```

---

#### **Componente de Upload:**
```typescript
'use client'
import { useState } from 'react'
import { Upload } from 'lucide-react'

export function FileUploader({ onUpload }) {
  const [uploading, setUploading] = useState(false)
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      onUpload(data.url)
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto mb-4" size={48} />
        {uploading ? 'Subiendo...' : 'Haz clic para subir archivo'}
      </label>
    </div>
  )
}
```

---

## 🎯 **PRIORIDADES INMEDIATAS (PRÓXIMOS 7 DÍAS)**

### **DÍA 1:**
- [ ] Completar CRUD de evaluaciones (backend)
- [ ] Crear endpoints `/api/admin/evaluations`
- [ ] Actualizar documentación

### **DÍA 2:**
- [ ] Completar CRUD de evaluaciones (frontend)
- [ ] Crear componente `AdminEvaluationsCrud.tsx`
- [ ] Integrar en panel admin

### **DÍA 3:**
- [ ] Sistema de asistencias para admin (backend)
- [ ] Mejorar endpoints `/api/admin/attendance`
- [ ] Reportes de asistencia

### **DÍA 4:**
- [ ] Sistema de asistencias para admin (frontend)
- [ ] Crear componente `AdminAttendanceCrud.tsx`
- [ ] Gráficas de estadísticas

### **DÍA 5:**
- [ ] Configurar templates de email
- [ ] Implementar envío de emails en solicitudes
- [ ] Probar sistema de notificaciones

### **DÍA 6:**
- [ ] Escribir primeros 10 tests unitarios
- [ ] Tests de hooks (`useResourceList`, `useDebounce`)
- [ ] Tests de componentes comunes

### **DÍA 7:**
- [ ] Implementar rate limiting
- [ ] Configurar security headers
- [ ] Auditoría de dependencias
- [ ] Revisar y documentar cambios

---

## 📚 **RECURSOS ÚTILES**

### **Documentación:**
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)

### **Seguridad:**
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)

### **Performance:**
- [Web.dev](https://web.dev/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

### **Deployment:**
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## 🎓 **OBJETIVO FINAL**

### **Meta a 4 semanas:**
- ✅ Funcionalidades 100% completas
- ✅ Tests unitarios > 70% coverage
- ✅ CI/CD configurado
- ✅ Deploy en producción
- ✅ Calificación: 95/100

### **Meta a 8 semanas:**
- ✅ Tests E2E completos
- ✅ Optimización avanzada
- ✅ Seguridad nivel producción
- ✅ Monitoreo y analytics
- ✅ UX/UI pulido
- ✅ Calificación: 97-98/100

### **Meta a 12 semanas:**
- ✅ Features adicionales
- ✅ Sistema de reportes avanzado
- ✅ Notificaciones push
- ✅ PWA completo
- ✅ Documentación exhaustiva
- ✅ Portfolio-ready
- ✅ Calificación: 99/100

---

## 📝 **NOTAS FINALES**

- **Prioriza calidad sobre cantidad**
- **Mantén la documentación actualizada**
- **Haz commits frecuentes y descriptivos**
- **Revisa código con regularidad**
- **Prueba en diferentes dispositivos**
- **Pide feedback de usuarios reales**

---

**Última actualización:** 15 de Octubre, 2025
**Versión:** 1.0
**Autor:** Análisis del proyecto Integradora-TCEI

---

¡Tu proyecto es excelente! Con estos pasos llegarás a un nivel profesional top. 🚀
