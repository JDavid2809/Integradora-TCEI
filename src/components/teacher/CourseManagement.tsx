'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import CourseCreationForm from './CourseCreationForm'
import CourseList from './CourseList'
import CourseDetailView from './CourseDetailView'
import EnrolledStudentsList from './EnrolledStudentsList'

interface CourseManagementProps {
  teacherId: number
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail' | 'students'

export default function CourseManagement({ teacherId }: CourseManagementProps) {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [viewingCourseId, setViewingCourseId] = useState<number | null>(null)
  const [viewingStudentsCourseId, setViewingStudentsCourseId] = useState<number | null>(null)
  const [viewingStudentsCourseName, setViewingStudentsCourseName] = useState<string>('')

  const handleCreateNew = () => {
    setEditingCourseId(null)
    setViewingCourseId(null)
    setCurrentView('create')
  }

  const handleEditCourse = (courseId: number) => {
    setEditingCourseId(courseId)
    setViewingCourseId(null)
    setCurrentView('edit')
  }

  const handleViewDetails = (courseId: number) => {
    setViewingCourseId(courseId)
    setEditingCourseId(null)
    setViewingStudentsCourseId(null)
    setCurrentView('detail')
  }

  const handleViewStudents = (courseId: number, courseName: string) => {
    setViewingStudentsCourseId(courseId)
    setViewingStudentsCourseName(courseName)
    setViewingCourseId(null)
    setEditingCourseId(null)
    setCurrentView('students')
  }

  const handleViewActivities = (courseId: number, courseName: string) => {
    // Navegar a la página de actividades
    router.push(`/teacher/courses/${courseId}/activities`)
  }

  const handleFormSuccess = () => {
    setCurrentView('list')
    setEditingCourseId(null)
    setViewingCourseId(null)
    setViewingStudentsCourseId(null)
  }

  const handleFormCancel = () => {
    setCurrentView('list')
    setEditingCourseId(null)
    setViewingCourseId(null)
    setViewingStudentsCourseId(null)
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setEditingCourseId(null)
    setViewingCourseId(null)
    setViewingStudentsCourseId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'list' && (
        <div className="max-w-7xl mx-auto p-6">
          <CourseList
            teacherId={teacherId}
            onCreateNew={handleCreateNew}
            onEditCourse={handleEditCourse}
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <div className="max-w-7xl mx-auto p-6">
          <CourseCreationForm
            teacherId={teacherId}
            editingCourseId={editingCourseId}
            isEditing={currentView === 'edit'}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {currentView === 'detail' && viewingCourseId && (
        <CourseDetailView
          courseId={viewingCourseId}
          teacherId={teacherId}
          onBack={handleBackToList}
          onEdit={handleEditCourse}
          onViewStudents={handleViewStudents}
          onViewActivities={handleViewActivities}
        />
      )}

      {currentView === 'students' && viewingStudentsCourseId && (
        <EnrolledStudentsList
          courseId={viewingStudentsCourseId}
          courseName={viewingStudentsCourseName}
          teacherId={teacherId}
          onBack={handleBackToList}
        />
      )}
    </div>
  )
}