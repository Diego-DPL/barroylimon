import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  created_at: string
  updated_at: string
  categories?: string[]
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  position: number
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener productos con sus categorías e imágenes
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories!inner (
            categories (
              name
            )
          ),
          product_images (
            id,
            url,
            alt_text,
            position
          )
        `)
        .gt('stock', 0) // Solo productos con stock
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transformar los datos
      const transformedProducts: Product[] = (data || []).map(product => ({
        ...product,
        categories: product.product_categories?.map((pc: any) => pc.categories.name) || [],
        images: product.product_images || []
      }))

      setProducts(transformedProducts)
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  }
}

// Hook para obtener un producto específico
export const useProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_categories!inner (
              categories (
                name
              )
            ),
            product_images (
              id,
              url,
              alt_text,
              position
            )
          `)
          .eq('slug', slug)
          .single()

        if (error) throw error

        const transformedProduct: Product = {
          ...data,
          categories: data.product_categories?.map((pc: any) => pc.categories.name) || [],
          images: data.product_images || []
        }

        setProduct(transformedProduct)
      } catch (err: any) {
        console.error('Error fetching product:', err)
        setError('Producto no encontrado')
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  return { product, loading, error }
}
