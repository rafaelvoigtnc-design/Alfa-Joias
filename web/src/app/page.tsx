'use client'

import dynamic from 'next/dynamic'
import HeroCarousel from '@/components/HeroCarousel'

// Lazy load components para melhorar performance inicial
const Categories = dynamic(() => import('@/components/Categories'), { ssr: true })
const FeaturedProducts = dynamic(() => import('@/components/FeaturedProducts'), { ssr: true })
const Promotions = dynamic(() => import('@/components/Promotions'), { ssr: false })
import Services from '@/components/Services'
const Brands = dynamic(() => import('@/components/Brands'), { ssr: false })
const Newsletter = dynamic(() => import('@/components/Newsletter'), { ssr: false })
const About = dynamic(() => import('@/components/About'), { ssr: false })
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false })

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* TESTE VISÍVEL - TEXTO VERMELHO GIGANTE */}
      <div style={{ 
        width: '100%', 
        backgroundColor: 'red', 
        color: 'white', 
        padding: '50px', 
        textAlign: 'center', 
        fontSize: '48px', 
        fontWeight: 'bold',
        position: 'relative',
        zIndex: 999999
      }}>
        TESTE: ALTERAÇÕES FUNCIONANDO!
      </div>
      <HeroCarousel />
      <Categories />
      <FeaturedProducts />
      <Promotions />
      <Services />
      <Brands />
      <Newsletter />
      <About />
      <Contact />
    </div>
  )
}
