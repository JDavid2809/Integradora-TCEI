# 🏗️ Nueva Estructura de Inscripciones - Propuesta

## 📋 **Problema actual:**
- Tabla `horario` confusa (no es para horarios, es para inscripciones)
- Relaciones complejas y poco intuitivas
- Nombres poco descriptivos

## 🎯 **Nueva estructura propuesta:**

### 1. **Tabla principal: `enrollments` (inscripciones)**
```prisma
model enrollment {
  id              Int      @id @default(autoincrement())
  student_id      Int
  course_id       Int
  enrolled_at     DateTime @default(now())
  status          EnrollmentStatus @default(ACTIVE)
  payment_status  PaymentStatus @default(PENDING)
  notes           String?
  
  // Relaciones
  student         estudiante @relation(fields: [student_id], references: [id_estudiante])
  course          curso @relation(fields: [course_id], references: [id_curso])
  payments        payment[]
  attendance      attendance[]
  
  @@unique([student_id, course_id]) // Un estudiante solo puede inscribirse una vez por curso
  @@index([student_id])
  @@index([course_id])
  @@index([status])
}
```

### 2. **Tabla de pagos: `payments`**
```prisma
model payment {
  id              Int           @id @default(autoincrement())
  enrollment_id   Int
  amount          Decimal       @db.Decimal(10, 2)
  payment_date    DateTime      @default(now())
  payment_method  PaymentMethod
  status          PaymentStatus @default(PENDING)
  reference       String?       // Referencia del pago
  notes           String?
  
  enrollment      enrollment @relation(fields: [enrollment_id], references: [id])
  
  @@index([enrollment_id])
  @@index([status])
}
```

### 3. **Tabla de asistencia: `attendance`**
```prisma
model attendance {
  id              Int      @id @default(autoincrement())
  enrollment_id   Int
  class_date      DateTime
  status          AttendanceStatus
  notes           String?
  recorded_by     Int      // Profesor que registró
  recorded_at     DateTime @default(now())
  
  enrollment      enrollment @relation(fields: [enrollment_id], references: [id])
  teacher         profesor @relation(fields: [recorded_by], references: [id_profesor])
  
  @@unique([enrollment_id, class_date])
  @@index([enrollment_id])
  @@index([class_date])
}
```

### 4. **Tabla de horarios reales: `class_schedules`**
```prisma
model class_schedule {
  id              Int      @id @default(autoincrement())
  course_id       Int
  teacher_id      Int
  level_id        Int
  day_of_week     DayOfWeek
  start_time      Time
  duration_minutes Int
  classroom       String?
  is_active       Boolean @default(true)
  
  course          curso @relation(fields: [course_id], references: [id_curso])
  teacher         profesor @relation(fields: [teacher_id], references: [id_profesor])
  level           nivel @relation(fields: [level_id], references: [id_nivel])
  
  @@index([course_id])
  @@index([teacher_id])
  @@index([day_of_week])
}
```

## 🏷️ **Enums necesarios:**

```prisma
enum EnrollmentStatus {
  ACTIVE          // Inscrito y activo
  COMPLETED       // Curso completado
  DROPPED         // Abandonó el curso
  SUSPENDED       // Suspendido temporalmente
  TRANSFERRED     // Transferido a otro curso
}

enum PaymentStatus {
  PENDING         // Pago pendiente
  PAID            // Pagado
  OVERDUE         // Vencido
  REFUNDED        // Reembolsado
  CANCELLED       // Cancelado
}

enum PaymentMethod {
  CASH            // Efectivo
  CARD            // Tarjeta
  TRANSFER        // Transferencia
  ONLINE          // Pago en línea
  OTHER           // Otro método
}

enum AttendanceStatus {
  PRESENT         // Presente
  ABSENT          // Ausente
  LATE            // Llegó tarde
  EXCUSED         // Falta justificada
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}
```

## 🔄 **Ventajas de la nueva estructura:**

### ✅ **Claridad:**
- `enrollment` = inscripciones (obvio)
- `payment` = pagos (separado de inscripciones)
- `attendance` = asistencia (clara relación)
- `class_schedule` = horarios reales de clases

### ✅ **Flexibilidad:**
- Un estudiante puede tener múltiples pagos por curso
- Historial completo de asistencia
- Estados claros de inscripción
- Horarios independientes de inscripciones

### ✅ **Integridad:**
- Constraints únicos para evitar duplicados
- Foreign keys bien definidas
- Índices para performance

### ✅ **Funcionalidad:**
- Control de estados de inscripción
- Seguimiento de pagos completo
- Registro detallado de asistencia
- Horarios flexibles y modificables

## 🚀 **Migración sugerida:**

1. Crear las nuevas tablas
2. Migrar datos existentes
3. Actualizar el código de la aplicación
4. Eliminar tablas antiguas (opcional)

¿Te gusta esta propuesta? ¿Quieres que implemente alguna parte específica?