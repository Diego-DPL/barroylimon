export default function Footer() {
    return (
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
    )
}
