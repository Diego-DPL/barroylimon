import React from 'react';

const ShippingReturns: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Envíos y Devoluciones</h1>
      
      <div className="prose prose-stone max-w-none">
        
        {/* Shipping Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b-2 border-purple-200 pb-2">📦 Información de Envíos</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-stone-800 mb-4">Zonas de Entrega</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">🇪🇸 España Peninsular</h4>
                <p className="text-sm text-blue-700">Envíos disponibles a toda la península</p>
                <p className="text-xs text-blue-600 mt-1">Tiempo: 2-4 días laborables</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">🏝️ Islas Baleares</h4>
                <p className="text-sm text-purple-700">Mallorca, Menorca, Ibiza, Formentera</p>
                <p className="text-xs text-purple-600 mt-1">Tiempo: 3-5 días laborables</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>❌ No realizamos envíos a:</strong> Canarias, Ceuta, Melilla, ni fuera de España
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-stone-800 mb-4">Costos de Envío</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-stone-200 rounded-lg">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-stone-800">Destino</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-800">Costo Estándar</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-800">Envío Gratuito</th>
                  <th className="px-4 py-3 text-left font-medium text-stone-800">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="px-4 py-3">España Peninsular</td>
                  <td className="px-4 py-3 text-green-600 font-medium">4,95€</td>
                  <td className="px-4 py-3 text-purple-600 font-medium">Desde 50€</td>
                  <td className="px-4 py-3">2-4 días</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Islas Baleares</td>
                  <td className="px-4 py-3 text-green-600 font-medium">7,95€</td>
                  <td className="px-4 py-3 text-purple-600 font-medium">Desde 75€</td>
                  <td className="px-4 py-3">3-5 días</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-stone-800 mb-4">Proceso de Envío</h3>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🛒</div>
              <h4 className="font-medium text-blue-800 mb-1">1. Pedido</h4>
              <p className="text-xs text-blue-600">Confirmas tu compra</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-yellow-800 mb-1">2. Preparación</h4>
              <p className="text-xs text-yellow-600">24-48h laborables</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">📦</div>
              <h4 className="font-medium text-green-800 mb-1">3. Envío</h4>
              <p className="text-xs text-green-600">Recibes código tracking</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🎉</div>
              <h4 className="font-medium text-purple-800 mb-1">4. Entrega</h4>
              <p className="text-xs text-purple-600">En tu domicilio</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📧 Seguimiento del Pedido</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Recibirás un email de confirmación al realizar el pedido</li>
              <li>• Te enviaremos el código de seguimiento cuando se envíe</li>
              <li>• Podrás trackear tu paquete en tiempo real</li>
              <li>• Notificación cuando esté próximo a entregarse</li>
            </ul>
          </div>
        </section>

        {/* Returns Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b-2 border-green-200 pb-2">↩️ Política de Devoluciones</h2>
          
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-green-800 mb-3">🕐 Plazo de Devolución: 14 días</h3>
            <p className="text-green-700 mb-4">
              Tienes 14 días naturales desde la recepción del producto para solicitar la devolución, 
              sin necesidad de justificar tu decisión.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ⚖️ Derecho reconocido por la Ley General para la Defensa de los Consumidores y Usuarios
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-stone-800 mb-4">Condiciones para Devoluciones</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3">✅ Se Acepta la Devolución</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Producto en perfecto estado, sin usar</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Embalaje original conservado</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Etiquetas y accesorios incluidos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Solicitud dentro del plazo</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-3">❌ No Se Acepta la Devolución</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Productos personalizados o hechos a medida</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Joyas con grabados personalizados</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Productos dañados por mal uso</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Fuera del plazo de 14 días</span>
                </li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-stone-800 mb-4">Cómo Realizar una Devolución</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-medium text-blue-800">Contacta con nosotros</h4>
                <p className="text-sm text-blue-700">
                  Envía un email a <strong>devoluciones@barrolimon.com</strong> con:
                </p>
                <ul className="text-xs text-blue-600 mt-1 ml-4">
                  <li>• Número de pedido</li>
                  <li>• Motivo de la devolución</li>
                  <li>• Fotos del producto (si hay algún problema)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-medium text-purple-800">Recibe las instrucciones</h4>
                <p className="text-sm text-purple-700">
                  Te enviaremos las instrucciones detalladas y la etiqueta de devolución prepagada.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-medium text-yellow-800">Empaqueta y envía</h4>
                <p className="text-sm text-yellow-700">
                  Empaqueta el producto en su embalaje original y pégale la etiqueta que te enviamos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h4 className="font-medium text-green-800">Recibe tu reembolso</h4>
                <p className="text-sm text-green-700">
                  Una vez recibido y verificado, procesaremos el reembolso en 7-14 días laborables.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg">
            <h4 className="font-medium text-stone-800 mb-2">💰 Información sobre Reembolsos</h4>
            <ul className="text-sm text-stone-700 space-y-1">
              <li>• El reembolso se realizará por el mismo método de pago utilizado</li>
              <li>• Los gastos de envío original no se reembolsan (excepto si hay error nuestro)</li>
              <li>• Los gastos de devolución son gratuitos (etiqueta prepagada)</li>
              <li>• Tiempo de procesamiento: 7-14 días laborables desde la recepción</li>
            </ul>
          </div>
        </section>

        {/* Special Care Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b-2 border-yellow-200 pb-2">💎 Cuidados Especiales</h2>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Embalaje y Protección</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📦</div>
                <h4 className="font-medium text-stone-800 mb-1">Embalaje Seguro</h4>
                <p className="text-xs text-stone-600">Cajas acolchadas y material protector</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="font-medium text-stone-800 mb-1">Seguro Incluido</h4>
                <p className="text-xs text-stone-600">Todos los envíos van asegurados</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📋</div>
                <h4 className="font-medium text-stone-800 mb-1">Tracking Completo</h4>
                <p className="text-xs text-stone-600">Seguimiento hasta la entrega</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-2xl font-bold text-stone-800 mb-6 border-b-2 border-purple-200 pb-2">📞 ¿Necesitas Ayuda?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Atención al Cliente</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-purple-700">📧 Email General</p>
                  <p className="text-sm text-purple-600">info@barrolimon.com</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">📦 Envíos y Devoluciones</p>
                  <p className="text-sm text-purple-600">devoluciones@barrolimon.com</p>
                </div>
                <div>
                  <p className="font-medium text-purple-700">📞 Teléfono</p>
                  <p className="text-sm text-purple-600">+34 600 000 000</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Horarios de Atención</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Lunes - Viernes:</span>
                  <span className="text-blue-600">9:00 - 18:00h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Sábados:</span>
                  <span className="text-blue-600">10:00 - 14:00h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Domingos:</span>
                  <span className="text-blue-600">Cerrado</span>
                </div>
              </div>
              <p className="text-xs text-blue-500 mt-3">
                Tiempo de respuesta promedio: 24 horas
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShippingReturns;
