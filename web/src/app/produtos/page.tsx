'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Phone, Eye, Clock, Gem, Search, Filter, X, ChevronDown, Diamond } from 'lucide-react'
import { formatPrice } from '@/lib/priceUtils'
import { supabase } from '@/lib/supabase'

  interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description: string
    on_sale?: boolean
    original_price?: string
    discount_percentage?: number
    sale_price?: string
  gender?: string
  model?: string
}

function ProdutosContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('Todas')
  const [selectedGender, setSelectedGender] = useState('Todos')
  const [selectedModel, setSelectedModel] = useState('Todos')
  const [dbError, setDbError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReload, setShowReload] = useState(false)
  const [categoriesFromDb, setCategoriesFromDb] = useState<string[]>([])
  
  // Carregar categorias dinamicamente do banco
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true })
        
        if (!error && data) {
          // Usar todas as categorias do banco, EXCETO "Serviços" (tem página própria)
          const validCategories = data
            .map((cat: any) => cat.name)
            .filter(Boolean)
            .filter((name: string) => {
              const lower = name.toLowerCase().trim()
              return lower !== 'serviços' && lower !== 'servicos' && !lower.includes('serviço')
            })
          
          // Ordenar: Joias antes de Semi-Joias
          validCategories.sort((a: string, b: string) => {
            if (a === 'Joias') return -1
            if (b === 'Joias') return 1
            if (a === 'Semi-Joias' && b !== 'Joias') return 1
            if (b === 'Semi-Joias' && a !== 'Joias') return -1
            return a.localeCompare(b)
          })
          
          setCategoriesFromDb(validCategories)
        }
      } catch (err) {
        console.error('Erro ao carregar categorias:', err)
      }
    }
    
    loadCategories()
  }, [])
  
  // Usar categorias do banco ou fallback padrão (incluindo Afins)
  const categories = ['Todas', ...(categoriesFromDb.length > 0 ? categoriesFromDb : ['Joias', 'Relógios', 'Óculos', 'Semi-Joias', 'Afins'])]
  const brands = ['Todas']
  const genders = ['Todos', 'Masculino', 'Feminino', 'Unissex']
  const models = ['Todos', 'Clássico', 'Moderno', 'Vintage', 'Esportivo']

  // Função para normalizar texto (remove acentos e torna minúsculo)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim()
  }

  useEffect(() => {
    // Verificar se há categoria na URL
    const categoriaFromUrl = searchParams.get('categoria')
    if (categoriaFromUrl) {
      // Mapear categorias da URL para o formato correto (incluindo novas categorias)
      const categoryMap: { [key: string]: string } = {
        'joias': 'Joias',
        'joias finas': 'Joias',
        'relogios': 'Relógios',
        'relógios': 'Relógios',
        'relojoaria': 'Relógios',
        'oculos': 'Óculos',
        'óculos': 'Óculos',
        'ótica': 'Óculos',
        'semijoias': 'Semi-Joias',
        'semi-joias': 'Semi-Joias',
        'semi joias': 'Semi-Joias',
        'afins': 'Afins',
        'outros': 'Afins'
      }
      
      // Também verificar se a categoria da URL está na lista de categorias válidas do banco
      const normalizedCategory = categoriaFromUrl.toLowerCase().trim()
      let mappedCategory = categoryMap[normalizedCategory] || categoriaFromUrl
      
      // Se não está no mapa, verificar se está na lista de categorias válidas (com normalização)
      if (!categoryMap[normalizedCategory] && categoriesFromDb.length > 0) {
        const foundCategory = categoriesFromDb.find(cat => 
          cat.toLowerCase().trim() === categoriaFromUrl.trim() ||
          normalizeText(cat) === normalizeText(categoriaFromUrl)
        )
        if (foundCategory) {
          mappedCategory = foundCategory
        }
      }
      
      console.log('🔍 Filtro de categoria aplicado:', {
        urlParam: categoriaFromUrl,
        normalized: normalizedCategory,
        mapped: mappedCategory
      })
      
      setSelectedCategory(mappedCategory)
      
      // Scroll suave para o topo após aplicar o filtro
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      // Se não há categoria na URL, resetar para "Todas"
      setSelectedCategory('Todas')
    }
  }, [searchParams, categoriesFromDb])

  useEffect(() => {
    const loadProducts = async () => {
      let reloadTimeout: NodeJS.Timeout | undefined
      
      try {
        setLoading(true)
        setDbError(null)
        setShowReload(false)
        
        console.log('🔄 Buscando produtos do banco de dados...')
        
        // Timeout de 30 segundos para mostrar opção de reload
        reloadTimeout = setTimeout(() => {
          setShowReload(true)
        }, 30000)
        
        // Timeout para evitar carregamento infinito (10s para erro)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Não foi possível carregar os produtos. Por favor, tente novamente.')), 10000)
        )
        
        // Otimizar query: selecionar apenas campos necessários e limitar inicialmente
        const queryPromise = supabase
          .from('products')
          .select('id, name, category, brand, price, image, description, on_sale, original_price, sale_price, gender, model, created_at')
          .order('created_at', { ascending: false })
          .limit(1000) // Limitar para evitar sobrecarga
        
        const result = await Promise.race([queryPromise, timeoutPromise]) as Awaited<typeof queryPromise>
        const { data, error } = result
        
        if (reloadTimeout) clearTimeout(reloadTimeout)
        
        if (error) {
          console.error('❌ Erro ao buscar do banco:', error.message)
          setDbError('Não foi possível carregar os produtos no momento. Por favor, tente novamente.')
          setProducts([])
          setFilteredProducts([])
          setLoading(false)
          setShowReload(false)
          return
        }
        
        if (!data || data.length === 0) {
          console.warn('⚠️ Banco de dados está vazio!')
          // Não mostrar erro quando não há produtos, apenas não exibir nada
          setProducts([])
          setFilteredProducts([])
          setLoading(false)
          setShowReload(false)
          return
        }
        
        setProducts(data)
        setFilteredProducts(data)
        setLoading(false)
        setShowReload(false)
        
      } catch (err: any) {
        console.error('❌ Falha ao carregar produtos:', err)
        if (reloadTimeout) clearTimeout(reloadTimeout)
        // Mensagem amigável para o cliente
        const errorMessage = err.message || 'Não foi possível carregar os produtos no momento.'
        // Remover mensagens técnicas
        const friendlyMessage = errorMessage
          .replace(/Timeout.*/i, 'Não foi possível carregar os produtos. Por favor, tente novamente.')
          .replace(/banco de dados/i, 'servidor')
          .replace(/supabase/i, 'servidor')
        setDbError(friendlyMessage)
        setProducts([])
        setFilteredProducts([])
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  // Memoizar filtros para melhor performance
  const filteredProductsMemo = useMemo(() => {
    let filtered = products

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(product => {
        // Filtro mais robusto para categorias
        const productCategory = product.category?.toLowerCase().trim()
        const selectedCategoryLower = selectedCategory.toLowerCase().trim()
        
        // Verificar correspondência exata primeiro
        if (productCategory === selectedCategoryLower) {
          return true
        }
        
        // Mapeamento de categorias para compatibilidade
        const categoryMap: { [key: string]: string[] } = {
          'joias': ['joias', 'joalheria', 'joias finas', 'joia'],
          'relógios': ['relógios', 'relojoaria', 'relogios', 'relógio', 'relogio'],
          'óculos': ['óculos', 'ótica', 'oculos', 'óculos de sol'],
          'semi-joias': ['semi-joias', 'semijoias', 'semi joias', 'semijoia', 'semi-joia']
        }
        
        // Verificar mapeamento
        const mappedCategories = categoryMap[selectedCategoryLower] || []
        return mappedCategories.includes(productCategory)
      })
      
    }

    if (selectedBrand !== 'Todas') {
      filtered = filtered.filter(product => product.brand === selectedBrand)
    }

    if (selectedGender !== 'Todos') {
      filtered = filtered.filter(product => product.gender === selectedGender)
    }

    if (selectedModel !== 'Todos') {
      filtered = filtered.filter(product => product.model === selectedModel)
    }

    if (searchTerm) {
      const normalizedSearch = normalizeText(searchTerm)
      filtered = filtered.filter(product => {
        const normalizedName = normalizeText(product.name)
        const normalizedBrand = normalizeText(product.brand)
        const normalizedDescription = normalizeText(product.description)
        const normalizedCategory = normalizeText(product.category)
        
        return normalizedName.includes(normalizedSearch) ||
               normalizedBrand.includes(normalizedSearch) ||
               normalizedDescription.includes(normalizedSearch) ||
               normalizedCategory.includes(normalizedSearch)
      })
      
    }

    // Filtro por preço
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        let price = 0
        if (product.on_sale && product.sale_price) {
          price = parseFloat(product.sale_price.replace(/[^\d,]/g, '').replace(',', '.'))
        } else {
          price = parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.'))
        }
        
        const min = minPrice ? parseFloat(minPrice) : 0
        const max = maxPrice ? parseFloat(maxPrice) : Infinity
        
        return price >= min && price <= max
      })
    }

    // Ordenar: produtos com estoque primeiro, esgotados no final
    filtered.sort((a, b) => {
      const stockA = (a as any).stock
      const stockB = (b as any).stock
      
      // Se ambos têm estoque definido
      if (typeof stockA === 'number' && typeof stockB === 'number') {
        if (stockA === 0 && stockB > 0) return 1 // a esgotado, b em estoque -> b primeiro
        if (stockA > 0 && stockB === 0) return -1 // a em estoque, b esgotado -> a primeiro
      }
      // Se apenas um é esgotado
      if (typeof stockA === 'number' && stockA === 0 && (typeof stockB !== 'number' || stockB > 0)) return 1
      if (typeof stockB === 'number' && stockB === 0 && (typeof stockA !== 'number' || stockA > 0)) return -1
      
      // Se ambos estão em estoque ou ambos sem definição, manter ordem original
      return 0
    })

    return filtered
  }, [products, selectedCategory, selectedBrand, selectedGender, selectedModel, searchTerm, minPrice, maxPrice])
  
  useEffect(() => {
    setFilteredProducts(filteredProductsMemo)
  }, [filteredProductsMemo])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Joias':
        return Gem
      case 'Relógios':
        return Clock
      case 'Óculos':
        return Eye
      case 'Semi-Joias':
        return Diamond
      default:
        return Gem
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-3 sm:mb-4 tracking-wide">
            Nossos Produtos
          </h1>
          <div className="w-12 sm:w-16 md:w-20 h-0.5 bg-gray-800 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-xl mx-auto leading-relaxed font-light">
            Descubra nossa seleção de produtos de qualidade
          </p>
        </div>

        {/* Indicador de filtro ativo */}
        {selectedCategory !== 'Todas' && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 md:p-5 mb-6 shadow-md animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                  <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                  <span className="text-xs md:text-sm font-medium text-white">Filtro ativo:</span>
                </div>
                <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-gray-900 text-xs md:text-sm rounded-full font-semibold shadow-sm">
                  {selectedCategory}
                </span>
                <span className="text-xs md:text-sm text-white/80 font-medium">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setSelectedCategory('Todas')}
                className="flex items-center justify-center space-x-1 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>Limpar filtro</span>
              </button>
            </div>
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categorias Visíveis */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          <h3 className="text-xs sm:text-sm md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Categorias</h3>
          <div className="flex overflow-x-auto gap-1.5 sm:gap-2 md:gap-3 pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('Todas')
                  setSelectedBrand('Todas')
                  setSelectedGender('Todos')
                  setSelectedModel('Todos')
                  setMinPrice('')
                  setMaxPrice('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtro</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Gênero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  {genders.map((gender) => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  {models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Preço</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Preço Mínimo (R$)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Preço Máximo (R$)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="999999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-800 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">Carregando produtos do banco de dados...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && dbError && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-4">Não foi possível carregar os produtos</h3>
              <p className="text-red-700 mb-6">
                {dbError.includes('Timeout') || dbError.includes('consulta muito lenta')
                  ? 'A conexão está demorando mais que o esperado. Por favor, tente novamente.'
                  : dbError.includes('internet') || dbError.includes('conexão')
                  ? 'Verifique sua conexão com a internet e tente novamente.'
                  : 'Ocorreu um problema ao carregar os produtos. Por favor, tente novamente em alguns instantes.'}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Tentar Novamente
                </button>
                <a
                  href="/"
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
                >
                  Voltar ao Início
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {!loading && !dbError && (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid de Produtos */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gem className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-6">Tente ajustar os filtros ou fazer uma nova busca</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('Todas')
                    setSelectedBrand('Todas')
                    setSelectedGender('Todos')
                    setSelectedModel('Todos')
                    setMinPrice('')
                    setMaxPrice('')
                  }}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredProducts.map((product) => {
                  const IconComponent = getCategoryIcon(product.category)
                  const oos = (product as any).stock === 0
                  return (
                <Link
                  key={product.id}
                  href={`/produto/${product.id}`}
                  className={`group block bg-white border ${oos ? 'border-gray-200' : 'border-gray-200 md:hover:border-gray-300 lg:hover:border-gray-800'} transition-all duration-300 overflow-hidden ${oos ? '' : 'md:hover:shadow-lg md:hover:-translate-y-1 active:scale-[0.98] touch-manipulation'} ${oos ? 'opacity-60' : ''}`}
                >
                  <div className="relative aspect-square sm:aspect-auto sm:h-48 md:h-56 lg:h-64">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${oos ? 'grayscale' : 'md:group-hover:scale-105'}`}
                    />
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4">
                      <div className="bg-white/95 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 rounded-full text-[10px] sm:text-xs font-medium text-gray-800 flex items-center space-x-1">
                        <IconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                        <span className="hidden sm:inline">{product.category}</span>
                      </div>
                    </div>
                    {oos && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                        <div className="bg-gray-800 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 rounded-full text-[10px] sm:text-xs font-semibold">Esgotado</div>
                      </div>
                    )}
                    {product.on_sale && !oos && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4">
                        <div className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-semibold">
                          -{product.discount_percentage}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-0 group-hover:text-gray-800 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4 font-light line-clamp-1">{product.brand}</p>

                    <div className="flex flex-col gap-1">
                      {oos ? (
                        <span className="text-sm sm:text-base md:text-lg font-medium text-gray-500">Indisponível</span>
                      ) : product.on_sale ? (
                        <>
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price || '')}
                          </span>
                          <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                            {formatPrice(product.sale_price || '')}
                          </span>
                        </>
                      ) : (
                        <span className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      )}
                    </div>

                    {(product.gender || product.model) && (
                      <div className="mt-2 sm:mt-3">
                        <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">
                          {product.gender} {product.gender && product.model ? '•' : ''} {product.model}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                  )
                })}
              </div>
            )}

            {/* CTA Final */}
            <div className="text-center mt-16">
              <div className="bg-white border border-gray-200 p-12 max-w-4xl mx-auto rounded-lg">
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Não encontrou o que procura?
                </h3>
                <p className="text-lg text-gray-600 mb-8 font-light">
                  Entre em contato conosco e solicite um orçamento personalizado
                </p>
                <a
                  href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Estou procurando produtos específicos na Alfa Jóias e não encontrei o que preciso.

Podem me ajudar a encontrar o produto ideal?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-3 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Produtos() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProdutosContent />
    </Suspense>
  )
}