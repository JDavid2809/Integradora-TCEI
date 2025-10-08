"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardContent from "./DashboardContent"
import CoursesContent from "./CoursesContent"
import ScheduleContent from "./Schedule"
import PaymentsContent from "./PaymentsContent"
import ExamsContent from "./ExamsContent"
import Sidebar from "./Sidebar"
import Header from "./Header"
import BottomTabs from "./Tabs"
import { Session } from "next-auth"
import { CursoFromDB } from "@/types/courses"

interface DashboardProps {
    onLogout: () => void
    user?: Session
    studentCourses?: CursoFromDB[]
    allCourses?: CursoFromDB[]
}

export default function Dashboard({ onLogout, user, studentCourses, allCourses }: DashboardProps) {
    const [activeSection, setActiveSection] = useState("dashboard")
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1,
            },
        },
    }

    const renderContent = () => {
        switch (activeSection) {
            case "dashboard":
                return <DashboardContent key="dashboard" />
            case "courses":
                return <CoursesContent key="courses" studentCourses={studentCourses} allCourses={allCourses} />
            case "schedule":
                return <ScheduleContent key="schedule" />
            case "payments":
                return <PaymentsContent key="payments" />
            case "exams":
                return <ExamsContent key="exams" />
            default:
                return <DashboardContent key="dashboard" />
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-slate-50 flex flex-col lg:flex-row pt-[76px] lg:pt-0"
        >
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                <Sidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    sidebarOpen={false}
                    setSidebarOpen={setSidebarOpen}
                    onLogout={onLogout}
                />
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    onLogout={onLogout}
                />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed top-[76px] left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[44] lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-0">
                <Header activeSection={activeSection} setSidebarOpen={setSidebarOpen} user={user} />

                {/* Content */}
                <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 pt-4 lg:pt-6">
                    <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                </main>

                {/* Mobile Bottom Tabs */}
                <div className="lg:hidden">
                    <BottomTabs activeSection={activeSection} setActiveSection={setActiveSection} />
                </div>
            </div>
        </motion.div>
    )
}
