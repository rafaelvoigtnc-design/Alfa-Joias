'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Phone, Eye, Clock, Gem, Search, Filter, X, ChevronDown, Diamond } from 'lucide-react'
import { formatPrice } from '@/lib/priceUtils'
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description: string
  on_sale?: boolean
  original_price?: string
  sale_price?: string
  discount_percentage?: number
  featured?: boolean
  stock?: number
  gender?: string
  model?: string
}

export default function Products() {
  const searchParams = useSearchParams()
  const { products, loading } = useFirebaseProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedBrand, setSelectedBrand] = useState('Todos')
  const [selectedPriceRange, setSelectedPriceRange] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('default')

  const categoryParam = searchParams.get('category')
  const brandParam = searchParams.get('brand')

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam)
    if (brandParam) setSelectedBrand(brandParam)
  }, [categoryParam, brandParam])

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ['Todos', ...Array.from(cats)]
  }, [products])

  const brands = useMemo(() => {
    const brs = new Set(products.map(p => p.brand))
    return ['Todos', ...Array.from(brs)]
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
      )
    }

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (selectedBrand !== 'Todos') {
      filtered = filtered.filter(p => p.brand === selectedBrand)
    }

    if (selectedPriceRange !== 'Todos') {
      const [min, max] = selectedPriceRange.split('-').map(Number)
      filtered = filtered.filter(p => {
        const price = parseFloat(p.price.replace(/[^\d.,]/g, '').replace(',', '.'))
        return price >= min && price <= max
      })
    }

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedPriceRange, sortBy])

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos</h1>
          <p className="text-gray-600">Explore nossa coleção completa</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos</option>
                  <option value="0-100">Até R$ 100</option>
                  <option value="100-500">R$ 100 - R$ 500</option>
                  <option value="500-1000">R$ 500 - R$ 1000</option>
                  <option value="1000-99999">Acima de R$ 1000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Padrão</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name">Nome A-Z</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('Todos')
                  setSelectedBrand('Todos')
                  setSelectedPriceRange('Todos')
                  setSortBy('default')
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
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhum produto encontrado com os filtros selecionados.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('Todos')
                setSelectedBrand('Todos')
                setSelectedPriceRange('Todos')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const CategoryIcon = getCategoryIcon(product.category)
              const priceToUse = product.on_sale && product.sale_price ? product.sale_price : product.price
              
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
                    {product.on_sale && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {product.discount_percentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{product.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.on_sale && product.original_price && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(product.original_price)}
                          </p>
                        )}
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(priceToUse)}
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