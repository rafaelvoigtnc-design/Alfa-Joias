'use client'

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react'

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, isLoggedIn } = useUnifiedAuth()

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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Faça login para acessar o carrinho</h1>
          <p className="text-gray-600 mb-6">Você precisa estar logado para adicionar produtos ao carrinho.</p>
          <Link
            href="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
            <p className="text-gray-600 mb-6">Adicione alguns produtos para começar suas compras.</p>
            <Link
              href="/produtos"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calcular total do carrinho
  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => {
      // Usar sale_price se estiver em promoção, senão usar price
      const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
      const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
      const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
      return sum + (isNaN(price) ? 0 : price * item.quantity)
    }, 0)
  }

  const total = calculateCartTotal()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link href="/produtos" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continuar comprando
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                    Produtos ({cart.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700"
                  >
                    Limpar carrinho
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                          {item.on_sale && item.sale_price ? (
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <p className="text-xs sm:text-sm text-gray-400 line-through">
                                R$ {formatPriceForDisplay(item.original_price || item.price)}
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-green-600">
                                R$ {formatPriceForDisplay(item.sale_price)}
                              </p>
                              {item.discount_percentage && (
                                <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 rounded">
                                  -{item.discount_percentage}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-600">
                              R$ {formatPriceForDisplay(item.price)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                          >
                            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                          >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>

                        <div className="text-right sm:text-left">
                          <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">
                            R$ {(() => {
                              const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
                              const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
                              const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
                              return isNaN(price) ? '0,00' : (price * item.quantity).toFixed(2).replace('.', ',')
                            })()}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg active:bg-red-100 transition-colors touch-manipulation flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 lg:sticky lg:top-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Total:</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Finalizar Pedido</span>
                </Link>
              </div>

              <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4 text-center">
                Preencha seus dados e envie o pedido via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

