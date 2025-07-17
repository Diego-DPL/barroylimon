import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabaseClient'
import Button from '../components/ui/button'
import { Input } from '../components/ui/input'
import UserOrders from '../components/UserOrders'
import { User, Mail, Calendar, Settings, Bell, Package } from 'lucide-react'

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

interface NewsletterSubscription {
  id: string
  email: string
  user_id?: string
  subscribed_at: string
  unsubscribed_at?: string | null
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [newsletters, setNewsletters] = useState<NewsletterSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchNewsletterSubscriptions()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      // Primero intentar obtener el perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Si hay un error que no sea "no encontrado"
        throw error
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
      } else {
        // Si no existe el perfil, crear uno básico
        const newProfile = {
          id: user.id,
          full_name: null,
          avatar_url: null,
          created_at: new Date().toISOString()
        }
        setProfile(newProfile)
        setFullName('')
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsletterSubscriptions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('user_id', user.id)
        .order('subscribed_at', { ascending: false })

      if (error) throw error
      setNewsletters(data || [])
    } catch (error: any) {
      console.error('Error fetching newsletters:', error)
    }
  }

  const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName || null,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage('Perfil actualizado correctamente')
      await fetchProfile()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError('Error al actualizar el perfil')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Cargando perfil...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Debes iniciar sesión para ver tu perfil</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-stone-800 tracking-tight mb-4">
            Mi Perfil
          </h1>
          <p className="text-stone-600 font-light">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar con información básica */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-stone-600" />
                </div>
                <h2 className="text-xl font-light text-stone-800 mb-2">
                  {profile?.full_name || 'Usuario'}
                </h2>
                <p className="text-stone-600 font-light text-sm mb-4">
                  {user.email}
                </p>
                <div className="flex items-center justify-center text-stone-500 text-xs">
                  <Calendar className="h-4 w-4 mr-1" />
                  Miembro desde {formatDate(user.created_at)}
                </div>
              </div>
            </div>

            {/* Newsletter Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="text-lg font-light text-stone-800">Newsletter</h3>
              </div>
              {newsletters.length > 0 ? (
                <div>
                  <p className="text-green-600 text-sm font-light mb-2">
                    ✓ Suscrito al newsletter
                  </p>
                  <p className="text-stone-500 text-xs">
                    Desde {formatDate(newsletters[0].subscribed_at)}
                  </p>
                </div>
              ) : (
                <p className="text-stone-600 text-sm font-light">
                  No estás suscrito al newsletter
                </p>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b border-stone-200">
                <nav className="flex space-x-8 px-8 pt-6">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'profile'
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Información Personal
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'orders'
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <Package className="h-4 w-4 inline mr-2" />
                    Mis Pedidos
                  </button>
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'profile' ? (
                  <div>
                    <h3 className="text-xl font-light text-stone-800 mb-6">Información Personal</h3>
                    <form onSubmit={updateProfile} className="space-y-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-light text-stone-700 mb-2">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <Input
                            id="email"
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="pl-10 bg-stone-50 text-stone-500"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          El correo electrónico no se puede cambiar
                        </p>
                      </div>

                      <div>
                        <label htmlFor="fullName" className="block text-sm font-light text-stone-700 mb-2">
                          Nombre completo
                        </label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                          placeholder="Tu nombre completo"
                          className="w-full"
                        />
                      </div>

                      {error && (
                        <div className="text-red-600 text-sm font-light bg-red-50 p-3 rounded-md">
                          {error}
                        </div>
                      )}

                      {message && (
                        <div className="text-green-600 text-sm font-light bg-green-50 p-3 rounded-md">
                          {message}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={updating}
                        className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2 font-light tracking-wide"
                      >
                        {updating ? 'Actualizando...' : 'Actualizar Perfil'}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <UserOrders />
                )}
              </div>
            </div>

            {/* Newsletter Subscriptions - Solo mostrar en el tab de perfil */}
            {activeTab === 'profile' && newsletters.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-light text-stone-800 mb-6">Mis Suscripciones</h3>
                <div className="space-y-4">
                  {newsletters.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                    >
                      <div>
                        <p className="text-stone-800 font-light">{subscription.email}</p>
                        <p className="text-stone-500 text-sm">
                          Suscrito el {formatDate(subscription.subscribed_at)}
                        </p>
                      </div>
                      <div className="text-green-600 text-sm font-light">
                        ✓ Activo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
