import React from 'react'

interface CreateRoomModalProps {
  showCreateRoom: boolean
  setShowCreateRoom: (value: boolean) => void
  newRoomName: string
  setNewRoomName: (value: string) => void
  newRoomDescription: string
  setNewRoomDescription: (value: string) => void
  newRoomType: 'GENERAL' | 'SOPORTE' | 'CLASE'
  setNewRoomType: (value: 'GENERAL' | 'SOPORTE' | 'CLASE') => void
  handleCreateRoom: (e: React.FormEvent) => void
}

export default function CreateRoomModal({
  showCreateRoom,
  setShowCreateRoom,
  newRoomName,
  setNewRoomName,
  newRoomDescription,
  setNewRoomDescription,
  newRoomType,
  setNewRoomType,
  handleCreateRoom
}: CreateRoomModalProps) {
  if (!showCreateRoom) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-4 text-[#00246a]">Crear Nueva Sala</h3>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la sala
            </label>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a]"
              placeholder="Ej: Sala General"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] resize-none"
              rows={3}
              placeholder="Descripción de la sala..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de sala
            </label>
            <select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value as 'GENERAL' | 'SOPORTE' | 'CLASE')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a]"
            >
              <option value="GENERAL">General</option>
              <option value="SOPORTE">Soporte</option>
              <option value="CLASE">Clase</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateRoom(false)
                setNewRoomName('')
                setNewRoomDescription('')
                setNewRoomType('GENERAL')
              }}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newRoomName.trim()}
              className="flex-1 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-[#003875] disabled:opacity-50 transition-colors"
            >
              Crear Sala
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
