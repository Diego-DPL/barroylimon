import { useState } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import CheckoutModal from './CheckoutModal'
import Button from './ui/button'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  const handleCheckout = () => {
    setShowCheckout(true)
  }

  const handleCloseCheckout = () => {
    setShowCheckout(false)
    // Solo cerrar el carrito cuando se cancela o completa el checkout
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <h2 className="text-2xl font-light text-stone-800">
              Carrito ({getTotalItems()})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-stone-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ShoppingBag className="h-16 w-16 text-stone-300 mb-4" />
                <h3 className="text-lg font-light text-stone-800 mb-2">Tu carrito está vacío</h3>
                <p className="text-stone-600 font-light">Añade algunos productos para empezar</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-stone-100 last:border-b-0">
                    {/* Image */}
                    <div className="w-20 h-20 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-stone-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-stone-800 truncate">{item.name}</h4>
                      <p className="text-sm text-stone-600">{item.price}€</p>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 rounded transition-colors"
                        >
                          <Minus className="h-3 w-3 text-stone-600" />
                        </button>
                        <span className="text-sm font-medium text-stone-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 rounded transition-colors"
                        >
                          <Plus className="h-3 w-3 text-stone-600" />
                        </button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 p-6 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-medium">
                <span className="text-stone-800">Total:</span>
                <span className="text-stone-800">{getTotalPrice().toFixed(2)}€</span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3 font-light tracking-wide"
                >
                  Finalizar Compra
                </Button>
                
                <button
                  onClick={clearCart}
                  className="w-full text-stone-600 hover:text-stone-800 text-sm font-light py-2 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              {/* Info */}
              <p className="text-xs text-stone-500 text-center">
                Nos pondremos en contacto contigo para confirmar el pedido y coordinar el envío.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={handleCloseCheckout} 
      />
    </>
  )
}
