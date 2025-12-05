'use client'

import { useState, useEffect } from 'react'
import { useBrands } from '@/hooks/useBrands'

export default function Brands() {
  const { brands, loading } = useBrands()
  // Removido filtro por 'active' - coluna não existe no banco
  const activeBrands = brands
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)

  // Quantidade de itens visíveis por tela (responsivo)
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 6
    const width = window.innerWidth
    if (width < 640) return 3 // mobile: 3 por linha
    if (width < 1024) return 4 // tablet: 4 por linha
    return 6 // desktop: 6 por linha
  }

  const [itemsPerView, setItemsPerView] = useState(6)
  
  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView())
    }
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const totalSlides = Math.ceil(activeBrands.length / itemsPerView) || 1

  // Sempre iniciar auto-rotação (sempre usar carrossel)
  useEffect(() => {
    setIsAutoRotating(true)
  }, [])

  // Rotação automática a cada 10 segundos - sempre ativa (só roda se tiver mais marcas que itens visíveis)
  useEffect(() => {
    if (activeBrands.length === 0 || activeBrands.length <= itemsPerView) return
    
    if (!isAutoRotating) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        return nextIndex >= totalSlides ? 0 : nextIndex
      })
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [activeBrands.length, totalSlides, itemsPerView, isAutoRotating])

  // Pausar rotação ao passar o mouse
  const handleMouseEnter = () => {
    setIsAutoRotating(false)
  }

  const handleMouseLeave = () => {
    setIsAutoRotating(true)
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Marcas que Trabalhamos
          </h2>
          <p className="text-gray-600">
            Parcerias com as melhores marcas do mercado
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500">Carregando marcas...</p>
          </div>
        ) : activeBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma marca cadastrada ainda.</p>
            <p className="text-sm text-gray-400 mt-2">Adicione marcas no painel administrativo.</p>
          </div>
        ) : (
          <div 
            className="relative overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="overflow-x-hidden">
              <div 
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ 
                  transform: totalSlides > 1 
                    ? `translateX(-${currentIndex * (100 / itemsPerView)}%)`
                    : 'translateX(0)'
                }}
              >
                {/* Renderizar todas as marcas (duplicadas para loop infinito quando necessário) */}
                {(totalSlides > 1 ? [...activeBrands, ...activeBrands] : activeBrands).map((brand, index) => (
                  <div
                    key={`${brand.id}-${index}`}
                    className="flex-shrink-0 px-2 sm:px-3"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 text-center hover:bg-gray-50 transition-all duration-300 md:hover:shadow-lg md:hover:-translate-y-1">
                      <div className="mb-2 sm:mb-3 flex items-center justify-center" style={{ backgroundColor: 'transparent !important', background: 'transparent !important', backgroundImage: 'none !important', minHeight: '48px' }}>
                        <img 
                          src={brand.image} 
                          alt={`${brand.name} marca`}
                          className="max-w-full max-h-12 sm:max-h-14 md:max-h-16"
                          style={{ 
                            backgroundColor: 'transparent !important',
                            background: 'transparent !important',
                            backgroundImage: 'none !important',
                            filter: 'grayscale(100%)',
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '64px',
                            display: 'block',
                            margin: '0 auto'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-2">
                        {brand.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Indicadores de posição */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-4 space-x-2 sm:space-x-2.5">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      minWidth: '12px',
                      minHeight: '12px',
                      padding: '0',
                      margin: '0'
                    }}
                    className={`rounded-full transition-all duration-300 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${
                      index === currentIndex % totalSlides ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
