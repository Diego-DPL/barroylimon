import { Elements } from '@stripe/react-stripe-js'
import { stripePromise, stripeConfig } from '../lib/stripe'
import StripePaymentForm from './StripePaymentForm'

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

interface StripeCheckoutProps {
  amount: number
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void
  loading?: boolean
  billingData: BillingData
}

export default function StripeCheckout({ 
  amount, 
  clientSecret, 
  onSuccess, 
  onError,
  loading,
  billingData
}: StripeCheckoutProps) {
  const options = {
    clientSecret,
    ...stripeConfig,
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <StripePaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
        billingData={billingData}
      />
    </Elements>
  )
}
