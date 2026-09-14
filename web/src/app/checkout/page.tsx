'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, MessageCircle, User, Package } from 'lucide-react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { formatPrice, formatPriceValue } from '@/lib/priceUtils'

export default function Checkout() {
  const { cart, clearCart, user } = useFirebaseAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: user?.displayName || user?.email?.split('@')[0] || '',
    phone: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: '',
    notes: ''
  })

  // Firebase migration - load user data from localStorage temporarily
  useEffect(() => {
    const loadUserAddress = async () => {
      try {
        const savedData = localStorage.getItem('alfajoias-last-checkout')
        if (savedData) {
          const parsed = JSON.parse(savedData)
          setFormData(prev => ({
            ...prev,
            ...parsed
          }))
        }
      } catch (e) {
        // Ignorar erro
      }
    }

    loadUserAddress()
  }, [])

  const [notifyOrder, setNotifyOrder] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('alfajoias-notify-order') || 'false') } catch { return false }
  })
  const [notifyPromos, setNotifyPromos] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('alfajoias-notify-promos') || 'false') } catch { return false }
  })
  
  const [loading, setLoading] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  const formatPriceForDisplay = (price: string | number): string => formatPriceValue(price)

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
      const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
      const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
      return total + (isNaN(price) ? 0 : price * item.quantity)
    }, 0)
  }

  const generateOrderNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ALFA-${year}${month}${day}-${random}`
  }

  const formatWhatsAppMessage = () => {
    const orderNumber = generateOrderNumber()
    const total = calculateTotal()
    
    const sanitize = (text: string): string => {
      return text
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/\*/g, '＊')
        .replace(/_/g, '＿')
        .trim()
    }
    
    let message = `*NOVO PEDIDO - Alfa Joias*%0A%0A`
    message += `Pedido: ${orderNumber}%0A`
    message += `Data: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}%0A%0A`
    
    message += `*Cliente:* ${sanitize(formData.name)}%0A`
    message += `*Telefone:* ${sanitize(formData.phone)}%0A`
    
    message += `%0A*Endereço para Entrega:*%0A`
    message += `${sanitize(formData.address_street)}, ${sanitize(formData.address_number)}`
    if (formData.address_complement) {
      message += ` - ${sanitize(formData.address_complement)}`
    }
    message += `%0A`
    if (formData.address_neighborhood) {
      message += `${sanitize(formData.address_neighborhood)}`
    }
    if (formData.address_city) {
      message += ` - ${sanitize(formData.address_city)}`
    }
    if (formData.address_state) {
      message += `/${sanitize(formData.address_state)}`
    }
    if (formData.address_zipcode) {
      message += `%0ACEP: ${sanitize(formData.address_zipcode)}`
    }
    message += `%0A`
    
    message += `%0A*PRODUTOS:*%0A`
    cart.forEach((item, index) => {
      const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
      const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
      const itemPrice = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
      const subtotal = isNaN(itemPrice) ? 0 : itemPrice * item.quantity
      
      message += `${index + 1}. ${sanitize(item.name)}%0A`
      
      if (item.on_sale && item.sale_price && item.original_price) {
        const origPriceStr = typeof item.original_price === 'string' ? item.original_price : String(item.original_price)
        const originalPrice = parseFloat(origPriceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
        if (!isNaN(originalPrice)) {
          message += `   ~R$ ${formatPriceForDisplay(originalPrice)}~ `
          message += `*R$ ${formatPriceForDisplay(itemPrice)}*`
          if (item.discount_percentage) {
            message += ` (-${item.discount_percentage}%%)`
          }
          message += `%0A`
          message += `   ${item.quantity}x = R$ ${formatPriceForDisplay(subtotal)}%0A`
        }
      } else {
        message += `   ${item.quantity}x R$ ${formatPriceForDisplay(itemPrice)} = R$ ${formatPriceForDisplay(subtotal)}%0A`
      }
    })
    
    message += `%0A*TOTAL:* R$ ${formatPriceForDisplay(total)}%0A`
    
    if (formData.notes) {
      message += `%0A*Observacoes:* ${sanitize(formData.notes)}%0A`
    }
    
    message += `%0AGostaria de confirmar a disponibilidade e combinar a forma de pagamento e entrega. Obrigado!`
    
    return message
  }

  const validateAddress = () => {
    const requiredFields = {
      address_street: 'Rua/Avenida',
      address_number: 'Número',
      address_neighborhood: 'Bairro',
      address_city: 'Cidade',
      address_state: 'Estado'
    }
    
    const missingFields: string[] = []
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field as keyof typeof formData] || !formData[field as keyof typeof formData].trim()) {
        missingFields.push(label)
      }
    }
    
    if (missingFields.length > 0) {
      alert(`Por favor, preencha todos os campos obrigatórios do endereço:\n\n${missingFields.join('\n')}`)
      return false
    }
    
    return true
  }

  const handleWhatsAppSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha seu nome e telefone')
      return
    }
    
    if (!validateAddress()) {
      return
    }
    
    if (!notifyOrder && !notifyPromos) {
      setPendingSubmit(true)
      setShowNotificationModal(true)
      return
    }
    
    await processOrder()
  }

  const processOrder = async () => {
    setLoading(true)
    setShowNotificationModal(false)
    
    const orderNumber = generateOrderNumber()
    const total = calculateTotal()
    const message = formatWhatsAppMessage()
    const whatsappNumber = '5555991288464'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    
    const orderData = {
      order_number: orderNumber,
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_email: user?.email || null,
      customer_address_street: formData.address_street,
      customer_address_number: formData.address_number,
      customer_address_complement: formData.address_complement || null,
      customer_address_neighborhood: formData.address_neighborhood,
      customer_address_city: formData.address_city,
      customer_address_state: formData.address_state,
      customer_address_zipcode: formData.address_zipcode,
      notes: `${formData.notes || ''}${notifyOrder ? ' [NOTIFY_ORDER]' : ''}${notifyPromos ? ' [NOTIFY_PROMOS]' : ''}`.trim() || null,
      products: cart.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image || null,
        price: item.on_sale && item.sale_price ? item.sale_price : item.price,
        quantity: item.quantity
      })),
      subtotal: parseFloat(total.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: 'pending'
    }

    try {
      const storedOrders = JSON.parse(localStorage.getItem('alfajoias-orders') || '[]')
      const newOrder = {
        ...orderData,
        created_at: new Date().toISOString(),
        whatsapp_message: message,
        whatsapp_url: whatsappUrl
      }
      localStorage.setItem('alfajoias-orders', JSON.stringify([...storedOrders, newOrder]))
      localStorage.setItem('alfajoias-last-whatsapp', JSON.stringify({
        url: whatsappUrl,
        message,
        order_number: orderNumber
      }))
    } catch {}

    // Firebase migration - order saving temporarily disabled
    console.log('💾 Pedido salvo no localStorage (migração Firebase em andamento)')
    
    window.open(whatsappUrl, '_blank')
    clearCart()
    
    setTimeout(() => {
      router.push('/pedido-confirmado')
      setLoading(false)
    }, 500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos ao carrinho antes de finalizar o pedido.</p>
          <button
            onClick={() => router.push('/produtos')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Pedido</h1>
          <p className="text-gray-600">Complete seus dados e envie o pedido via WhatsApp</p>
          <p className="text-sm text-gray-500 mt-2">Pagamento e entrega serão combinados diretamente pelo WhatsApp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Seus Dados
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço de Entrega</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">
                        Rua/Avenida *
                      </label>
                      <input
                        type="text"
                        id="address_street"
                        name="address_street"
                        required
                        value={formData.address_street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        id="address_number"
                        name="address_number"
                        required
                        value={formData.address_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address_complement" className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        id="address_complement"
                        name="address_complement"
                        value={formData.address_complement}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address_neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        id="address_neighborhood"
                        name="address_neighborhood"
                        required
                        value={formData.address_neighborhood}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        id="address_city"
                        name="address_city"
                        required
                        value={formData.address_city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        type="text"
                        id="address_state"
                        name="address_state"
                        required
                        value={formData.address_state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address_zipcode" className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        id="address_zipcode"
                        name="address_zipcode"
                        value={formData.address_zipcode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-4">
                {cart.map((item) => {
                  const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
                  const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
                  const itemPrice = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
                  const subtotal = isNaN(itemPrice) ? 0 : itemPrice * item.quantity
                  
                  return (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity}x {formatPriceForDisplay(itemPrice)}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatPriceForDisplay(subtotal)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatPriceForDisplay(calculateTotal())}</span>
                </div>

                <button
                  onClick={handleWhatsAppSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="h-5 w-5" />
                  {loading ? 'Enviando...' : 'Enviar via WhatsApp'}
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ao clicar, você será redirecionado para o WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}