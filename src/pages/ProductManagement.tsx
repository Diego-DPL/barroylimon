import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Plus, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react'
import type { Product } from '../hooks/useProducts'
import Button from '../components/ui/button'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories!inner (
            categories (
              name
            )
          ),
          product_images (
            id,
            url,
            alt_text,
            position
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedProducts: Product[] = (data || []).map(product => ({
        ...product,
        categories: product.product_categories?.map((pc: any) => pc.categories.name) || [],
        images: product.product_images || []
      }))

      setProducts(transformedProducts)
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId)

      if (error) throw error

      // Actualizar el estado local
      setProducts(products.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      ))
    } catch (err: any) {
      console.error('Error updating stock:', err)
      alert('Error al actualizar el stock')
    }
  }

  const toggleProductVisibility = async (productId: string, currentStock: number) => {
    // Si el stock es 0, lo ponemos en 1 para "activar", si es > 0, lo ponemos en 0 para "desactivar"
    const newStock = currentStock > 0 ? 0 : 1
    await updateProductStock(productId, newStock)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-stone-900 mb-2">Gestión de Productos</h1>
              <p className="text-stone-600">
                Administra el catálogo de productos y controla el inventario.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setIsModalOpen(true)
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 font-light tracking-wide inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image */}
              <div className="aspect-square bg-stone-100 relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-stone-300" />
                  </div>
                )}
                
                {/* Stock status badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? 'Disponible' : 'Sin stock'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-stone-900 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-stone-600 mb-2">
                  {product.categories?.[0]?.name || 'Sin categoría'}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-light text-stone-900">
                    {product.price}€
                  </span>
                  <span className="text-sm text-stone-600">
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(e) => updateProductStock(product.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-stone-300 rounded text-sm"
                  />
                  <button
                    onClick={() => toggleProductVisibility(product.id, product.stock)}
                    className={`p-1 rounded transition-colors ${
                      product.stock > 0
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={product.stock > 0 ? 'Ocultar producto' : 'Mostrar producto'}
                  >
                    {product.stock > 0 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingProduct(product)
                      setIsModalOpen(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                        // TODO: Implementar eliminación
                        console.log('Delete product:', product.id)
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No hay productos</h3>
            <p className="text-stone-600 mb-6">Comienza agregando tu primer producto al catálogo.</p>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setIsModalOpen(true)
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          </div>
        )}
      </div>

      {/* TODO: Modal para crear/editar productos */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-stone-900 mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <p className="text-stone-600 mb-6">
              La funcionalidad de crear/editar productos se implementará próximamente.
            </p>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
