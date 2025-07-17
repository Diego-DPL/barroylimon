import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Términos y Condiciones de Venta</h1>
      
      <div className="prose prose-stone max-w-none">
        <p className="text-sm text-stone-600 mb-6">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">1. Información de la Empresa</h2>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p><strong>Denominación social:</strong> Barro y Limón</p>
            <p><strong>CIF:</strong> [TU_CIF]</p>
            <p><strong>Dirección:</strong> [TU_DIRECCIÓN_COMPLETA]</p>
            <p><strong>Email:</strong> info@barrolimon.com</p>
            <p><strong>Teléfono:</strong> [TU_TELÉFONO]</p>
            <p><strong>Registro Mercantil:</strong> [DATOS_REGISTRO_MERCANTIL]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">2. Objeto y Ámbito de Aplicación</h2>
          <p className="mb-4">
            Los presentes términos y condiciones regulan las ventas realizadas a través de nuestra tienda online 
            <strong> www.barrolimon.com</strong>, especializada en joyería artesanal.
          </p>
          <p className="mb-4">
            Al realizar un pedido, el cliente acepta expresamente estos términos y condiciones.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">3. Productos y Servicios</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">3.1 Descripción de Productos</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Todos los productos se describen con la máxima precisión posible</li>
            <li>Las fotografías son orientativas y pueden mostrar ligeras diferencias con el producto real</li>
            <li>Al tratarse de joyería artesanal, cada pieza puede tener características únicas</li>
            <li>Los materiales y dimensiones se especifican en cada producto</li>
          </ul>

          <h3 className="text-lg font-medium text-stone-700 mb-3">3.2 Disponibilidad y Stock</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Los productos están sujetos a disponibilidad</li>
            <li>En caso de falta de stock, se notificará al cliente en un plazo máximo de 48 horas</li>
            <li>Se ofrecerá un producto similar o la devolución del importe abonado</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">4. Precios y Formas de Pago</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">4.1 Precios</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Todos los precios se muestran en euros (€) e incluyen IVA</li>
            <li>Los gastos de envío se calculan según el destino y se muestran antes de la confirmación</li>
            <li>Los precios pueden modificarse sin previo aviso, pero se respetarán los de pedidos ya confirmados</li>
          </ul>

          <h3 className="text-lg font-medium text-stone-700 mb-3">4.2 Formas de Pago</h3>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-medium text-blue-800 mb-2">Métodos de Pago Aceptados:</p>
            <ul className="list-disc pl-6">
              <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
              <li>Apple Pay / Google Pay</li>
              <li>Bizum (próximamente)</li>
            </ul>
          </div>
          <p className="text-sm text-stone-600">
            El pago se procesa de forma segura a través de Stripe, certificado PCI DSS.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">5. Proceso de Compra</h2>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-stone-800 mb-4">Pasos del Proceso:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Selección de productos y añadir al carrito</li>
              <li>Revisión del carrito de compra</li>
              <li>Registro o inicio de sesión</li>
              <li>Introducción de datos de envío y facturación</li>
              <li>Selección del método de pago</li>
              <li>Confirmación del pedido</li>
              <li>Recepción de email de confirmación</li>
            </ol>
          </div>
          
          <p className="text-sm text-stone-600">
            Una vez confirmado el pedido, se considera formalizado el contrato de compraventa.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">6. Envíos y Entrega</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">6.1 Ámbito de Entrega</h3>
          <p className="mb-4">Realizamos envíos únicamente a:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>España peninsular</li>
            <li>Islas Baleares</li>
          </ul>
          <p className="text-sm text-stone-600 mb-4">
            No realizamos envíos a Canarias, Ceuta, Melilla ni al extranjero.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">6.2 Plazos de Entrega</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-stone-200 p-4 rounded-lg">
              <h4 className="font-medium text-stone-800">📦 Península</h4>
              <p className="text-sm text-stone-600">2-4 días laborables</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h4 className="font-medium text-stone-800">🏝️ Baleares</h4>
              <p className="text-sm text-stone-600">3-5 días laborables</p>
            </div>
          </div>

          <h3 className="text-lg font-medium text-stone-700 mb-3">6.3 Gastos de Envío</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Los gastos de envío se calculan según el destino y peso del pedido</li>
            <li>Envío gratuito en pedidos superiores a 50€ (España peninsular)</li>
            <li>Los gastos se muestran claramente antes de confirmar el pedido</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">7. Derecho de Desistimiento</h2>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">📅 Plazo: 14 días</h3>
            <p className="text-green-700">
              Dispones de 14 días naturales desde la recepción del producto para ejercer tu derecho de desistimiento.
            </p>
          </div>

          <h3 className="text-lg font-medium text-stone-700 mb-3">7.1 Condiciones para la Devolución</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>El producto debe estar en perfecto estado</li>
            <li>Conservar el embalaje original</li>
            <li>Incluir todos los accesorios y documentación</li>
            <li>No haber sido usado (salvo para examinar el producto)</li>
          </ul>

          <h3 className="text-lg font-medium text-stone-700 mb-3">7.2 Proceso de Devolución</h3>
          <ol className="list-decimal pl-6 mb-4">
            <li>Contactar con <strong>devoluciones@barrolimon.com</strong></li>
            <li>Recibir las instrucciones de devolución</li>
            <li>Enviar el producto en un plazo máximo de 14 días</li>
            <li>Recibir el reembolso en un plazo máximo de 14 días desde la recepción</li>
          </ol>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Excepciones</h4>
            <p className="text-yellow-700 text-sm">
              No se admiten devoluciones de productos personalizados o hechos a medida específicamente para el cliente.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">8. Garantías</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">8.1 Garantía Legal</h3>
          <p className="mb-4">
            Todos los productos tienen garantía legal de conformidad de 2 años según la normativa española.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">8.2 Garantía de Calidad</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Garantizamos la calidad de los materiales utilizados</li>
            <li>Ofrecemos servicio de reparación para nuestras piezas</li>
            <li>Asesoramiento para el cuidado y mantenimiento</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">9. Responsabilidad</h2>
          <p className="mb-4">
            Barro y Limón no se hace responsable de:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Retrasos en la entrega por causas ajenas a nuestra voluntad</li>
            <li>Daños causados por un uso inadecuado del producto</li>
            <li>Errores tipográficos en precios que sean manifiestamente incorrectos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">10. Protección de Datos</h2>
          <p className="mb-4">
            El tratamiento de tus datos personales se rige por nuestra 
            <a href="/privacy" className="text-purple-600 hover:text-purple-800 font-medium"> Política de Privacidad</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">11. Resolución de Conflictos</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">11.1 Legislación Aplicable</h3>
          <p className="mb-4">
            Estos términos se rigen por la legislación española.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">11.2 Resolución Extrajudicial</h3>
          <p className="mb-4">
            Para la resolución de controversias, el consumidor puede acudir a las Juntas Arbitrales de Consumo 
            o a la plataforma europea de resolución de litigios en línea: 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" 
               className="text-purple-600 hover:text-purple-800 font-medium"> https://ec.europa.eu/consumers/odr/</a>
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">11.3 Jurisdicción</h3>
          <p>
            Para cualquier controversia que pueda surgir, las partes se someten a los juzgados y tribunales 
            del domicilio del consumidor.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">12. Contacto</h2>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p className="mb-2">Para cualquier consulta sobre estos términos:</p>
            <p><strong>Email:</strong> legal@barrolimon.com</p>
            <p><strong>Teléfono:</strong> [TU_TELÉFONO]</p>
            <p><strong>Horario:</strong> Lunes a Viernes de 9:00 a 18:00h</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
