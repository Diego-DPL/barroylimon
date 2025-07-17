import { useState } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import Button from './ui/button'

interface DiscountCodeApplicatorProps {
  subtotal: number
  onDiscountApplied: (discount: DiscountInfo | null) => void
  appliedDiscount: DiscountInfo | null
}

export interface DiscountInfo {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
}

export default function DiscountCodeApplicator({ 
  subtotal, 
  onDiscountApplied, 
  appliedDiscount 
}: DiscountCodeApplicatorProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateAndApplyCode = async () => {
    if (!code.trim()) {
      setError('Introduce un código de descuento')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Llamar a la función de validación
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_discount_code', {
          code_input: code.trim().toUpperCase(),
          order_total: subtotal
        })

      if (validationError) {
        console.error('Validation error:', validationError)
        setError('Error al validar el código. Por favor, inténtalo de nuevo.')
        return
      }

      // La función retorna JSON, verificamos la respuesta
      if (!validationResult || !validationResult.valid) {
        setError(validationResult?.message || 'Código de descuento no válido')
        return
      }

      // Obtener los detalles del código
      const { data: codeData, error: codeError } = await supabase
        .from('discount_codes')
        .select('id, code, discount_type, discount_value')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single()

      if (codeError || !codeData) {
        setError('Error al obtener los detalles del código')
        return
      }

      // Calcular el descuento
      let discountAmount = 0
      if (codeData.discount_type === 'percentage') {
        discountAmount = (subtotal * codeData.discount_value) / 100
      } else {
        discountAmount = Math.min(codeData.discount_value, subtotal)
      }

      // Aplicar el descuento
      const discountInfo: DiscountInfo = {
        id: codeData.id,
        code: codeData.code,
        discount_type: codeData.discount_type,
        discount_value: codeData.discount_value,
        discount_amount: discountAmount
      }

      onDiscountApplied(discountInfo)
      setCode('')
      setError('')

    } catch (error: any) {
      console.error('Error validating discount code:', error)
      
      // Si la función no existe, intentar validación básica
      if (error.message?.includes('Could not find the function')) {
        try {
          // Validación básica sin función
          const { data: codeData, error: codeError } = await supabase
            .from('discount_codes')
            .select('*')
            .eq('code', code.trim().toUpperCase())
            .eq('is_active', true)
            .single()

          if (codeError || !codeData) {
            setError('Código de descuento no válido')
            return
          }

          // Verificar fecha de expiración
          if (codeData.valid_until && new Date(codeData.valid_until) < new Date()) {
            setError('Este código de descuento ha expirado')
            return
          }

          // Calcular descuento
          let discountAmount = 0
          if (codeData.discount_type === 'percentage') {
            discountAmount = (subtotal * codeData.discount_value) / 100
          } else {
            discountAmount = Math.min(codeData.discount_value, subtotal)
          }

          // Aplicar el descuento
          const discountInfo: DiscountInfo = {
            id: codeData.id,
            code: codeData.code,
            discount_type: codeData.discount_type,
            discount_value: codeData.discount_value,
            discount_amount: discountAmount
          }

          onDiscountApplied(discountInfo)
          setCode('')
          setError('')
          return

        } catch (fallbackError) {
          console.error('Fallback validation failed:', fallbackError)
          setError('Error al validar el código de descuento')
          return
        }
      }
      
      setError(error.message || 'Error al validar el código de descuento')
    } finally {
      setLoading(false)
    }
  }

  const removeDiscount = () => {
    onDiscountApplied(null)
    setCode('')
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      validateAndApplyCode()
    }
  }

  const formatDiscountValue = (discount: DiscountInfo) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.discount_value}%`
    }
    return `${discount.discount_value.toFixed(2)}€`
  }

  return (
    <div className="bg-stone-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center">
        <Tag className="h-4 w-4 text-stone-600 mr-2" />
        <h3 className="text-sm font-medium text-stone-800">Código de Descuento</h3>
      </div>

      {appliedDiscount ? (
        // Mostrar código aplicado
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {appliedDiscount.code}
                </p>
                <p className="text-xs text-green-600">
                  Descuento del {formatDiscountValue(appliedDiscount)} aplicado
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-semibold text-green-800 mr-2">
                -{appliedDiscount.discount_amount.toFixed(2)}€
              </span>
              <button
                onClick={removeDiscount}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Quitar descuento"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Formulario para aplicar código
        <div className="space-y-2">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                onKeyPress={handleKeyPress}
                placeholder="Introduce tu código"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <Button
              onClick={validateAndApplyCode}
              disabled={loading || !code.trim()}
              size="sm"
              className="bg-stone-800 hover:bg-stone-900 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Aplicar'
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2">
              <div className="flex items-center">
                <X className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
