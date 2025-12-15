'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Phone, Eye, Clock, Gem, Diamond, Sparkles } from 'lucide-react'
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts'
import { formatPrice } from '@/lib/priceUtils'
import { smartSortProducts } from '@/lib/productSorting'

export default function FeaturedProducts() {
  const { products, loading, error } = useSupabaseProducts()
  const [sortedFeaturedProducts, setSortedFeaturedProducts] = useState<any[]>([])
  
  useEffect(() => {
    if (products.length > 0) {
      const featured = products
        .filter(product => product.featured === true)
        .filter(product => typeof (product as any).stock !== 'number' || (product as any).stock > 0)
      
      // Aplicar ordenação inteligente
      const sorted = smartSortProducts(featured)
      setSortedFeaturedProducts(sorted)
    } else {
      setSortedFeaturedProducts([])
    }
  }, [products])
  
  const featuredProducts = sortedFeaturedProducts

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
    <section className="py-8 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-2 sm:mb-3 md:mb-6 tracking-wide">
            Produtos em Destaque
          </h2>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-gray-800 mx-auto mb-3 sm:mb-4 md:mb-8"></div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light px-4">
            Itens cuidadosamente selecionados para você
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
            <p className="text-gray-500 text-lg font-light">Carregando produtos...</p>
            <p className="text-gray-400 text-sm mt-2">Aguarde alguns segundos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gem className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-red-500 text-lg font-light">Erro ao carregar produtos</p>
            <p className="text-sm text-red-400 mt-2">{error}</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gem className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-light">Nenhum produto em destaque cadastrado.</p>
            <p className="text-sm text-gray-400 mt-2">Adicione produtos e marque como &quot;em destaque&quot; no painel administrativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {featuredProducts.map((product) => {
              const IconComponent = getCategoryIcon(product.category)
              return (
                <Link
                  key={product.id}
                  href={`/produto/${product.id}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-300 md:hover:border-gray-800 transition-all duration-300 overflow-hidden md:hover:shadow-lg md:hover:-translate-y-1 active:scale-[0.98] touch-manipulation"
                >
                  <div className="relative aspect-square sm:aspect-auto sm:h-48 md:h-56 lg:h-64">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4">
                      <div className="bg-white/95 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 rounded-full text-[10px] sm:text-xs font-medium text-gray-800 flex items-center space-x-1">
                        <IconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                        <span className="hidden sm:inline">{product.category}</span>
                      </div>
                    </div>
                    {product.on_sale && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-semibold">
                          -{product.discount_percentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-0">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4 font-light line-clamp-1">{product.brand}</p>

                    <div className="flex flex-col gap-1">
                        {product.on_sale ? (
                          <>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-xs sm:text-sm text-gray-500 line-through">
                                {formatPrice(product.original_price || '')}
                              </span>
                            </div>
                            <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                              {formatPrice(product.sale_price || '')}
                            </span>
                          </>
                        ) : (
                          <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{formatPrice(product.price)}</span>
                        )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/produtos"
              className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-3 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
            >
              Ver todos os produtos
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}