import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import Button from './ui/button'

interface BillingData {
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  postal_code: string
  country: string
  phone: string
}

interface StripePaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
  loading?: boolean
  billingData: BillingData
}

export default function StripePaymentForm({ 
  amount, 
  onSuccess, 
  onError,
  loading: externalLoading = false,
  billingData
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setMessage(null)

    // Confirmar el pago
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // URL de retorno después del pago
        return_url: `${window.location.origin}/checkout/success`,
        // Datos de facturación requeridos
        payment_method_data: {
          billing_details: {
            name: `${billingData.first_name} ${billingData.last_name}`,
            phone: billingData.phone,
            address: {
              line1: billingData.address_line_1,
              line2: billingData.address_line_2 || undefined,
              city: billingData.city,
              state: billingData.province,
              postal_code: billingData.postal_code,
              country: 'ES' // España
            }
          }
        }
      },
      redirect: 'if_required',
    })

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Error al procesar el pago')
        onError(error.message || 'Error al procesar el pago')
      } else {
        setMessage('Ha ocurrido un error inesperado.')
        onError('Ha ocurrido un error inesperado.')
      }
    } else {
      // El pago se completó con éxito
      onSuccess()
    }

    setLoading(false)
  }

  const isLoading = loading || externalLoading

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-stone-800">Información de Pago</h3>
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <Lock className="h-4 w-4" />
            <span>Pago seguro</span>
          </div>
        </div>
        
        <div className="bg-stone-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-stone-600">Total a pagar:</span>
            <span className="text-xl font-medium text-stone-800">
              {(amount / 100).toFixed(2)}€
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Elemento de pago de Stripe */}
        <div className="border border-stone-200 rounded-lg p-4">
          <PaymentElement 
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
              defaultValues: {
                billingDetails: {
                  name: `${billingData.first_name} ${billingData.last_name}`,
                  address: {
                    country: 'ES',
                  }
                }
              }
            }}
          />
        </div>

        {/* Mensaje de error */}
        {message && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{message}</p>
          </div>
        )}

        {/* Botón de pago */}
        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Procesando pago...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Pagar {(amount / 100).toFixed(2)}€</span>
            </div>
          )}
        </Button>

        {/* Información de seguridad */}
        <div className="text-xs text-stone-500 text-center">
          <p>
            Tu información de pago está protegida con cifrado SSL de 256 bits.
            Procesado de forma segura por Stripe.
          </p>
        </div>
      </form>
    </div>
  )
}
