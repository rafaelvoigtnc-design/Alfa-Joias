'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Eye, Clock, Gem, Share2, ShoppingCart } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { formatPrice, formatPriceValue } from '@/lib/priceUtils'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description: string
  detailedDescription?: string
  additionalImages?: string[]
  features?: string[]
  specifications?: { [key: string]: string }
  rating?: number
  reviews?: number
  onSale?: boolean
  on_sale?: boolean
  originalPrice?: string
  original_price?: string
  discountPercentage?: number
  discount_percentage?: number
  salePrice?: string
  sale_price?: string
  stock?: number
}

export default function ProductPage() {
  const params = useParams()
  const { addToCart, isLoggedIn } = useUnifiedAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showReload, setShowReload] = useState(false)
  const productId = params.id as string

  // Função para formatar preço para exibição (sempre vírgula para decimais)
  const formatPriceForDisplay = (price: string | number): string => {
    return formatPriceValue(price)
  }

  useEffect(() => {
    const loadProduct = async () => {
      let reloadTimeout: NodeJS.Timeout | undefined
      
      try {
        setLoading(true)
        setShowReload(false)
        const productId = params?.id as string
        
        if (!productId) {
          console.error('❌ Product ID não encontrado nos params:', params)
          setProduct(null)
          setLoading(false)
          return
        }
        
        console.log('🔄 Buscando produto individual - ID:', productId)
        console.log('🔍 Params completos:', params)
        
        // Timeout de 30 segundos para mostrar opção de reload
        reloadTimeout = setTimeout(() => {
          setShowReload(true)
        }, 30000)
        
        // Usar select('*') primeiro para garantir que funciona, depois podemos otimizar
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle() // Usar maybeSingle() em vez de single() para não dar erro se não encontrar
        
        if (reloadTimeout) clearTimeout(reloadTimeout)
        
        if (error) {
          console.error('❌ Erro ao buscar produto:', error)
          console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2))
          setProduct(null)
          setLoading(false)
          return
        }
        
        if (!data) {
          console.warn('⚠️ Produto não encontrado para ID:', productId)
          console.warn('⚠️ Tentando buscar todos os produtos para debug...')
          
          // Debug: buscar todos os produtos para ver os IDs disponíveis
          const { data: allProducts } = await supabase
            .from('products')
            .select('id, name')
            .limit(5)
          console.log('📋 Primeiros 5 produtos no banco:', allProducts)
          
          setProduct(null)
          setLoading(false)
          return
        }
        
        console.log('✅ Dados brutos do produto:', data)
        
        // Processar additional_images - pode ser string JSON ou array
        let additionalImages: string[] = []
        if (data.additional_images) {
          if (typeof data.additional_images === 'string') {
            try {
              const parsed = JSON.parse(data.additional_images)
              additionalImages = Array.isArray(parsed) ? parsed : []
            } catch {
              // Se não for JSON válido, tratar como string única
              additionalImages = [data.additional_images]
            }
          } else if (Array.isArray(data.additional_images)) {
            additionalImages = data.additional_images
          }
        }
        
        // Processar e garantir que additionalImages seja sempre um array
        const processedAdditionalImages = (additionalImages || []).filter(img => img && img.trim())
        
        // Mapear campos do banco para interface (com fallbacks seguros)
        const mappedProduct: Product = {
          id: data.id || '',
          name: data.name || 'Produto sem nome',
          category: data.category || '',
          brand: data.brand || '',
          price: data.price || '0',
          image: data.image || '',
          description: data.description || '',
          detailedDescription: data.detailed_description || data.description || '',
          additionalImages: processedAdditionalImages, // Sempre um array, nunca undefined
          features: Array.isArray(data.features) ? data.features : [],
          specifications: data.specifications && typeof data.specifications === 'object' ? data.specifications : {},
          on_sale: data.on_sale || false,
          original_price: data.original_price || '',
          sale_price: data.sale_price || '',
          discount_percentage: data.discount_percentage || 0,
          stock: data.stock
        }
        
        console.log('📸 Imagens processadas:', {
          principal: mappedProduct.image,
          adicionais: processedAdditionalImages,
          total: processedAdditionalImages.length + (mappedProduct.image ? 1 : 0)
        })
        
        console.log('✅ Produto mapeado com sucesso:', mappedProduct.name)
        setProduct(mappedProduct)
      } catch (err) {
        console.error('❌ Erro ao carregar produto:', err)
        if (reloadTimeout) clearTimeout(reloadTimeout)
        setProduct(null)
        setLoading(false)
        // Não deixar o erro quebrar a página
        return
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [params.id])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Óculos':
        return Eye
      case 'Relógios':
        return Clock
      case 'Joias':
        return Gem
      default:
        return Eye
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Carregando produto...</p>
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
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Link href="/produtos" className="text-gray-600 hover:text-gray-800 transition-colors">
            ← Voltar para produtos
          </Link>
        </div>
      </div>
    )
  }

  const IconComponent = getCategoryIcon(product.category)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-600">Início</Link>
          <span>›</span>
          <Link href="/produtos" className="hover:text-gray-600">Produtos</Link>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <div>
            {/* Imagem principal com navegação */}
            <div className="relative bg-white rounded-xl overflow-hidden mb-4 group w-full sm:max-w-md lg:max-w-lg mx-auto" style={{ 
              aspectRatio: '1 / 1'
            }}>
              {(() => {
                const allImages = product.image 
                  ? [product.image, ...(product.additionalImages || [])]
                  : (product.additionalImages || [])
                
                if (allImages.length === 0) {
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ 
                      aspectRatio: '1 / 1'
                    }}>
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )
                }
                
                return (
                  <>
                    <div className="relative w-full h-full">
                      {allImages.map((image, index) => (
                        <img
                          key={index}
                          src={image || '/placeholder.jpg'}
                          alt={product.name}
                          className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-500 ease-in-out ${
                            selectedImage === index ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{ 
                            aspectRatio: '1 / 1',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Sem+Imagem'
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Botões de navegação (anterior/próximo) - sempre visíveis no mobile */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity z-10 touch-manipulation"
                          aria-label="Imagem anterior"
                          type="button"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity z-10 touch-manipulation"
                          aria-label="Próxima imagem"
                          type="button"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        {/* Indicador de imagem atual */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-10">
                          {selectedImage + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                )
              })()}
            </div>
            
            {/* Galeria de miniaturas abaixo da imagem principal */}
            {(() => {
              const allImages = product.image 
                ? [product.image, ...(product.additionalImages || [])]
                : (product.additionalImages || [])
              
              if (allImages.length <= 1) return null
              
              return (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                        selectedImage === index 
                          ? 'border-primary-600 ring-2 ring-primary-200 scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      type="button"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                        style={{ 
                          aspectRatio: '1 / 1',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=Erro'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <IconComponent className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{product.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Marca - só mostrar se existir */}
            {product.brand && product.brand.trim() && (
              <p className="text-lg text-gray-600 mb-2">
                {product.brand}
              </p>
            )}
            
            {/* Modelo - só mostrar se existir */}
            {(product as any).model && (product as any).model.trim() && (
              <p className="text-base text-gray-500 mb-2">
                Modelo: {(product as any).model}
              </p>
            )}

            {/* Estoque */}
            <div className="mb-4">
              {typeof (product as any).stock === 'number' ? (
                (product as any).stock > 0 ? (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">
                      {((product as any).stock === 1) ? '1 unidade disponível' : `${(product as any).stock} unidades disponíveis`}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">Produto esgotado</span>
                  </div>
                )
              ) : (
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">Em estoque</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 mb-6">
              {(product.onSale || product.on_sale) ? (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl sm:text-lg text-gray-500 line-through">
                      R$ {formatPriceForDisplay(product.originalPrice || product.original_price || product.price)}
                    </span>
                    <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                      -{product.discountPercentage || product.discount_percentage || 0}%
                    </span>
                  </div>
                  <span className="text-8xl sm:text-3xl font-bold text-red-600" style={{whiteSpace: 'nowrap'}}>
                    R$ {formatPriceForDisplay(product.salePrice || product.sale_price || product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-8xl sm:text-3xl font-bold text-gray-600" style={{whiteSpace: 'nowrap'}}>
                  R$ {formatPriceForDisplay(product.price)}
                </span>
              )}
            </div>

            {/* Descrição - só mostrar se existir */}
            {(product.detailedDescription || product.description) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição:</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.detailedDescription || product.description}
                </p>
              </div>
            )}

            {/* Features - só mostrar se existir e tiver itens */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Características:</h3>
                <ul className="space-y-2">
                  {product.features.filter(f => f && f.trim()).map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product?.name} - ${formatPrice(product?.price || '')}

Podem me dar mais informações sobre este produto?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Falar no WhatsApp</span>
              </a>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    if (product) {
                      const stock = (product as any).stock
                      if (typeof stock === 'number' && stock === 0) {
                        alert('Este produto está esgotado no momento.')
                        return
                      }
                      
                      const isOnSale = product.onSale || product.on_sale
                      
                      // Função para converter e formatar preço corretamente
                      const convertPrice = (price: any): string => {
                        if (typeof price === 'number') {
                          // Se é número, manter como número mas garantir que seja string
                          return price.toString()
                        }
                        if (typeof price === 'string') {
                          // Se é string, apenas limpar caracteres especiais mas manter o valor
                          const cleaned = price.replace(/[^\d.,]/g, '')
                          // Se tem vírgula, substituir por ponto para parseFloat
                          const withDot = cleaned.replace(',', '.')
                          const num = parseFloat(withDot)
                          return isNaN(num) ? '0' : num.toString()
                        }
                        return '0'
                      }

                      
                      const basePrice = convertPrice(product.price)
                      const origPrice = isOnSale ? convertPrice(product.originalPrice || product.original_price) : undefined
                      const sPrice = isOnSale ? convertPrice(product.salePrice || product.sale_price) : undefined
                      
                      
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: basePrice,
                        image: product.image,
                        on_sale: isOnSale,
                        original_price: origPrice,
                        sale_price: sPrice,
                        discount_percentage: isOnSale ? (product.discountPercentage || product.discount_percentage) : undefined
                      })
                      setAddedToCart(true)
                      setTimeout(() => setAddedToCart(false), 2000)
                    }
                  }}
                  disabled={typeof (product as any).stock === 'number' && (product as any).stock === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : typeof (product as any).stock === 'number' && (product as any).stock === 0
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {addedToCart 
                      ? 'Adicionado!' 
                      : typeof (product as any).stock === 'number' && (product as any).stock === 0
                      ? 'Produto Esgotado'
                      : 'Adicionar ao Carrinho'
                    }
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Fazer Login para Comprar</span>
                </Link>
              )}
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description || '',
                      url: window.location.href
                    }).catch(() => {
                      // Fallback: copiar URL
                      navigator.clipboard.writeText(window.location.href)
                      alert('Link copiado para a área de transferência!')
                    })
                  } else {
                    // Fallback: copiar URL
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link copiado para a área de transferência!')
                  }
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                type="button"
              >
                <Share2 className="h-5 w-5" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            </div>

            {/* Specifications - só mostrar se existir e tiver itens */}
            {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificações Técnicas:</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications)
                    .filter(([key, value]) => key && value && String(value).trim())
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600 font-medium pr-4">{key}:</span>
                        <span className="text-gray-900 text-right flex-1">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
