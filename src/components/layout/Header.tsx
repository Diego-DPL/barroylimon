import { Link } from 'react-router-dom'
import { User, LogOut, Settings, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useRole } from '../../hooks/useRole'
import { useCart } from '../../contexts/CartContext'
import Button from '../ui/button'
import LogoPNG from '../../assets/Logopng.png';

export default function Header({ onCartOpen }: { onCartOpen?: () => void }) {
    const { user, signOut } = useAuth()
    const { isAdmin } = useRole()
    const { getTotalItems } = useCart()

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <div className="text-2xl font-light tracking-wider text-stone-800">
                            BARRO<span className="text-amber-600">y</span>LIMÓN
                        </div>
                        <img 
                            src={LogoPNG} 
                            alt="Barro y Limón logo" 
                            className="w-8 h-8 ml-2 object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    {/* <nav className="hidden lg:flex items-center space-x-12">
                    <Link
                        to="/coleccion"
                        className="text-stone-700 hover:text-stone-900 font-light tracking-wide transition-colors"
                    >
                        Colección
                    </Link>
                    <Link
                        to="/alta-joyeria"
                        className="text-stone-700 hover:text-stone-900 font-light tracking-wide transition-colors"
                    >
                        Joyería
                    </Link>
                    <Link
                        to="/proceso"
                        className="text-stone-700 hover:text-stone-900 font-light tracking-wide transition-colors"
                    >
                        Nuestro Proceso
                    </Link>
                    </nav> */}

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
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
                    <div className="flex items-center space-x-4">
                        {isAdmin && (
                            <Link to="/admin">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-amber-600 hover:text-amber-700 flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Admin</span>
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
                                <span className="hidden sm:inline">Mi Perfil</span>
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="text-stone-700 hover:text-stone-900 flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </Button>
                    </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-stone-700 hover:text-stone-900 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="hidden sm:inline">Iniciar Sesión</span>
                                    </Button>
                                </Link>
                                <Link to="/registro">
                                    <Button
                                        size="sm"
                                        className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 font-light tracking-wide"
                                    >
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
      </header>
    )
}
