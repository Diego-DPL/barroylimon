import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import Button from '../components/ui/button'
import { Input } from '../components/ui/input'

interface RegisterProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  onBack?: () => void
  showBackButton?: boolean
}

export default function Register({ 
  onSuccess, 
  onSwitchToLogin, 
  onBack, 
  showBackButton = false 
}: RegisterProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Se ha enviado un correo de confirmación. Revisa tu bandeja de entrada.')
      // Usar callback de éxito si está disponible, sino navegar
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-stone-600 hover:text-stone-800 transition-colors mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </button>
          )}
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-stone-800 tracking-tight">
              Crear Cuenta
            </h2>
            <p className="mt-4 text-stone-600 font-light">
              Únete a la comunidad Barro y Limón
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-light text-stone-700 mb-2">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-light text-stone-700 mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-light text-stone-700 mb-2">
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="w-full"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-light text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm font-light text-center">
              {message}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-light tracking-wide"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-stone-600 font-light">
              ¿Ya tienes cuenta?{' '}
              {onSwitchToLogin ? (
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-amber-600 hover:text-amber-700 font-light underline"
                >
                  Inicia sesión aquí
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-amber-600 hover:text-amber-700 font-light underline"
                >
                  Inicia sesión aquí
                </Link>
              )}
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
