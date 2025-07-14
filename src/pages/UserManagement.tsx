import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Shield, User, Crown, Pencil, RefreshCw } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'customer' | 'admin' | 'moderator'
  created_at: string
  newsletter_subscribed: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [newRole, setNewRole] = useState<'customer' | 'admin' | 'moderator'>('customer')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Intentar usar la función RPC primero
      let { data, error } = await supabase.rpc('get_users_with_emails')

      if (error) {
        console.warn('RPC failed, falling back to direct query:', error)
        
        // Fallback: consulta directa sin emails
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .order('created_at', { ascending: false })

        if (profileError) throw profileError

        data = (profiles || []).map(profile => ({
          ...profile,
          email: `usuario-${profile.id.slice(0, 8)}...`,
          newsletter_subscribed: false
        }))
      }
      
      console.log('Users loaded:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Error al cargar los usuarios. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: 'customer' | 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (error) throw error
      
      // Actualizar el estado local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ))
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-amber-600" />
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-stone-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-800'
      case 'moderator':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-stone-100 text-stone-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-stone-900 mb-2">Gestión de Usuarios</h1>
              <p className="text-stone-600">
                Administra los usuarios y sus roles en el sistema.
              </p>
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-lg font-medium text-stone-900">Usuarios Registrados ({users.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Newsletter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-stone-500">
                        <User className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                        <p className="text-lg font-medium mb-2">No hay usuarios registrados</p>
                        <p className="text-sm">Los usuarios aparecerán aquí cuando se registren en la plataforma.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-stone-900">
                        {user.full_name || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-stone-500">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-900 font-medium">{user.email}</div>
                      <div className="text-xs text-stone-500">
                        {user.email ? 'Verificado' : 'Sin email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.newsletter_subscribed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.newsletter_subscribed ? 'Suscrito' : 'No suscrito'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar Rol
                      </button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Edit Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-stone-900 mb-4">
                Cambiar Rol de Usuario
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-stone-600 mb-2">
                  Usuario: <strong>{selectedUser.full_name || selectedUser.email}</strong>
                </p>
                <p className="text-sm text-stone-600 mb-4">
                  Rol actual: <strong className="capitalize">{selectedUser.role}</strong>
                </p>
                
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Nuevo rol:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'customer' | 'admin' | 'moderator')}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="customer">Customer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-md hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updateUserRole(selectedUser.id, newRole)}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
                >
                  Actualizar Rol
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
