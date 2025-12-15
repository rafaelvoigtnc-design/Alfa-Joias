'use client'

import Link from 'next/link'
import { Phone, Percent, Clock, Gem, Diamond, Sparkles, Eye } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { formatPrice } from '@/lib/priceUtils'
import { smartProductSort } from '@/lib/productRecommendation'
import { useMemo } from 'react'

export default function Promotions() {
  const { getProductsOnSale, loading, error } = useProducts()
  const products = useMemo(() => {
    const filtered = getProductsOnSale().filter(p => typeof (p as any).stock !== 'number' || (p as any).stock > 0)
    // Aplicar algoritmo inteligente de ordenação
    return smartProductSort(filtered)
  }, [getProductsOnSale])

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

  // Sempre mostrar a seção, mesmo se não houver produtos

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-2 sm:mb-3 md:mb-6 tracking-wide">
            Promoções Especiais
          </h2>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-gray-800 mx-auto mb-3 sm:mb-4 md:mb-8"></div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light px-4 mb-4 sm:mb-6">
            Aproveite nossas ofertas por tempo limitado
          </p>
          <Link
            href="/promocoes"
            className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm md:text-base transition-all duration-300 font-medium hover:scale-105 active:scale-95"
          >
            <span>Ver Todas as Promoções</span>
            <svg className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
            <p className="text-gray-500 text-lg font-light">Carregando promoções...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Percent className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-red-500 text-lg font-light">Erro ao carregar promoções</p>
            <p className="text-sm text-red-400 mt-2">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Percent className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma promoção ativa</h3>
            <p className="text-gray-600 mb-6">Fique atento às nossas ofertas especiais!</p>
            <a
              href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre as promoções da Alfa Jóias.

Podem me ajudar?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-6 py-3 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
            >
              <Phone className="h-4 w-4 mr-2" />
              Falar no WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {products.map((product, index) => {
              const IconComponent = getCategoryIcon(product.category)
              return (
                <Link
                  key={product.id}
                  href={`/produto/${product.id}`}
                  className="group block bg-white border border-gray-200 md:hover:border-gray-800 transition-all duration-300 overflow-hidden md:hover:shadow-lg md:hover:-translate-y-1 active:scale-[0.98] touch-manipulation"
                  style={{ animationDelay: `${index * 200}ms` }}
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
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                      <div className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1 rounded font-semibold flex items-center space-x-1 shadow-sm">
                        <Percent className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{product.discount_percentage}% OFF</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-900 mb-1 sm:mb-2 group-hover:text-gray-800 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-0">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4 font-light line-clamp-1">{product.brand}</p>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price || '')}
                      </span>
                      <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-red-600">
                        {formatPrice(product.sale_price || '')}
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Tenho interesse na promoção: ${product.name} - ${product.sale_price} (${product.discount_percentage}% de desconto)

Podem me ajudar com esta oferta?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-6 py-3 transition-all duration-300 flex items-center justify-center space-x-2 font-medium hover:scale-105 active:scale-95"
                    >
                      <Phone className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span>Aproveitar Oferta</span>
                    </a>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}