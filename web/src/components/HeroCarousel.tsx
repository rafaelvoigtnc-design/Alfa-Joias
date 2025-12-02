'use client'

import { useState, useEffect, useRef } from 'react'

export default function HeroCarousel() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Refs para prevenir race conditions
  const isFetchingRef = useRef(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const loadBanners = async () => {
      // Prevenir múltiplas chamadas simultâneas
      if (isFetchingRef.current) {
        console.log('⏸️ Já está buscando banners, ignorando chamada duplicada...')
        return
      }
      
      // Incrementar ID da requisição para rastrear a mais recente (fora do try para estar acessível no catch)
      const currentRequestId = ++requestIdRef.current
      
      try {
        
        isFetchingRef.current = true
        setLoading(true)
        const { supabase } = await import('@/lib/supabase')
        console.log('🔄 Buscando banners do banco...', { requestId: currentRequestId })
        
        // Timeout de 5 segundos para evitar carregamento infinito
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao carregar banners')), 5000)
        )
        
        const queryPromise = supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(10) // Limitar para melhor performance
        
        const result = await Promise.race([queryPromise, timeoutPromise]) as Awaited<typeof queryPromise>
        const { data, error } = result
        
        // Verificar se ainda é a requisição mais recente
        if (currentRequestId !== requestIdRef.current) {
          console.log('⏹️ Resposta de requisição antiga de banners ignorada')
          return
        }
        
        if (error) {
          console.error('❌ Erro ao buscar banners:', error)
          if (currentRequestId === requestIdRef.current) {
            setBanners([])
            setLoading(false)
          }
          isFetchingRef.current = false
          return
        }
        
        if (data && data.length > 0) {
          console.log('✅ Banners carregados do BANCO:', data.length, { requestId: currentRequestId })
          if (currentRequestId === requestIdRef.current) {
            setBanners(data.map((b: any) => {
              // Parsear imagem (pode ser string simples ou JSON com desktop/mobile)
              let image = b.image
              let imageDesktop = b.image
              let imageMobile = b.image
              
              try {
                const parsed = JSON.parse(b.image)
                if (typeof parsed === 'object' && (parsed.desktop || parsed.mobile)) {
                  imageDesktop = parsed.desktop || parsed.original || b.image
                  imageMobile = parsed.mobile || parsed.original || b.image
                  image = imageDesktop // Fallback para compatibilidade
                }
              } catch {
                // Não é JSON, usar string simples
                imageDesktop = b.image
                imageMobile = b.image
              }
              
              return {
                id: b.id,
                title: b.title,
                subtitle: b.subtitle,
                image: image,
                imageDesktop: imageDesktop,
                imageMobile: imageMobile,
                ctaText: b.cta_text,
                ctaLink: b.cta_link,
                active: b.active
              }
            }))
            setLoading(false)
            isFetchingRef.current = false
            return
          }
        }
        
        console.warn('⚠️ Banco de banners vazio')
        if (currentRequestId === requestIdRef.current) {
          setBanners([])
          setLoading(false)
        }
        isFetchingRef.current = false
        return
      } catch (err) {
        console.error('❌ Erro ao buscar banners:', err)
        // Em caso de erro, retornar array vazio (não usar fallback)
        const latestRequestId = requestIdRef.current
        if (currentRequestId === latestRequestId) {
          setBanners([])
          setLoading(false)
        }
        isFetchingRef.current = false
        return
      }
    }
    
    loadBanners()
  }, [])

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

  // Suporte a touch para mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNextSlide()
    }
    if (isRightSwipe) {
      goToPrevSlide()
    }
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

  return (
    <section 
      className="relative bg-white" 
      id="hero-carousel-section" 
      style={{ position: 'relative' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden" style={{ position: 'relative' }}>
        {/* Imagem Desktop */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${activeBanners[currentSlide]?.imageDesktop || activeBanners[currentSlide]?.image})` }}
        />
        {/* Imagem Mobile */}
        <div 
          className="md:hidden absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${activeBanners[currentSlide]?.imageMobile || activeBanners[currentSlide]?.image})` }}
        />
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000" />
        
        {/* Botões de navegação */}
        {activeBanners.length > 1 && (
          <>
            {/* Botão Anterior */}
            <button
              onClick={goToPrevSlide}
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
              aria-label="Banner anterior"
              type="button"
            >
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Botão Próximo */}
            <button
              onClick={goToNextSlide}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
              aria-label="Próximo banner"
              type="button"
            >
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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