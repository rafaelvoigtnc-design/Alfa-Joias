'use client'

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { Package, Calendar, Phone, CheckCircle, Clock, Star } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Orders() {
  const { user, loading: authLoading } = useUnifiedAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSlow, setIsSlow] = useState(false)
  const [showReload, setShowReload] = useState(false)
  const hasFetchedRef = useRef<string | null>(null) // Guarda o email que já foi buscado
  const isFetchingRef = useRef(false)
  const retryCountRef = useRef(0)
  
  // Função centralizada para buscar pedidos
  const fetchOrders = async (force = false) => {
    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current && !force) {
      console.log('⏸️ Já está buscando, ignorando chamada...')
      return
    }
    
    // Se ainda está carregando autenticação, aguardar
    if (authLoading && !force) {
      console.log('⏳ Aguardando autenticação terminar...')
      return
    }
    
    // Se não tem usuário ou email, não buscar
    if (!user?.email) {
      console.log('⚠️ Usuário não logado ou sem email')
      if (!authLoading) {
        setOrders([])
        setLoading(false)
        setError(null)
      }
      return
    }
    
    // Se já buscou para este email e não é força, não buscar novamente
    if (hasFetchedRef.current === user.email && !force) {
      console.log('✅ Já buscou pedidos para este email')
      return
    }
    
    console.log('🔄 Buscando pedidos...', { email: user.email, force })
    isFetchingRef.current = true
    // Só atualizar o cache se não for força (para permitir retries forçados)
    if (!force) {
      hasFetchedRef.current = user.email
    }
    
    let reloadTimeout: NodeJS.Timeout | undefined
    let slowTimer: NodeJS.Timeout | undefined
    
    try {
      setLoading(true)
      setError(null)
      setIsSlow(false)
      setShowReload(false)
      retryCountRef.current = 0
      
      // Timeout de 30 segundos para mostrar opção de reload
      reloadTimeout = setTimeout(() => {
        setShowReload(true)
      }, 30000)
      
      slowTimer = setTimeout(() => setIsSlow(true), 6000)
      
      console.log('📡 Fazendo query no Supabase...', user.email)
      const { data, error: queryError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
      
      if (slowTimer) clearTimeout(slowTimer)
      if (reloadTimeout) clearTimeout(reloadTimeout)
      
      if (queryError) {
        console.error('❌ Erro na query:', queryError)
        throw queryError
      }
      
      console.log('✅ Pedidos carregados:', data?.length || 0)
      setOrders(data || [])
      setShowReload(false)
      setError(null)
      // Agora sim, marcar como buscado (só se tiver sucesso)
      hasFetchedRef.current = user.email
    } catch (e: any) {
      if (slowTimer) clearTimeout(slowTimer)
      if (reloadTimeout) clearTimeout(reloadTimeout)
      console.error('❌ Erro ao carregar pedidos:', e)
      setError(e?.message || 'Erro ao carregar seus pedidos.')
      setOrders([])
      hasFetchedRef.current = null // Permitir retry
    } finally {
      setLoading(false)
      setShowReload(false)
      isFetchingRef.current = false
    }
  }

  // Carregar pedidos quando a autenticação estiver pronta
  useEffect(() => {
    // Se ainda está carregando autenticação, aguardar mas também configurar retry
    if (authLoading) {
      console.log('⏳ Aguardando autenticação terminar...')
      // Tentar novamente após 1 segundo se ainda estiver carregando
      const retryTimer = setTimeout(() => {
        if (authLoading && retryCountRef.current < 5) {
          retryCountRef.current++
          console.log(`🔄 Tentativa ${retryCountRef.current} de buscar após aguardar autenticação...`)
          fetchOrders()
        }
      }, 1000)
      return () => clearTimeout(retryTimer)
    }
    
    // Se não tem usuário, definir estado como não logado
    if (!user) {
      console.log('⚠️ Usuário não logado')
      setOrders([])
      setLoading(false)
      setError(null)
      hasFetchedRef.current = null
      return
    }
    
    // Se tem usuário mas não tem email, aguardar um pouco
    if (!user.email) {
      console.log('⚠️ Usuário sem email, aguardando...')
      const emailWaitTimer = setTimeout(() => {
        if (!user?.email && !authLoading) {
          setOrders([])
          setLoading(false)
          setError('Email não encontrado na conta.')
          hasFetchedRef.current = null
        } else if (user?.email) {
          // Email apareceu, buscar agora
          fetchOrders()
        }
      }, 1000)
      return () => clearTimeout(emailWaitTimer)
    }
    
    // Se chegou aqui, tem usuário e email - buscar pedidos
    // Delay pequeno para garantir que tudo está sincronizado
    const timer = setTimeout(() => {
      fetchOrders()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [user, user?.email, authLoading])
  
  // Retry automático se ainda estiver carregando após alguns segundos
  useEffect(() => {
    if (loading && !authLoading && user?.email && retryCountRef.current < 3) {
      const retryTimer = setTimeout(() => {
        if (loading && !authLoading && user?.email) {
          retryCountRef.current++
          console.log(`🔄 Retry automático ${retryCountRef.current}...`)
          hasFetchedRef.current = null
          fetchOrders(true) // Force retry
        }
      }, 2000)
      return () => clearTimeout(retryTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authLoading, user?.email])
  
  // Recarregar quando a aba voltar a ficar ativa
  useEffect(() => {
    const handleFocus = () => {
      if (!authLoading && user?.email && !loading) {
        console.log('🔄 Página focada, verificando se precisa recarregar...')
        // Recarregar se houve erro ou se não há pedidos
        if (error || (orders.length === 0 && !authLoading)) {
          console.log('🔄 Recarregando pedidos ao focar na aba...')
          hasFetchedRef.current = null // Reset para permitir busca
          fetchOrders(true)
        }
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authLoading, error, orders.length, user?.email])
  
  // Tentar buscar imediatamente quando componente monta e autenticação já está pronta
  useEffect(() => {
    // Se autenticação já terminou e tem usuário, tentar buscar
    if (!authLoading && user?.email && hasFetchedRef.current === null) {
      console.log('🚀 Autenticação pronta na montagem, buscando imediatamente...')
      const immediateTimer = setTimeout(() => {
        fetchOrders()
      }, 50)
      return () => clearTimeout(immediateTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executar apenas uma vez na montagem

  const getStatusLabel = (status: string | null | undefined, order?: any) => {
    // Prioridade: verificar primeiro picked_up_at e delivered_at antes do status
    // Se tem picked_up_at (mesmo que null/undefined seja verificado como falsy, mas existe), é retirado
    if (order?.picked_up_at) {
      return 'Retirado'
    }
    
    // Se tem delivered_at mas não tem picked_up_at, é entregue
    if (order?.delivered_at && !order?.picked_up_at) {
      return 'Entregue'
    }
    
    // Se o status é delivered mas não temos informações de delivered_at ou picked_up_at,
    // assumir entregue como padrão
    if ((status || '').toLowerCase() === 'delivered' && !order?.picked_up_at) {
      return 'Entregue'
    }
    
    switch ((status || 'pending').toLowerCase()) {
      case 'pending':
      case 'pedido_feito':
      case 'pending_whatsapp':
        return 'Pedido Feito'
      case 'confirmed':
      case 'confirmado':
        return 'Confirmado'
      case 'preparing':
      case 'preparando':
        return 'Preparando'
      case 'picked_up':
        return 'Retirado'
      case 'delivered':
      case 'entregue':
        // Se não tem picked_up_at mas tem delivered_at, é entregue
        // Se tem picked_up_at, já foi tratado acima
        return order?.picked_up_at ? 'Retirado' : 'Entregue'
      case 'ready_for_pickup':
      case 'pronto_para_retirar':
      case 'ready':
        return 'Pronto para Retirar'
      case 'cancelled':
      case 'canceled':
        return 'Cancelado'
      default:
        return 'Pedido Feito'
    }
  }

  const getStatusIcon = (status: string | null | undefined, order?: any) => {
    const label = getStatusLabel(status, order)
    switch (label) {
      case 'Entregue':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Confirmado':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'Preparando':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'Pronto para Retirar':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case 'Cancelado':
        return <Clock className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string | null | undefined, order?: any) => {
    const label = getStatusLabel(status, order)
    switch (label) {
      case 'Pedido Feito':
        return 'text-gray-700 bg-gray-100'
      case 'Confirmado':
        return 'text-blue-700 bg-blue-100'
      case 'Preparando':
        return 'text-yellow-700 bg-yellow-100'
      case 'Pronto para Retirar':
        return 'text-emerald-700 bg-emerald-100'
      case 'Entregue':
        return 'text-green-700 bg-green-100'
      case 'Retirado':
        return 'text-blue-700 bg-blue-100'
      case 'Cancelado':
        return 'text-red-700 bg-red-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

        {authLoading ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando...</h2>
            <p className="text-gray-600 mb-6">Verificando autenticação...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Faça login para acessar seus pedidos</h2>
            <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
            <a
              href="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Fazer Login
            </a>
          </div>
        ) : (
          <>

            {loading ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando seus pedidos...</h2>
                {isSlow && !showReload && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-yellow-700">Demorando mais que o normal. Verifique sua conexão.</p>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={async () => {
                          console.log('🔄 Botão "Tentar novamente" clicado')
                          // Resetar todos os estados
                          hasFetchedRef.current = null
                          isFetchingRef.current = false
                          setError(null)
                          setLoading(true)
                          setIsSlow(false)
                          setShowReload(false)
                          
                          // Forçar busca imediatamente
                          await fetchOrders(true)
                        }} 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        disabled={isFetchingRef.current}
                      >
                        {isFetchingRef.current ? 'Buscando...' : 'Tentar novamente'}
                      </button>
                      <a href="https://wa.me/5555991288464?text=Olá! Não consegui carregar meus pedidos no site." target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">Falar no WhatsApp</a>
                    </div>
                  </div>
                )}
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
            ) : error ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar pedidos</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={async () => {
                      console.log('🔄 Botão "Tentar novamente" (erro) clicado')
                      // Resetar todos os estados
                      hasFetchedRef.current = null
                      isFetchingRef.current = false
                      setError(null)
                      setLoading(true)
                      setIsSlow(false)
                      setShowReload(false)
                      
                      // Forçar busca imediatamente
                      await fetchOrders(true)
                    }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    disabled={isFetchingRef.current}
                  >
                    {isFetchingRef.current ? 'Buscando...' : 'Tentar novamente'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Recarregar Página
                  </button>
                  <a href="/" className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">Voltar ao início</a>
                </div>
              </div>
            ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h2>
            <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido.</p>
            <a
              href="/produtos"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Produtos
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                        <h3 className="text-lg font-semibold text-gray-900">Pedido {order.order_number}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status, order)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status, order)}`}>
                          {getStatusLabel(order.status, order)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Itens do pedido:</h4>
                  <div className="space-y-3 mb-4">
                        {(order.products || []).map((item: any, index: number) => {
                          // Verificar se o produto tem ID para criar link
                          const productLink = item.id ? `/produto/${item.id}` : null
                          
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              {/* Imagem do produto */}
                              {item.image ? (
                                <Link 
                                  href={productLink || '#'} 
                                  className={`flex-shrink-0 ${productLink ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
                                  onClick={(e) => !productLink && e.preventDefault()}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                  />
                                </Link>
                              ) : (
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Informações do produto */}
                              <div className="flex-1 min-w-0">
                                {productLink ? (
                                  <Link 
                                    href={productLink}
                                    className="block group"
                                  >
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Quantidade: {item.quantity}
                                    </p>
                                  </Link>
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Quantidade: {item.quantity}
                                    </p>
                                  </>
                                )}
                              </div>
                              
                              {/* Preço */}
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  R$ {typeof item.price === 'number' ? item.price.toFixed(2).replace('.', ',') : item.price}
                                </p>
                                {item.quantity > 1 && (() => {
                                  const priceNum = typeof item.price === 'number' 
                                    ? item.price 
                                    : parseFloat(String(item.price).replace(/[^\d,]/g, '').replace(',', '.')) || 0
                                  const totalPrice = priceNum * item.quantity
                                  return (
                                    <p className="text-xs text-gray-500">
                                      {item.quantity}x = R$ {totalPrice.toFixed(2).replace('.', ',')}
                                    </p>
                                  )
                                })()}
                              </div>
                            </div>
                          )
                        })}
                  </div>
                  
                {getStatusLabel(order.status) === 'Cancelado' && order.notes && (
                  <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 text-sm">
                    <span className="font-medium">Compra cancelada.</span>{' '}
                    {(() => {
                      const match = String(order.notes).match(/Cancelamento:\s*(.*)$/)
                      const reason = match ? match[1] : order.notes
                      return <span>Motivo: {reason}</span>
                    })()}
                  </div>
                )}
                  
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-gray-600">R$ {order.total}</span>
                  </div>
                </div>

                    {/* Botões de Ação */}
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <a
                        href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Gostaria de falar sobre meu pedido ${order.order_number} na Alfa Jóias.

Podem me ajudar com informações sobre o status do pedido?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Falar sobre este pedido</span>
                      </a>
                      
                      {/* Botão de Avaliar Produtos */}
                      {(getStatusLabel(order.status, order) === 'Entregue' || getStatusLabel(order.status, order) === 'Retirado') && (
                        <div className="pt-2 border-t">
                          <button
                            onClick={() => {
                              const productsList = (order.products || []).map((p: any) => `• ${p.name}`).join('\n')
                              
                              // Enviar avaliação para o WhatsApp da loja
                              const storePhone = '5555991288464'
                              
                              const reviewMessage = `Olá! Gostaria de avaliar meu pedido #${order.order_number} na Alfa Jóias.\n\nProdutos comprados:\n${productsList}\n\nMinha avaliação:\n[Digite aqui sua opinião sobre os produtos]\n\nObrigado! 😊`
                              
                              const reviewWhatsAppUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(reviewMessage)}`
                              window.open(reviewWhatsAppUrl, '_blank')
                            }}
                            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <Star className="h-4 w-4" />
                            <span>Avaliar produtos via WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </div>
              </div>
            ))}
          </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

