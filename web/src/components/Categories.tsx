'use client'

import Link from 'next/link'
import { Gem, Clock, Eye, Sparkles, Diamond, Wrench } from 'lucide-react'
import { useState, useEffect } from 'react'
import OptimizedImage from './OptimizedImage'

interface CategoryData {
  id: string
  name: string
  description: string
  image: string
  iconName: string
  href: string
}

export default function Categories() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [imageReloadKey, setImageReloadKey] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  const getDefaultCategory = (name: string): CategoryData | null => {
    const defaults = {
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
      }
    }
    return defaults[name as keyof typeof defaults] || null
  }

  const loadCategories = async () => {
    try {
      setLoading(true)
      const loadTime = Date.now()
      console.log(`📥 [${loadTime}] Iniciando carregamento de categorias do banco...`)
      // Carregar do Supabase com cache busting forçado
      const { supabase } = await import('@/lib/supabase')
      
      // Forçar busca sem cache - buscar por updated_at para pegar as mais recentes
      const timestamp = Date.now()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('updated_at', { ascending: false, nullsFirst: false })
        
      console.log(`📊 [${loadTime}] Dados recebidos do Supabase:`, data?.length || 0, 'categorias')
      
      // Log detalhado da categoria Serviços
      if (data) {
        const servicosInDb = data.find((cat: any) => cat.name === 'Serviços')
        if (servicosInDb) {
          console.log(`🔍 [${loadTime}] Categoria Serviços encontrada no banco:`, {
            id: servicosInDb.id,
            name: servicosInDb.name,
            imageLength: servicosInDb.image?.length || 0,
            imageType: servicosInDb.image?.startsWith('data:') ? 'base64' : servicosInDb.image?.startsWith('http') ? 'url' : 'outro',
            imagePreview: servicosInDb.image?.substring(0, 150) || 'vazia',
            updated_at: servicosInDb.updated_at
          })
        } else {
          console.log(`⚠️ [${loadTime}] Categoria Serviços NÃO encontrada no banco!`)
        }
      }
      
      if (error) {
        console.error(`❌ [${loadTime}] Erro ao buscar categorias:`, error)
      }
      
      if (data && data.length > 0 && !error) {
        // Filtrar categorias válidas (4 categorias de produtos + Serviços)
        const validCategories = ['Joias', 'Relógios', 'Óculos', 'Semi-Joias', 'Serviços']
        const filteredData = data.filter((cat: any) => validCategories.includes(cat.name))
        
        // Mapear categorias do banco para o formato do componente
        const mappedCategories = filteredData.map((cat: any) => {
          const mapped = {
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            image: cat.image || '', // Garantir que sempre tenha um valor (mesmo que vazio)
            iconName: cat.icon || 'gem',
            href: cat.name === 'Serviços' ? '/servicos' : `/produtos?categoria=${cat.name}`
          }
          
          // Log detalhado para categoria Serviços
          if (cat.name === 'Serviços') {
            console.log(`🖼️ [${loadTime}] Mapeando categoria Serviços:`, {
              id: mapped.id,
              imageLength: mapped.image?.length || 0,
              imagePreview: mapped.image?.substring(0, 150) || 'vazia',
              originalImageLength: cat.image?.length || 0
            })
          }
          
          return mapped
        })
        
        // Garantir que temos todas as categorias (adicionar as que faltam)
        const finalCategories = []
        const categoryMap = new Map(mappedCategories.map(cat => [cat.name, cat]))
        
        // Adicionar categorias de produtos na ordem correta
        const productCategories = ['Joias', 'Relógios', 'Óculos', 'Semi-Joias']
        productCategories.forEach(name => {
          if (categoryMap.has(name)) {
            finalCategories.push(categoryMap.get(name)!)
          } else {
            // Adicionar categoria padrão se não existir no banco
            const defaultCat = getDefaultCategory(name)
            if (defaultCat) finalCategories.push(defaultCat)
          }
        })
        
        // Adicionar item "Serviços" sempre por último (do banco ou padrão)
        if (categoryMap.has('Serviços')) {
          const servicosCat = categoryMap.get('Serviços')!
          
          console.log('🔍 [FINAL] Categoria Serviços antes de adicionar:', {
            id: servicosCat.id,
            name: servicosCat.name,
            imageLength: servicosCat.image?.length || 0,
            imageType: servicosCat.image?.startsWith('data:') ? 'base64' : servicosCat.image?.startsWith('http') ? 'url' : 'outro',
            imagePreview: servicosCat.image?.substring(0, 150) || 'vazia',
            isEmpty: !servicosCat.image || servicosCat.image.trim() === ''
          })
          
          // Garantir que tem imagem, senão usar padrão
          if (!servicosCat.image || servicosCat.image.trim() === '') {
            console.log('⚠️ Imagem de Serviços vazia, usando padrão')
            servicosCat.image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
          } else {
            console.log('✅ Imagem de Serviços válida encontrada!', {
              length: servicosCat.image.length,
              type: servicosCat.image.startsWith('data:') ? 'base64' : servicosCat.image.startsWith('http') ? 'url' : 'outro',
              preview: servicosCat.image.substring(0, 150),
              hash: servicosCat.image.substring(0, 20) + '...' + servicosCat.image.substring(servicosCat.image.length - 20)
            })
          }
          
          finalCategories.push(servicosCat)
          
          console.log('📦 [FINAL] Categorias após processar Serviços:', finalCategories.map(c => ({
            name: c.name,
            hasImage: !!c.image,
            imageLength: c.image?.length || 0
          })))
        } else {
          console.log('⚠️ Categoria Serviços não encontrada no banco, usando fallback')
          // Fallback se não existir no banco
          finalCategories.push({
            id: 'services',
            name: 'Serviços',
            description: 'Manutenção, reparos e serviços especializados',
            iconName: 'wrench',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
            href: '/servicos'
          })
        }
        
        console.log('📦 Categorias finais definidas:', finalCategories.map(c => ({ 
          name: c.name, 
          hasImage: !!c.image,
          imageType: c.image?.startsWith('data:') ? 'base64' : c.image?.startsWith('http') ? 'url' : 'outro'
        })))
        
        // Criar nova referência para forçar atualização do React
        const newCategories = JSON.parse(JSON.stringify(finalCategories))
        setCategories(newCategories)
        setLoading(false)
        
        console.log('✅ Estado de categorias atualizado:', newCategories.length, 'categorias')
        return
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
    
    // Fallback: 4 categorias + 1 serviço
    const defaultCategories: CategoryData[] = [
      {
        id: '1',
        name: 'Joias',
        description: 'Anéis, colares, brincos e pulseiras em ouro e prata',
        iconName: 'gem',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Joias'
      },
      {
        id: '2',
        name: 'Relógios',
        description: 'Relógios masculinos e femininos das melhores marcas',
        iconName: 'clock',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Relógios'
      },
      {
        id: '3',
        name: 'Óculos',
        description: 'Óculos de sol e grau com tecnologia avançada',
        iconName: 'eye',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Óculos'
      },
      {
        id: '4',
        name: 'Semi-Joias',
        description: 'Bijuterias elegantes e acessórios modernos',
        iconName: 'diamond',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
        href: '/produtos?categoria=Semi-Joias'
      },
      {
        id: '5',
        name: 'Serviços',
        description: 'Manutenção, reparos e serviços especializados',
        iconName: 'wrench',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        href: '/servicos'
      }
    ]
    
    // Criar nova referência para forçar atualização do React
    const newDefaultCategories = JSON.parse(JSON.stringify(defaultCategories))
    setCategories(newDefaultCategories)
    setLoading(false)
  }

  // Carregar categorias quando o componente montar ou refreshKey mudar
  useEffect(() => {
    console.log('🔄 useEffect triggered, refreshKey:', refreshKey)
    loadCategories()
  }, [refreshKey])
  
  // Monitorar mudanças na imagem de Serviços e forçar atualização
  useEffect(() => {
    const servicosCategory = categories.find(c => c.name === 'Serviços')
    if (servicosCategory && servicosCategory.image) {
      console.log('🔍 Imagem de Serviços detectada no estado:', {
        imageLength: servicosCategory.image.length,
        imagePreview: servicosCategory.image.substring(0, 100),
        refreshKey,
        imageReloadKey
      })
      
      // Forçar atualização da chave da imagem se necessário
      const imageHash = servicosCategory.image.substring(0, 50) + servicosCategory.image.substring(servicosCategory.image.length - 50)
      const lastHash = sessionStorage.getItem('servicos-last-image-hash')
      
      if (lastHash !== imageHash) {
        console.log('🔄 Hash da imagem mudou, forçando atualização!', {
          oldHash: lastHash,
          newHash: imageHash
        })
        sessionStorage.setItem('servicos-last-image-hash', imageHash)
        setImageReloadKey(prev => prev + 1)
      }
    }
  }, [categories, refreshKey])

  // Escutar mudanças para atualizar quando a imagem mudar
  useEffect(() => {
    const handleCategoryUpdate = (e?: CustomEvent) => {
      // Evitar múltiplas chamadas simultâneas
      if (isUpdating) {
        console.log('⏸️ Já está atualizando, ignorando chamada duplicada')
        return
      }
      
      console.log('📢 Category-updated event detectado, recarregando categorias...', e?.detail)
      setIsUpdating(true)
      
      // Aguardar mais tempo para garantir que o banco processou completamente
      setTimeout(async () => {
        const newKey = Date.now()
        console.log('🔑 Atualizando refreshKey para:', newKey)
        
        // Primeiro, forçar atualização do refreshKey para invalidar cache da imagem
        setRefreshKey(newKey)
        setImageReloadKey(prev => prev + 1)
        
        // Aguardar um pouco antes de recarregar
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Recarregar categorias - com múltiplas tentativas se necessário
        try {
          console.log('🔄 Recarregando categorias do banco...')
          await loadCategories()
          
          // Após carregar, aguardar um pouco e atualizar novamente a chave da imagem
          setTimeout(() => {
            setImageReloadKey(prev => prev + 1)
            console.log('✅ Categorias recarregadas e imagem atualizada')
            setIsUpdating(false)
          }, 200)
        } catch (err) {
          console.error('❌ Erro ao recarregar:', err)
          setIsUpdating(false)
          
          // Tentar novamente após 2 segundos
          setTimeout(() => {
            console.log('🔄 Tentando recarregar novamente...')
            setIsUpdating(true)
            loadCategories().then(() => {
              setIsUpdating(false)
            }).catch(() => {
              setIsUpdating(false)
            })
          }, 2000)
        }
      }, 1000) // Delay maior de 1s para garantir que o banco processou
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'servicos-category-updated') {
        // Evitar múltiplas chamadas simultâneas
        if (isUpdating) {
          console.log('⏸️ Já está atualizando via storage event, ignorando')
          return
        }
        console.log('📢 Storage event detectado, agendando recarregamento...')
        // Usar o mesmo handler que o evento customizado para evitar duplicação
        handleCategoryUpdate()
      }
    }
    
    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange)
    // Escutar eventos customizados disparados pelo admin
    window.addEventListener('category-updated', handleCategoryUpdate as EventListener)
    
    // Verificar mudanças no localStorage periodicamente (com debounce)
    let lastCheckedValue = ''
    let debounceTimer: NodeJS.Timeout | null = null
    
    const checkInterval = setInterval(() => {
      const lastUpdate = localStorage.getItem('servicos-category-updated')
      const imageUpdated = localStorage.getItem('servicos-image-updated')
      
      // Se o valor mudou ou se a flag de imagem atualizada está setada
      if ((lastUpdate && lastUpdate !== lastCheckedValue) || imageUpdated === 'true') {
        // Limpar timer anterior se existir
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        
        lastCheckedValue = lastUpdate || ''
        
        // Remover flag de atualização para não disparar múltiplas vezes
        if (imageUpdated === 'true') {
          localStorage.removeItem('servicos-image-updated')
        }
        
        // Debounce: aguardar 800ms antes de processar (evita múltiplas chamadas)
        debounceTimer = setTimeout(() => {
          console.log('🔄 Verificação periódica detectou atualização')
          handleCategoryUpdate()
          
          // Limpar flag após processar
          if (lastUpdate) {
            setTimeout(() => {
              localStorage.removeItem('servicos-category-updated')
              lastCheckedValue = ''
            }, 2000)
          }
        }, 800)
      }
    }, 1000) // Verificar a cada 1 segundo (menos agressivo)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('category-updated', handleCategoryUpdate as EventListener)
      clearInterval(checkInterval)
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [])

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
      case 'sparkles':
        return Sparkles
      case 'wrench':
        return Wrench
      default:
        return Gem
    }
  }

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
            Descubra nossa seleção cuidadosamente curada de produtos e serviços
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 max-w-7xl mx-auto">
          {categories.map((category, index) => {
            const IconComponent = getIconComponent(category.iconName)
            // Garantir que href existe
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
                      src={category.name === 'Serviços' 
                        ? (category.image.startsWith('data:') 
                            ? category.image // Para base64, não adicionar parâmetros
                            : `${category.image}${category.image.includes('?') ? '&' : '?'}_v=${refreshKey}&_t=${Date.now()}&_nocache=${Math.random()}&_rk=${imageReloadKey}`)
                        : category.image
                      }
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      key={category.name === 'Serviços' ? `servicos-img-${refreshKey}-${imageReloadKey}-${category.image?.substring(0, 30) || 'no-img'}-${category.image?.substring(Math.max(0, category.image.length - 30)) || 'no-img'}` : `category-img-${category.id}`}
                      loading={category.name === 'Serviços' ? 'eager' : 'lazy'}
                      onLoad={() => {
                        if (category.name === 'Serviços') {
                          console.log('✅ Imagem de Serviços carregada!', {
                            imageType: category.image?.startsWith('data:') ? 'base64' : 'url',
                            imageLength: category.image?.length || 0,
                            refreshKey,
                            imageReloadKey,
                            preview: category.image?.substring(0, 100)
                          })
                        }
                      }}
                      onError={(e) => {
                        console.error('❌ Erro ao carregar imagem da categoria:', category.name, {
                          imageLength: category.image?.length || 0,
                          imageType: category.image?.startsWith('data:') ? 'base64' : 'url',
                          preview: category.image?.substring(0, 100)
                        })
                        // Se falhar, usar imagem padrão
                        const defaultImage = category.name === 'Serviços' 
                          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
                          : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop'
                        e.currentTarget.src = defaultImage
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