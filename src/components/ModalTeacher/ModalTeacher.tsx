import React from 'react'
import { X, Save } from 'lucide-react'

// Interfaces
interface Activity {
  id: number;
  title: string;
  description: string;
  course: string;
  level: string;
  skill: string;
  duration: string;
  lessons: string;
  instructions: string;
}

interface ModalTeacherProps {
  showModal: boolean;
  isEditing: boolean;
  currentActivity: Activity;
  setCurrentActivity: (activity: Activity) => void;
  closeModal: () => void;
  handleSave: () => void;
}

export default function ModalTeacher({ 
  showModal, 
  isEditing, 
  currentActivity, 
  setCurrentActivity, 
  closeModal, 
  handleSave 
}: ModalTeacherProps) {
  if (!showModal) return null;

  
  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Actividad' : 'Crear Nueva Actividad'}
          </h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título de la Actividad</label>
            <input
              type="text"
              value={currentActivity.title}
              onChange={(e) => setCurrentActivity({...currentActivity, title: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Ej: Email Writing Practice"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={currentActivity.description}
              onChange={(e) => setCurrentActivity({...currentActivity, description: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600 h-24 resize-none"
              placeholder="Describe brevemente la actividad..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
              <select
                value={currentActivity.course}
                onChange={(e) => setCurrentActivity({...currentActivity, course: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">Seleccionar curso</option>
                <option value="Business English">Business English</option>
                <option value="Conversación Avanzada">Conversación Avanzada</option>
                <option value="Grammar Fundamentals">Grammar Fundamentals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
              <select
                value={currentActivity.level}
                onChange={(e) => setCurrentActivity({...currentActivity, level: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300  text-black rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">Seleccionar nivel</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Habilidad</label>
              <select
                value={currentActivity.skill}
                onChange={(e) => setCurrentActivity({...currentActivity, skill: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 text-black  rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">Seleccionar habilidad</option>
                <option value="Reading">Reading</option>
                <option value="Writing">Writing</option>
                <option value="Speaking">Speaking</option>
                <option value="Listening">Listening</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración estimada</label>
              <input
                type="text"
                value={currentActivity.duration}
                onChange={(e) => setCurrentActivity({...currentActivity, duration: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Ej: 25 min"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de lecciones</label>
            <input
              type="text"
              value={currentActivity.lessons}
              onChange={(e) => setCurrentActivity({...currentActivity, lessons: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300  text-black rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Ej: 5 lecciones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones</label>
            <textarea
              value={currentActivity.instructions}
              onChange={(e) => setCurrentActivity({...currentActivity, instructions: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600 h-24 resize-none"
              placeholder="Instrucciones para completar la actividad..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isEditing ? 'Guardar Cambios' : 'Crear Actividad'}
          </button>
        </div>
      </div>
    </div>
  );
}

