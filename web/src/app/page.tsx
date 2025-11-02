'use client'

import HeroCarousel from '@/components/HeroCarousel'
import Categories from '@/components/Categories'
import FeaturedProducts from '@/components/FeaturedProducts'
import Promotions from '@/components/Promotions'
import Services from '@/components/Services'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Brands from '@/components/Brands'
import Newsletter from '@/components/Newsletter'

export default function Home() {
  return (
    <div className="min-h-screen">
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
