import { useState, useEffect } from 'react'
import { Package, Eye, Truck, CheckCircle, XCircle, Calendar, User, MapPin, Phone, Mail } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import Button from '../components/ui/button'

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_first_name: string
  shipping_last_name: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_postal_code: string
  shipping_phone: string
  email: string
  order_items: {
    id: string
    product_id: string
    quantity: number
    unit_price: number
    product: {
      name: string
      images: { url: string }[]
    }
  }[]
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            product:products (
              name,
              images:product_images (url)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(orderId)
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Actualizar el estado local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
      }

    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado del pedido')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<string, Order['status']> = {
      pending: 'confirmed',
      confirmed: 'shipped',
      shipped: 'delivered'
    }

    return statusFlow[currentStatus] || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light text-stone-800">Gestión de Pedidos</h1>
        <div className="text-sm text-stone-600">
          Total: {orders.length} pedidos
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-light text-stone-800 mb-2">No hay pedidos</h3>
          <p className="text-stone-600">Los pedidos aparecerán aquí cuando los clientes realicen compras.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de pedidos */}
          <div className="space-y-4">
            <h2 className="text-xl font-light text-stone-800">Pedidos Recientes</h2>
            <div className="space-y-3">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status]
                const StatusIcon = statusConfig.icon
                
                return (
                  <div
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id 
                        ? 'border-stone-400 bg-stone-50' 
                        : 'border-stone-200 hover:bg-stone-50'
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
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} flex items-center space-x-1`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-800">
                          {order.shipping_first_name} {order.shipping_last_name}
                        </p>
                        <p className="text-sm text-stone-600">
                          {order.order_items.length} artículo{order.order_items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-stone-800">
                          {order.total_amount.toFixed(2)}€
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detalles del pedido seleccionado */}
          <div>
            {selectedOrder ? (
              <div className="bg-white border border-stone-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-stone-800">
                    Pedido #{selectedOrder.id.slice(-8)}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                      <>
                        {getNextStatus(selectedOrder.status) && (
                          <Button
                            onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                            disabled={updatingStatus === selectedOrder.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {updatingStatus === selectedOrder.id ? 'Actualizando...' : 
                             `Marcar como ${STATUS_CONFIG[getNextStatus(selectedOrder.status)!].label}`}
                          </Button>
                        )}
                        <Button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                          disabled={updatingStatus === selectedOrder.id}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 border-red-300"
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-stone-800 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-600">Nombre:</p>
                      <p className="font-medium">{selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                    </div>
                    <div>
                      <p className="text-stone-600">Email:</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {selectedOrder.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-600">Teléfono:</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedOrder.shipping_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-600">Fecha:</p>
                      <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Dirección de envío */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-stone-800 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Dirección de Envío
                  </h3>
                  <div className="text-sm bg-stone-50 p-3 rounded">
                    <p>{selectedOrder.shipping_address_line_1}</p>
                    {selectedOrder.shipping_address_line_2 && (
                      <p>{selectedOrder.shipping_address_line_2}</p>
                    )}
                    <p>{selectedOrder.shipping_postal_code} {selectedOrder.shipping_city}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="space-y-4">
                  <h3 className="font-medium text-stone-800">Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-stone-50 rounded">
                        <div className="w-12 h-12 bg-stone-200 rounded overflow-hidden">
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
                        <div className="flex-1">
                          <p className="font-medium text-stone-800">{item.product.name}</p>                        <p className="text-sm text-stone-600">
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
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span>Total:</span>
                      <span>{selectedOrder.total_amount.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-12 text-center">
                <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-600">Selecciona un pedido para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
