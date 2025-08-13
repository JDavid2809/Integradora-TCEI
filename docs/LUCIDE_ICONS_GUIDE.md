# Lucide React Icons - Usage Guide

## Overview
Lucide React is a beautiful & consistent icon toolkit made by the community. It provides over 1000+ carefully crafted icons that are perfect for web applications.

## Installation
The package is already installed in this project:
```bash
npm install lucide-react
```

## Basic Usage

### 1. Import Icons
```tsx
import { Heart, Star, Settings, User } from 'lucide-react'
```

### 2. Use in Components
```tsx
function MyComponent() {
  return (
    <div>
      <Heart className="w-6 h-6 text-red-500" />
      <Star className="w-5 h-5 text-yellow-500" />
      <Settings size={24} />
      <User size={20} className="text-gray-600" />
    </div>
  )
}
```

## Props

All Lucide React icons accept these props:

- **size**: `number` - Sets both width and height
- **className**: `string` - CSS classes for styling
- **color**: `string` - Icon color
- **strokeWidth**: `number` - Stroke width (default: 2)

### Examples:
```tsx
<Heart size={24} color="red" />
<Star className="w-6 h-6 text-yellow-500" />
<Settings size={20} strokeWidth={1.5} />
```

## Common Icon Categories

### Navigation & UI
- `Home`, `Menu`, `Search`, `Bell`, `Settings`, `User`, `LogOut`

### Actions
- `Plus`, `Edit`, `Trash2`, `Save`, `Download`, `Upload`, `Copy`

### Status & Feedback
- `CheckCircle`, `XCircle`, `AlertTriangle`, `Info`, `Loader`

### Education & Learning
- `BookOpen`, `GraduationCap`, `Award`, `Target`, `Brain`

### Business & Finance
- `DollarSign`, `CreditCard`, `TrendingUp`, `BarChart3`, `PieChart`

### Arrows & Direction
- `ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `ChevronRight`

## Usage Patterns

### 1. Button with Icon
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded">
  <Plus size={16} />
  Add New
</button>
```

### 2. Icon in Card Header
```tsx
<div className="p-4 border rounded-lg">
  <div className="flex items-center gap-3 mb-2">
    <Users className="w-6 h-6 text-blue-600" />
    <h3 className="font-semibold">Students</h3>
  </div>
  <p>Manage student accounts</p>
</div>
```

### 3. Status Indicator
```tsx
<div className="flex items-center gap-2">
  <CheckCircle className="w-5 h-5 text-green-600" />
  <span className="text-green-700">Success</span>
</div>
```

### 4. Navigation Item
```tsx
<nav>
  <a href="/dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-100">
    <BarChart3 className="w-5 h-5" />
    Dashboard
  </a>
</nav>
```

## Styling with Tailwind CSS

### Size Classes
```tsx
<Heart className="w-4 h-4" />    {/* 16px */}
<Heart className="w-5 h-5" />    {/* 20px */}
<Heart className="w-6 h-6" />    {/* 24px */}
<Heart className="w-8 h-8" />    {/* 32px */}
```

### Color Classes
```tsx
<Heart className="text-red-500" />
<Star className="text-yellow-400" />
<Settings className="text-gray-600" />
```

### Hover Effects
```tsx
<Heart className="text-gray-400 hover:text-red-500 transition-colors" />
```

## Best Practices

1. **Consistent Sizing**: Use consistent icon sizes throughout your app
2. **Semantic Usage**: Choose icons that clearly represent their function
3. **Accessibility**: Add proper labels when icons are interactive
4. **Performance**: Import only the icons you need

### Good Example:
```tsx
import { User, Settings, LogOut } from 'lucide-react'

function UserMenu() {
  return (
    <div className="space-y-2">
      <button className="flex items-center gap-2">
        <User className="w-4 h-4" />
        Profile
      </button>
      <button className="flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Settings
      </button>
      <button className="flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  )
}
```

## Resources

- [Lucide Icons Website](https://lucide.dev/) - Browse all available icons
- [Lucide React Docs](https://lucide.dev/guide/packages/lucide-react) - Official documentation
- [Icon Search](https://lucide.dev/icons/) - Search for specific icons
