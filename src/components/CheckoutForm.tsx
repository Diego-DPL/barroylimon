import { useState, useEffect } from 'react'
import { MapPin, Mail, CreditCard, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../utils/supabaseClient'
import { sendOrderConfirmationEmail } from '../utils/emailService'
import Button from './ui/button'
import StripeCheckout from './StripeCheckout'
import DiscountCodeApplicator from './DiscountCodeApplicator'
import type { DiscountInfo } from './DiscountCodeApplicator'

// Provincias de España (España peninsular y Baleares)
const SPAIN_PROVINCES = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén',
  'La Coruña', 'La Rioja', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra',
  'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Segovia', 'Sevilla', 'Soria', 'Tarragona',
  'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
]

// Códigos postales de España peninsular y Baleares
const ALLOWED_POSTAL_CODE_PREFIXES = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', // 01-10
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', // 11-20
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', // 21-30
  '31', '32', '33', '34', '36', '37', '38', '39', '40', '41', // 31-41 (sin 35-Canarias)
  '42', '43', '44', '45', '46', '47', '48', '49', '50'       // 42-50
]

interface CheckoutFormProps {
  onBack: () => void
  onSuccess: () => void
}

type CheckoutStep = 'shipping' | 'payment'

interface ShippingAddress {
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

interface BillingAddress extends ShippingAddress {
  same_as_shipping: boolean
}

interface CheckoutFormData {
  shipping: ShippingAddress
  billing: BillingAddress
  email: string
}

export default function CheckoutForm({ onBack, onSuccess }: CheckoutFormProps) {
  const { user } = useAuth()
  const { items, getTotalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null)

  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: {
      first_name: '',
      last_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'España',
      phone: ''
    },
    billing: {
      first_name: '',
      last_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'España',
      phone: '',
      same_as_shipping: true
    },
    email: user?.email || ''
  })

  // Estados para Stripe
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

  // Función para calcular el total final con descuentos
  const calculateFinalTotal = () => {
    const subtotal = getTotalPrice()
    if (appliedDiscount) {
      return Math.max(0, subtotal - appliedDiscount.discount_amount)
    }
    return subtotal
  }

  // Cargar datos del perfil del usuario si está autenticado
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        const [first_name, ...rest] = profile.full_name.split(' ')
        const last_name = rest.join(' ')
        
        setFormData(prev => ({
          ...prev,
          shipping: {
            ...prev.shipping,
            first_name: first_name || '',
            last_name: last_name || ''
          },
          billing: {
            ...prev.billing,
            first_name: first_name || '',
            last_name: last_name || ''
          }
        }))
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar información de envío
    if (!formData.shipping.first_name) newErrors.shipping_first_name = 'Nombre requerido'
    if (!formData.shipping.last_name) newErrors.shipping_last_name = 'Apellidos requeridos'
    if (!formData.shipping.address_line_1) newErrors.shipping_address_line_1 = 'Dirección requerida'
    if (!formData.shipping.city) newErrors.shipping_city = 'Ciudad requerida'
    if (!formData.shipping.province) newErrors.shipping_province = 'Provincia requerida'
    if (!formData.shipping.postal_code) newErrors.shipping_postal_code = 'Código postal requerido'
    if (!formData.shipping.phone) newErrors.shipping_phone = 'Teléfono requerido'
    if (!formData.email) newErrors.email = 'Email requerido'

    // Validar país (solo España)
    if (formData.shipping.country !== 'España') {
      newErrors.shipping_country = 'Solo realizamos envíos a España peninsular y Baleares'
    }

    // Validar provincia (debe estar en la lista)
    if (formData.shipping.province && !SPAIN_PROVINCES.includes(formData.shipping.province)) {
      newErrors.shipping_province = 'Provincia no válida para envíos'
    }

    // Validar código postal (España peninsular y Baleares)
    if (formData.shipping.postal_code) {
      const postalPrefix = formData.shipping.postal_code.substring(0, 2)
      if (!ALLOWED_POSTAL_CODE_PREFIXES.includes(postalPrefix)) {
        newErrors.shipping_postal_code = 'No realizamos envíos a esa zona. Solo España peninsular y Baleares.'
      }
    }

    // Validar información de facturación si es diferente
    if (!formData.billing.same_as_shipping) {
      if (!formData.billing.first_name) newErrors.billing_first_name = 'Nombre requerido'
      if (!formData.billing.last_name) newErrors.billing_last_name = 'Apellidos requeridos'
      if (!formData.billing.address_line_1) newErrors.billing_address_line_1 = 'Dirección requerida'
      if (!formData.billing.city) newErrors.billing_city = 'Ciudad requerida'
      if (!formData.billing.province) newErrors.billing_province = 'Provincia requerida'
      if (!formData.billing.postal_code) newErrors.billing_postal_code = 'Código postal requerido'
      if (!formData.billing.phone) newErrors.billing_phone = 'Teléfono requerido'

      // Validar país de facturación
      if (formData.billing.country !== 'España') {
        newErrors.billing_country = 'Solo aceptamos direcciones de facturación en España'
      }

      // Validar provincia de facturación
      if (formData.billing.province && !SPAIN_PROVINCES.includes(formData.billing.province)) {
        newErrors.billing_province = 'Provincia no válida'
      }

      // Validar código postal de facturación
      if (formData.billing.postal_code) {
        const postalPrefix = formData.billing.postal_code.substring(0, 2)
        if (!ALLOWED_POSTAL_CODE_PREFIXES.includes(postalPrefix)) {
          newErrors.billing_postal_code = 'Solo aceptamos códigos postales de España peninsular y Baleares'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!user) return

    if (currentStep === 'shipping') {
      // Paso 1: Procesar información de envío y crear payment intent
      await createPaymentIntent()
    }
  }

  const createPaymentIntent = async () => {
    setLoading(true)

    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // 1. Crear el pedido primero (sin confirmar)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: calculateFinalTotal(),
          subtotal_amount: getTotalPrice(),
          discount_code_id: appliedDiscount?.id || null,
          discount_amount: appliedDiscount?.discount_amount || 0,
          status: 'pending',
          shipping_first_name: formData.shipping.first_name,
          shipping_last_name: formData.shipping.last_name,
          shipping_address_line_1: formData.shipping.address_line_1,
          shipping_address_line_2: formData.shipping.address_line_2,
          shipping_city: formData.shipping.city,
          shipping_province: formData.shipping.province,
          shipping_postal_code: formData.shipping.postal_code,
          shipping_country: formData.shipping.country,
          shipping_phone: formData.shipping.phone,
          billing_first_name: formData.billing.same_as_shipping ? formData.shipping.first_name : formData.billing.first_name,
          billing_last_name: formData.billing.same_as_shipping ? formData.shipping.last_name : formData.billing.last_name,
          billing_address_line_1: formData.billing.same_as_shipping ? formData.shipping.address_line_1 : formData.billing.address_line_1,
          billing_address_line_2: formData.billing.same_as_shipping ? formData.shipping.address_line_2 : formData.billing.address_line_2,
          billing_city: formData.billing.same_as_shipping ? formData.shipping.city : formData.billing.city,
          billing_province: formData.billing.same_as_shipping ? formData.shipping.province : formData.billing.province,
          billing_postal_code: formData.billing.same_as_shipping ? formData.shipping.postal_code : formData.billing.postal_code,
          billing_country: formData.billing.same_as_shipping ? formData.shipping.country : formData.billing.country,
          billing_phone: formData.billing.same_as_shipping ? formData.shipping.phone : formData.billing.phone,
          email: formData.email
        })
        .select()
        .single()

      if (orderError) throw orderError
      if (!order) throw new Error('Error al crear el pedido')

      // Guardar el ID del pedido para uso posterior
      setCurrentOrderId(order.id)

      // 2. Crear los items del pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Crear Payment Intent con Stripe
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          amount: Math.round(calculateFinalTotal() * 100), // Convertir a céntimos
          currency: 'eur',
          description: `Pedido #${order.id} - Barro y Limón`,
          metadata: {
            order_id: order.id,
            user_id: user.id,
            discount_code_id: appliedDiscount?.id || null,
            discount_amount: appliedDiscount?.discount_amount || 0
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el payment intent')
      }

      const { client_secret } = await response.json()
      
      // 4. Guardar información y pasar al siguiente paso
      setClientSecret(client_secret)
      setCurrentStep('payment')

    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      alert(`Error al procesar el pedido: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      // Registrar el uso del código de descuento si se aplicó uno
      if (appliedDiscount && user) {
        try {
          const { data: usageResult, error: usageError } = await supabase
            .rpc('register_discount_code_usage', {
              code_id: appliedDiscount.id,
              order_id: currentOrderId, // Usar el ID del pedido actual
              discount_amount_applied: appliedDiscount.discount_amount
            })

          if (usageError) {
            console.error('Error registering discount code usage:', usageError)
          } else if (usageResult && !usageResult.success) {
            console.warn('Discount code usage registration warning:', usageResult.message)
          } else {
            console.log('Discount code usage registered successfully')
          }
        } catch (discountError) {
          console.error('Error registering discount code usage:', discountError)
          // No fallar el proceso por errores de registro de descuento
        }
      }

      // Actualizar stock de productos
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single()

        if (!product) continue

        await supabase
          .from('products')
          .update({
            stock: product.stock - item.quantity
          })
          .eq('id', item.id)
      }

      // Enviar email de confirmación del pedido
      if (currentOrderId && formData.email) {
        try {
          const emailResult = await sendOrderConfirmationEmail({
            orderId: currentOrderId,
            customerEmail: formData.email
          })

          if (emailResult.success) {
            console.log('Email de confirmación enviado exitosamente')
          } else {
            console.error('Error al enviar email de confirmación:', emailResult.error)
            // No fallar el proceso por errores de email
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
          // No fallar el proceso por errores de email
        }
      }

      // Limpiar carrito y mostrar éxito
      clearCart()
      onSuccess()

    } catch (error: any) {
      console.error('Error updating stock:', error)
      // Aún así continuar con el éxito, el pago ya se procesó
      clearCart()
      onSuccess()
    }
  }

  const handlePaymentError = (error: string) => {
    alert(`Error en el pago: ${error}`)
    // Opcionalmente, podrías volver al paso anterior
    setCurrentStep('shipping')
  }

  const updateFormData = (section: 'shipping' | 'billing', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleBillingToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        same_as_shipping: checked,
        // Si se marca como "igual que envío", copiar todos los datos
        ...(checked ? {
          first_name: prev.shipping.first_name,
          last_name: prev.shipping.last_name,
          address_line_1: prev.shipping.address_line_1,
          address_line_2: prev.shipping.address_line_2,
          city: prev.shipping.city,
          province: prev.shipping.province,
          postal_code: prev.shipping.postal_code,
          country: prev.shipping.country,
          phone: prev.shipping.phone
        } : {})
      }
    }))
  }

  if (currentStep === 'payment' && clientSecret) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setCurrentStep('shipping')}
            className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a información de envío</span>
          </button>
        </div>

        <StripeCheckout
          amount={Math.round(calculateFinalTotal() * 100)}
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          loading={loading}
          billingData={formData.billing.same_as_shipping ? {
            first_name: formData.shipping.first_name,
            last_name: formData.shipping.last_name,
            address_line_1: formData.shipping.address_line_1,
            address_line_2: formData.shipping.address_line_2,
            city: formData.shipping.city,
            province: formData.shipping.province,
            postal_code: formData.shipping.postal_code,
            country: formData.shipping.country,
            phone: formData.shipping.phone
          } : formData.billing}
        />
      </div>
    )
  }

  // Renderizar formulario de información de envío
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-stone-600 hover:text-stone-800 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al carrito</span>
        </button>
        
        <h2 className="text-2xl font-light text-stone-800">Información de Envío</h2>
        <p className="text-stone-600 mt-2">Completa tus datos para procesar el pedido</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-stone-700 mb-2">
            <Mail className="h-4 w-4" />
            <span>Email de contacto</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Información de Envío */}
        <div className="border border-stone-200 rounded-lg p-6">
          <h3 className="flex items-center space-x-2 text-lg font-medium text-stone-800 mb-4">
            <MapPin className="h-5 w-5" />
            <span>Dirección de Envío</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.shipping.first_name}
                onChange={(e) => updateFormData('shipping', 'first_name', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                required
              />
              {errors.shipping_first_name && <p className="text-red-500 text-xs mt-1">{errors.shipping_first_name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                value={formData.shipping.last_name}
                onChange={(e) => updateFormData('shipping', 'last_name', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                required
              />
              {errors.shipping_last_name && <p className="text-red-500 text-xs mt-1">{errors.shipping_last_name}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              value={formData.shipping.address_line_1}
              onChange={(e) => updateFormData('shipping', 'address_line_1', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
              placeholder="Calle, número, piso, puerta..."
              required
            />
            {errors.shipping_address_line_1 && <p className="text-red-500 text-xs mt-1">{errors.shipping_address_line_1}</p>}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Dirección adicional
            </label>
            <input
              type="text"
              value={formData.shipping.address_line_2}
              onChange={(e) => updateFormData('shipping', 'address_line_2', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
              placeholder="Información adicional (opcional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.shipping.city}
                onChange={(e) => updateFormData('shipping', 'city', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                required
              />
              {errors.shipping_city && <p className="text-red-500 text-xs mt-1">{errors.shipping_city}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Provincia *
              </label>
              <select
                value={formData.shipping.province}
                onChange={(e) => updateFormData('shipping', 'province', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                required
              >
                <option value="">Selecciona una provincia</option>
                {SPAIN_PROVINCES.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors.shipping_province && <p className="text-red-500 text-xs mt-1">{errors.shipping_province}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Código Postal *
              </label>
              <input
                type="text"
                value={formData.shipping.postal_code}
                onChange={(e) => updateFormData('shipping', 'postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                placeholder="28001"
                maxLength={5}
                required
              />
              {errors.shipping_postal_code && <p className="text-red-500 text-xs mt-1">{errors.shipping_postal_code}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                País *
              </label>
              <select
                value={formData.shipping.country}
                onChange={(e) => updateFormData('shipping', 'country', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 bg-stone-50"
                required
                disabled
              >
                <option value="España">España</option>
              </select>
              {errors.shipping_country && <p className="text-red-500 text-xs mt-1">{errors.shipping_country}</p>}
              <p className="text-xs text-stone-500 mt-1">Solo enviamos a España peninsular y Baleares</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.shipping.phone}
              onChange={(e) => updateFormData('shipping', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
              placeholder="+34 123 456 789"
              required
            />
            {errors.shipping_phone && <p className="text-red-500 text-xs mt-1">{errors.shipping_phone}</p>}
          </div>
        </div>

        {/* Información de Facturación */}
        <div className="border border-stone-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center space-x-2 text-lg font-medium text-stone-800">
              <CreditCard className="h-5 w-5" />
              <span>Dirección de Facturación</span>
            </h3>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.billing.same_as_shipping}
                onChange={(e) => handleBillingToggle(e.target.checked)}
                className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
              />
              <span className="text-sm text-stone-600">Igual que envío</span>
            </label>
          </div>

          {!formData.billing.same_as_shipping && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.billing.first_name}
                    onChange={(e) => updateFormData('billing', 'first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                    required
                  />
                  {errors.billing_first_name && <p className="text-red-500 text-xs mt-1">{errors.billing_first_name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.billing.last_name}
                    onChange={(e) => updateFormData('billing', 'last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                    required
                  />
                  {errors.billing_last_name && <p className="text-red-500 text-xs mt-1">{errors.billing_last_name}</p>}
                </div>
              </div>

              {/* Resto de campos de facturación igual que envío... */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.billing.address_line_1}
                  onChange={(e) => updateFormData('billing', 'address_line_1', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="Calle, número, piso, puerta..."
                  required
                />
                {errors.billing_address_line_1 && <p className="text-red-500 text-xs mt-1">{errors.billing_address_line_1}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Dirección adicional
                </label>
                <input
                  type="text"
                  value={formData.billing.address_line_2}
                  onChange={(e) => updateFormData('billing', 'address_line_2', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="Información adicional (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.billing.city}
                    onChange={(e) => updateFormData('billing', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                    required
                  />
                  {errors.billing_city && <p className="text-red-500 text-xs mt-1">{errors.billing_city}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Provincia *
                  </label>
                  <select
                    value={formData.billing.province}
                    onChange={(e) => updateFormData('billing', 'province', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                    required
                  >
                    <option value="">Selecciona una provincia</option>
                    {SPAIN_PROVINCES.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  {errors.billing_province && <p className="text-red-500 text-xs mt-1">{errors.billing_province}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    value={formData.billing.postal_code}
                    onChange={(e) => updateFormData('billing', 'postal_code', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                    placeholder="28001"
                    maxLength={5}
                    required
                  />
                  {errors.billing_postal_code && <p className="text-red-500 text-xs mt-1">{errors.billing_postal_code}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    País *
                  </label>
                  <select
                    value={formData.billing.country}
                    onChange={(e) => updateFormData('billing', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 bg-stone-50"
                    required
                    disabled
                  >
                    <option value="España">España</option>
                  </select>
                  {errors.billing_country && <p className="text-red-500 text-xs mt-1">{errors.billing_country}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.billing.phone}
                  onChange={(e) => updateFormData('billing', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="+34 123 456 789"
                  required
                />
                {errors.billing_phone && <p className="text-red-500 text-xs mt-1">{errors.billing_phone}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Resumen del pedido */}
        <div className="border border-stone-200 rounded-lg p-6 bg-stone-50">
          <h3 className="text-lg font-medium text-stone-800 mb-4">Resumen del Pedido</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            ))}
          </div>
          
          {/* Aplicador de código de descuento */}
          <div className="mt-4">
            <DiscountCodeApplicator
              subtotal={getTotalPrice()}
              onDiscountApplied={setAppliedDiscount}
              appliedDiscount={appliedDiscount}
            />
          </div>

          <div className="border-t border-stone-300 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{getTotalPrice().toFixed(2)}€</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({appliedDiscount.code}):</span>
                <span>-{appliedDiscount.discount_amount.toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg border-t border-stone-300 pt-2">
              <span>Total:</span>
              <span>{calculateFinalTotal().toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Botón de continuar */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Continuar al Pago</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}
