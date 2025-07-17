// utils/emailService.ts
import { supabase } from './supabaseClient'

interface SendOrderEmailParams {
  orderId: string
  customerEmail: string
}

export const sendOrderConfirmationEmail = async ({ orderId, customerEmail }: SendOrderEmailParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Usuario no autenticado')
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        orderId,
        customerEmail
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al enviar el email de confirmación')
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('Email de confirmación enviado exitosamente')
      return { success: true }
    } else {
      throw new Error(result.error || 'Error al enviar el email')
    }

  } catch (error: any) {
    console.error('Error sending order confirmation email:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

export default {
  sendOrderConfirmationEmail
}
