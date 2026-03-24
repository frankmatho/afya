import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminDoctors     from './pages/admin/AdminDoctors'
import AdminPatients    from './pages/admin/AdminPatients'
import AdminDepartments from './pages/admin/AdminDepartments'
import { DoctorDashboard, DoctorPatients } from './pages/doctor/DoctorPortal'

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)   return <Navigate to="/login" replace />
  return <Navigate to={`/${user.role}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<RoleRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route path="/admin"             element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/doctors"     element={<ProtectedRoute role="admin"><AdminDoctors /></ProtectedRoute>} />
      <Route path="/admin/patients"    element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute role="admin"><AdminDepartments /></ProtectedRoute>} />

      {/* Doctor routes */}
      <Route path="/doctor"          element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><DoctorPatients /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
