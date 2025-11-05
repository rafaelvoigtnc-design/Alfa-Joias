'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroCarousel() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true)
        const { supabase } = await import('@/lib/supabase')
        console.log('🔄 Buscando banners do banco...')
        
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
        
        if (error) {
          console.error('❌ Erro ao buscar banners:', error)
          // Usar fallback em caso de erro
          throw new Error('Erro ao buscar banners')
        }
        
        if (data && data.length > 0) {
          console.log('✅ Banners carregados do BANCO:', data.length)
          setBanners(data.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image: b.image,
            ctaText: b.cta_text,
            ctaLink: b.cta_link,
            active: b.active
          })))
          setLoading(false)
          return
        }
        
        console.warn('⚠️ Banco de banners vazio, usando banners padrão')
      } catch (err) {
        console.log('⚠️ Erro ao buscar banners, usando padrão:', err)
      }
      
      // Fallback: banners padrão (sempre usar se houver erro ou banco vazio)
      const defaultBanners = [
        {
          id: '1',
          title: 'Alfa Jóias',
          subtitle: 'A Vitrine dos seus Olhos',
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=800&fit=crop',
          ctaText: 'Explorar',
          ctaLink: '/produtos',
          active: true
        },
        {
          id: '2',
          title: 'Promoções Especiais',
          subtitle: 'Até 50% de desconto em produtos selecionados',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop',
          ctaText: 'Ver Ofertas',
          ctaLink: '/promocoes',
          active: true
        }
      ]
      setBanners(defaultBanners)
      setLoading(false)
    }
    
    loadBanners()
  }, [])

  const activeBanners = banners.filter(b => b.active)

  useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [activeBanners])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)

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
    <section className="relative bg-white">
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${activeBanners[currentSlide]?.image})` }}
        />
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-light tracking-wide text-white mb-3 sm:mb-4 md:mb-6 leading-tight transition-all duration-700 ease-in-out">
              {activeBanners[currentSlide]?.title}
            </h1>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-white mb-4 sm:mb-6 md:mb-8 transition-all duration-700 ease-in-out"></div>
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed transition-all duration-700 ease-in-out">
              {activeBanners[currentSlide]?.subtitle}
            </p>
            <a
              href={activeBanners[currentSlide]?.ctaLink || '/produtos'}
              className="inline-flex items-center border border-white text-white hover:bg-white hover:text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base transition-all duration-300 font-medium hover:scale-105 active:scale-95"
            >
              {activeBanners[currentSlide]?.ctaText || 'Explorar'}
              <svg className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 backdrop-blur-sm active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-all duration-300 backdrop-blur-sm active:scale-95"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}

        {/* Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-[2px] sm:space-x-1">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '4px',
                  height: '4px',
                  minWidth: '4px',
                  minHeight: '4px',
                  padding: '0',
                  margin: '0'
                }}
                className={`rounded-full transition-all duration-300 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 ${
                  index === currentSlide ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}