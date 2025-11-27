# Sistema de Certificados - Documentación

## Resumen del Sistema

Se ha implementado un sistema completo de certificados similar a Udemy, que genera automáticamente certificados cuando un estudiante completa un curso.

## Características Implementadas


- ### 1. **Base de Datos**


- [x] Modelo `Certificado` con UUID único

- [x] Código de verificación corto (8 caracteres)

- [x] Relaciones con estudiante, curso e inscripción

- [x] Sistema de tracking (vistas, última visualización)

- [x] Capacidad de revocación

### 2. **Generación Automática**


- [x] Se genera automáticamente al marcar curso como COMPLETED

- [x] Verifica que el curso otorgue certificado

- [x] No duplica certificados existentes

- [x] Incluye toda la información del estudiante y curso

### 3. **Diseño del Certificado**


- [x] Diseño elegante con gradientes azul/índigo/morado

- [x] Header y footer decorativos

- [x] Marca de agua sutil

- [x] Información organizada en secciones

- [x] Código de verificación visible

- [x] Completamente responsive

- [x] Optimizado para impresión/PDF

### 4. **Funcionalidades**


- [x] URL única: `/certificate/UC-{uuid}`

- [x] Botón compartir (Web Share API + clipboard)

- [x] Botón descargar (impresión)

- [x] Verificación pública

- [x] Contador de vistas

- [x] Sistema de revocación

## Archivos Creados

```text
prisma/
└── schema.prisma (modelo Certificado agregado)

src/actions/
├── certificates.ts (funciones principales)
└── enrollment.ts (lógica de completar curso)

src/app/certificate/[token]/
└── page.tsx (página pública del certificado)

src/components/certificates/
├── CertificateView.tsx (vista del certificado)
├── CertificateButton.tsx (botón para estudiantes)
└── StudentCertificates.tsx (lista de certificados)
```

text
## Cómo Usar

### Para Estudiantes

**Ver certificados disponibles:**
```tsx
import StudentCertificates from '@/components/certificates/StudentCertificates'

<StudentCertificates estudianteId={estudianteId} />
```

text
**Botón en página del curso:**
```tsx
import CertificateButton from '@/components/certificates/CertificateButton'

<CertificateButton
  inscripcionId={inscripcion.id}
  courseId={curso.id}
  courseName={curso.nombre}
/>
```

text
### Para Administradores/Profesores

**Marcar curso como completado y generar certificado:**
```typescript
import { completeCourse } from '@/actions/enrollment'

const result = await completeCourse(inscripcionId)

if (result.success && result.certificate) {
  console.log('Certificado generado:', result.certificate.url)
}
```

text
**Generar certificado manualmente:**
```typescript
import { generateCertificate } from '@/actions/certificates'

const result = await generateCertificate({ inscripcionId })

if (result.success) {
  console.log('URL:', result.data.url)
  console.log('Código:', result.data.codigo)
}
```

text
**Revocar un certificado:**
```typescript
import { revokeCertificate } from '@/actions/certificates'

await revokeCertificate(certificadoId, 'Motivo de revocación')
```

text
### Verificación Pública

Los certificados son públicamente verificables en:

```text
https://tudominio.com/certificate/UC-{uuid}
```

text
**Verificar por código:**
```typescript
import { verifyCertificateByCode } from '@/actions/certificates'

const result = await verifyCertificateByCode('A1B2C3D4')
```

text
## Personalización del Diseño

El certificado usa un sistema de colores personalizable en `CertificateView.tsx`:


- **Gradiente principal**: `from-blue-600 via-indigo-600 to-purple-600`

- **Colores de fondo**: `from-slate-50 via-blue-50 to-indigo-50`

- **Border**: `border-4 border-blue-100`

Para cambiar el diseño:

1. Modifica las clases de Tailwind en `CertificateView.tsx`

2. Ajusta los componentes decorativos (líneas, patrones)

3. Personaliza el logo y marca de agua

## Variables de Entorno

Asegúrate de tener configurada:
```env
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

text
## Modelo de Datos

```prisma
model Certificado {
  id                  Int      @id @default(autoincrement())
  token_uuid          String   @unique @default(uuid())
  estudiante_id       Int
  curso_id            Int
  inscripcion_id      Int      @unique
  nombre_estudiante   String
  nombre_curso        String
  nombre_instructor   String
  duracion_horas      Int?
  nivel_ingles        String?
  fecha_inicio        DateTime
  fecha_finalizacion  DateTime
  fecha_emision       DateTime @default(now())
  codigo_verificacion String   @unique
  url_verificacion    String   @unique
  es_valido           Boolean  @default(true)
  veces_visto         Int      @default(0)
  // ...relaciones
}
```

text
## Flujo de Generación


1. **Estudiante completa el curso** → Estado cambia a `COMPLETED`

2. **Sistema verifica** → ¿El curso otorga certificado?

3. **Genera certificado** → UUID único + código de verificación

4. **Estudiante notificado** → Puede ver/descargar certificado

5. **Certificado público** → Cualquiera puede verificar

## Características Responsive


- [x] Desktop: Layout completo con sidebar

- [x] Tablet: Grid adaptativo

- [x] Mobile: Stack vertical

- [x] Print: Optimizado para PDF A4

## Próximas Mejoras (Opcionales)


- [ ] Enviar certificado por email automáticamente

- [ ] Integración con LinkedIn

- [ ] Templates personalizables por curso

- [ ] Certificados con QR code

- [ ] API pública de verificación

- [ ] Dashboard de estadísticas de certificados

- [ ] Certificados con firma digital

## Solución de Problemas

**El certificado no se genera:**


- Verificar que el curso tenga `certificado: true`

- Verificar que la inscripción esté en estado `COMPLETED`

- Revisar los logs del servidor

**Error al visualizar:**


- Verificar que `NEXT_PUBLIC_APP_URL` esté configurado

- Verificar que el token UUID sea válido

**Problemas de estilo:**


- Limpiar caché del navegador

- Verificar que Tailwind esté compilando correctamente

## Soporte

Para dudas o problemas, revisar:


1. Logs del servidor

2. Errores en la consola del navegador

3. Estado de la base de datos (certificados generados)

---

## Sistema listo

El sistema de certificados está completamente funcional y listo para usar. Solo necesitas:

- [x] Reiniciar el servidor de desarrollo

- [x] Marcar un curso como completado

- [x] Ver el certificado generado automáticamente

**URL de ejemplo:**
```text
http://localhost:3000/certificate/UC-123e4567-e89b-12d3-a456-426614174000
```

text
