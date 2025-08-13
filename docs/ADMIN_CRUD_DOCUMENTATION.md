# Admin CRUD Components Documentation

## Overview
This document describes the complete CRUD (Create, Read, Update, Delete) components for the English Learning Management System administrative interface.

## Components Created

### 1. AdminUserCrud Component (`src/components/AdminUserCrud.tsx`)

**Features:**
- ✅ View all users with pagination
- ✅ Create new users (Students, Teachers, Administrators)
- ✅ Edit existing users
- ✅ Delete users
- ✅ Search and filter by role
- ✅ Role-specific form fields
- ✅ Validation and error handling

**Functionality:**
- **Students**: Requires age and age category
- **Teachers**: Requires education level and optional observations
- **Administrators**: Basic user information only
- **Search**: By name, surname, or email
- **Filters**: By user role (Student/Teacher/Admin)
- **Pagination**: 10 users per page

### 2. AdminCourseCrud Component (`src/components/AdminCourseCrud.tsx`)

**Features:**
- ✅ View all courses with statistics
- ✅ Create new courses
- ✅ Edit existing courses
- ✅ Delete courses
- ✅ Filter by modality and status
- ✅ Course duration management

**Functionality:**
- **Modalities**: Presential or Online
- **Duration**: Start and end dates
- **Statistics**: Number of enrolled students and classes
- **Status**: Active/Inactive courses
- **Search**: By course name
- **Validation**: Ensures end date is after start date

### 3. AdminExamCrud Component (`src/components/AdminExamCrud.tsx`)

**Features:**
- ✅ View all exams with question counts
- ✅ Create new exams
- ✅ Edit existing exams
- ✅ Delete exams
- ✅ Manage exam questions
- ✅ Create multiple-choice questions
- ✅ Delete individual questions

**Functionality:**
- **Levels**: Associate exams with English levels
- **Questions**: Add multiple-choice questions with 4 options
- **Validation**: Ensures at least one correct answer per question
- **Statistics**: Shows number of questions and results per exam
- **Interactive**: Modal interface for question management

### 4. AdminPaymentCrud Component (`src/components/AdminPaymentCrud.tsx`)

**Features:**
- ✅ View all payment records
- ✅ Register new payments
- ✅ Edit existing payments
- ✅ Delete payment records
- ✅ Export payment data to CSV
- ✅ Filter by date and type
- ✅ Total amount calculations

**Functionality:**
- **Students**: Link payments to specific students (optional)
- **Courses**: Associate payments with course classes
- **Types**: Currently supports "Mensualidad" (Monthly)
- **Export**: Download payment data as CSV
- **Filters**: By payment type and date (monthly)
- **Currency**: Mexican Peso formatting

## API Endpoints Used

### Users API
- `GET /api/admin/users` - List users with pagination and filters
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Courses API
- `GET /api/admin/courses` - List courses with pagination and filters
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/[id]` - Update course
- `DELETE /api/admin/courses/[id]` - Delete course
- `GET /api/admin/courses/classes` - Get course classes for payments

### Exams API
- `GET /api/admin/exams` - List exams with pagination and filters
- `POST /api/admin/exams` - Create new exam
- `PUT /api/admin/exams/[id]` - Update exam
- `DELETE /api/admin/exams/[id]` - Delete exam
- `GET /api/admin/exams/[id]/questions` - Get exam questions
- `POST /api/admin/exams/[id]/questions` - Create question
- `DELETE /api/admin/exams/[id]/questions/[questionId]` - Delete question

### Payments API
- `GET /api/admin/payments` - List payments with pagination and filters
- `POST /api/admin/payments` - Create new payment
- `PUT /api/admin/payments/[id]` - Update payment
- `DELETE /api/admin/payments/[id]` - Delete payment

### System APIs
- `GET /api/admin/system/levels` - Get English levels
- `GET /api/admin/system/age-categories` - Get age categories

## Integration with Main Admin Page

The CRUD components are integrated into the main Admin page (`src/app/Admin/page.tsx`) through a navigation system:

```tsx
const renderContent = () => {
  switch (activeSection) {
    case 'dashboard':
      return renderDashboard()
    case 'users':
      return <AdminUserCrud />
    case 'courses':
      return <AdminCourseCrud />
    case 'exams':
      return <AdminExamCrud />
    case 'payments':
      return <AdminPaymentCrud />
    case 'system':
      return <AdminSystemSection navigateToPage={navigateToPage} />
    default:
      return renderDashboard()
  }
}
```

## Design Features

### UI/UX Elements
- **Lucide React Icons**: Consistent iconography throughout
- **Tailwind CSS**: Responsive and modern styling
- **Modal Interfaces**: Clean form overlays for create/edit operations
- **Loading States**: Spinner animations during data operations
- **Success/Error Messages**: User feedback for all operations
- **Pagination**: Efficient data browsing
- **Search & Filters**: Quick data discovery

### Security
- **Admin Authorization**: All API endpoints verify admin role
- **Session Validation**: Server-side session checking
- **Input Validation**: Both client and server-side validation
- **Error Handling**: Graceful error management

### Performance
- **Pagination**: Prevents large data loads
- **Selective Loading**: Only loads necessary data
- **Optimistic Updates**: Immediate UI feedback
- **Efficient Queries**: Optimized database queries with relations

## Usage Instructions

### For Administrators

1. **Accessing CRUD Functions**:
   - Navigate to Admin panel
   - Use sidebar navigation to switch between sections
   - Each section provides full CRUD functionality

2. **Creating Records**:
   - Click "New [Entity]" button
   - Fill required fields (marked with *)
   - Submit form to create record

3. **Editing Records**:
   - Click edit icon on any table row
   - Modify fields in modal form
   - Save changes

4. **Deleting Records**:
   - Click delete icon on any table row
   - Confirm deletion in popup
   - Record is permanently removed

5. **Searching and Filtering**:
   - Use search bar for text searches
   - Apply filters using dropdown menus
   - Clear filters to see all records

### Special Features

1. **User Management**:
   - Role-specific form fields
   - Password is optional when editing
   - Age categories for students
   - Education levels for teachers

2. **Course Management**:
   - Duration validation
   - Modality selection (Presential/Online)
   - Active/Inactive status

3. **Exam Management**:
   - Question bank management
   - Multiple-choice question creation
   - Level association

4. **Payment Management**:
   - CSV export functionality
   - Monthly filtering
   - Total amount tracking
   - Student and course association

## Database Relationships

The CRUD components respect all database relationships:

- **Users** → **Students/Teachers/Administrators**
- **Courses** → **Course Classes (Imparte)**
- **Exams** → **Questions** → **Answers**
- **Payments** → **Students** + **Course Classes**

## Error Handling

All components include comprehensive error handling:

- Network errors
- Validation errors
- Authorization errors
- Database constraint errors
- User-friendly error messages

## Future Enhancements

Potential improvements:
- Bulk operations (bulk delete, bulk edit)
- Advanced filters (date ranges, multiple criteria)
- Data import functionality
- Real-time updates with WebSockets
- Advanced reporting and analytics
- File upload for media content
- Audit trail for all operations

This CRUD system provides a complete administrative interface for managing all aspects of the English learning platform.
