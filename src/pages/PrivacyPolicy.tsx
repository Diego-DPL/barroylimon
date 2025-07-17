import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Política de Privacidad</h1>
      
      <div className="prose prose-stone max-w-none">
        <p className="text-sm text-stone-600 mb-6">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">1. Responsable del Tratamiento</h2>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p><strong>Denominación social:</strong> Barro y Limón</p>
            <p><strong>CIF:</strong> [TU_CIF]</p>
            <p><strong>Dirección:</strong> [TU_DIRECCIÓN_COMPLETA]</p>
            <p><strong>Email:</strong> info@barrolimon.com</p>
            <p><strong>Teléfono:</strong> [TU_TELÉFONO]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">2. Datos que Recopilamos</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">2.1 Datos de Registro y Cuenta</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Contraseña (encriptada)</li>
            <li>Fecha de registro</li>
          </ul>

          <h3 className="text-lg font-medium text-stone-700 mb-3">2.2 Datos de Pedidos</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Información de envío (nombre, dirección, teléfono)</li>
            <li>Información de facturación</li>
            <li>Historial de pedidos y compras</li>
            <li>Preferencias de productos</li>
          </ul>

          <h3 className="text-lg font-medium text-stone-700 mb-3">2.3 Datos de Navegación</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Dirección IP</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Páginas visitadas y tiempo de permanencia</li>
            <li>Cookies y tecnologías similares</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">3. Finalidades del Tratamiento</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">3.1 Gestión de Pedidos</h3>
            <p><strong>Finalidad:</strong> Procesar y gestionar tus pedidos</p>
            <p><strong>Base legal:</strong> Ejecución del contrato (Art. 6.1.b RGPD)</p>
            <p><strong>Conservación:</strong> 6 años (obligaciones fiscales)</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">3.2 Newsletter y Marketing</h3>
            <p><strong>Finalidad:</strong> Envío de newsletters y comunicaciones comerciales</p>
            <p><strong>Base legal:</strong> Consentimiento (Art. 6.1.a RGPD)</p>
            <p><strong>Conservación:</strong> Hasta revocación del consentimiento</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">3.3 Atención al Cliente</h3>
            <p><strong>Finalidad:</strong> Resolver consultas y proporcionar soporte</p>
            <p><strong>Base legal:</strong> Interés legítimo (Art. 6.1.f RGPD)</p>
            <p><strong>Conservación:</strong> 3 años desde la última comunicación</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">4. Destinatarios de los Datos</h2>
          <p className="mb-4">Tus datos personales pueden ser comunicados a:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Proveedores de servicios tecnológicos:</strong> Supabase (hosting y base de datos)</li>
            <li><strong>Servicios de email:</strong> Mailgun (envío de emails transaccionales)</li>
            <li><strong>Pasarelas de pago:</strong> Stripe (procesamiento de pagos)</li>
            <li><strong>Empresas de mensajería:</strong> Para la entrega de pedidos</li>
            <li><strong>Autoridades competentes:</strong> Cuando sea requerido por ley</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">5. Transferencias Internacionales</h2>
          <p className="mb-4">
            Algunos de nuestros proveedores pueden estar ubicados fuera del EEE. En estos casos:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Utilizamos proveedores con decisiones de adecuación de la Comisión Europea</li>
            <li>Aplicamos cláusulas contractuales tipo aprobadas por la UE</li>
            <li>Verificamos que implementen medidas de seguridad adecuadas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">6. Tus Derechos</h2>
          <p className="mb-4">Puedes ejercer los siguientes derechos:</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-stone-200 p-4 rounded-lg">
              <h3 className="font-medium text-stone-800">🔍 Acceso</h3>
              <p className="text-sm text-stone-600">Solicitar información sobre tus datos</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h3 className="font-medium text-stone-800">✏️ Rectificación</h3>
              <p className="text-sm text-stone-600">Corregir datos inexactos</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h3 className="font-medium text-stone-800">🗑️ Supresión</h3>
              <p className="text-sm text-stone-600">Solicitar la eliminación</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h3 className="font-medium text-stone-800">⏸️ Limitación</h3>
              <p className="text-sm text-stone-600">Restringir el tratamiento</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h3 className="font-medium text-stone-800">📱 Portabilidad</h3>
              <p className="text-sm text-stone-600">Recibir tus datos en formato estructurado</p>
            </div>
            <div className="border border-stone-200 p-4 rounded-lg">
              <h3 className="font-medium text-stone-800">❌ Oposición</h3>
              <p className="text-sm text-stone-600">Oponerte al tratamiento</p>
            </div>
          </div>

          <p className="text-sm text-stone-600 mb-4">
            Para ejercer estos derechos, envía un email a: <strong>privacidad@barrolimon.com</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">7. Medidas de Seguridad</h2>
          <p className="mb-4">Implementamos medidas técnicas y organizativas apropiadas:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encriptación SSL/TLS para todas las comunicaciones</li>
            <li>Almacenamiento seguro en servidores con certificaciones ISO 27001</li>
            <li>Acceso restringido a datos personales solo a personal autorizado</li>
            <li>Auditorías regulares de seguridad</li>
            <li>Procedimientos de respuesta ante incidentes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">8. Cookies</h2>
          <p className="mb-4">
            Utilizamos cookies para mejorar tu experiencia. Consulta nuestra 
            <a href="/cookies" className="text-purple-600 hover:text-purple-800 font-medium"> Política de Cookies</a> 
            para más información.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">9. Reclamaciones</h2>
          <p className="mb-4">
            Si consideras que el tratamiento de tus datos no se ajusta a la normativa, 
            puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):
          </p>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p><strong>Web:</strong> www.aepd.es</p>
            <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
            <p><strong>Teléfono:</strong> 901 100 099</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">10. Modificaciones</h2>
          <p>
            Esta política puede ser actualizada. Te notificaremos de cambios significativos 
            por email o mediante aviso en nuestra web.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
