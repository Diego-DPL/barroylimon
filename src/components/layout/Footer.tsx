import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-800 text-stone-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <div className="text-2xl font-light tracking-wider text-white mb-6">
              BARRO<span className="text-amber-600">y</span>LIMÓN
            </div>
            <p className="text-sm text-stone-300 mb-4">
              Joyería artesanal con alma. Cada pieza cuenta una historia única, 
              creada con amor y dedicación para acompañarte en tus momentos especiales.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/barroylimon" target="_blank" rel="noopener noreferrer"
                 className="text-stone-400 hover:text-purple-400 transition-colors">
                <Instagram size={20} />
              </a>
              {/* <a href="https://facebook.com/barroylimon" target="_blank" rel="noopener noreferrer"
                 className="text-stone-400 hover:text-purple-400 transition-colors">
                <Facebook size={20} />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              {/* <li>
                <Link to="/products" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Contacto
                </Link>
              </li> */}
              <li>
                <Link to="/profile" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Atención al Cliente</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Guía de Tallas
                </Link>
              </li>
              <li>
                <Link to="/care-guide" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Cuidado de Joyas
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-stone-300 hover:text-white transition-colors text-sm">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-purple-400" />
                <a href="mailto:info@barrolimon.com" 
                   className="text-stone-300 hover:text-white transition-colors text-sm">
                  info@barrolimon.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-purple-400" />
                <a href="tel:+34600000000" 
                   className="text-stone-300 hover:text-white transition-colors text-sm">
                  +34 600 000 000
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-purple-400 mt-0.5" />
                <div className="text-stone-300 text-sm">
                  <p>España</p>
                  <p className="text-xs text-stone-400">
                    Envíos a toda España peninsular y Baleares
                  </p>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-white mb-2">Horario de Atención</h5>
              <p className="text-xs text-stone-400">
                Lunes a Viernes: 9:00 - 18:00h<br />
                Sábados: 10:00 - 14:00h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Links Bar */}
      <div className="border-t border-stone-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
              <Link to="/legal" className="text-stone-400 hover:text-white transition-colors text-xs">
                Aviso Legal
              </Link>
              <Link to="/privacy" className="text-stone-400 hover:text-white transition-colors text-xs">
                Política de Privacidad
              </Link>
              <Link to="/cookies" className="text-stone-400 hover:text-white transition-colors text-xs">
                Política de Cookies
              </Link>
              <Link to="/terms" className="text-stone-400 hover:text-white transition-colors text-xs">
                Términos de Venta
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-stone-400 text-center md:text-right">
              <p>&copy; {currentYear} Barro y Limón. Todos los derechos reservados.</p>
              <p className="mt-1">Joyería artesanal española</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Brand Strip */}
      <div className="bg-stone-900 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-xs text-stone-500">
              <span>🔒 Pago seguro SSL</span>
              <span>📦 Envío 24-48h</span>
              <span>↩️ Devolución 14 días</span>
            </div>
            <div className="text-xs text-stone-500">
              Hecho con ❤️ en España
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
