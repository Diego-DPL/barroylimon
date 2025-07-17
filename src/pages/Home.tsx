// import { useState } from "react"
import { useState, useEffect } from "react"
import Button from "../components/ui/button"
import { ShoppingBag } from "lucide-react"
import LimonHero from '../assets/LimonAmpliado.jpg';
import LimonAcero from '../assets/Limon_collar_acero_dorado.JPG';
// import LogoPNG from '../assets/Logopng.png';
import NewsletterForm from "../components/NewsletterForm";
import Modal from "../components/ui/modal";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../contexts/CartContext";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { products, loading: productsLoading } = useProducts()
  const { addItem } = useCart()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo abrir si no se ha mostrado ya el de éxito
      if (!sessionStorage.getItem('newsletterModalShown')) {
        setIsModalOpen(true)
        sessionStorage.setItem('newsletterModalShown', 'true');
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleSuccess = () => {
    setIsModalOpen(false)
    setShowSuccessModal(true)
  }

  const scrollToProducts = () => {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={LimonHero}
            alt="Joyería arcilla mediterránea"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/50" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl lg:text-8xl font-light text-white mb-8 tracking-tight leading-none">
            Arcilla
            <br />
            <span className="italic font-serif">Mediterránea</span>
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Joyería artesanal inspirada en la tradición milenaria de la huerta murciana
          </p>
          <Button
            onClick={scrollToProducts}
            size="lg"
            className="bg-transparent border border-white text-white hover:bg-white hover:text-stone-900 px-12 py-4 text-lg font-light tracking-wide transition-all duration-300"
          >
            Descubrir Colección
            {/* <ArrowRight className="ml-3 h-5 w-5" /> */}
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-16 bg-white/50 animate-pulse" />
        </div>
      </section>

    {/* Welcome Section */}
    <section className="py-32 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="mb-8">
                <div className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-full text-sm font-light tracking-wide mb-8">
                    ¡Ya Disponible!
                </div>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-light text-stone-800 mb-8 tracking-tight leading-tight">
                Bienvenido a
                <br />
                <span className="italic font-serif text-amber-700">Barro y Limón</span>
            </h2>
            
            <p className="text-xl text-stone-600 mb-12 font-light max-w-3xl mx-auto leading-relaxed">
                Nuestra tienda online ya está abierta con nuestra primera colección 
                de joyería arcilla mediterránea. Descubre piezas únicas creadas a mano 
                por nuestros artesanos en la huerta murciana.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-8 h-8 bg-amber-600 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-light text-stone-800 mb-4">Colección Exclusiva</h3>
                    <p className="text-stone-600 font-light">Piezas únicas creadas a mano por nuestros artesanos</p>
                </div>
                
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-8 h-8 bg-amber-600 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-light text-stone-800 mb-4">Técnica Mediterránea</h3>
                    <p className="text-stone-600 font-light">Inspirado en la tradición alfarera de la huerta murciana</p>
                </div>
                
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-8 h-8 bg-amber-600 rounded-full"></div>
                    </div>
                    <h3 className="text-xl font-light text-stone-800 mb-4">Garantía Artesanal</h3>
                    <p className="text-stone-600 font-light">Cada pieza está respaldada por nuestra garantía de calidad</p>
                </div>
            </div>
        </div>
    </section>

      {/* Featured Products */}
      <section id="productos" className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-light text-stone-800 mb-6 tracking-tight">Piezas Selectas</h2>
            <div className="w-24 h-px bg-amber-600 mx-auto" />
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="text-stone-600 font-light">Cargando productos...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-stone-600 font-light">No hay productos disponibles</div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {products.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative mb-8 overflow-hidden">
                    <div className="aspect-[4/5] bg-stone-100">
                      <img
                        src={product.images?.[0]?.url || LimonAcero}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute top-6 left-6">
                      <span className="text-xs font-light tracking-widest text-stone-600 bg-white/90 px-3 py-1">
                        {product.categories?.[0] || 'Producto'}
                      </span>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-light text-stone-800 mb-2 tracking-wide">{product.name}</h3>
                    <p className="text-xl text-stone-600 font-light">{product.price}€</p>
                    <p className="text-sm text-stone-500 mt-2">Stock: {product.stock} unidades</p>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={() => addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        slug: product.slug,
                        image: product.images?.[0]?.url
                      })}
                      className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2 font-light tracking-wide inline-flex items-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Añadir al carrito
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-5xl font-light text-stone-800 mb-8 tracking-tight leading-tight">
                Tradición
                <br />
                <span className="italic font-serif text-amber-700">Artesanal</span>
              </h3>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed font-light">
                Cada pieza nace del encuentro entre la arcilla mediterránea y las manos expertas de nuestros artesanos.
                Un proceso que honra técnicas milenarias mientras abraza la innovación contemporánea.
              </p>
              <p className="text-lg text-stone-600 mb-12 leading-relaxed font-light">
                Desde los campos de Murcia, cada joya cuenta la historia de su origen, llevando
                consigo la esencia del sol mediterráneo y la sabiduría ancestral.
              </p>

              {/* <Button
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 px-8 py-3 font-light tracking-wide bg-transparent"
              >
                <Play className="mr-3 h-4 w-4" />
                Ver Proceso
              </Button> */}
            </div>

            <div className="relative">
              <div className="aspect-[4/5] bg-stone-100 overflow-hidden">
                <img
                  src={LimonAcero}
                  alt="Proceso artesanal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-100 -z-10" />
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-stone-200 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <blockquote className="text-4xl lg:text-5xl font-light italic leading-relaxed mb-12">
            "La belleza reside en la imperfección perfecta de lo hecho a mano"
          </blockquote>
          <div className="w-16 h-px bg-amber-600 mx-auto mb-8" />
          <p className="text-lg font-light text-stone-300 tracking-wide">FILOSOFÍA BARRO y LIMÓN</p>
        </div>
      </section>

      {/* Newsletter */}
        <section className="py-24 bg-amber-50">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                <h4 className="text-3xl font-light text-stone-800 mb-6 tracking-wide">
                Newsletter Exclusivo
                </h4>
                <p className="text-lg text-stone-600 mb-12 font-light">
                Suscríbete y recibe descuentos exclusivos, acceso anticipado a nuevas colecciones y noticias especiales
                </p>
                <NewsletterForm onSuccess={handleSuccess} />
            </div>
        </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center p-4">
            <div className="mb-4">
                <div className="inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-light tracking-wide">
                    🎁 Oferta Especial
                </div>
            </div>
            <h2 className="text-3xl font-light text-stone-800 mb-4 tracking-tight">
                ¡Únete a nuestro Newsletter!
            </h2>
            <p className="text-stone-600 mb-8 font-light leading-relaxed">
                Suscríbete ahora y obtén <strong>descuentos exclusivos</strong>, acceso anticipado a nuevas colecciones 
                y mantente al tanto de todo lo que ocurre en Barro y Limón. ¡No te pierdas nuestras ofertas especiales!
            </p>
            <NewsletterForm onSuccess={handleSuccess} />
        </div>
      </Modal>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <div className="text-center p-8">
            <div className="mb-4">
                <div className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-light tracking-wide">
                    ✅ ¡Suscrito con éxito!
                </div>
            </div>
            <h2 className="text-3xl font-light text-stone-800 mb-4 tracking-tight">
                ¡Bienvenido a la familia!
            </h2>
            <p className="text-stone-600 mb-8 font-light leading-relaxed">
                Ya formas parte de nuestro newsletter exclusivo. Recibirás descuentos especiales, 
                acceso anticipado a nuevas colecciones y estarás al tanto de todo lo que pasa en Barro y Limón.
            </p>
            <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-stone-800 hover:bg-stone-900 text-white px-8 py-3 font-light tracking-wide"
            >
                ¡Perfecto!
            </Button>
        </div>
      </Modal>
    </div>
  )
}
