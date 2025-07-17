import React, { useState } from 'react';

const CookiePolicy: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowBanner(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Política de Cookies</h1>
      
      <div className="prose prose-stone max-w-none">
        <p className="text-sm text-stone-600 mb-6">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">1. ¿Qué son las Cookies?</h2>
          <p className="mb-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. 
            Permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-blue-800 mb-2">🍪 Información que pueden contener:</h3>
            <ul className="list-disc pl-6 text-blue-700">
              <li>Preferencias de idioma y configuración</li>
              <li>Productos en el carrito de compra</li>
              <li>Información de sesión de usuario</li>
              <li>Datos estadísticos de navegación</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">2. Tipos de Cookies que Utilizamos</h2>
          
          <div className="space-y-6">
            <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-3">🔧 Cookies Técnicas (Necesarias)</h3>
              <p className="text-green-700 mb-2"><strong>Finalidad:</strong> Funcionamiento básico del sitio web</p>
              <p className="text-green-700 mb-2"><strong>Base legal:</strong> Interés legítimo (no requieren consentimiento)</p>
              <div className="text-sm text-green-600">
                <p><strong>Ejemplos:</strong></p>
                <ul className="list-disc pl-4">
                  <li>Mantener la sesión de usuario activa</li>
                  <li>Recordar productos en el carrito</li>
                  <li>Configuración de idioma y región</li>
                  <li>Seguridad y autenticación</li>
                </ul>
              </div>
            </div>

            <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-3">📊 Cookies de Análisis</h3>
              <p className="text-blue-700 mb-2"><strong>Finalidad:</strong> Medir y analizar el uso del sitio web</p>
              <p className="text-blue-700 mb-2"><strong>Base legal:</strong> Consentimiento del usuario</p>
              <div className="text-sm text-blue-600">
                <p><strong>Proveedores:</strong></p>
                <ul className="list-disc pl-4">
                  <li><strong>Google Analytics:</strong> Estadísticas de visitas y comportamiento</li>
                  <li><strong>Supabase Analytics:</strong> Métricas técnicas de rendimiento</li>
                </ul>
              </div>
            </div>

            <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-800 mb-3">🎯 Cookies de Personalización</h3>
              <p className="text-purple-700 mb-2"><strong>Finalidad:</strong> Recordar preferencias del usuario</p>
              <p className="text-purple-700 mb-2"><strong>Base legal:</strong> Consentimiento del usuario</p>
              <div className="text-sm text-purple-600">
                <p><strong>Funciones:</strong></p>
                <ul className="list-disc pl-4">
                  <li>Tema de colores preferido</li>
                  <li>Configuración de vista de productos</li>
                  <li>Historial de productos visitados</li>
                </ul>
              </div>
            </div>

            <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-orange-800 mb-3">📢 Cookies de Marketing</h3>
              <p className="text-orange-700 mb-2"><strong>Finalidad:</strong> Mostrar publicidad relevante</p>
              <p className="text-orange-700 mb-2"><strong>Base legal:</strong> Consentimiento del usuario</p>
              <div className="text-sm text-orange-600">
                <p><strong>Nota:</strong> Actualmente no utilizamos cookies de marketing, pero podríamos implementarlas en el futuro.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">3. Cookies de Terceros</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-stone-200 rounded-lg">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-stone-800">Proveedor</th>
                  <th className="px-4 py-2 text-left font-medium text-stone-800">Finalidad</th>
                  <th className="px-4 py-2 text-left font-medium text-stone-800">Duración</th>
                  <th className="px-4 py-2 text-left font-medium text-stone-800">Más Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="px-4 py-2 font-medium">Google Analytics</td>
                  <td className="px-4 py-2">Análisis de tráfico web</td>
                  <td className="px-4 py-2">2 años</td>
                  <td className="px-4 py-2">
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-purple-600 hover:text-purple-800 text-sm">Política Google</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Stripe</td>
                  <td className="px-4 py-2">Procesamiento de pagos</td>
                  <td className="px-4 py-2">Sesión</td>
                  <td className="px-4 py-2">
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-purple-600 hover:text-purple-800 text-sm">Política Stripe</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Supabase</td>
                  <td className="px-4 py-2">Autenticación y almacenamiento</td>
                  <td className="px-4 py-2">Sesión</td>
                  <td className="px-4 py-2">
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-purple-600 hover:text-purple-800 text-sm">Política Supabase</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">4. Gestión de Cookies</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">4.1 Configuración del Navegador</h3>
          <p className="mb-4">
            Puedes configurar tu navegador para aceptar, rechazar o eliminar cookies:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border border-stone-200 p-4 rounded-lg">
              <h4 className="font-medium text-stone-800 mb-2">🌐 Chrome</h4>
              <p className="text-sm text-stone-600">Configuración → Privacidad y seguridad → Cookies</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h4 className="font-medium text-stone-800 mb-2">🦊 Firefox</h4>
              <p className="text-sm text-stone-600">Opciones → Privacidad y seguridad → Cookies</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h4 className="font-medium text-stone-800 mb-2">🧭 Safari</h4>
              <p className="text-sm text-stone-600">Preferencias → Privacidad → Cookies</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h4 className="font-medium text-stone-800 mb-2">📱 Edge</h4>
              <p className="text-sm text-stone-600">Configuración → Cookies y permisos del sitio</p>
            </div>
          </div>

          <h3 className="text-lg font-medium text-stone-700 mb-3">4.2 Panel de Preferencias</h3>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
            <p className="mb-4">Gestiona tus preferencias de cookies para este sitio:</p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={acceptCookies}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                ✅ Aceptar Todas
              </button>
              <button 
                onClick={rejectCookies}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                ❌ Rechazar Opcionales
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
              >
                🔄 Configurar
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">5. Duración de las Cookies</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">⏰ Cookies de Sesión</h3>
              <p className="text-blue-700 text-sm">Se eliminan al cerrar el navegador</p>
              <ul className="list-disc pl-4 text-blue-600 text-sm mt-2">
                <li>Carrito de compra</li>
                <li>Sesión de usuario</li>
                <li>Datos de formularios</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">📅 Cookies Persistentes</h3>
              <p className="text-green-700 text-sm">Se mantienen por un tiempo determinado</p>
              <ul className="list-disc pl-4 text-green-600 text-sm mt-2">
                <li>Preferencias de usuario (1 año)</li>
                <li>Análisis web (2 años)</li>
                <li>Recordar login (30 días)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">6. Impacto de Rechazar Cookies</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Funcionalidades Afectadas</h3>
            <p className="text-yellow-700 text-sm mb-2">Si rechazas las cookies opcionales:</p>
            <ul className="list-disc pl-4 text-yellow-600 text-sm">
              <li>No recordaremos tus preferencias de navegación</li>
              <li>No podremos personalizar tu experiencia</li>
              <li>Los análisis de uso serán limitados</li>
              <li>Algunas funciones pueden no trabajar correctamente</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">7. Actualizaciones de la Política</h2>
          <p className="mb-4">
            Esta política de cookies puede ser actualizada periódicamente. Te notificaremos de cambios 
            significativos mediante aviso en nuestra web o por email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">8. Contacto</h2>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p className="mb-2">Para consultas sobre cookies:</p>
            <p><strong>Email:</strong> privacidad@barrolimon.com</p>
            <p><strong>Asunto:</strong> "Consulta sobre Cookies"</p>
          </div>
        </section>
      </div>

      {/* Banner de Cookies */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-800 text-white p-4 z-50">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm">
                🍪 Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra política de cookies.
                <a href="/cookies" className="text-purple-300 hover:text-purple-100 ml-1">Más información</a>
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={acceptCookies}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Aceptar
              </button>
              <button 
                onClick={rejectCookies}
                className="bg-stone-600 hover:bg-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Solo Necesarias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookiePolicy;
