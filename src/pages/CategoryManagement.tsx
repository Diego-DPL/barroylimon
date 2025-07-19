import { useState } from 'react'
import { useCategories, categoryUtils, type Category, type CategoryGroup } from '../hooks/useCategories'
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react'
import Button from '../components/ui/button'

interface CategoryFormData {
  name: string
  slug: string
  description: string
  category_type: 'product_type' | 'material' | 'collection' | 'style' | 'occasion' | 'general'
  sort_order: number
}

export default function CategoryManagement() {
  const { categoryGroups, loading, error, refetch } = useCategories()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    category_type: 'general',
    sort_order: 0
  })

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      category_type: 'general',
      sort_order: 0
    })
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      category_type: category.category_type,
      sort_order: category.sort_order
    })
    setIsModalOpen(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const categoryData = {
      ...formData,
      is_active: true,
      parent_id: undefined
    }

    let result
    if (editingCategory) {
      result = await categoryUtils.updateCategory(editingCategory.id, categoryData)
    } else {
      result = await categoryUtils.createCategory(categoryData)
    }

    if (result.success) {
      setIsModalOpen(false)
      refetch()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      const result = await categoryUtils.deleteCategory(category.id)
      if (result.success) {
        refetch()
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const categoryTypeLabels = {
    product_type: 'Tipo de Producto',
    material: 'Material',
    collection: 'Colección',
    style: 'Estilo',
    occasion: 'Ocasión',
    general: 'General'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 font-light">Cargando categorías...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-stone-800 tracking-tight">
                Gestión de Categorías
              </h1>
              <p className="text-stone-600 mt-2 font-light">
                Organiza tus productos por tipo, material, colección y estilo
              </p>
            </div>
            <Button
              onClick={handleCreateCategory}
              className="bg-stone-800 hover:bg-stone-900 text-white font-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Category Groups */}
        <div className="space-y-8">
          {categoryGroups.map((group: CategoryGroup) => (
            <div key={group.type} className="bg-white rounded-lg shadow-sm border border-stone-200">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-light text-stone-800 flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-amber-600" />
                  {group.label}
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  {group.categories.length} categoría(s)
                </p>
              </div>

              <div className="p-6">
                {group.categories.length === 0 ? (
                  <p className="text-stone-500 text-center py-8 font-light">
                    No hay categorías en este grupo
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.categories.map((category) => (
                      <div
                        key={category.id}
                        className="p-4 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-stone-800">{category.name}</h3>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-1 text-stone-500 hover:text-stone-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-stone-500 mb-2">
                          Slug: {category.slug}
                        </p>
                        
                        {category.description && (
                          <p className="text-sm text-stone-600 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100">
                          <span className="text-xs text-stone-500">
                            Orden: {category.sort_order}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            Activa
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-light text-stone-800">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.category_type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      category_type: e.target.value as CategoryFormData['category_type']
                    }))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(categoryTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-stone-800 hover:bg-stone-900 text-white font-light"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 font-light"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
