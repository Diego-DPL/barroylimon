import { useRole } from '../hooks/useRole'
import { useAdminStats } from '../hooks/useAdminStats'
import { Users, Package, ShoppingCart, Settings, BarChart3, FileText, Tag, AlertTriangle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { role, loading } = useRole()
  const { totalUsers, totalProducts, totalOrders, totalSales, pendingOrders, lowStockProducts, loading: statsLoading, error } = useAdminStats()

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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar estadísticas</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Usuarios</p>
                {statsLoading ? (
                  <p className="text-2xl font-light text-stone-400">Cargando...</p>
                ) : error ? (
                  <p className="text-2xl font-light text-red-500">Error</p>
                ) : (
                  <p className="text-2xl font-light text-stone-900">{totalUsers.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Productos</p>
                {statsLoading ? (
                  <p className="text-2xl font-light text-stone-400">Cargando...</p>
                ) : error ? (
                  <p className="text-2xl font-light text-red-500">Error</p>
                ) : (
                  <p className="text-2xl font-light text-stone-900">{totalProducts.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Pedidos</p>
                {statsLoading ? (
                  <p className="text-2xl font-light text-stone-400">Cargando...</p>
                ) : error ? (
                  <p className="text-2xl font-light text-red-500">Error</p>
                ) : (
                  <p className="text-2xl font-light text-stone-900">{totalOrders.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Ventas</p>
                {statsLoading ? (
                  <p className="text-2xl font-light text-stone-400">Cargando...</p>
                ) : error ? (
                  <p className="text-2xl font-light text-red-500">Error</p>
                ) : (
                  <p className="text-2xl font-light text-stone-900">€{totalSales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Pedidos Pendientes</p>
                {statsLoading ? (
                  <p className="text-2xl font-light text-stone-400">Cargando...</p>
                ) : error ? (
                  <p className="text-2xl font-light text-red-500">Error</p>
                ) : (
                  <div className="flex items-center">
                    <p className="text-2xl font-light text-stone-900">{pendingOrders.toLocaleString()}</p>
                    {pendingOrders > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        Requiere atención
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Stock Bajo</p>
                {statsLoading ? (
                  <p className="text-2xl font-light text-stone-400">Cargando...</p>
                ) : error ? (
                  <p className="text-2xl font-light text-red-500">Error</p>
                ) : (
                  <div className="flex items-center">
                    <p className="text-2xl font-light text-stone-900">{lowStockProducts.toLocaleString()}</p>
                    {lowStockProducts > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {'<5 unidades'}
                      </span>
                    )}
                  </div>
                )}
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

          {/* Discount Codes Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Tag className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-medium text-stone-900 ml-2">Códigos de Descuento</h3>
            </div>
            <p className="text-stone-600 mb-4">
              Crea y gestiona códigos promocionales para incentivar ventas.
            </p>
            <Link
              to="/admin/discount-codes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              Gestionar Códigos
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
