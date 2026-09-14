'use client'

import { useState, useMemo } from 'react'
import { Phone, Clock, Search, Eye, Percent, Filter, ChevronDown, Gem, Diamond } from 'lucide-react'
import Link from 'next/link'
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts'
import { formatPrice } from '@/lib/priceUtils'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: number | string
  image: string
  description: string
  on_sale?: boolean
  original_price?: number | string
  sale_price?: number | string
  discount_percentage?: number
}

export default function Promocoes() {
  const { products, loading } = useFirebaseProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [showFilters, setShowFilters] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['Todas', ...Array.from(cats)]
  }, [products])

  const saleProducts = useMemo(() => {
    return products.filter(p => p.on_sale || p.onSale)
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...saleProducts]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      )
    }

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    return filtered
  }, [saleProducts, searchTerm, selectedCategory])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Joias':
        return Gem
      case 'Relógios':
        return Clock
      case 'Óculos':
        return Eye
      case 'Semi-Joias':
        return Diamond
      default:
        return Gem
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Percent className="h-8 w-8 text-red-600" />
            Promoções
          </h1>
          <p className="text-gray-600">Aproveite nossos descontos especiais</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar promoções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-5 w-5" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('Todas')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando promoções...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nenhuma promoção encontrada no momento.</p>
            <Link
              href="/produtos"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const CategoryIcon = getCategoryIcon(product.category)
              const originalPrice = product.original_price
              const discount = product.discount_percentage
              const priceToUse = product.on_sale && product.sale_price ? product.sale_price : product.price
              const priceNumber = typeof priceToUse === 'number' ? priceToUse : parseFloat(String(priceToUse).replace(/[^\d.,]/g, '').replace(',', '.'))
              const originalPriceNumber = originalPrice ? (typeof originalPrice === 'number' ? originalPrice : parseFloat(String(originalPrice).replace(/[^\d.,]/g, '').replace(',', '.'))) : null
              
              return (
                <Link
                  key={product.id}
                  href={`/produto/${product.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {discount}% OFF
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{product.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {originalPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(String(originalPriceNumber || originalPrice))}
                          </p>
                        )}
                        <p className="text-lg font-bold text-red-600">
                          {formatPrice(String(priceNumber))}
                        </p>
                      </div>
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}