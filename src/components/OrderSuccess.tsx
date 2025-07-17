import { Check, Package, Heart, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './ui/button'

interface OrderSuccessProps {
  onClose: () => void
}

export default function OrderSuccess({ onClose }: OrderSuccessProps) {
  return (
    <div className="max-w-lg mx-auto p-8 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-light text-stone-800 mb-4">¡Muchas Gracias!</h1>
        <p className="text-lg text-stone-600 font-light mb-2">
          Tu pedido ha sido procesado correctamente.
        </p>
        <p className="text-stone-600 font-light">
          Gracias por confiar en nosotros. ¡Nos pondremos manos a la obra para que te llegue lo antes posible!
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg text-left">
          <User className="h-6 w-6 text-stone-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-stone-800 mb-1">Información del pedido</h3>
            <p className="text-sm text-stone-600">
              Puedes consultar todos los detalles de tu pedido en tu perfil de usuario.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg text-left">
          <Package className="h-6 w-6 text-stone-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-stone-800 mb-1">Próximos pasos</h3>
            <p className="text-sm text-stone-600">
              Nos pondremos en contacto contigo en las próximas 24 horas para confirmar 
              los detalles del pedido y coordinar el envío.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 bg-amber-50 rounded-lg text-left border border-amber-200">
          <Heart className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-stone-800 mb-1">¡Gracias por elegirnos!</h3>
            <p className="text-sm text-stone-600">
              Tu confianza significa mucho para nosotros. Trabajaremos con dedicación 
              para que recibas tus productos de cerámica artesanal en perfectas condiciones.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link to="/profile" onClick={onClose}>
          <Button className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-light">
            Ver mi perfil y pedidos
          </Button>
        </Link>
        
        <button
          onClick={onClose}
          className="w-full text-stone-600 hover:text-stone-800 py-3 transition-colors font-light"
        >
          Continuar comprando
        </button>
      </div>
    </div>
  )
}
