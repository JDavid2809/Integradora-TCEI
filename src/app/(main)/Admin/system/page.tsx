'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Level {
  id: number
  nombre: string
  activo: boolean
  total_examenes?: number
  total_clases?: number
}

interface AgeCategory {
  id: number
  rango: string
  activo: boolean
  total_estudiantes?: number
}

export default function AdminSystemConfigPage() {
  const { data: session } = useSession()
  const [levels, setLevels] = useState<Level[]>([])
  const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para modales
  const [showCreateLevelForm, setShowCreateLevelForm] = useState(false)
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false)
  
  // Estados para formularios
  const [newLevelName, setNewLevelName] = useState('')
  const [newCategoryRange, setNewCategoryRange] = useState('')

  useEffect(() => {
    fetchLevels()
    fetchAgeCategories()
  }, [])

  const fetchLevels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system/levels?includeStats=true')
      if (response.ok) {
        const data = await response.json()
        setLevels(data.levels)
      }
    } catch (error) {
      console.error('Error al cargar niveles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgeCategories = async () => {
    try {
      const response = await fetch('/api/admin/system/age-categories?includeStats=true')
      if (response.ok) {
        const data = await response.json()
        setAgeCategories(data.categories)
      }
    } catch (error) {
      console.error('Error al cargar categorías de edad:', error)
    }
  }

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/system/levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: newLevelName })
      })

      if (response.ok) {
        alert('Nivel creado exitosamente')
        setShowCreateLevelForm(false)
        setNewLevelName('')
        fetchLevels()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al crear nivel:', error)
      alert('Error al crear nivel')
    }
  }

  const handleCreateAgeCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/system/age-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rango: newCategoryRange })
      })

      if (response.ok) {
        alert('Categoría de edad creada exitosamente')
        setShowCreateCategoryForm(false)
        setNewCategoryRange('')
        fetchAgeCategories()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al crear categoría de edad:', error)
      alert('Error al crear categoría de edad')
    }
  }

  const handleToggleLevelStatus = async (levelId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/system/levels', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: levelId, 
          activo: !currentStatus 
        })
      })

      if (response.ok) {
        fetchLevels()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al actualizar nivel:', error)
      alert('Error al actualizar nivel')
    }
  }

  const handleDeleteLevel = async (levelId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este nivel?')) return

    try {
      const response = await fetch(`/api/admin/system/levels?id=${levelId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Nivel eliminado exitosamente')
        fetchLevels()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar nivel:', error)
      alert('Error al eliminar nivel')
    }
  }

  if (!session || session.user?.rol !== 'ADMIN') {
    return <div>No autorizado</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#00246a]">Configuraciones del Sistema</h1>
        <p className="text-gray-600 mt-2">Gestiona los niveles de inglés y categorías de edad del sistema</p>
      </div>

      {/* Sección de Niveles */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Niveles de Inglés</h2>
          <button
            onClick={() => setShowCreateLevelForm(true)}
            className="bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Agregar Nivel
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exámenes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {levels.map(level => (
                  <tr key={level.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {level.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {level.total_examenes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {level.total_clases || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleLevelStatus(level.id, level.activo)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          level.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {level.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={(level.total_examenes || 0) > 0 || (level.total_clases || 0) > 0}
                      >
                        {(level.total_examenes || 0) > 0 || (level.total_clases || 0) > 0 ? 'En uso' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección de Categorías de Edad */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Categorías de Edad</h2>
          <button
            onClick={() => setShowCreateCategoryForm(true)}
            className="bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Agregar Categoría
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango de Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ageCategories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.rango}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.total_estudiantes || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear nivel */}
      {showCreateLevelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Nivel</h3>
              <button
                onClick={() => setShowCreateLevelForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLevel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Nivel *
                </label>
                <input
                  type="text"
                  required
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  placeholder="Ej: A1, A2, B1, B2, C1, C2..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateLevelForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Nivel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear categoría de edad */}
      {showCreateCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crear Nueva Categoría de Edad</h3>
              <button
                onClick={() => setShowCreateCategoryForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgeCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de Edad *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryRange}
                  onChange={(e) => setNewCategoryRange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  placeholder="Ej: 5-10 años, 11-15 años, 16+ años..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCategoryForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
