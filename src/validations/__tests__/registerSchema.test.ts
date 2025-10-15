import { registerSchema } from '../registerSchema'

describe('Register Schema Validation', () => {
  const validData = {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@email.com',
    telefono: '1234567890',
    password: 'password123',
    confirmPassword: 'password123',
  }

  it('should validate correct data successfully', () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should fail validation when nombre is empty', () => {
    const invalidData = { ...validData, nombre: '' }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre es obligatorio')
    }
  })

  it('should fail validation when apellido is empty', () => {
    const invalidData = { ...validData, apellido: '' }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El apellido es obligatorio')
    }
  })

  it('should fail validation when email is invalid', () => {
    const invalidData = { ...validData, email: 'invalid-email' }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Correo electrónico inválido')
    }
  })

  it('should fail validation when telefono is too short', () => {
    const invalidData = { ...validData, telefono: '123' }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Teléfono inválido')
    }
  })

  it('should fail validation when password is too short', () => {
    const invalidData = { ...validData, password: '123', confirmPassword: '123' }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres')
    }
  })

  it('should fail validation when passwords do not match', () => {
    const invalidData = { ...validData, confirmPassword: 'differentPassword' }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(issue => issue.path.includes('confirmPassword'))
      expect(passwordError?.message).toBe('Las contraseñas no coinciden')
    }
  })

  it('should fail validation when multiple fields are invalid', () => {
    const invalidData = {
      nombre: '',
      apellido: '',
      email: 'invalid-email',
      telefono: '123',
      password: '123',
      confirmPassword: '456',
    }
    const result = registerSchema.safeParse(invalidData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      // Should have multiple validation errors
      expect(result.error.issues.length).toBeGreaterThan(1)
    }
  })

  it('should validate edge case valid telefono', () => {
    const edgeCaseData = { ...validData, telefono: '1234567890' } // exactly 10 digits
    const result = registerSchema.safeParse(edgeCaseData)
    
    expect(result.success).toBe(true)
  })

  it('should validate edge case valid password', () => {
    const edgeCaseData = { 
      ...validData, 
      password: '123456', // exactly 6 characters
      confirmPassword: '123456'
    }
    const result = registerSchema.safeParse(edgeCaseData)
    
    expect(result.success).toBe(true)
  })
})