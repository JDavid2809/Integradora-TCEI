# 🎨 UI/UX - Interfaz de Usuario

## Descripción
Documentación de diseño de interfaces, experiencia de usuario y guías visuales del sistema.

## 📋 Documentos Disponibles

### 🎨 Diseño Visual
- **[LUCIDE_ICONS_GUIDE.md](./LUCIDE_ICONS_GUIDE.md)** - Guía completa de iconografía del sistema
- **[UI_VIEWS_SUMMARY.md](./UI_VIEWS_SUMMARY.md)** - Resumen de todas las vistas de la aplicación

## 🎯 Estándares de Diseño

### Sistema de Iconos
- ✅ **Lucide React**: Librería de iconos consistente
- ✅ **Tamaños estándar**: 4x4, 5x5, 6x6, 8x8 (Tailwind units)
- ✅ **Colores temáticos**: Integración con paleta de colores
- ✅ **Estados interactivos**: Hover, active, disabled

### Paleta de Colores
```css
/* Colores Principales */
--primary-blue: #00246a    /* Azul institucional */
--primary-red: #e30f28     /* Rojo de acento */
--secondary-blue: #003875  /* Azul oscuro */

/* Colores de Estado */
--success: #10b981         /* Verde éxito */
--warning: #f59e0b         /* Amarillo advertencia */
--error: #ef4444           /* Rojo error */
--info: #3b82f6            /* Azul información */
```

### Tipografía
- **Fuente principal**: Inter (sistema)
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Tamaños**: Sistema de escalado Tailwind CSS
- **Jerarquía**: Headers h1-h6 definidos consistentemente

## 🖼️ Vistas Principales

### Dashboard Administrativo
- ✅ **Layout responsive**: Adaptable a móvil/tablet/desktop
- ✅ **Navegación lateral**: Menu colapsable
- ✅ **Cards informativas**: Estadísticas y métricas
- ✅ **Tablas dinámicas**: Ordenamiento y filtros

### Sistema de Chat
- ✅ **Ventana flotante**: Posicionable y redimensionable
- ✅ **Modo pantalla completa**: Experiencia inmersiva
- ✅ **Lista minimizable**: Optimización de espacio
- ✅ **Estados visuales**: Online/offline, mensajes leídos

### Formularios
- ✅ **Validación en tiempo real**: Feedback inmediato
- ✅ **Estados de error**: Mensajes claros y útiles
- ✅ **Loading states**: Spinners y skeleton loaders
- ✅ **Accesibilidad**: Labels, ARIA attributes

### Modales y Overlays
- ✅ **Backdrop blur**: Efecto visual profesional
- ✅ **Animaciones suaves**: Transiciones CSS
- ✅ **Focus trap**: Navegación por teclado
- ✅ **Escape key**: Cierre rápido

## 🎨 Componentes Reutilizables

### Botones
```jsx
// Primario
<button className="bg-[#00246a] hover:bg-[#003875] text-white">

// Secundario  
<button className="border-[#00246a] text-[#00246a] hover:bg-[#00246a] hover:text-white">

// Peligro
<button className="bg-[#e30f28] hover:bg-red-700 text-white">
```

### Cards
```jsx
// Card básica
<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">

// Card con hover
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6">
```

### Inputs
```jsx
// Input estándar
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a]">
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first approach */
sm: 640px    /* Tablet pequeña */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Desktop grande */
2xl: 1536px  /* Ultra wide */
```

### Adaptaciones por Dispositivo
- ✅ **Mobile**: Stack vertical, menús colapsables
- ✅ **Tablet**: Layouts híbridos, touch-friendly
- ✅ **Desktop**: Layouts complejos, hover states

## 🔧 Herramientas de Desarrollo

### CSS Framework
- **Tailwind CSS**: Utility-first styling
- **Configuración personalizada**: Colores y spacing del instituto
- **PostCSS**: Optimización y prefijos automáticos

### Componentes UI
- **Lucide React**: Iconos consistentes
- **Radix UI**: Componentes accesibles (futuro)
- **Framer Motion**: Animaciones avanzadas (futuro)

## 🚀 Acceso Rápido

### Para Diseñadores:
1. **Iconos**: [LUCIDE_ICONS_GUIDE.md](./LUCIDE_ICONS_GUIDE.md)
2. **Vistas**: [UI_VIEWS_SUMMARY.md](./UI_VIEWS_SUMMARY.md)

### Para Desarrolladores:
1. **Componentes**: Ver ejemplos de código en documentación
2. **Patrones**: Seguir convenciones establecidas

### Para QA/Testing:
1. **Responsive**: Verificar en todos los breakpoints
2. **Accesibilidad**: Validar con screen readers

## 📊 Métricas de UX

### Performance
- ✅ **First Paint**: < 1.2s
- ✅ **Largest Contentful Paint**: < 2.5s
- ✅ **Cumulative Layout Shift**: < 0.1

### Accesibilidad
- ✅ **WCAG 2.1**: Nivel AA compliance
- ✅ **Keyboard navigation**: Completamente funcional
- ✅ **Screen reader**: Compatible

---
**📅 Última actualización**: Enero 2025  
**📁 Documentos**: 2 archivos especializados