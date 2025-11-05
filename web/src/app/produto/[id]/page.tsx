'use client'

// Configuração para Cloudflare Pages - permitir rota dinâmica sem Edge Runtime
// Como é client-side, o Cloudflare deve tratar como estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Eye, Clock, Gem, Share2, ShoppingCart } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
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
    if (typeof price === 'number') {
      return price.toFixed(2).replace('.', ',')
    }
    // Limpar caracteres especiais e converter vírgula para ponto
    const cleaned = price.toString().replace(/[^\d.,]/g, '').replace(',', '.')
    const num = parseFloat(cleaned)
    if (isNaN(num)) return '0,00'
    return num.toFixed(2).replace('.', ',')
  }

  useEffect(() => {
    const loadProduct = async () => {
      let reloadTimeout: NodeJS.Timeout | undefined
      
      try {
        setLoading(true)
        setShowReload(false)
        const productId = params.id as string
        console.log('🔄 Buscando produto individual:', productId)
        
        // Timeout de 30 segundos para mostrar opção de reload
        reloadTimeout = setTimeout(() => {
          setShowReload(true)
        }, 30000)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()
        
        if (reloadTimeout) clearTimeout(reloadTimeout)
        
        if (error) {
          console.error('❌ Erro ao buscar produto:', error.message)
          setProduct(null)
        } else if (data) {
          console.log('✅ Produto encontrado:', data.name)
          console.log('💰 Dados de preço do banco:', {
            price: data.price,
            priceType: typeof data.price,
            original_price: data.original_price,
            sale_price: data.sale_price,
            on_sale: data.on_sale
          })
          setProduct(data)
        } else {
          console.warn('⚠️ Produto não encontrado')
          setProduct(null)
        }
      } catch (err) {
        console.error('❌ Erro ao carregar produto:', err)
        if (reloadTimeout) clearTimeout(reloadTimeout)
        setProduct(null)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-600">Início</Link>
          <span>›</span>
          <Link href="/produtos" className="hover:text-gray-600">Produtos</Link>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4">
              <img
                src={product.additionalImages?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.additionalImages && product.additionalImages.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.additionalImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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

            <p className="text-lg text-gray-600 mb-2">
              {product.brand || 'Marca não informada'}
            </p>

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
                    <span className="text-lg text-gray-500 line-through">
                      R$ {formatPriceForDisplay(product.originalPrice || product.original_price || product.price)}
                    </span>
                    <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                      -{product.discountPercentage || product.discount_percentage || 0}%
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-red-600" style={{whiteSpace: 'nowrap'}}>
                    R$ {formatPriceForDisplay(product.salePrice || product.sale_price || product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-600" style={{whiteSpace: 'nowrap'}}>
                  R$ {formatPriceForDisplay(product.price)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">
              {product.detailedDescription || product.description}
            </p>

            {/* Features */}
            {product.features && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Características:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
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
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Compartilhar</span>
              </button>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificações:</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-medium">{value}</span>
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
