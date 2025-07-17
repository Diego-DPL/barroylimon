import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, Settings, ShoppingBag, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useRole } from '../../hooks/useRole'
import { useCart } from '../../contexts/CartContext'
import Button from '../ui/button'
import LogoPNG from '../../assets/Logopng.png';

export default function Header({ onCartOpen }: { onCartOpen?: () => void }) {
    const { user, signOut } = useAuth()
    const { isAdmin } = useRole()
    const { getTotalItems } = useCart()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        setIsMenuOpen(false)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Header */}
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo - Mobile First */}
                    <Link to="/" className="flex items-center" onClick={closeMenu}>
                        <div className="text-lg sm:text-xl lg:text-2xl font-light tracking-wider text-stone-800">
                            BARRO<span className="text-amber-600">y</span>LIMÓN
                        </div>
                        <img 
                            src={LogoPNG} 
                            alt="Barro y Limón logo" 
                            className="w-6 h-6 sm:w-8 sm:h-8 ml-2 object-contain"
                        />
                    </Link>

                    {/* Desktop Actions - Hidden on Mobile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Cart Button */}
                        <button
                            onClick={onCartOpen}
                            className="relative p-2 text-stone-700 hover:text-stone-900 transition-colors"
                        >
                            <ShoppingBag className="h-6 w-6" />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-3">
                                {isAdmin && (
                                    <Link to="/admin">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-amber-600 hover:text-amber-700 flex items-center gap-2"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span className="hidden lg:inline">Admin</span>
                                        </Button>
                                    </Link>
                                )}
                                <Link to="/profile">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-stone-700 hover:text-stone-900 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="hidden lg:inline">Mi Perfil</span>
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="text-stone-700 hover:text-stone-900 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden lg:inline">Cerrar</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-stone-700 hover:text-stone-900 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="hidden lg:inline">Iniciar Sesión</span>
                                    </Button>
                                </Link>
                                <Link to="/registro">
                                    <Button
                                        size="sm"
                                        className="bg-stone-800 hover:bg-stone-900 text-white px-3 lg:px-4 py-2 font-light tracking-wide text-sm"
                                    >
                                        <span className="hidden lg:inline">Registrarse</span>
                                        <span className="lg:hidden">Registro</span>
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex items-center space-x-2 md:hidden">
                        {/* Cart Button Mobile */}
                        <button
                            onClick={onCartOpen}
                            className="relative p-2 text-stone-700 hover:text-stone-900 transition-colors"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>

                        {/* Menu Toggle Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-stone-700 hover:text-stone-900 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Hidden by default, shown when isMenuOpen is true */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-stone-200/50 bg-white/95 backdrop-blur-md">
                        <div className="px-4 py-4 space-y-4">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="pb-3 border-b border-stone-200">
                                        <p className="text-sm font-medium text-stone-800">
                                            Hola, {user.email?.split('@')[0]}
                                        </p>
                                    </div>
                                    
                                    <Link to="/profile" onClick={closeMenu}>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors">
                                            <User className="h-5 w-5 text-stone-600" />
                                            <span className="text-stone-800 font-light">Mi Perfil</span>
                                        </div>
                                    </Link>

                                    {isAdmin && (
                                        <Link to="/admin" onClick={closeMenu}>
                                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors">
                                                <Settings className="h-5 w-5 text-amber-600" />
                                                <span className="text-amber-600 font-light">Panel Admin</span>
                                            </div>
                                        </Link>
                                    )}

                                    <button 
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="h-5 w-5 text-red-600" />
                                        <span className="text-red-600 font-light">Cerrar Sesión</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link to="/login" onClick={closeMenu}>
                                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors">
                                            <User className="h-5 w-5 text-stone-600" />
                                            <span className="text-stone-800 font-light">Iniciar Sesión</span>
                                        </div>
                                    </Link>
                                    
                                    <Link to="/registro" onClick={closeMenu}>
                                        <div className="w-full bg-stone-800 hover:bg-stone-900 text-white p-3 rounded-lg transition-colors text-center font-light tracking-wide">
                                            Registrarse
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
