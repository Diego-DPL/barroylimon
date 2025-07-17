import { useState, useEffect } from 'react'
import { Package, Calendar, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabaseClient'

interface UserOrder {
  id: string
  created_at: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  order_items: {
    id: string
    quantity: number
    unit_price: number
    product: {
      name: string
      images: { url: string }[]
    }
  }[]
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Pendiente', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Clock,
    description: 'Tu pedido está siendo procesado' 
  },
  confirmed: { 
    label: 'Confirmado', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: CheckCircle,
    description: 'Tu pedido ha sido confirmado y será preparado pronto' 
  },
  shipped: { 
    label: 'Enviado', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Truck,
    description: 'Tu pedido está en camino' 
  },
  delivered: { 
    label: 'Entregado', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    description: 'Tu pedido ha sido entregado' 
  },
  cancelled: { 
    label: 'Cancelado', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    description: 'Este pedido ha sido cancelado' 
  }
}

export default function UserOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            quantity,
            unit_price,
            product:products (
              name,
              images:product_images (url)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as unknown as UserOrder[] || [])
    } catch (error) {
      console.error('Error fetching user orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600">Cargando tus pedidos...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-light text-stone-800 mb-2">No tienes pedidos</h3>
        <p className="text-stone-600 mb-6">
          Cuando realices tu primera compra, aparecerá aquí.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2 rounded-lg font-light transition-colors"
        >
          Explorar productos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-stone-800">Mis Pedidos</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de pedidos */}
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status]
            const StatusIcon = statusConfig.icon
            
            return (
              <div
                key={order.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id 
                    ? 'border-stone-400 bg-stone-50 shadow-md' 
                    : 'border-stone-200 hover:bg-stone-50 hover:shadow-sm'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-stone-500" />
                    <span className="text-sm text-stone-600">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color} flex items-center space-x-1`}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-800">
                      Pedido #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-stone-600">
                      {order.order_items.length} artículo{order.order_items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-stone-800">
                      {order.total_amount.toFixed(2)}€
                    </p>
                    <button className="text-xs text-stone-600 hover:text-stone-800 transition-colors flex items-center mt-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detalles del pedido seleccionado */}
        <div>
          {selectedOrder ? (
            <div className="bg-white border border-stone-200 rounded-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-stone-800">
                  Pedido #{selectedOrder.id.slice(-8)}
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[selectedOrder.status].color} flex items-center space-x-2`}>
                  {(() => {
                    const StatusIcon = STATUS_CONFIG[selectedOrder.status].icon;
                    return <StatusIcon className="h-4 w-4" />;
                  })()}
                  <span>{STATUS_CONFIG[selectedOrder.status].label}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-stone-500" />
                  <span className="text-sm text-stone-600">
                    Pedido realizado el {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
                <p className="text-sm text-stone-600 pl-6">
                  {STATUS_CONFIG[selectedOrder.status].description}
                </p>
              </div>

              {/* Productos */}
              <div className="space-y-4">
                <h4 className="font-medium text-stone-800">Productos</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-stone-50 rounded-lg">
                      <div className="w-12 h-12 bg-stone-200 rounded overflow-hidden flex-shrink-0">
                        {item.product.images?.[0]?.url ? (
                          <img 
                            src={item.product.images[0].url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-stone-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-800 truncate">{item.product.name}</p>
                        <p className="text-sm text-stone-600">
                          Cantidad: {item.quantity} × {item.unit_price.toFixed(2)}€
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-stone-800">
                          {(item.quantity * item.unit_price).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total:</span>
                    <span>{selectedOrder.total_amount.toFixed(2)}€</span>
                  </div>
                </div>

                {/* Contacto para dudas */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>¿Tienes dudas sobre tu pedido?</strong><br />
                    Contáctanos y te ayudaremos con cualquier consulta.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-12 text-center sticky top-6">
              <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-600">Selecciona un pedido para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
