"use server"

import { enrollStudentInCourse } from "./manageCourses"
import { revalidatePath } from "next/cache"

export async function enrollInCourse(courseId: number) {
  try {
    const result = await enrollStudentInCourse(courseId)
    
    // Revalidar las páginas para actualizar los datos
    revalidatePath("/Students")
    revalidatePath("/Courses")
    
    return result
  } catch (error) {
    console.error('Error in enrollInCourse action:', error)
    throw error
  }
}