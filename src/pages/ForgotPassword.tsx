import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import Button from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo electrónico.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-stone-800 tracking-tight">
              Recuperar Contraseña
            </h2>
            <p className="mt-4 text-stone-600 font-light">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          {error && (
            <div className="text-red-600 text-sm font-light text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm font-light text-center bg-green-50 p-3 rounded-md">
              {message}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-light tracking-wide"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/login"
              className="text-stone-600 hover:text-stone-800 font-light underline text-sm"
            >
              ← Volver al inicio de sesión
            </Link>
            <div>
              <span className="text-stone-600 font-light text-sm">
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
