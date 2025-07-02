// components/NewsletterForm.tsx
'use client'
import { useState, type FormEvent } from 'react'
import { supabase } from '../utils/supabaseClient'

interface NewsletterResponse {
  success: boolean
  message: string
}

export default function NewsletterForm() {
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<NewsletterResponse | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback(null)

    if (!email) {
      setFeedback({ success: false, message: 'Introduce una dirección de correo.' })
      return
    }

    setLoading(true)
    
    // Obtener usuario actual (si está logueado)
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user.id || null

    // Insertar o actualizar suscriptor
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, user_id: userId },
        { onConflict: 'email' }
      )

    setLoading(false)

    if (error) {
      console.error('Error al suscribir:', error)
      setFeedback({ success: false, message: 'Hubo un error. Inténtalo de nuevo.' })
    } else {
      setFeedback({ success: true, message: '¡Te has suscrito correctamente!' })
      setEmail('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Su dirección de correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border-stone-300 bg-white px-6 py-4 text-stone-700 placeholder:text-stone-400 font-light rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-stone-800 hover:bg-stone-900 text-white px-8 py-4 font-light tracking-wide rounded disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Suscribirse'}
      </button>
      {feedback && (
        <p className={`mt-4 ${feedback.success ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.message}
        </p>
      )}
    </form>
  )
}
