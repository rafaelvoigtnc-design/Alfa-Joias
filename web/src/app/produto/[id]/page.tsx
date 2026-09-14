'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Eye, Clock, Gem, Share2, ShoppingCart } from 'lucide-react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts'
import { formatPrice, formatPriceValue } from '@/lib/priceUtils'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: number | string
  image: string
  description: string
  additional_images?: string[]
  on_sale?: boolean
  original_price?: number | string
  sale_price?: number | string
  discount_percentage?: number
  stock?: number
  gender?: string
  model?: string
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useFirebaseAuth()
  const { products } = useFirebaseProducts()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.id && products.length > 0) {
      const found = products.find(p => p.id === params.id)
      if (found) {
        setProduct(found)
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
  }, [params.id, products])

  const handleAddToCart = () => {
    if (product) {
      const productToAdd = {
        ...product,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.,]/g, '').replace(',', '.'))
      }
      for (let i = 0; i < quantity; i++) {
        addToCart(productToAdd)
      }
      router.push('/carrinho')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Joias':
        return Gem
      case 'Relógios':
        return Clock
      case 'Óculos':
        return Eye
      default:
        return Gem
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Link
            href="/produtos"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Produtos
          </Link>
        </div>
      </div>
    )
  }

  const CategoryIcon = getCategoryIcon(product.category)
  const images = [product.image, ...(product.additional_images || [])]
  const priceToUse = product.on_sale && product.sale_price ? product.sale_price : product.price
  const priceNumber = typeof priceToUse === 'number' ? priceToUse : parseFloat(String(priceToUse).replace(/[^\d.,]/g, '').replace(',', '.'))
  const originalPriceNumber = product.original_price ? (typeof product.original_price === 'number' ? product.original_price : parseFloat(String(product.original_price).replace(/[^\d.,]/g, '').replace(',', '.'))) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/produtos"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar para Produtos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">{product.category}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{product.brand}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="mb-6">
              {product.on_sale && product.original_price && (
                <p className="text-lg text-gray-400 line-through mb-1">
                  {formatPrice(String(originalPriceNumber || product.original_price))}
                </p>
              )}
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(String(priceNumber))}
              </p>
              {product.on_sale && product.discount_percentage && (
                <p className="text-sm text-red-600 mt-1">
                  {product.discount_percentage}% de desconto
                </p>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h2>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao Carrinho
              </button>

              <a
                href={`https://wa.me/5555991288464?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Comprar via WhatsApp
              </a>
            </div>

            {product.stock !== undefined && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Estoque: {product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Produto esgotado'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}