import React from 'react'
import {
  // Navigation & UI
  Home,
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  
  // Actions
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  
  // Status & Feedback
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader,
  
  // Education & Learning
  BookOpen,
  GraduationCap,
  Award,
  Target,
  Brain,
  
  // Communication
  Mail,
  MessageCircle,
  Phone,
  
  // Media & Files
  Image,
  FileText,
  Video,
  Music,
  
  // Business & Finance
  DollarSign,
  CreditCard,
  TrendingUp,
  BarChart3,
  PieChart,
  
  // Time & Calendar
  Calendar,
  Clock,
  Timer,
  
  // Technology
  Monitor,
  Smartphone,
  Wifi,
  Database,
  
  // Arrows & Direction
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  
  // Social & People
  Users,
  UserPlus,
  UserCheck,
  Heart,
  Star,
  
  // Weather & Nature
  Sun,
  Moon,
  Cloud,
  
  // Tools & Objects
  Wrench,
  Key,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'

interface IconShowcaseProps {
  size?: number
  className?: string
}

export function IconShowcase({ size = 24, className = "" }: IconShowcaseProps) {
  const iconSections = [
    {
      title: "Navigation & UI",
      icons: [
        { component: Home, name: "Home" },
        { component: Menu, name: "Menu" },
        { component: Search, name: "Search" },
        { component: Bell, name: "Bell" },
        { component: Settings, name: "Settings" },
        { component: User, name: "User" },
        { component: LogOut, name: "LogOut" }
      ]
    },
    {
      title: "Actions",
      icons: [
        { component: Plus, name: "Plus" },
        { component: Edit, name: "Edit" },
        { component: Trash2, name: "Trash2" },
        { component: Save, name: "Save" },
        { component: Download, name: "Download" },
        { component: Upload, name: "Upload" },
        { component: Copy, name: "Copy" }
      ]
    },
    {
      title: "Status & Feedback",
      icons: [
        { component: CheckCircle, name: "CheckCircle" },
        { component: XCircle, name: "XCircle" },
        { component: AlertTriangle, name: "AlertTriangle" },
        { component: Info, name: "Info" },
        { component: Loader, name: "Loader" }
      ]
    },
    {
      title: "Education & Learning",
      icons: [
        { component: BookOpen, name: "BookOpen" },
        { component: GraduationCap, name: "GraduationCap" },
        { component: Award, name: "Award" },
        { component: Target, name: "Target" },
        { component: Brain, name: "Brain" }
      ]
    },
    {
      title: "Business & Finance",
      icons: [
        { component: DollarSign, name: "DollarSign" },
        { component: CreditCard, name: "CreditCard" },
        { component: TrendingUp, name: "TrendingUp" },
        { component: BarChart3, name: "BarChart3" },
        { component: PieChart, name: "PieChart" }
      ]
    }
  ]

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lucide React Icons Showcase</h2>
      
      {iconSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">{section.title}</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {section.icons.map((icon, iconIndex) => {
              const IconComponent = icon.component
              return (
                <div
                  key={iconIndex}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <IconComponent size={size} className={`text-gray-600 mb-2 ${className}`} />
                  <span className="text-xs text-gray-500 text-center">{icon.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      
      {/* Usage Examples */}
      <div className="mt-12 space-y-6">
        <h3 className="text-lg font-semibold text-gray-700">Usage Examples</h3>
        
        {/* Button Examples */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-600">Buttons with Icons</h4>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              Add New
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Save size={16} />
              Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 size={16} />
              Delete
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Card Examples */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-600">Cards with Icons</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h5 className="font-semibold">Students</h5>
              </div>
              <p className="text-gray-600 text-sm">Manage student accounts</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-green-600" />
                <h5 className="font-semibold">Courses</h5>
              </div>
              <p className="text-gray-600 text-sm">View and edit courses</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <h5 className="font-semibold">Analytics</h5>
              </div>
              <p className="text-gray-600 text-sm">Performance metrics</p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-600">Status Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">Success message</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">Error message</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-700">Warning message</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700">Information message</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IconShowcase
