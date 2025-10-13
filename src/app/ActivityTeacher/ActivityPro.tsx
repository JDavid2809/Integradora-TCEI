"use client"

import React, { useState } from 'react';
import { BookOpen, Mic, Headphones, PenTool, Plus, Edit2, Trash2, Search, X, Save, Clock } from 'lucide-react';
import ModalTeacher from '@/components/ModalTeacher/ModalTeacher';

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

type SkillType = 'Writing' | 'Reading' | 'Speaking' | 'Listening';
type LevelType = 'Básico' | 'Intermedio' | 'Avanzado';

type ActivityCRUDProps = {
  paginatedData?: any; // Define the type based on your actual data structure
};

export default function ActivityCRUD({ paginatedData }: ActivityCRUDProps) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  
  const [currentActivity, setCurrentActivity] = useState<Activity>({
    id: 0,
    title: '',
    description: '',
    course: '',
    level: '',
    skill: '',
    duration: '',
    lessons: '',
    instructions: ''
  });

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      title: "Email Writing Practice",
      description: "Aprende a escribir correos profesionales en inglés",
      course: "Business English",
      level: "Intermedio",
      skill: "Writing",
      duration: "25 min",
      lessons: "5 lecciones",
      instructions: "Completa los ejercicios de redacción de emails formales"
    },
    {
      id: 2,
      title: "Business Meetings",
      description: "Vocabulario esencial para reuniones de negocios",
      course: "Business English",
      level: "Intermedio",
      skill: "Reading",
      duration: "20 min",
      lessons: "8 lecciones",
      instructions: "Lee los textos y completa el vocabulario"
    },
    {
      id: 3,
      title: "Daily Conversations",
      description: "Practica conversaciones cotidianas en inglés",
      course: "Conversación Avanzada",
      level: "Avanzado",
      skill: "Speaking",
      duration: "30 min",
      lessons: "6 lecciones",
      instructions: "Graba tus respuestas para cada situación"
    },
    {
      id: 4,
      title: "Present Tenses Review",
      description: "Repaso completo de los tiempos presentes",
      course: "Grammar Fundamentals",
      level: "Básico",
      skill: "Writing",
      duration: "15 min",
      lessons: "10 lecciones",
      instructions: "Completa los ejercicios gramaticales"
    },
    {
      id: 5,
      title: "Listening: News Reports",
      description: "Comprensión auditiva de noticias internacionales",
      course: "Conversación Avanzada",
      level: "Avanzado",
      skill: "Listening",
      duration: "35 min",
      lessons: "7 lecciones",
      instructions: "Escucha los reportajes y responde las preguntas"
    },
    {
      id: 6,
      title: "Job Interviews Practice",
      description: "Practica entrevistas de trabajo en inglés",
      course: "Business English",
      level: "Intermedio",
      skill: "Speaking",
      duration: "40 min",
      lessons: "4 lecciones",
      instructions: "Simula entrevistas laborales y mejora tus respuestas"
    }
  ]);

  const skillIcons: Record<SkillType, React.ReactElement> = {
    Writing: <PenTool className="w-12 h-12 text-gray-300" />,
    Reading: <BookOpen className="w-12 h-12 text-gray-300" />,
    Speaking: <Mic className="w-12 h-12 text-gray-300" />,
    Listening: <Headphones className="w-12 h-12 text-gray-300" />
  };

  const levelColors: Record<LevelType, string> = {
    'Básico': 'bg-purple-50 text-purple-600',
    'Intermedio': 'bg-red-50 text-red-600',
    'Avanzado': 'bg-blue-50 text-blue-600'
  };

  const openModal = (activity: Activity | null = null) => {
    if (activity) {
      setCurrentActivity(activity);
      setIsEditing(true);
    } else {
      setCurrentActivity({
        id: Date.now(),
        title: '',
        description: '',
        course: '',
        level: '',
        skill: '',
        duration: '',
        lessons: '',
        instructions: ''
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentActivity({
      id: 0,
      title: '',
      description: '',
      course: '',
      level: '',
      skill: '',
      duration: '',
      lessons: '',
      instructions: ''
    });
  };

  const handleSave = () => {
    if (isEditing) {
      setActivities(activities.map(act => 
        act.id === currentActivity.id ? { ...currentActivity, id: act.id } : act
      ));
    } else {
      setActivities([...activities, { ...currentActivity, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta actividad?')) {
      setActivities(activities.filter(act => act.id !== id));
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || activity.level === filterLevel;
    const matchesSkill = filterSkill === 'all' || activity.skill === filterSkill;
    return matchesSearch && matchesLevel && matchesSkill;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Actividades</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona las actividades de tus cursos de inglés</p>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Filters and Actions */}
        <div className="px-8 py-6 bg-white border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar actividad o curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2.5 border border-gray-300  text-black rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todos los niveles</option>
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>

            {/* Skill Filter */}
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todas las habilidades</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
              <option value="Speaking">Speaking</option>
              <option value="Listening">Listening</option>
            </select>

            {/* Add Button */}
            <button
              onClick={() => openModal()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Actividad
            </button>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                <div className="bg-gray-50 p-8 flex items-center justify-center border-b border-gray-200 relative">
                  {skillIcons[activity.skill as SkillType]}
                  
                  {/* Action Buttons - Aparecen en hover */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(activity)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600 transition"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-600 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-sm text-gray-500">{activity.lessons}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[activity.level as LevelType]}`}>
                      {activity.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                      {activity.course}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-2.5 border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron actividades</p>
            </div>
          )}
        </div>
      </main>

    <ModalTeacher
      showModal={showModal}
      isEditing={isEditing}
      currentActivity={currentActivity}
      setCurrentActivity={setCurrentActivity}
      closeModal={closeModal}
      handleSave={handleSave}
    />
    </div>
  );
}