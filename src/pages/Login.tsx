import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import Button from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-stone-800 tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="mt-4 text-stone-600 font-light">
              Accede a tu cuenta de Barro y Limón
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
          </div>

          {error && (
            <div className="text-red-600 text-sm font-light text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-light tracking-wide"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          <div className="text-center space-y-3">
            <div>
              <Link
                to="/forgot-password"
                className="text-stone-600 hover:text-stone-800 font-light underline text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div>
              <span className="text-stone-600 font-light">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/registro"
                  className="text-amber-600 hover:text-amber-700 font-light underline"
                >
                  Regístrate aquí
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
