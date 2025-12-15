'use client'

import { useState, useEffect, useMemo } from 'react'
import { useBrands } from '@/hooks/useBrands'
import { shuffleArray } from '@/lib/productRecommendation'

export default function Brands() {
  const { brands, loading } = useBrands()
  // Removido filtro por 'active' - coluna não existe no banco
  // Remover duplicatas baseadas no ID E no nome, e embaralhar marcas para aparecerem sempre em ordem diferente
  const activeBrands = useMemo(() => {
    if (brands.length === 0) return []
    
    // Remover duplicatas por ID primeiro
    const uniqueById = brands.filter((brand, index, self) => 
      index === self.findIndex((b) => b.id === brand.id)
    )
    
    // Depois remover duplicatas por nome (case-insensitive)
    const uniqueByName = uniqueById.filter((brand, index, self) => {
      const nameKey = brand.name.toLowerCase().trim()
      const firstIndex = self.findIndex((b) => b.name.toLowerCase().trim() === nameKey)
      // Se não é o primeiro com esse nome, verificar qual é mais recente
      if (index !== firstIndex) {
        const firstBrand = self[firstIndex]
        const firstDate = new Date(firstBrand.created_at || 0).getTime()
        const currentDate = new Date(brand.created_at || 0).getTime()
        // Manter apenas o mais recente
        return currentDate > firstDate
      }
      return true
    })
    
    // Garantir que não há duplicatas finais
    const finalUnique = uniqueByName.filter((brand, index, self) => {
      const nameKey = brand.name.toLowerCase().trim()
      return index === self.findIndex((b) => b.name.toLowerCase().trim() === nameKey)
    })
    
    if (finalUnique.length !== brands.length) {
      console.warn(`⚠️ Brands: ${brands.length - finalUnique.length} marca(s) duplicada(s) removida(s) no componente`)
    }
    
    return shuffleArray(finalUnique)
  }, [brands])
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

  // Calcular total de slides - sempre criar pelo menos 2 slides para rotação contínua
  const totalSlides = useMemo(() => {
    if (activeBrands.length === 0) return 1
    // Se houver poucas marcas, duplicar para criar múltiplos slides
    const naturalSlides = Math.ceil(activeBrands.length / itemsPerView)
    // Sempre ter pelo menos 2 slides para permitir rotação
    return naturalSlides < 2 ? 2 : naturalSlides
  }, [activeBrands.length, itemsPerView])

  // Sempre iniciar auto-rotação (sempre usar carrossel)
  useEffect(() => {
    setIsAutoRotating(true)
  }, [])

  // Rotação automática a cada 10 segundos - sempre ativa quando há marcas
  useEffect(() => {
    // Só rotacionar se houver marcas e mais de um slide
    if (activeBrands.length === 0 || totalSlides <= 1) return
    
    if (!isAutoRotating) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        // Se chegou ao final, voltar ao início (loop infinito)
        return nextIndex >= totalSlides ? 0 : nextIndex
      })
    }, 10000) // 10 segundos

    return () => clearInterval(interval)
  }, [activeBrands.length, totalSlides, isAutoRotating])

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
                {/* Renderizar marcas únicas apenas (sem duplicação visual) */}
                {/* Duplicar apenas o necessário para criar carrossel infinito suave, mas garantir que cada marca única apareça apenas uma vez por ciclo */}
                {(() => {
                  // Criar array de marcas únicas para renderização
                  const uniqueBrandsForRender = activeBrands.filter((brand, index, self) => 
                    index === self.findIndex((b) => b.id === brand.id)
                  )
                  
                  // Duplicar apenas o necessário para o carrossel (máximo 2 ciclos completos)
                  const cyclesNeeded = Math.max(2, Math.ceil(totalSlides * 1.5))
                  const brandsToRender = Array.from({ length: cyclesNeeded }).flatMap(() => uniqueBrandsForRender)
                  
                  return brandsToRender.map((brand, index) => (
                    <div
                      key={`${brand.id}-cycle-${Math.floor(index / uniqueBrandsForRender.length)}-pos-${index % uniqueBrandsForRender.length}`}
                      className="flex-shrink-0 px-2 sm:px-3"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                    <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 text-center hover:bg-gray-50 transition-all duration-300 md:hover:shadow-lg md:hover:-translate-y-1">
                      <div className="mb-2 sm:mb-3 flex items-center justify-center" style={{ minHeight: '48px' }}>
                        <img 
                          src={brand.image} 
                          alt={`${brand.name} marca`}
                          className="max-w-full max-h-12 sm:max-h-14 md:max-h-16"
                          style={{ 
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '64px',
                            display: 'block'
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
                  ))
                })()}
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
