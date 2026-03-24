import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './UI'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return children
}