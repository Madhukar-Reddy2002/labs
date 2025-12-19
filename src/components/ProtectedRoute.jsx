import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}