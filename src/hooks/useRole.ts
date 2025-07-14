import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabaseClient'

export type UserRole = 'customer' | 'admin' | 'moderator'

interface UseRoleReturn {
  role: UserRole | null
  isAdmin: boolean
  isCustomer: boolean
  isModerator: boolean
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => Promise<boolean>
  loading: boolean
}

export const useRole = (): UseRoleReturn => {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserRole()
    } else {
      setRole(null)
      setLoading(false)
    }
  }, [user])

  const fetchUserRole = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setRole('customer') // Default role
      } else {
        setRole(data?.role || 'customer')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole('customer')
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole
  }

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false
    
    try {
      const { data, error } = await supabase
        .rpc('has_permission', { required_permission: permission })

      if (error) {
        console.error('Error checking permission:', error)
        return false
      }

      return data || false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  return {
    role,
    isAdmin: role === 'admin',
    isCustomer: role === 'customer',
    isModerator: role === 'moderator',
    hasRole,
    hasPermission,
    loading
  }
}
