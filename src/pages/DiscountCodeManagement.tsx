import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tag, Calendar, Users, Percent, DollarSign } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/button'

interface DiscountCode {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_single_use: boolean
  is_active: boolean
  usage_count?: number
  max_uses: number | null
  valid_from?: string
  valid_until: string | null
  created_at: string
  total_uses?: number
  total_discount_given?: number
  unique_users?: number
}

interface DiscountFormData {
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_single_use: boolean
  is_active: boolean
  max_uses: number | null
  valid_until: string
}

export default function DiscountCodeManagement() {
  const { user } = useAuth()
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    is_single_use: false,
    is_active: true,
    max_uses: null,
    valid_until: ''
  })

  useEffect(() => {
    loadDiscountCodes()
  }, [])

  const loadDiscountCodes = async () => {
    try {
      // Usar la función que incluye estadísticas en lugar de solo la tabla
      const { data, error } = await supabase
        .rpc('get_discount_code_stats')

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error('Error loading discount codes:', error)
      // Fallback a cargar solo los códigos sin estadísticas
      try {
        const { data, error } = await supabase
          .from('discount_codes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCodes(data || [])
      } catch (fallbackError) {
        console.error('Error loading discount codes (fallback):', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        valid_until: formData.valid_until || null,
        created_by: user?.id
      }

      if (editingCode) {
        const { error } = await supabase
          .from('discount_codes')
          .update(dataToSubmit)
          .eq('id', editingCode.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert([dataToSubmit])

        if (error) throw error
      }

      await loadDiscountCodes()
      resetForm()
    } catch (error: any) {
      console.error('Error saving discount code:', error)
      alert(error.message || 'Error al guardar el código de descuento')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      description: code.description,
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      is_single_use: code.is_single_use,
      is_active: code.is_active,
      max_uses: code.max_uses,
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este código de descuento?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadDiscountCodes()
    } catch (error) {
      console.error('Error deleting discount code:', error)
      alert('Error al eliminar el código de descuento')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      is_single_use: false,
      is_active: true,
      max_uses: null,
      valid_until: ''
    })
    setEditingCode(null)
    setShowForm(false)
  }

  const formatDiscountValue = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `${value.toFixed(2)}€`
  }

  const getStatusBadge = (code: DiscountCode) => {
    if (!code.is_active) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactivo</span>
    }
    
    if (code.valid_until && new Date(code.valid_until) < new Date()) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Expirado</span>
    }

    const usageCount = code.total_uses || code.usage_count || 0
    if (code.max_uses && usageCount >= code.max_uses) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Agotado</span>
    }

    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>
  }

  if (loading && codes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto"></div>
          <p className="mt-4 text-stone-600">Cargando códigos de descuento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Códigos de Descuento</h1>
          <p className="text-stone-600 mt-1">Gestiona los códigos de descuento de tu tienda</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-stone-800 hover:bg-stone-900 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Código
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            {editingCode ? 'Editar Código' : 'Nuevo Código de Descuento'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="DESCUENTO10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Tipo de Descuento
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Cantidad Fija (€)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                placeholder="Descuento de bienvenida"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Valor del Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {formData.discount_type === 'percentage' ? (
                      <Percent className="h-4 w-4 text-stone-400" />
                    ) : (
                      <span className="text-stone-400">€</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Máximo de Usos
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Fecha de Expiración
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_single_use}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_single_use: e.target.checked }))}
                  className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                />
                <span className="ml-2 text-sm text-stone-700">Un solo uso por usuario</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-stone-300 text-stone-600 focus:ring-stone-500"
                />
                <span className="ml-2 text-sm text-stone-700">Código activo</span>
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-stone-800 hover:bg-stone-900 text-white"
              >
                {editingCode ? 'Actualizar' : 'Crear'} Código
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de códigos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Validez
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {codes.map((code) => (
                <tr key={code.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-stone-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-stone-900">
                          {code.code}
                        </div>
                        <div className="text-sm text-stone-500">
                          {code.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {code.discount_type === 'percentage' ? (
                        <Percent className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                      )}
                      <span className="text-sm font-medium text-stone-900">
                        {formatDiscountValue(code.discount_type, code.discount_value)}
                      </span>
                    </div>
                    {code.is_single_use && (
                      <div className="text-xs text-orange-600">Un solo uso</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-stone-400 mr-1" />
                      <span className="text-sm text-stone-900">
                        {code.total_uses || code.usage_count || 0}
                        {code.max_uses && ` / ${code.max_uses}`}
                      </span>
                    </div>
                    {code.unique_users && (
                      <div className="text-xs text-stone-500">
                        {code.unique_users} usuarios únicos
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(code)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {code.valid_until 
                        ? new Date(code.valid_until).toLocaleDateString()
                        : 'Sin límite'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(code)}
                      className="text-stone-600 hover:text-stone-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {codes.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              No hay códigos de descuento
            </h3>
            <p className="text-stone-500 mb-4">
              Crea tu primer código de descuento para incentivar las ventas
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-stone-800 hover:bg-stone-900 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Código
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
