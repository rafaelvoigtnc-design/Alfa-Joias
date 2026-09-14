'use client'

import { useState, useEffect } from 'react'
import { useFirebaseBanners } from '@/hooks/useFirebaseBanners'

export default function HeroCarousel() {
  const { banners, loading } = useFirebaseBanners()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)

  const activeBanners = banners.filter(b => b.active)

  // Funções de navegação
  const goToNextSlide = () => {
    if (activeBanners.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
  }

  const goToPrevSlide = () => {
    if (activeBanners.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  }

  // Auto-rotação em todos os dispositivos a cada 12 segundos
  useEffect(() => {
    if (activeBanners.length <= 1 || !isAutoRotating) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
    }, 12000)

    return () => clearInterval(interval)
  }, [activeBanners.length, isAutoRotating])

  // Suporte a touch para mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button[aria-label*="banner"], button[aria-label*="Banner"]')) {
      return
    }
    setIsAutoRotating(false)
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button[aria-label*="banner"], button[aria-label*="Banner"]')) {
      return
    }
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (e?: React.TouchEvent) => {
    if (e) {
      const target = e.target as HTMLElement
      if (target.closest('button[aria-label*="banner"], button[aria-label*="Banner"]')) {
        return
      }
    }
    if (!touchStart || !touchEnd) {
      setTimeout(() => {
        setIsAutoRotating(true)
      }, 5000)
      return
    }
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNextSlide()
    }
    if (isRightSwipe) {
      goToPrevSlide()
    }
    
    setTimeout(() => {
      setIsAutoRotating(true)
    }, 5000)
  }

  if (loading) {
    return (
      <section className="relative bg-white">
        <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-3xl">
              <div className="h-16 bg-gray-300 rounded mb-6 animate-pulse"></div>
              <div className="w-24 h-1 bg-gray-300 rounded mb-8 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded mb-10 animate-pulse"></div>
              <div className="h-12 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (activeBanners.length === 0) {
    return (
      <section className="relative bg-white">
        <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gray-200" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-wide text-gray-900 mb-3 sm:mb-4 md:mb-6 leading-tight">
                Alfa Jóias
              </h1>
              <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-gray-800 mb-4 sm:mb-6 md:mb-8"></div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed">
                A Vitrine dos seus Olhos
              </p>
              <a
                href="/produtos"
                className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base transition-all duration-300 font-medium hover:scale-105 active:scale-95"
              >
                Explorar
                <svg className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Pausar rotação ao passar o mouse (desktop)
  const handleMouseEnter = () => {
    setIsAutoRotating(false)
  }

  const handleMouseLeave = () => {
    setIsAutoRotating(true)
  }

  return (
    <section 
      className="relative bg-white" 
      id="hero-carousel-section" 
      style={{ position: 'relative', touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden" style={{ position: 'relative' }}>
        {/* Imagem Desktop */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${activeBanners[currentSlide]?.image})` }}
        />
        {/* Imagem Mobile */}
        <div 
          className="md:hidden absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${activeBanners[currentSlide]?.image})` }}
        />
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000" />
        
        {/* Botões de navegação */}
        {activeBanners.length > 1 && (
          <>
            {/* Botão Anterior */}
            <button
              onTouchStart={(e) => {
                e.stopPropagation()
                e.preventDefault()
                goToPrevSlide()
              }}
              onClick={(e) => {
                e.stopPropagation()
                goToPrevSlide()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              className="bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Banner anterior"
              type="button"
            >
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" pointerEvents="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Botão Próximo */}
            <button
              onTouchStart={(e) => {
                e.stopPropagation()
                e.preventDefault()
                goToNextSlide()
              }}
              onClick={(e) => {
                e.stopPropagation()
                goToNextSlide()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                pointerEvents: 'auto',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
              className="bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Próximo banner"
              type="button"
            >
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" pointerEvents="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indicadores de slide */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-0.5 items-center">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="transition-all duration-300 rounded-full touch-manipulation"
                style={{
                  width: index === currentSlide ? '6px' : '4px',
                  height: index === currentSlide ? '6px' : '4px',
                  backgroundColor: index === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  minWidth: index === currentSlide ? '6px' : '4px',
                  minHeight: index === currentSlide ? '6px' : '4px'
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSlide) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSlide) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                  }
                }}
                aria-label={`Ir para slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        )}
        
        <div className="relative z-20 max-w-6xl mx-auto px-8 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl w-full relative z-30 ml-8 sm:ml-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-light tracking-wide text-white mb-3 sm:mb-4 md:mb-6 leading-tight transition-all duration-700 ease-in-out drop-shadow-lg">
              {activeBanners[currentSlide]?.title}
            </h1>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-white mb-4 sm:mb-6 md:mb-8 transition-all duration-700 ease-in-out drop-shadow"></div>
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/95 mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed transition-all duration-700 ease-in-out drop-shadow-lg">
              {activeBanners[currentSlide]?.subtitle}
            </p>
            <a
              href={activeBanners[currentSlide]?.ctaLink || '/produtos'}
              className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-gray-900 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg transition-all duration-300 font-medium hover:scale-105 active:scale-95 rounded-md shadow-lg backdrop-blur-sm bg-white/10 min-w-[140px] sm:min-w-[160px]"
            >
              <span className="flex-1 text-center">{activeBanners[currentSlide]?.ctaText || 'Explorar'}</span>
              <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}