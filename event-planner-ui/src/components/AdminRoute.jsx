import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function AdminRoute() {
  const { token, user } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return user?.isAdmin ? <Outlet /> : <Navigate to="/events" replace />
}
