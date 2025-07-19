import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  category_type: 'product_type' | 'material' | 'collection' | 'style' | 'occasion' | 'general'
  parent_id?: number
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface CategoryGroup {
  type: string
  label: string
  categories: Category[]
}

interface UseCategoriesReturn {
  categories: Category[]
  categoryGroups: CategoryGroup[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('category_type')
        .order('sort_order')
        .order('name')

      if (error) throw error

      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError('Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Agrupar categorías por tipo
  const categoryGroups: CategoryGroup[] = [
    {
      type: 'product_type',
      label: 'Tipo de Producto',
      categories: categories.filter(cat => cat.category_type === 'product_type')
    },
    {
      type: 'material',
      label: 'Material',
      categories: categories.filter(cat => cat.category_type === 'material')
    },
    {
      type: 'collection',
      label: 'Colección',
      categories: categories.filter(cat => cat.category_type === 'collection')
    },
    {
      type: 'style',
      label: 'Estilo',
      categories: categories.filter(cat => cat.category_type === 'style')
    },
    {
      type: 'occasion',
      label: 'Ocasión',
      categories: categories.filter(cat => cat.category_type === 'occasion')
    }
  ].filter(group => group.categories.length > 0)

  return {
    categories,
    categoryGroups,
    loading,
    error,
    refetch: fetchCategories
  }
}

// Hook para obtener categorías de un producto específico
export const useProductCategories = (productId: string) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductCategories = async () => {
      if (!productId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .rpc('get_product_categories', { product_uuid: productId })

        if (error) throw error

        setCategories(data || [])
      } catch (err: any) {
        console.error('Error fetching product categories:', err)
        setError('Error al cargar las categorías del producto')
      } finally {
        setLoading(false)
      }
    }

    fetchProductCategories()
  }, [productId])

  return { categories, loading, error }
}

// Hook para buscar productos por categorías
export const useProductsByCategories = (categorySlugs: string[]) => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = async () => {
    if (categorySlugs.length === 0) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .rpc('get_products_by_multiple_categories', { category_slugs: categorySlugs })

      if (error) throw error

      setProducts(data || [])
    } catch (err: any) {
      console.error('Error searching products by categories:', err)
      setError('Error al buscar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchProducts()
  }, [categorySlugs.join(',')])

  return { products, loading, error, refetch: searchProducts }
}

// Funciones de utilidad para gestión de categorías
export const categoryUtils = {
  // Asignar categorías a un producto
  assignCategoriesToProduct: async (productId: string, categoryIds: number[]) => {
    try {
      const { error } = await supabase
        .rpc('assign_categories_to_product', {
          product_uuid: productId,
          category_ids: categoryIds
        })

      if (error) throw error
      return { success: true }
    } catch (err: any) {
      console.error('Error assigning categories:', err)
      return { success: false, error: err.message }
    }
  },

  // Crear nueva categoría
  createCategory: async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err: any) {
      console.error('Error creating category:', err)
      return { success: false, error: err.message }
    }
  },

  // Actualizar categoría
  updateCategory: async (id: number, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err: any) {
      console.error('Error updating category:', err)
      return { success: false, error: err.message }
    }
  },

  // Eliminar categoría (soft delete)
  deleteCategory: async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (err: any) {
      console.error('Error deleting category:', err)
      return { success: false, error: err.message }
    }
  }
}
