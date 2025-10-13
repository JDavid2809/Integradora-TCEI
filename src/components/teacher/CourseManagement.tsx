'use client'

import React, { useState } from 'react'
import CourseCreationForm from './CourseCreationForm'
import CourseList from './CourseList'

interface CourseManagementProps {
  teacherId: number
}

type ViewMode = 'list' | 'create' | 'edit'

export default function CourseManagement({ teacherId }: CourseManagementProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)

  const handleCreateNew = () => {
    setEditingCourseId(null)
    setCurrentView('create')
  }

  const handleEditCourse = (courseId: number) => {
    setEditingCourseId(courseId)
    setCurrentView('edit')
  }

  const handleFormSuccess = () => {
    setCurrentView('list')
    setEditingCourseId(null)
  }

  const handleFormCancel = () => {
    setCurrentView('list')
    setEditingCourseId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {currentView === 'list' && (
          <CourseList
            teacherId={teacherId}
            onCreateNew={handleCreateNew}
            onEditCourse={handleEditCourse}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <CourseCreationForm
            teacherId={teacherId}
            editingCourseId={editingCourseId}
            isEditing={currentView === 'edit'}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </div>
  )
}