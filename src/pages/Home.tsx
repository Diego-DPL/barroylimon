// import { useState } from "react"
import Button from "../components/ui/button"
// import { ShoppingBag, User, Search, Menu, ArrowRight, Play } from "lucide-react"
import LimonHero from '../assets/LimonAmpliado.jpg';
import LimonAcero from '../assets/Limon_collar_acero_dorado.JPG';
import LogoPNG from '../assets/Logopng.png';
import NewsletterForm from "../components/NewsletterForm";





export default function Home() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)

//   const featuredProducts = [
//     {
//       id: 1,
//       name: "Collar Limón Acero inoxidable",
//       price: "25",
//       image: LimonAcero,
//       category: "Nueva Colección",
//     },
//     {
//       id: 2,
//       name: "Pendientes Terracota",
//       price: "195",
//       image: "https://via.placeholder.com/400x500/d6d3d1/78716c?text=Pendientes+Terracota",
//       category: "Edición Limitada",
//     },
//     {
//       id: 3,
//       name: "Anillo Mediterráneo",
//       price: "245",
//       image: "https://via.placeholder.com/400x500/d6d3d1/78716c?text=Anillo+Mediterráneo",
//       category: "Exclusivo",
//     },
//   ]

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex items-center">
                <div className="text-2xl font-light tracking-wider text-stone-800">
                    BARRO<span className="text-amber-600">y</span>LIMÓN
                </div>
                <img 
                    src={LogoPNG} 
                    alt="Barro y Limón logo" 
                    className="w-8 h-8 ml-2 object-contain"
                />
            </a>

            {/* Desktop Navigation */}
            {/* <nav className="hidden lg:flex items-center space-x-12">
              <a
                href="/coleccion"
                className="text-stone-700 hover:text-stone-900 font-light tracking-wide transition-colors"
              >
                Colección
              </a>
              <a
                href="/alta-joyeria"
                className="text-stone-700 hover:text-stone-900 font-light tracking-wide transition-colors"
              >
                Joyería
              </a>
              <a
                href="/proceso"
                className="text-stone-700 hover:text-stone-900 font-light tracking-wide transition-colors"
              >
                Nuestro Proceso
              </a>

            </nav> */}

            {/* Actions */}
            {/* <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-900">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-900">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-900">
                <ShoppingBag className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-stone-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div> */}
          </div>
        </div>
      </header>

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
            size="lg"
            className="bg-transparent border border-white text-white hover:bg-white hover:text-stone-900 px-12 py-4 text-lg font-light tracking-wide transition-all duration-300"
          >
            Muy Pronto
            {/* <ArrowRight className="ml-3 h-5 w-5" /> */}
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-16 bg-white/50 animate-pulse" />
        </div>
      </section>

    {/* Coming Soon Section */}
    <section className="py-32 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="mb-8">
                <div className="inline-block px-6 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-light tracking-wide mb-8">
                    Próximamente
                </div>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-light text-stone-800 mb-8 tracking-tight leading-tight">
                Muy Pronto
                <br />
                <span className="italic font-serif text-amber-700">Disponible</span>
            </h2>
            
            <p className="text-xl text-stone-600 mb-12 font-light max-w-3xl mx-auto leading-relaxed">
                Estamos preparando con mimo cada detalle para ofrecerte la mejor experiencia. 
                Nuestra tienda online estará disponible muy pronto con nuestra primera colección 
                de joyería arcilla mediterránea.
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
      {/* <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-light text-stone-800 mb-6 tracking-tight">Piezas Selectas</h2>
            <div className="w-24 h-px bg-amber-600 mx-auto" />
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative mb-8 overflow-hidden">
                  <div className="aspect-[4/5] bg-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className="text-xs font-light tracking-widest text-stone-600 bg-white/90 px-3 py-1">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-light text-stone-800 mb-2 tracking-wide">{product.name}</h3>
                  <p className="text-xl text-stone-600 font-light">{product.price}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

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
                Manténgase Informado
                </h4>
                <p className="text-lg text-stone-600 mb-12 font-light">
                Reciba noticias exclusivas sobre nuevas colecciones y eventos especiales
                </p>
                <NewsletterForm />
            </div>
        </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-light tracking-wider text-white mb-6">
                BARRO<span className="text-amber-600">y</span>LIMÓN
              </div>
              <p className="text-stone-400 mb-8 max-w-md font-light leading-relaxed">
                Joyería arcilla mediterránea. Creaciones únicas inspiradas en la tradición artesanal de la
                huerta murciana.
              </p>
            </div>

            {/* <div>
              <h5 className="text-white font-light mb-6 tracking-wide">Información</h5>
              <ul className="space-y-3 text-stone-400 font-light">
                <li>
                  <a href="/cuidados" className="hover:text-white transition-colors">
                    Cuidado de Piezas
                  </a>
                </li>
                <li>
                  <a href="/envios" className="hover:text-white transition-colors">
                    Envíos
                  </a>
                </li>
                <li>
                  <a href="/devoluciones" className="hover:text-white transition-colors">
                    Devoluciones
                  </a>
                </li>
                <li>
                  <a href="/tallas" className="hover:text-white transition-colors">
                    Guía de Tallas
                  </a>
                </li>
              </ul>
            </div> */}

            <div>
              <h5 className="text-white font-light mb-6 tracking-wide">Contacto</h5>
              <ul className="space-y-3 text-stone-400 font-light">
                <li>Barro y Limón</li>
                <li>info@barroylimon.com</li>
                {/* <li>+34 968 000 000</li> */}
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 mt-12 pt-8 text-center text-stone-500 font-light">
            <p>&copy; 2025 Barro y Limón. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
