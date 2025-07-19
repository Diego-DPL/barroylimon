import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCart } from '../contexts/CartContext'
import { ShoppingBag, ArrowLeft, Share2, Minus, Plus, Copy, Check, Facebook, Twitter } from 'lucide-react'
import Button from '../components/ui/button'
import ProductCategories from '../components/ProductCategories'

export default function Product() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(slug || '')
  const { relatedProducts, loading: relatedLoading } = useRelatedProducts(
    product?.id || '', 
    product?.categories || [], 
    3
  )
  const { addItem } = useCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-stone-600 font-light">Cargando producto...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light text-stone-800 mb-4">Producto no encontrado</h1>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="font-light"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        image: product.images?.[0]?.url
      })
    }
    // Reset quantity after adding to cart
    setQuantity(1)
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // Share functionality
  const currentUrl = window.location.href
  const shareTitle = `${product?.name} - Barro y Limón`
  const shareDescription = product?.description || `Descubre ${product?.name}, joyería artesanal de arcilla mediterránea.`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${currentUrl}`)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Si no hay soporte nativo, mostrar el menú personalizado
      setShowShareMenu(!showShareMenu)
    }
  }

  const currentImage = product.images?.[selectedImageIndex]
  const hasMultipleImages = product.images && product.images.length > 1

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-stone-600 hover:text-stone-900 transition-colors font-light"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square bg-stone-100 overflow-hidden rounded-lg">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-stone-400 text-center">
                    <ShoppingBag className="mx-auto h-16 w-16 mb-4" />
                    <p className="font-light">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-stone-100 overflow-hidden rounded-md border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-amber-600'
                        : 'border-transparent hover:border-stone-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">

            {/* Title & Price */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-light text-stone-800 mb-4 tracking-tight">
                {product.name}
              </h1>
              <div className="text-3xl font-light text-stone-900 mb-2">
                {product.price}€
              </div>
              <p className="text-sm text-stone-500">
                Stock disponible: {product.stock} unidades
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-stone max-w-none">
                <p className="text-lg text-stone-600 font-light leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 border border-stone-300 rounded-md hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-light text-stone-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-stone-300 rounded-md hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-stone-800 hover:bg-amber-600 hover:scale-105 hover:shadow-lg text-white py-4 text-lg font-light tracking-wide transition-all duration-300 ease-out"
                size="lg"
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                {product.stock === 0 ? 'Sin stock' : `Añadir ${quantity} al carrito`}
              </Button>

              {/* Secondary Actions */}
              <div className="flex justify-center">
                <div className="relative w-full share-menu-container">
                  <Button
                    onClick={shareViaNative}
                    variant="outline"
                    className="w-full font-light py-4 text-lg tracking-wide"
                    size="lg"
                  >
                    <Share2 className="mr-3 h-5 w-5" />
                    Compartir
                  </Button>

                  {/* Custom Share Menu */}
                  {showShareMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={copyToClipboard}
                          className="w-full flex items-center px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded transition-colors"
                        >
                          {copySuccess ? (
                            <>
                              <Check className="mr-3 h-4 w-4 text-green-600" />
                              ¡Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-3 h-4 w-4" />
                              Copiar enlace
                            </>
                          )}
                        </button>

                        <button
                          onClick={shareOnWhatsApp}
                          className="w-full flex items-center px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded transition-colors"
                        >
                          <div className="mr-3 h-4 w-4 bg-green-500 rounded"></div>
                          WhatsApp
                        </button>

                        <button
                          onClick={shareOnFacebook}
                          className="w-full flex items-center px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded transition-colors"
                        >
                          <Facebook className="mr-3 h-4 w-4 text-blue-600" />
                          Facebook
                        </button>

                        <button
                          onClick={shareOnTwitter}
                          className="w-full flex items-center px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded transition-colors"
                        >
                          <Twitter className="mr-3 h-4 w-4 text-blue-400" />
                          Twitter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-stone-200 pt-8">
              <h3 className="text-lg font-medium text-stone-900 mb-4">Detalles del producto</h3>
              <div className="space-y-3 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span className="font-light">Material:</span>
                  <span>Arcilla mediterránea</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light">Técnica:</span>
                  <span>Hecho a mano</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light">Origen:</span>
                  <span>Huerta murciana</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light">Garantía:</span>
                  <span>Artesanal premium</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-stone-600 uppercase tracking-widest">
                  Categorías
                </h3>
                <ProductCategories 
                  categories={product.categories} 
                  variant="detail" 
                  showType={true}
                />
              </div>
            )}

            {/* Care Instructions */}
            <div className="border-t border-stone-200 pt-8">
              <h3 className="text-lg font-medium text-stone-900 mb-4">Cuidados</h3>
              <div className="space-y-2 text-sm text-stone-600 font-light">
                <p>• Limpiar con paño suave y seco</p>
                <p>• Evitar el contacto con productos químicos</p>
                <p>• Guardar en lugar seco</p>
                <p>• Manipular con cuidado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="border-t border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-stone-800 tracking-tight">
              También te puede interesar
            </h2>
            <div className="w-16 h-px bg-amber-600 mx-auto mt-4" />
          </div>
          
          {relatedLoading ? (
            <div className="text-center py-12">
              <div className="text-stone-600 font-light">Cargando productos relacionados...</div>
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 font-light">
                No hay productos relacionados disponibles
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group">
                  <Link to={`/producto/${relatedProduct.slug}`} className="block">
                    <div className="relative mb-6 overflow-hidden cursor-pointer">
                      <div className="aspect-[4/5] bg-stone-100 rounded-lg">
                        <img
                          src={relatedProduct.images?.[0]?.url || '/placeholder-product.jpg'}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-lg"
                        />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="text-xs font-light tracking-widest text-stone-600 bg-white/90 px-2 py-1 rounded-full">
                          {relatedProduct.categories?.[0]?.name || 'Producto'}
                        </span>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-light text-stone-800 mb-2 tracking-wide group-hover:text-amber-700 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg text-stone-600 font-light">{relatedProduct.price}€</p>
                      
                      {/* Mostrar categorías */}
                      <div className="mt-2">
                        <ProductCategories 
                          categories={relatedProduct.categories || []} 
                          variant="badge" 
                        />
                      </div>
                    </div>
                  </Link>

                  <div className="text-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        addItem({
                          id: relatedProduct.id,
                          name: relatedProduct.name,
                          price: relatedProduct.price,
                          slug: relatedProduct.slug,
                          image: relatedProduct.images?.[0]?.url
                        })
                      }}
                      className="bg-stone-800 hover:bg-amber-600 hover:scale-105 hover:shadow-lg text-white px-4 py-2 font-light tracking-wide inline-flex items-center gap-2 transition-all duration-300 ease-out"
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Añadir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
