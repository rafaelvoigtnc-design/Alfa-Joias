'use client'

import Link from 'next/link'
import { 
  Gem, Clock, Eye, Diamond, Package, Watch, ShoppingBag, Box, Gift, Tag, Award, Sparkles, Crown, Heart, Star,
  Zap, Flame, Leaf, Music, Camera, Gamepad2, Book, Coffee, Beer, Wine, Pizza, Utensils, Car, Plane, Home,
  Building, Briefcase, Palette, Paintbrush, Scissors, Wrench, Hammer, Gauge, Cog, User, Users, Smile,
  ThumbsUp, Bell, Mail, Phone, Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useFirebaseCategories } from '@/hooks/useFirebaseCategories'

interface CategoryData {
  id: string
  name: string
  description: string
  image: string
  iconName: string
  href: string
}

const BASE_CATEGORIES = ['Óculos', 'Relógios', 'Joias', 'Semi-Joias', 'Afins', 'Serviços']

export default function Categories() {
  const { categories, loading } = useFirebaseCategories()
  const [displayCategories, setDisplayCategories] = useState<CategoryData[]>([])

  useEffect(() => {
    if (categories.length > 0) {
      const mapped = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        image: cat.image || '',
        iconName: cat.icon || 'gem',
        href: `/produtos?category=${cat.name}`
      }))
      setDisplayCategories(mapped)
    } else {
      // Fallback para categorias estáticas
      const fallback = BASE_CATEGORIES.map(name => ({
        id: name,
        name,
        description: `Explore nossa coleção de ${name}`,
        image: '',
        iconName: 'gem',
        href: `/produtos?category=${name}`
      }))
      setDisplayCategories(fallback)
    }
  }, [categories])

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      gem: Gem,
      clock: Clock,
      eye: Eye,
      diamond: Diamond,
      package: Package,
      watch: Watch,
      'shopping-bag': ShoppingBag,
      box: Box,
      gift: Gift,
      tag: Tag,
      award: Award,
      sparkles: Sparkles,
      crown: Crown,
      heart: Heart,
      star: Star,
      zap: Zap,
      flame: Flame,
      leaf: Leaf,
      music: Music,
      camera: Camera,
      gamepad2: Gamepad2,
      book: Book,
      coffee: Coffee,
      beer: Beer,
      wine: Wine,
      pizza: Pizza,
      utensils: Utensils,
      car: Car,
      plane: Plane,
      home: Home,
      building: Building,
      briefcase: Briefcase,
      palette: Palette,
      paintbrush: Paintbrush,
      scissors: Scissors,
      wrench: Wrench,
      hammer: Hammer,
      gauge: Gauge,
      cog: Cog,
      user: User,
      users: Users,
      smile: Smile,
      'thumbs-up': ThumbsUp,
      bell: Bell,
      mail: Mail,
      phone: Phone,
      settings: Settings
    }
    return iconMap[iconName] || Gem
  }

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((category) => {
            const Icon = getCategoryIcon(category.iconName)
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Icon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                  <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}