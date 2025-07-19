import React from 'react'
import type { Category } from '../hooks/useProducts'

interface ProductCategoriesProps {
  categories: Category[]
  variant?: 'card' | 'detail' | 'badge'
  showType?: boolean
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({ 
  categories, 
  variant = 'card',
  showType = false 
}) => {
  if (!categories || categories.length === 0) {
    return null
  }

  // Agrupar categorías por tipo
  const groupedCategories = categories.reduce((acc, category) => {
    const type = category.category_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(category)
    return acc
  }, {} as Record<string, Category[]>)

  // Obtener el estilo según el tipo de categoría
  const getCategoryStyle = (type: string) => {
    const baseStyle = "inline-block px-2 py-1 text-xs font-medium rounded-full"
    
    switch (type) {
      case 'product_type':
        return `${baseStyle} bg-blue-100 text-blue-800`
      case 'material':
        return `${baseStyle} bg-green-100 text-green-800`
      case 'collection':
        return `${baseStyle} bg-purple-100 text-purple-800`
      case 'style':
        return `${baseStyle} bg-yellow-100 text-yellow-800`
      case 'occasion':
        return `${baseStyle} bg-pink-100 text-pink-800`
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`
    }
  }

  // Obtener el nombre del tipo en español
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product_type':
        return 'Tipo'
      case 'material':
        return 'Material'
      case 'collection':
        return 'Colección'
      case 'style':
        return 'Estilo'
      case 'occasion':
        return 'Ocasión'
      default:
        return 'General'
    }
  }

  if (variant === 'badge') {
    // Para tarjetas de producto - mostrar solo algunas categorías principales
    const mainCategories = [
      ...groupedCategories.product_type || [],
      ...groupedCategories.collection || []
    ].slice(0, 2)

    return (
      <div className="flex flex-wrap gap-1">
        {mainCategories.map((category) => (
          <span
            key={category.id}
            className={getCategoryStyle(category.category_type)}
          >
            {category.name}
          </span>
        ))}
      </div>
    )
  }

  if (variant === 'detail') {
    // Para página de producto - mostrar todas las categorías organizadas
    return (
      <div className="space-y-3">
        {Object.entries(groupedCategories).map(([type, typeCategories]) => (
          <div key={type} className="flex flex-wrap items-center gap-2">
            {showType && (
              <span className="text-sm font-medium text-gray-600 min-w-[80px]">
                {getTypeLabel(type)}:
              </span>
            )}
            <div className="flex flex-wrap gap-1">
              {typeCategories.map((category) => (
                <span
                  key={category.id}
                  className={getCategoryStyle(category.category_type)}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Variante por defecto - compacta para tarjetas
  return (
    <div className="flex flex-wrap gap-1">
      {categories.slice(0, 3).map((category) => (
        <span
          key={category.id}
          className={getCategoryStyle(category.category_type)}
        >
          {category.name}
        </span>
      ))}
      {categories.length > 3 && (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
          +{categories.length - 3}
        </span>
      )}
    </div>
  )
}

export default ProductCategories
