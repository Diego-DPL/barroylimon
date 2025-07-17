import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CheckoutForm from './CheckoutForm'
import OrderSuccess from './OrderSuccess'
import Button from './ui/button'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type CheckoutStep = 'auth-choice' | 'login' | 'register' | 'form' | 'success'

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { user } = useAuth()
  const { items } = useCart()
  const [step, setStep] = useState<CheckoutStep>('auth-choice')

  // Si el usuario está autenticado, ir directamente al formulario
  useEffect(() => {
    if (user && step === 'auth-choice') {
      setStep('form')
    }
  }, [user, step])

  // Si no hay items en el carrito, cerrar el modal (excepto si estamos mostrando el éxito)
  useEffect(() => {
    if (isOpen && items.length === 0 && step !== 'success') {
      onClose()
    }
  }, [isOpen, items.length, onClose, step])

  // Si no está abierto, no mostrar nada
  if (!isOpen) return null

  const handleBackToCart = () => {
    setStep('auth-choice')
    onClose()
  }

  const handleOrderSuccess = () => {
    setStep('success')
  }

  const handleCloseSuccess = () => {
    setStep('auth-choice')
    onClose()
  }

  const renderContent = () => {
    switch (step) {
      case 'auth-choice':
        return (
          <div className="max-w-md mx-auto p-6 text-center">
            <h2 className="text-2xl font-light text-stone-800 mb-4">Finalizar Compra</h2>
            <p className="text-stone-600 mb-8">
              Para continuar con tu pedido, necesitas iniciar sesión o crear una cuenta.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => setStep('login')}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-light"
              >
                Iniciar Sesión
              </Button>
              
              <Button
                onClick={() => setStep('register')}
                variant="outline"
                className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 py-3 font-light"
              >
                Crear Cuenta
              </Button>
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 text-stone-600 hover:text-stone-800 text-sm transition-colors"
            >
              Continuar sin cuenta (próximamente)
            </button>
          </div>
        )

      case 'login':
        return (
          <div>
            <Login 
              onSuccess={() => setStep('form')}
              onSwitchToRegister={() => setStep('register')}
              onBack={() => setStep('auth-choice')}
              showBackButton={true}
            />
          </div>
        )

      case 'register':
        return (
          <div>
            <Register 
              onSuccess={() => setStep('form')}
              onSwitchToLogin={() => setStep('login')}
              onBack={() => setStep('auth-choice')}
              showBackButton={true}
            />
          </div>
        )

      case 'form':
        return (
          <CheckoutForm 
            onBack={handleBackToCart}
            onSuccess={handleOrderSuccess}
          />
        )

      case 'success':
        return (
          <OrderSuccess onClose={handleCloseSuccess} />
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 bg-opacity-50 z-40"
        onClick={step === 'success' ? undefined : onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </>
  )
}
