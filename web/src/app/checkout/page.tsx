'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, MessageCircle, User, Package } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { formatPrice, formatPriceValue } from '@/lib/priceUtils'

export default function Checkout() {
  const { cart, clearCart, user } = useUnifiedAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    phone: user?.user_metadata?.phone || '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: '',
    notes: ''
  })

  // Buscar dados do usuário incluindo endereço quando o componente carregar
  useEffect(() => {
    const loadUserAddress = async () => {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!error && data) {
            console.log('📥 Carregando dados do usuário:', {
              hasName: !!data.name,
              hasPhone: !!data.phone,
              hasAddress: !!(data.address_street && data.address_number)
            })
            
            setFormData(prev => ({
              ...prev,
              // Preencher nome se existir no banco
              name: data.name || prev.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '',
              // Preencher telefone se existir no banco
              phone: data.phone || prev.phone || user?.user_metadata?.phone || '',
              // Preencher endereço completo se existir no banco (substituir valores vazios)
              address_street: data.address_street || prev.address_street || '',
              address_number: data.address_number || prev.address_number || '',
              address_complement: data.address_complement || prev.address_complement || '',
              address_neighborhood: data.address_neighborhood || prev.address_neighborhood || '',
              address_city: data.address_city || prev.address_city || '',
              address_state: data.address_state || prev.address_state || '',
              address_zipcode: data.address_zipcode || prev.address_zipcode || ''
            }))
            
            console.log('✅ Dados do usuário carregados e preenchidos automaticamente')
          } else if (error) {
            console.log('ℹ️ Usuário ainda não tem dados salvos no banco')
          }
        } catch (err) {
          console.error('Erro ao carregar endereço do usuário:', err)
        }
      } else {
        // Se não tiver usuário logado, tentar carregar do localStorage (para visitantes)
        try {
          const savedData = localStorage.getItem('alfajoias-last-checkout')
          if (savedData) {
            const parsed = JSON.parse(savedData)
            setFormData(prev => ({
              ...prev,
              ...parsed
            }))
            console.log('✅ Dados carregados do localStorage')
          }
        } catch (e) {
          // Ignorar erro
        }
      }
    }

    loadUserAddress()
  }, [user?.email, user?.id])
  const [notifyOrder, setNotifyOrder] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('alfajoias-notify-order') || 'false') } catch { return false }
  })
  const [notifyPromos, setNotifyPromos] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('alfajoias-notify-promos') || 'false') } catch { return false }
  })
  
  const [loading, setLoading] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  // Função para formatar preço para exibição (sempre vírgula para decimais)
  const formatPriceForDisplay = (price: string | number): string => formatPriceValue(price)

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
      const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
      const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
      return total + (isNaN(price) ? 0 : price * item.quantity)
    }, 0)
  }

  const calculateSubtotal = () => {
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
    
    // Função de sanitização para WhatsApp
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
    
    // Adicionar endereço completo (sempre obrigatório)
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
      
      // Se estiver em promoção, mostrar preço original riscado
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
    
    // Validar endereço obrigatório
    if (!validateAddress()) {
      return
    }
    
    // Verificar se não selecionou nenhuma notificação
    if (!notifyOrder && !notifyPromos) {
      setPendingSubmit(true)
      setShowNotificationModal(true)
      return
    }
    
    // Se chegou aqui, prosseguir com o envio
    await processOrder()
  }

  const processOrder = async () => {
    setLoading(true)
    setShowNotificationModal(false)
    
    // Preparar dados imediatamente (sem await)
    const orderNumber = generateOrderNumber()
    const total = calculateTotal()
    const message = formatWhatsAppMessage()
    const whatsappNumber = '5555991288464'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    
    // Salvar dados no localStorage imediatamente
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

    // Salvar pedido no banco PRIMEIRO (antes de limpar carrinho)
    try {
      console.log('💾 Salvando pedido no banco...', { orderNumber, email: user?.email })
      const { data: savedOrder, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
          
          if (orderError) {
        console.error('❌ ERRO ao salvar pedido no banco:', orderError)
            
            // Tentar com campos mínimos
            const minimalOrderData = {
              order_number: orderNumber,
              customer_name: formData.name,
              customer_phone: formData.phone,
              customer_email: user?.email || null,
              products: cart.map(item => ({
            id: item.id,
                name: item.name,
                image: item.image || null,
                price: item.on_sale && item.sale_price ? item.sale_price : item.price,
                quantity: item.quantity
              })),
          total: parseFloat(total.toFixed(2)),
          status: 'pending'
            }
            
        const { error: minimalError } = await supabase
              .from('orders')
              .insert([minimalOrderData])
          .select()
        
        if (minimalError) {
          console.error('❌ Erro mesmo com campos mínimos:', minimalError)
          alert('⚠️ Pedido enviado no WhatsApp, mas houve erro ao salvar no banco. Entre em contato conosco.')
          } else {
          console.log('✅ Pedido salvo com campos mínimos')
        }
      } else {
        console.log('✅ Pedido salvo no banco com sucesso!', savedOrder?.[0]?.id)
          }
        } catch (e) {
      console.error('❌ Erro ao salvar pedido:', e)
      alert('⚠️ Pedido enviado no WhatsApp, mas houve erro ao salvar no banco. Entre em contato conosco.')
    }
    
    // ABRIR WHATSAPP APÓS salvar no banco
    window.open(whatsappUrl, '_blank')
    
    // Limpar carrinho APÓS salvar no banco
    clearCart()
    
    // Redirecionar
    setTimeout(() => {
      router.push('/pedido-confirmado')
      setLoading(false)
    }, 500)

    // Operações em background (não bloquear a interface)
    Promise.all([
      // Salvar endereço na conta do usuário
      (async () => {
        if (!user?.email) return
        
        try {
          // Verificar se o usuário existe na tabela users
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()
          
          const addressData = {
            address_street: formData.address_street,
            address_number: formData.address_number,
            address_complement: formData.address_complement || null,
            address_neighborhood: formData.address_neighborhood,
            address_city: formData.address_city,
            address_state: formData.address_state,
            address_zipcode: formData.address_zipcode,
            updated_at: new Date().toISOString()
          }
          
          if (fetchError || !existingUser) {
            // Usuário não existe, criar registro completo
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                name: formData.name,
                phone: formData.phone,
                ...addressData
              }])
            
            if (insertError) {
              console.error('Erro ao criar usuário com endereço:', insertError)
            } else {
              console.log('✅ Endereço salvo na conta do usuário (novo usuário)')
            }
          } else {
            // Usuário existe, atualizar endereço (só atualizar se não tiver ou se for diferente)
            const hasExistingAddress = existingUser.address_street && existingUser.address_number
            
            // Se não tem endereço salvo OU se o endereço mudou, atualizar
            const addressChanged = !hasExistingAddress || 
              existingUser.address_street !== formData.address_street ||
              existingUser.address_number !== formData.address_number ||
              existingUser.address_neighborhood !== formData.address_neighborhood ||
              existingUser.address_city !== formData.address_city ||
              existingUser.address_state !== formData.address_state ||
              existingUser.address_zipcode !== formData.address_zipcode
            
            if (addressChanged) {
              const { error: updateError } = await supabase
                .from('users')
                .update(addressData)
                .eq('email', user.email)
              
              if (updateError) {
                console.error('Erro ao atualizar endereço do usuário:', updateError)
              } else {
                console.log('✅ Endereço salvo/atualizado na conta do usuário')
              }
            } else {
              console.log('ℹ️ Endereço já estava salvo na conta')
            }
          }
        } catch (e) {
          console.error('Erro ao salvar endereço na conta do usuário:', e)
          // Não bloquear o fluxo se falhar ao salvar endereço
        }
      })(),
      
      // Decrementar estoque (em paralelo) - apenas se a coluna existir
      Promise.all(cart.map(async (item) => {
        if (!item.id || !item.quantity) return
        try {
          // Tentar verificar se a coluna stock existe primeiro
          const { data: prod, error: selectError } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.id)
            .single()
          
          // Se houver erro ou não encontrar produto, pular
          if (selectError || !prod) return
          
          // Verificar se a propriedade stock existe no resultado
          if ('stock' in prod && typeof prod.stock === 'number') {
            const current = prod.stock
            const next = Math.max(0, current - item.quantity)
            await supabase
              .from('products')
              .update({ stock: next })
              .eq('id', item.id)
          }
          // Se não tiver coluna stock, apenas ignorar silenciosamente
        } catch (e) {
          // Ignorar todos os erros de estoque em background
        }
      })),
      
      // Solicitar permissão de notificação
      (async () => {
        try {
          if (notifyOrder && 'Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission()
          }
        } catch {}
      })(),
      
      // Track no Analytics
      (async () => {
        if (typeof window !== 'undefined') {
          try {
            const { trackPurchase, trackWhatsAppClick } = await import('@/lib/analytics')
            trackPurchase(orderNumber, total, cart.length)
            trackWhatsAppClick('checkout')
          } catch {}
        }
      })()
    ]).catch(err => {
      // Erros em background não devem bloquear o fluxo
      console.error('Erros em background:', err)
    })
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Pedido</h1>
          <p className="text-gray-600">Complete seus dados e envie o pedido via WhatsApp</p>
          <p className="text-sm text-gray-500 mt-2">Pagamento e entrega serão combinados diretamente pelo WhatsApp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="(55) 99999-9999"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usaremos este número para entrar em contato sobre seu pedido
                  </p>
                </div>

                {/* Campos de Endereço */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Endereço para Entrega
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    * Todos os campos marcados com asterisco são obrigatórios. O endereço será salvo na sua conta para facilitar futuros pedidos.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Nome da rua ou avenida"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="address_complement" className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      id="address_complement"
                      name="address_complement"
                      value={formData.address_complement}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Apartamento, bloco, etc. (opcional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Nome do bairro"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Nome da cidade"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado (UF) *
                      </label>
                      <select
                        id="address_state"
                        name="address_state"
                        required
                        value={formData.address_state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Selecione o estado</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="address_zipcode" className="block text-sm font-medium text-gray-700 mb-1">
                        CEP (Opcional)
                      </label>
                      <input
                        type="text"
                        id="address_zipcode"
                        name="address_zipcode"
                        maxLength={9}
                        value={formData.address_zipcode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações (Opcional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Alguma informação adicional sobre seu pedido? Ex: preferência de horário, etc."
                  />
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Como funciona:</strong><br />
                  1. Você envia o pedido pelo WhatsApp<br />
                  2. Confirmamos disponibilidade dos produtos<br />
                  3. Combinamos forma de pagamento e entrega<br />
                  4. Pronto! Simples e rápido 🎉
                </p>
              </div>

            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        R$ {(() => {
                          const priceToUse = item.on_sale && item.sale_price ? item.sale_price : item.price
                          const priceStr = typeof priceToUse === 'string' ? priceToUse : String(priceToUse)
                          const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.'))
                          return isNaN(price) ? '0,00' : formatPriceForDisplay(price * item.quantity)
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">R$ {formatPriceForDisplay(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete:</span>
                  <span className="text-gray-900">A combinar</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {formatPriceForDisplay(calculateTotal())} + frete</span>
                </div>
              </div>

              {/* Seção de Notificações - Movida para acima do botão */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 font-semibold mb-3 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
                  Notificações
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer hover:text-blue-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={notifyOrder} 
                    onChange={e=>{
                      setNotifyOrder(e.target.checked); 
                      localStorage.setItem('alfajoias-notify-order', JSON.stringify(e.target.checked))
                    }} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">Receber notificações de atualização do pedido</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-blue-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={notifyPromos} 
                    onChange={e=>{
                      setNotifyPromos(e.target.checked); 
                      localStorage.setItem('alfajoias-notify-promos', JSON.stringify(e.target.checked))
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">Receber ofertas e promoções</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Mantenha-se informado sobre o status do seu pedido e ofertas exclusivas!
                </p>
              </div>

              <button
                onClick={handleWhatsAppSubmit}
                disabled={loading || !formData.name || !formData.phone || !formData.address_street || !formData.address_number || !formData.address_neighborhood || !formData.address_city || !formData.address_state}
                className="w-full mt-6 bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-semibold shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Abrindo WhatsApp...
                  </div>
                ) : (
                  <>
                    <MessageCircle className="h-6 w-6 mr-2" />
                    Finalizar no WhatsApp
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Você será redirecionado para o WhatsApp com seu pedido pronto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Notificações - Aparece se não selecionou nada */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📢 Receber Notificações?
            </h3>
            <p className="text-gray-700 mb-6">
              Deseja receber notificações sobre o status do seu pedido e ofertas exclusivas? 
              Isso nos ajuda a manter você informado sobre atualizações importantes!
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <input 
                  type="checkbox" 
                  checked={notifyOrder} 
                  onChange={e=>{
                    setNotifyOrder(e.target.checked); 
                    localStorage.setItem('alfajoias-notify-order', JSON.stringify(e.target.checked))
                  }} 
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Atualizações do pedido</span>
                  <p className="text-xs text-gray-600">Seja avisado quando seu pedido for confirmado, preparado ou entregue</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <input 
                  type="checkbox" 
                  checked={notifyPromos} 
                  onChange={e=>{
                    setNotifyPromos(e.target.checked); 
                    localStorage.setItem('alfajoias-notify-promos', JSON.stringify(e.target.checked))
                  }}
                  className="w-5 h-5 text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Ofertas e promoções</span>
                  <p className="text-xs text-gray-600">Receba novidades sobre produtos em promoção e lançamentos</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  // Validar endereço antes de prosseguir
                  if (!validateAddress()) {
                    setShowNotificationModal(false)
                    setPendingSubmit(false)
                    return
                  }
                  setShowNotificationModal(false)
                  setPendingSubmit(false)
                  // Prosseguir mesmo sem selecionar
                  processOrder()
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Não, obrigado
              </button>
              <button
                onClick={() => {
                  // Validar endereço antes de prosseguir
                  if (!validateAddress()) {
                    setShowNotificationModal(false)
                    setPendingSubmit(false)
                    return
                  }
                  setShowNotificationModal(false)
                  setPendingSubmit(false)
                  // Prosseguir com as seleções feitas
                  processOrder()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
