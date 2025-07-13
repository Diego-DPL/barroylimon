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

    // 1) Insert en la tabla de suscriptores y obtener el registro
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, user_id: userId })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      setFeedback({ success: false, message: 'No se ha podido suscribir. Inténtalo de nuevo.' })
      setLoading(false)
      return
    }

    // 2) Llamada a Edge Function para enviar welcome mail
    const { data, error } = await supabase.functions.invoke('send-welcome', {
      body: JSON.stringify({ email }),
    })

    if (error) {
      console.error('Function invocation error:', error)
      setFeedback({ success: false, message: 'Error al contactar el servicio de correo. Inténtalo más tarde.' })
    } else if (data.error) {
      // Error de negocio devuelto por la función
      console.error('Business logic error:', data.error)
      setFeedback({ success: false, message: data.error })
    } else {
      // Éxito
      console.log('send-welcome response:', data)
      setFeedback({ success: true, message: data.message || '¡Te has suscrito correctamente! Revisa tu correo.' })
    }

    setLoading(false)
    if (feedback?.success) {
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
        required
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
