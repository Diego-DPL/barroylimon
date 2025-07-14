import { useRole, type UserRole } from '../hooks/useRole'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface RoleProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/' 
}: RoleProtectedRouteProps) {
  const { role, loading } = useRole()

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Verificando permisos...</div>
      </div>
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
