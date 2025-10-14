'use client'

import React, { useState } from 'react'
import ActivityList from '@/components/teacher/activities/ActivityList'
import ActivityFormModal from '@/components/teacher/activities/ActivityFormModal'
import SubmissionsList from '@/components/teacher/activities/SubmissionsList'

interface CourseActivitiesPageProps {
  courseId: number
  teacherId: number
  courseName: string
}

type View = 'list' | 'submissions'

export default function CourseActivitiesPage({
  courseId,
  teacherId,
  courseName
}: CourseActivitiesPageProps) {
  const [currentView, setCurrentView] = useState<View>('list')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<{
    id: number
    title: string
    totalPoints: number
  } | null>(null)

  // Handlers para el formulario
  const handleCreateNew = () => {
    setEditingActivityId(null)
    setShowFormModal(true)
  }

  const handleEdit = (activityId: number) => {
    setEditingActivityId(activityId)
    setShowFormModal(true)
  }

  const handleFormClose = () => {
    setShowFormModal(false)
    setEditingActivityId(null)
  }

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingActivityId(null)
    // La lista se actualizará automáticamente
  }

  // Handlers para las entregas
  const handleViewSubmissions = (activityId: number, activityTitle: string, totalPoints: number = 100) => {
    setSelectedActivity({ id: activityId, title: activityTitle, totalPoints })
    setCurrentView('submissions')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedActivity(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Vista de lista de actividades */}
        {currentView === 'list' && (
          <ActivityList
            courseId={courseId}
            teacherId={teacherId}
            courseName={courseName}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onViewSubmissions={handleViewSubmissions}
          />
        )}

        {/* Vista de entregas */}
        {currentView === 'submissions' && selectedActivity && (
          <SubmissionsList
            activityId={selectedActivity.id}
            activityTitle={selectedActivity.title}
            teacherId={teacherId}
            totalPoints={selectedActivity.totalPoints}
            onBack={handleBackToList}
          />
        )}

        {/* Modal de formulario */}
        {showFormModal && (
          <ActivityFormModal
            courseId={courseId}
            teacherId={teacherId}
            activityId={editingActivityId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </div>
  )
}
