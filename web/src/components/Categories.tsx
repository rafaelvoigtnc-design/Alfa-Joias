'use client'

import Link from 'next/link'
import { Gem, Clock, Eye, Diamond } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface CategoryData {
  id: string
  name: string
  description: string
  image: string
  iconName: string
  href: string
}

// LISTA FIXA DE CATEGORIAS PERMITIDAS - APENAS ESTAS PODEM APARECER
const ALLOWED_CATEGORIES = ['Joias', 'Relógios', 'Óculos', 'Semi-Joias', 'Afins']

export default function Categories() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(false)

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
      }
    }
    return defaults[name] || null
  }

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { supabase } = await import('@/lib/supabase')
      
      // BUSCAR APENAS AS CATEGORIAS PERMITIDAS - EXCLUIR SERVIÇOS DIRETO NA QUERY
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .in('name', ALLOWED_CATEGORIES) // APENAS categorias permitidas
        .order('updated_at', { ascending: false, nullsFirst: false })
        
      if (error) {
        console.error('❌ Erro ao buscar categorias:', error)
      }
      
      if (data && data.length > 0 && !error) {
        // PROCESSAR APENAS CATEGORIAS PERMITIDAS - ORDEM FIXA
        const finalCategories: CategoryData[] = []
        
        // IGNORAR COMPLETAMENTE qualquer categoria que não esteja em ALLOWED_CATEGORIES
        for (const allowedName of ALLOWED_CATEGORIES) {
          // Buscar no banco APENAS se estiver na lista permitida
          const dbCategory = data.find((cat: any) => {
            const catName = (cat.name || '').trim()
            // VERIFICAÇÃO DUPLA: deve estar na lista E não ser Serviços
            return catName === allowedName && 
                   ALLOWED_CATEGORIES.includes(catName) &&
                   catName !== 'Serviços' &&
                   catName.toLowerCase() !== 'serviços'
          })
          
          if (dbCategory && ALLOWED_CATEGORIES.includes(dbCategory.name)) {
            // Usar dados do banco
            finalCategories.push({
              id: dbCategory.id,
              name: dbCategory.name,
              description: dbCategory.description || '',
              image: dbCategory.image || '',
              iconName: dbCategory.icon || 'gem',
              href: dbCategory.name === 'Afins' ? '/produtos?categoria=Afins' : `/produtos?categoria=${dbCategory.name}`
            })
          } else {
            // Usar padrão se não existe no banco
            const defaultCat = getDefaultCategory(allowedName)
            if (defaultCat) {
              finalCategories.push(defaultCat)
            }
          }
        }
        
        // FILTRO FINAL ABSOLUTO - REMOVER QUALQUER COISA QUE NÃO ESTEJA NA LISTA
        const safeCategories = finalCategories
          .filter(cat => {
            const name = (cat.name || '').trim()
            return ALLOWED_CATEGORIES.includes(name) &&
                   name !== 'Serviços' &&
                   name.toLowerCase() !== 'serviços' &&
                   !name.includes('Serviço')
          })
        
        console.log('✅ Categorias FINAIS (SEM SERVIÇOS):', safeCategories.map(c => c.name))
        setCategories(safeCategories)
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
    
    // Fallback: usar apenas as categorias padrão permitidas
    const defaultCategories: CategoryData[] = ALLOWED_CATEGORIES
      .map(name => getDefaultCategory(name))
      .filter((cat): cat is CategoryData => cat !== null)
    
    console.log('✅ Usando categorias padrão:', defaultCategories.map(c => c.name))
    setCategories(defaultCategories)
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // PROTEÇÃO EXTRA: Remover "Serviços" do estado imediatamente se aparecer
  useEffect(() => {
    if (categories.length > 0) {
      const hasServicos = categories.some(cat => {
        const name = (cat.name || '').trim().toLowerCase()
        return name === 'serviços' || name === 'servicos' || name.includes('serviço')
      })
      
      if (hasServicos) {
        console.error('❌ ALERTA CRÍTICO: Serviços detectado no estado! Removendo AGORA...')
        const cleaned = categories.filter(cat => {
          const name = (cat.name || '').trim().toLowerCase()
          return name !== 'serviços' && name !== 'servicos' && !name.includes('serviço')
        })
        setCategories(cleaned)
      }
    }
  }, [categories])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'gem':
        return Gem
      case 'clock':
        return Clock
      case 'eye':
        return Eye
      case 'diamond':
        return Diamond
      case 'package':
        return Gem // Usar Gem como fallback para Afins
      default:
        return Gem
    }
  }

  // GARANTIR que apenas categorias permitidas sejam renderizadas
  // PROTEÇÃO MÁXIMA: Filtrar também por nome exato e case-insensitive
  const displayCategories = useMemo(() => {
    const filtered = categories.filter(cat => {
      // Verificar se está na lista permitida
      const inAllowedList = ALLOWED_CATEGORIES.includes(cat.name)
      // Verificar se NÃO é Serviços (de qualquer forma)
      const name = (cat.name || '').trim().toLowerCase()
      const isServicos = name === 'serviços' || name === 'servicos' || name.includes('serviço')
      
      if (isServicos) {
        console.error('❌ BLOQUEADO: Tentativa de renderizar Serviços!', cat)
        return false
      }
      
      return inAllowedList && !isServicos
    })
    
    console.log('🎨 Categorias que serão renderizadas:', filtered.map(c => c.name))
    return filtered
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
          {displayCategories
            .filter(category => {
              // PROTEÇÃO FINAL: Verificar novamente antes de renderizar
              const name = (category.name || '').trim().toLowerCase()
              const isServicos = name === 'serviços' || name === 'servicos' || name.includes('serviço')
              if (isServicos) {
                console.error('❌ BLOQUEADO NO RENDER: Serviços detectado!', category)
                return false
              }
              return ALLOWED_CATEGORIES.includes(category.name)
            })
            .map((category) => {
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
