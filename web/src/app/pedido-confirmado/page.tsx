'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle, MessageCircle, Package, Clock, Home } from 'lucide-react'

export default function PedidoConfirmado() {
  const [orderData, setOrderData] = useState<any>(null)
  const [lastWhatsApp, setLastWhatsApp] = useState<{ url: string; message: string; order_number?: string } | null>(null)

  useEffect(() => {
    // Buscar o último pedido do localStorage
    const orders = JSON.parse(localStorage.getItem('alfajoias-orders') || '[]')
    if (orders.length > 0) {
      setOrderData(orders[orders.length - 1])
    }
    const lw = localStorage.getItem('alfajoias-last-whatsapp')
    if (lw) {
      try { setLastWhatsApp(JSON.parse(lw)) } catch {}
    }
  }, [])

  // Acompanhar status do pedido no banco e notificar
  useEffect(() => {
    let interval: any
    if (orderData?.order_number) {
      const fetchStatus = async () => {
        const { data } = await supabase
          .from('orders')
          .select('status, updated_at, notes')
          .eq('order_number', orderData.order_number)
          .single()
        if (data && (data.status !== orderData.status || data.notes !== orderData.notes)) {
          setOrderData((prev: any) => ({ ...prev, status: data.status, notes: data.notes }))
          try {
            const wants = JSON.parse(localStorage.getItem('alfajoias-notify-order') || 'false')
            if (wants && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Status do pedido atualizado', { body: `Novo status: ${data.status}` })
            }
          } catch {}
        }
      }
      // Solicitar permissão se marcado
      try {
        const wants = JSON.parse(localStorage.getItem('alfajoias-notify-order') || 'false')
        if (wants && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission()
        }
      } catch {}
      fetchStatus()
      interval = setInterval(fetchStatus, 10000)
    }
    return () => interval && clearInterval(interval)
  }, [orderData?.order_number])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Ícone de Sucesso */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pedido Enviado com Sucesso!
          </h1>

          {/* Mensagem */}
          <p className="text-gray-600 mb-8">
            Seu pedido foi enviado via WhatsApp e está sendo processado. 
            Em breve entraremos em contato para confirmar os detalhes.
          </p>

          {/* Detalhes do Pedido */}
          {orderData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Detalhes do Pedido
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-medium text-gray-900">{orderData.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(orderData.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(orderData.created_at).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">
                    R$ {orderData.total.toFixed(2).replace('.', ',')} + frete
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Aguardando Confirmação
                  </span>
                </div>

                {orderData.status === 'cancelled' && orderData.notes && (
                  <div className="mt-3 p-3 rounded-md bg-red-50 text-red-800">
                    <p className="text-sm">
                      <span className="font-medium">Compra cancelada.</span>{' '}
                      {(() => {
                        const match = String(orderData.notes).match(/Cancelamento:\s*(.*)$/)
                        const reason = match ? match[1] : orderData.notes
                        return <span>Motivo: {reason}</span>
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Próximos Passos / Status */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              {orderData?.status === 'confirmed' && 'Pedido Confirmado'}
              {orderData?.status === 'preparing' && 'Preparando seu Pedido'}
              {(orderData?.status === 'ready' || orderData?.status === 'ready_for_pickup') && 'Pronto para Retirar/Entregar'}
              {orderData?.status === 'cancelled' && 'Pedido Cancelado'}
              {!orderData?.status || orderData?.status === 'pending' ? 'Aguardando Confirmação' : ''}
            </h3>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="text-blue-900 font-medium">Confirmação via WhatsApp</p>
                  <p className="text-blue-700 text-sm">Confirmaremos a disponibilidade dos produtos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="text-blue-900 font-medium">Cálculo do Frete</p>
                  <p className="text-blue-700 text-sm">Informaremos o valor do frete ou entrega</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="text-blue-900 font-medium">Confirmação Final</p>
                  <p className="text-blue-700 text-sm">Você confirma o pedido e forma de pagamento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="text-blue-900 font-medium">Preparação e Entrega</p>
                  <p className="text-blue-700 text-sm">Preparamos seu pedido e entregamos ou avisamos quando estiver pronto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contato
            </h3>
            
            <div className="space-y-2 text-left">
              <p className="text-green-800">
                <strong>WhatsApp:</strong> <a href="tel:+5555991288464" className="hover:underline">(55) 9 9912-88464</a>
              </p>
              <p className="text-green-800">
                <strong>Endereço:</strong> Av. Santa Clara 137, Centro, Nova Candelária - RS
              </p>
              <p className="text-green-800">
                <strong>Horário de Funcionamento:</strong><br />
                Segunda a Sexta: 8h às 12h e 13h30 às 18h30<br />
                Sábados: 8h às 12h<br />
                Domingos: Fechado
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/produtos"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Package className="h-5 w-5 mr-2" />
              Continuar Comprando
            </Link>
            
            <Link
              href="/pedidos"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <Clock className="h-5 w-5 mr-2" />
              Acompanhar compra
            </Link>

            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Voltar ao Início
            </Link>

            {lastWhatsApp && (
              <a
                href={lastWhatsApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Reenviar no WhatsApp
              </a>
            )}
          </div>

          {/* Nota Importante */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Mantenha o WhatsApp aberto para receber nossa resposta. 
              Normalmente respondemos em até 30 minutos durante o horário de funcionamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}









