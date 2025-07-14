import { useRole } from '../hooks/useRole'
import { Users, Package, ShoppingCart, Settings, BarChart3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { role, loading } = useRole()

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-stone-900 mb-2">Panel de Administración</h1>
          <p className="text-stone-600">
            Bienvenido al panel de control de Barro y Limón. Rol actual: 
            <span className="font-medium ml-1 capitalize">{role}</span>
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Usuarios</p>
                <p className="text-2xl font-light text-stone-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Productos</p>
                <p className="text-2xl font-light text-stone-900">256</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Pedidos</p>
                <p className="text-2xl font-light text-stone-900">89</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Ventas</p>
                <p className="text-2xl font-light text-stone-900">€12,345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-stone-900 ml-2">Gestión de Usuarios</h3>
            </div>
            <p className="text-stone-600 mb-4">
              Administra usuarios, roles y permisos del sistema.
            </p>
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Ver Usuarios
            </Link>
          </div>

          {/* Products Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-stone-900 ml-2">Gestión de Productos</h3>
            </div>
            <p className="text-stone-600 mb-4">
              Añade, edita y organiza el catálogo de productos.
            </p>
            <Link
              to="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Ver Productos
            </Link>
          </div>

          {/* Orders Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-stone-900 ml-2">Gestión de Pedidos</h3>
            </div>
            <p className="text-stone-600 mb-4">
              Procesa y hace seguimiento de todos los pedidos.
            </p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Ver Pedidos
            </Link>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-stone-900 ml-2">Reportes</h3>
            </div>
            <p className="text-stone-600 mb-4">
              Consulta estadísticas y genera reportes de ventas.
            </p>
            <Link
              to="/admin/reports"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Ver Reportes
            </Link>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-stone-900 ml-2">Configuración</h3>
            </div>
            <p className="text-stone-600 mb-4">
              Ajusta la configuración general del sitio web.
            </p>
            <Link
              to="/admin/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Configurar
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-stone-900 mb-4">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 transition-colors">
              Nuevo Producto
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 transition-colors">
              Procesar Pedidos
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-stone-300 text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 transition-colors">
              Backup Base de Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
