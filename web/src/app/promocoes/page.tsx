'use client'

import { useState, useEffect } from 'react'
import { Phone, Clock, Search, Eye, Percent, Filter, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description: string
  onSale?: boolean
  on_sale?: boolean
  originalPrice?: string
  original_price?: string
  discountPercentage?: number
  discount_percentage?: number
  salePrice?: string
  sale_price?: string
  gender?: string
  model?: string
}

export default function Promocoes() {
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
          // Usar todas as categorias do banco (incluindo Serviços e Afins)
          const validCategories = data.map((cat: any) => cat.name)
          
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
    const loadProducts = async () => {
      if (typeof window !== 'undefined') {
        let reloadTimeout: NodeJS.Timeout | undefined
        
        try {
          setLoading(true)
          setDbError(null)
          setShowReload(false)
          
          // Timeout de 30 segundos para mostrar opção de reload
          reloadTimeout = setTimeout(() => {
            setShowReload(true)
          }, 30000)
          
          // SEMPRE carregar APENAS do Supabase
          const { supabase } = await import('@/lib/supabase')
          console.log('🔄 Buscando promoções do banco de dados...')
          
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
          
          clearTimeout(reloadTimeout)
          
          if (error) {
            console.error('❌ Erro ao buscar do banco:', error.message)
            setDbError('Não foi possível carregar as promoções no momento. Por favor, tente novamente.')
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
          
          // Filtrar apenas produtos em promoção
          const productsOnSale = data.filter((p: any) => p.on_sale || p.onSale)
          
          console.log('✅ Total de produtos no banco:', data.length)
          console.log('🔥 Produtos em PROMOÇÃO:', productsOnSale.length)
          
          setProducts(productsOnSale)
          setFilteredProducts(productsOnSale)
          setLoading(false)
          setShowReload(false)
          
        } catch (err: any) {
          if (reloadTimeout) clearTimeout(reloadTimeout)
          console.error('❌ Falha ao carregar promoções:', err)
          // Mensagem amigável para o cliente
          const errorMessage = err.message || 'Não foi possível carregar as promoções no momento.'
          // Remover mensagens técnicas
          const friendlyMessage = errorMessage
            .replace(/Timeout.*/i, 'Não foi possível carregar as promoções. Por favor, tente novamente.')
            .replace(/banco de dados/i, 'servidor')
            .replace(/supabase/i, 'servidor')
          setDbError(friendlyMessage)
          setProducts([])
          setFilteredProducts([])
          setLoading(false)
        }
      }
    }
    
    loadProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filtro por categoria
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filtro por termo de busca com normalização (remove acentos)
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
      
      console.log('🔎 Busca em promoções:', {
        termo: searchTerm,
        normalizado: normalizedSearch,
        encontrados: filtered.length
      })
    }

    // Filtro por marca
    if (selectedBrand !== 'Todas') {
      filtered = filtered.filter(product => product.brand === selectedBrand)
    }

    // Filtro por gênero
    if (selectedGender !== 'Todos') {
      filtered = filtered.filter(product => product.gender === selectedGender)
    }

    // Filtro por modelo
    if (selectedModel !== 'Todos') {
      filtered = filtered.filter(product => product.model === selectedModel)
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

    // Filtro por preço
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        const salePrice = product.salePrice || product.sale_price || product.price
        const price = parseFloat(salePrice.replace(/[^\d,]/g, '').replace(',', '.') || '0')
        const min = minPrice ? parseFloat(minPrice) : 0
        const max = maxPrice ? parseFloat(maxPrice) : Infinity
        
        return price >= min && price <= max
      })
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedBrand, selectedGender, selectedModel, searchTerm, minPrice, maxPrice])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Percent className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Promoções Especiais
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Aproveite nossos produtos em promoção
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg mb-4">Carregando promoções do banco de dados...</p>
            {showReload && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-yellow-800 mb-3">O carregamento está demorando mais que o esperado.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            )}
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
              <h3 className="text-xl font-bold text-red-900 mb-4">Não foi possível carregar as promoções</h3>
              <p className="text-red-700 mb-6">
                {dbError.includes('Timeout') || dbError.includes('consulta muito lenta')
                  ? 'A conexão está demorando mais que o esperado. Por favor, tente novamente.'
                  : dbError.includes('internet') || dbError.includes('conexão')
                  ? 'Verifique sua conexão com a internet e tente novamente.'
                  : 'Ocorreu um problema ao carregar as promoções. Por favor, tente novamente em alguns instantes.'}
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

        {!loading && !dbError && (
          <>

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar produtos em promoção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-6 sm:mb-7 md:mb-8">
          <h3 className="text-xs sm:text-sm md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Categorias</h3>
          <div className="flex overflow-x-auto gap-1.5 sm:gap-2 md:gap-3 pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </span>
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
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Preço Máximo (R$)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="999999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Percent className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {products.length === 0 ? 'Nenhuma promoção ativa' : 'Nenhum produto encontrado'}
              </h2>
              <p className="text-gray-500 mb-6">
                {products.length === 0 
                  ? 'No momento não temos produtos em promoção, mas sempre temos produtos incríveis para você!'
                  : 'Tente ajustar os filtros de busca para encontrar o que procura.'
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                {products.length > 0 && (
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
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
                <Link
                  href="/produtos"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Ver Todos os Produtos
                </Link>
                <a
                  href="https://wa.me/5555991288464"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Falar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="group block bg-white rounded-xl sm:rounded-xl border border-gray-200 md:hover:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform md:hover:-translate-y-2 overflow-hidden relative active:scale-[0.98] touch-manipulation"
              >
                {/* Badge de desconto */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.discountPercentage || product.discount_percentage || 0}%
                  </div>
                </div>

                {/* Imagem */}
                <div className="relative aspect-square sm:aspect-auto sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-10" />
                </div>

                {/* Conteúdo */}
                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium sm:font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-gray-800 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-0">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 font-light line-clamp-1">{product.brand}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4 line-clamp-2 hidden sm:block">
                    {product.description}
                  </p>
                  
                  {/* Preços */}
                  <div className="mb-2 sm:mb-3 md:mb-4">
                    <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        R$ {product.originalPrice || product.original_price || product.price}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-red-600">
                      R$ {product.salePrice || product.sale_price || product.price}
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col space-y-1.5 sm:space-y-2">
                    <a
                      href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Tenho interesse na promoção: ${product.name} - R$ ${product.salePrice || product.sale_price || product.price}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm md:text-base font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2"
                    >
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Aproveitar Oferta</span>
                      <span className="sm:hidden">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA geral */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Não perca nossas promoções!
            </h3>
            <p className="text-gray-600 mb-6">
              Siga-nos no Instagram e fique por dentro das melhores ofertas
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="https://instagram.com/alfajoiasnc"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                Seguir no Instagram
              </a>
              <a
                href="https://wa.me/5555991288464"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
