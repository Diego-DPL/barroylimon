import LogoPNG from '../../assets/Logopng.png';

export default function Header() {
    return (
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
    )
}
