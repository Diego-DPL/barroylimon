import { loadStripe } from '@stripe/stripe-js'

// Configuración de Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key. Please check your .env file.')
}

// Inicializar Stripe
export const stripePromise = loadStripe(stripePublishableKey)

// Configuración de Stripe para España
export const stripeConfig = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#44403c', // stone-700
      colorBackground: '#ffffff',
      colorText: '#1c1917', // stone-900
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: '6px',
    },
  },
  locale: 'es' as const,
}

// Tipos para los métodos de pago
export interface PaymentMethodData {
  billing_details: {
    name: string
    email: string
    address: {
      line1: string
      line2?: string
      city: string
      postal_code: string
      country: string
    }
  }
}

// Configuración para crear Payment Intent
export interface CreatePaymentIntentData {
  amount: number // En céntimos
  currency: string
  description: string
  metadata: {
    order_id: string
    user_id: string
  }
}
