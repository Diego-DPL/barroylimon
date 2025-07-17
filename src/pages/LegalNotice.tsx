import React from 'react';

const LegalNotice: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Aviso Legal</h1>
      
      <div className="prose prose-stone max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">1. Datos Identificativos</h2>
          <div className="bg-stone-50 p-6 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-stone-800 mb-2">Información de la Empresa</h3>
                <p><strong>Denominación social:</strong> Barro y Limón</p>
                <p><strong>CIF:</strong> [TU_CIF]</p>
                <p><strong>Domicilio social:</strong> [TU_DIRECCIÓN_COMPLETA]</p>
                <p><strong>Código postal:</strong> [TU_CP]</p>
                <p><strong>Ciudad:</strong> [TU_CIUDAD]</p>
                <p><strong>Provincia:</strong> [TU_PROVINCIA]</p>
              </div>
              <div>
                <h3 className="font-medium text-stone-800 mb-2">Datos de Contacto</h3>
                <p><strong>Teléfono:</strong> [TU_TELÉFONO]</p>
                <p><strong>Email:</strong> info@barrolimon.com</p>
                <p><strong>Web:</strong> www.barrolimon.com</p>
                <p><strong>Horario de atención:</strong> L-V 9:00-18:00h</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">2. Registro Mercantil</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p><strong>Registro Mercantil:</strong> [TU_REGISTRO_MERCANTIL]</p>
            <p><strong>Tomo:</strong> [TOMO]</p>
            <p><strong>Folio:</strong> [FOLIO]</p>
            <p><strong>Sección:</strong> [SECCIÓN]</p>
            <p><strong>Hoja:</strong> [HOJA]</p>
            <p><strong>Inscripción:</strong> [INSCRIPCIÓN]</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">3. Actividad Empresarial</h2>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-stone-800 mb-3">Objeto Social</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Diseño, fabricación y venta de joyería artesanal</li>
              <li>Comercio electrónico de productos de bisutería y complementos</li>
              <li>Servicios de personalización y reparación de joyas</li>
              <li>Venta al por menor de artículos de regalo</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">4. Condiciones de Uso del Sitio Web</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">4.1 Aceptación de las Condiciones</h3>
          <p className="mb-4">
            El acceso y uso de este sitio web implica la aceptación plena de las presentes condiciones generales. 
            Si no está de acuerdo con las mismas, no debe utilizar este sitio web.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">4.2 Modificaciones</h3>
          <p className="mb-4">
            Barro y Limón se reserva el derecho de modificar, en cualquier momento y sin previo aviso, 
            las presentes condiciones generales de uso y las condiciones particulares que en su caso existan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">5. Propiedad Intelectual e Industrial</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">⚠️ Derechos Protegidos</h3>
            <p className="text-yellow-700 text-sm">
              Todos los contenidos de este sitio web están protegidos por derechos de propiedad intelectual e industrial.
            </p>
          </div>

          <h3 className="text-lg font-medium text-stone-700 mb-3">5.1 Contenidos Protegidos</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Diseños y fotografías de productos</li>
            <li>Textos, descripciones y contenidos editoriales</li>
            <li>Logotipos, marcas y elementos gráficos</li>
            <li>Código fuente y estructura del sitio web</li>
            <li>Base de datos de productos y clientes</li>
          </ul>

          <h3 className="text-lg font-medium text-stone-700 mb-3">5.2 Uso Autorizado</h3>
          <p className="mb-4">
            El usuario puede visualizar y descargar contenidos para uso personal y privado, sin fines comerciales. 
            Queda prohibida cualquier reproducción, distribución, comunicación pública o transformación sin autorización expresa.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">6. Responsabilidades y Limitaciones</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">6.1 Disponibilidad del Servicio</h3>
          <p className="mb-4">
            Barro y Limón no garantiza la disponibilidad continua del sitio web ni se hace responsable de 
            interrupciones que puedan producirse por mantenimiento, fallos técnicos o causas ajenas.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">6.2 Exactitud de la Información</h3>
          <p className="mb-4">
            Nos esforzamos por mantener la información actualizada y precisa, pero no podemos garantizar 
            la exactitud absoluta de todos los contenidos. Los usuarios deben verificar la información antes de tomar decisiones.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">6.3 Enlaces Externos</h3>
          <p className="mb-4">
            El sitio web puede contener enlaces a sitios de terceros. Barro y Limón no se hace responsable 
            del contenido de dichos sitios ni de las prácticas de privacidad de los mismos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">7. Uso Prohibido</h2>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <h3 className="text-lg font-medium text-red-800 mb-3">🚫 Actividades Prohibidas</h3>
            <ul className="list-disc pl-6 text-red-700 space-y-1">
              <li>Uso del sitio web para fines ilegales o no autorizados</li>
              <li>Intentos de acceso no autorizado a sistemas o datos</li>
              <li>Introducción de virus, malware o código malicioso</li>
              <li>Realizar ingeniería inversa del sitio web</li>
              <li>Recopilar información de otros usuarios sin consentimiento</li>
              <li>Interferir con el funcionamiento normal del sitio</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">8. Protección de Datos Personales</h2>
          <p className="mb-4">
            El tratamiento de datos personales se realiza conforme al Reglamento General de Protección de Datos (RGPD) 
            y la Ley Orgánica de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
          </p>
          <p className="mb-4">
            Para información detallada, consulte nuestra 
            <a href="/privacy" className="text-purple-600 hover:text-purple-800 font-medium"> Política de Privacidad</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">9. Cookies</h2>
          <p className="mb-4">
            Este sitio web utiliza cookies para mejorar la experiencia del usuario. Al continuar navegando, 
            acepta su uso conforme a nuestra 
            <a href="/cookies" className="text-purple-600 hover:text-purple-800 font-medium"> Política de Cookies</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">10. Legislación Aplicable y Jurisdicción</h2>
          
          <h3 className="text-lg font-medium text-stone-700 mb-3">10.1 Ley Aplicable</h3>
          <p className="mb-4">
            Las presentes condiciones se rigen por la legislación española.
          </p>

          <h3 className="text-lg font-medium text-stone-700 mb-3">10.2 Resolución de Conflictos</h3>
          <p className="mb-4">
            Para la resolución de controversias, las partes se someten a los juzgados y tribunales competentes 
            según la legislación española, sin perjuicio de los derechos que correspondan al consumidor.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">11. Contacto Legal</h2>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p className="mb-2">Para cuestiones legales y consultas relacionadas con este aviso:</p>
            <p><strong>Email:</strong> legal@barrolimon.com</p>
            <p><strong>Dirección postal:</strong> [TU_DIRECCIÓN_COMPLETA]</p>
            <p><strong>Atención legal:</strong> Lunes a Viernes de 9:00 a 18:00h</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">12. Fecha de Vigencia</h2>
          <p className="text-sm text-stone-600">
            Este aviso legal es efectivo desde el {new Date().toLocaleDateString('es-ES')} y permanecerá vigente 
            hasta su modificación o sustitución por una nueva versión.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LegalNotice;
