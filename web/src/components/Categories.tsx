'use client'

import Link from 'next/link'
import { 
  Gem, Clock, Eye, Diamond, Package, Watch, ShoppingBag, Box, Gift, Tag, Award, Sparkles, Crown, Heart, Star,
  Zap, Flame, Leaf, Music, Camera, Gamepad2, Book, Coffee, Beer, Wine, Pizza, Utensils, Car, Plane, Home,
  Building, Briefcase, Palette, Paintbrush, Scissors, Wrench, Hammer, Gauge, Cog, User, Users, Smile,
  ThumbsUp, Bell, Mail, Phone, Settings
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface CategoryData {
  id: string
  name: string
  description: string
  image: string
  iconName: string
  href: string
}

// CATEGORIAS BASE (para fallback se não houver no banco)
const BASE_CATEGORIES = ['Joias', 'Relógios', 'Óculos', 'Semi-Joias', 'Afins', 'Serviços']

export default function Categories() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  const getDefaultCategory = (name: string): CategoryData | null => {
    const defaults: { [key: string]: CategoryData } = {
      'Joias': {
        id: '1',
        name: 'Joias',
        description: 'Anéis, colares, brincos e pulseiras em ouro e prata',
        iconName: 'gem',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Joias'
      },
      'Relógios': {
        id: '2',
        name: 'Relógios',
        description: 'Relógios masculinos e femininos das melhores marcas',
        iconName: 'clock',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Relógios'
      },
      'Óculos': {
        id: '3',
        name: 'Óculos',
        description: 'Óculos de sol e grau com tecnologia avançada',
        iconName: 'eye',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Óculos'
      },
      'Semi-Joias': {
        id: '4',
        name: 'Semi-Joias',
        description: 'Bijuterias elegantes e acessórios modernos',
        iconName: 'diamond',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Semi-Joias'
      },
      'Afins': {
        id: '5',
        name: 'Afins',
        description: 'Produtos variados e categorias relacionadas',
        iconName: 'package',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Afins'
      },
      'Serviços': {
        id: '6',
        name: 'Serviços',
        description: 'Manutenção, reparos e serviços especializados',
        iconName: 'wrench',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        href: '/servicos'
      }
    }
    return defaults[name] || null
  }

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { supabase } = await import('@/lib/supabase')
      
      // BUSCAR TODAS AS CATEGORIAS DO BANCO (sem filtros de nome - vamos filtrar depois)
      // Isso garante que novas categorias sejam carregadas
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, image, icon, created_at, updated_at')
        .order('created_at', { ascending: true })
        
      if (error) {
        console.error('❌ Erro ao buscar categorias do Supabase:', error)
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2))
        setLoading(false)
        return
      }
      
      if (data && data.length > 0 && !error) {
        // PROCESSAR TODAS AS CATEGORIAS DO BANCO (incluindo Serviços)
        const dbCategories = data
          .map((cat: any) => ({
            id: cat.id || '',
            name: (cat.name || '').trim(),
            description: cat.description || '',
            image: cat.image || '',
            iconName: cat.icon || 'gem',
            href: `/produtos?categoria=${encodeURIComponent(cat.name || '')}`
          }))
        
        setCategories(dbCategories)
        setLoading(false)
        return
      } else if (data && data.length === 0) {
        // Se banco está vazio, usar fallback
        console.warn('⚠️ Banco de categorias está vazio, usando fallback')
        const defaultCategories: CategoryData[] = BASE_CATEGORIES
          .map(name => getDefaultCategory(name))
          .filter((cat): cat is CategoryData => cat !== null)
        setCategories(defaultCategories)
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
    
    // Fallback: usar apenas as categorias padrão base
    const defaultCategories: CategoryData[] = BASE_CATEGORIES
      .map(name => getDefaultCategory(name))
      .filter((cat): cat is CategoryData => cat !== null)
    
    setCategories(defaultCategories)
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
    
    // Escutar eventos de atualização de categorias do admin
    const handleCategoryUpdate = () => {
      loadCategories()
    }
    
    window.addEventListener('category-updated', handleCategoryUpdate)
    
    return () => {
      window.removeEventListener('category-updated', handleCategoryUpdate)
    }
  }, [])


  const getIconComponent = (iconName: string) => {
    // Mapear todos os ícones disponíveis
    const iconMap: { [key: string]: any } = {
      // Joias e Acessórios
      'gem': Gem,
      'diamond': Diamond,
      'crown': Crown,
      'sparkles': Sparkles,
      'award': Award,
      // Relógios e Óculos
      'clock': Clock,
      'watch': Watch,
      'eye': Eye,
      // Produtos e Embalagem
      'package': Package,
      'box': Box,
      'gift': Gift,
      'shopping-bag': ShoppingBag,
      // Categorias Gerais
      'tag': Tag,
      'star': Star,
      'heart': Heart,
      'zap': Zap,
      'flame': Flame,
      'leaf': Leaf,
      // Bebidas e Comida
      'coffee': Coffee,
      'beer': Beer,
      'wine': Wine,
      'pizza': Pizza,
      'utensils': Utensils,
      // Entretenimento
      'music': Music,
      'camera': Camera,
      'gamepad2': Gamepad2,
      'book': Book,
      // Locais e Viagem
      'home': Home,
      'building': Building,
      'car': Car,
      'plane': Plane,
      'briefcase': Briefcase,
      // Ferramentas
      'wrench': Wrench,
      'hammer': Hammer,
      'scissors': Scissors,
      'gauge': Gauge,
      'cog': Cog,
      'paintbrush': Paintbrush,
      'palette': Palette,
      'settings': Settings,
      // Pessoas e Comunicação
      'user': User,
      'users': Users,
      'smile': Smile,
      'thumbs-up': ThumbsUp,
      'bell': Bell,
      'mail': Mail,
      'phone': Phone,
    }
    
    return iconMap[iconName] || Gem // Fallback para Gem se ícone não encontrado
  }

  // Usar todas as categorias (incluindo Serviços)
  const displayCategories = useMemo(() => {
    return categories
  }, [categories])

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 tracking-wide">
              Nossas Especialidades
            </h2>
            <div className="w-20 h-0.5 bg-gray-800 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Carregando categorias...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-2 sm:mb-3 md:mb-6 tracking-wide">
            Nossas Especialidades
          </h2>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-gray-800 mx-auto mb-3 sm:mb-4 md:mb-8"></div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light px-4">
            Descubra nossa seleção cuidadosamente curada de produtos
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto">
          {displayCategories.map((category) => {
            const IconComponent = getIconComponent(category.iconName)
            const href = category.href || '/produtos'
            return (
              <Link
                key={category.id}
                href={href}
                className="group block bg-white border border-gray-200 md:hover:border-gray-800 transition-all duration-300 overflow-hidden md:hover:shadow-lg md:hover:-translate-y-1 active:scale-[0.98] touch-manipulation w-full"
              >
                <div className="relative h-24 sm:h-32 md:h-36 lg:h-40 overflow-hidden bg-gray-200">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        const defaultCat = getDefaultCategory(category.name)
                        if (defaultCat?.image) {
                          e.currentTarget.src = defaultCat.image
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-1 sm:p-1.5 rounded-full shadow-sm group-hover:bg-gray-800 group-hover:text-white transition-all duration-300">
                      <IconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 md:p-3">
                  <h3 className="text-[11px] sm:text-sm md:text-base font-medium text-gray-900 mb-0.5 sm:mb-1 group-hover:text-gray-800 transition-colors leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-[10px] sm:text-xs leading-tight sm:leading-relaxed line-clamp-2 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
