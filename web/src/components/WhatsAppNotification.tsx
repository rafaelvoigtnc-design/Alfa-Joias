'use client'

import { useState } from 'react'
import { MessageCircle, Send, X, Star } from 'lucide-react'

interface WhatsAppNotificationProps {
  order: any
  onClose: () => void
}

export default function WhatsAppNotification({ order, onClose }: WhatsAppNotificationProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const generateStatusMessage = (status: string) => {
    switch (status) {
      case 'confirmed':
        return `✅ *Pedido Confirmado!*\n\nOlá! Confirmamos seu pedido #${order.order_number}.\n\nOs produtos estão disponíveis e começaremos a preparação em breve.\n\nEm breve entraremos em contato para informar quando estiver pronto para retirada ou entrega.`
      
      case 'ready':
        return `🎉 *Seu Pedido Está Pronto!*\n\nOlá! Seu pedido #${order.order_number} está pronto!\n\nVocê pode:\n• Retirar na loja\n• Solicitar entrega\n• Aguardar nosso contato\n\nEntre em contato para combinar a melhor forma de receber seu pedido.`
      
      case 'delivered':
        return `✅ *Pedido Entregue!*\n\nOlá! Seu pedido #${order.order_number} foi entregue com sucesso!\n\nEsperamos que tenha gostado dos seus produtos!\n\nObrigado por escolher a Alfa Jóias! 💎`
      
      default:
        return `📋 *Atualização do Pedido*\n\nOlá! Temos uma atualização sobre seu pedido #${order.order_number}.\n\n${message || 'Status atualizado.'}`
    }
  }

  const sendWhatsAppMessage = (customMessage?: string) => {
    setLoading(true)
    
    try {
      const finalMessage = customMessage || generateStatusMessage(order.status)
      
      // Tentar diferentes formas de acessar o telefone do cliente
      const phoneNumber = order.customer_phone || 
                         order.customer?.phone || 
                         order.shipping_address?.phone || 
                         order.phone ||
                         ''
      
      if (!phoneNumber) {
        alert('⚠️ Telefone do cliente não encontrado no pedido.')
        setLoading(false)
        return
      }
      
      const cleanPhone = phoneNumber.toString().replace(/\D/g, '') // Remove caracteres não numéricos
      
      if (!cleanPhone || cleanPhone.length < 10) {
        alert('⚠️ Número de telefone inválido.')
        setLoading(false)
        return
      }
      
      // Se o número não começar com 55 (Brasil), adicionar
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      
      const encodedMessage = encodeURIComponent(finalMessage)
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank')
      
      setTimeout(() => {
        setLoading(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      alert('❌ Erro ao enviar mensagem. Verifique o console para mais detalhes.')
      setLoading(false)
    }
  }

  const generateReviewMessage = () => {
    const productsList = (order.products || []).map((p: any) => `• ${p.name}`).join('\n')
    return `✅ *Pedido Entregue/Retirado!*\n\nOlá! Seu pedido #${order.order_number} foi finalizado com sucesso!\n\n✨ Esperamos que tenha gostado dos seus produtos:\n\n${productsList}\n\n💬 Gostaríamos muito de saber sua opinião sobre sua compra e os produtos que você recebeu.\n\nSe quiser compartilhar conosco o que achou, é só responder esta mensagem!\n\nSua opinião nos ajuda a melhorar sempre! 😊\n\nObrigado por escolher a Alfa Jóias! 💎`
  }

  const quickMessages = [
    {
      status: 'confirmed',
      label: 'Confirmar Pedido',
      message: generateStatusMessage('confirmed')
    },
    {
      status: 'ready', 
      label: 'Pedido Pronto',
      message: generateStatusMessage('ready')
    },
    {
      status: 'delivered',
      label: 'Pedido Entregue',
      message: generateStatusMessage('delivered')
    },
    {
      status: 'review',
      label: 'Pedir Avaliação',
      message: generateReviewMessage()
    }
  ]

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="h-6 w-6 mr-2 text-green-600" />
            Notificar Cliente via WhatsApp
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Informações do Pedido */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Pedido #{order.order_number}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Cliente:</strong> {order.customer_name || order.customer?.name || order.shipping_address?.full_name || 'N/A'}</p>
            <p><strong>Telefone:</strong> {order.customer_phone || order.customer?.phone || order.shipping_address?.phone || 'N/A'}</p>
            <p><strong>Status Atual:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'pending_whatsapp' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status === 'pending_whatsapp' ? 'Aguardando WhatsApp' :
                 order.status === 'confirmed' ? 'Confirmado' :
                 order.status === 'ready' ? 'Pronto' :
                 order.status === 'delivered' ? 'Entregue' :
                 order.status}
              </span>
            </p>
          </div>
        </div>

        {/* Mensagens Rápidas */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Mensagens Rápidas</h4>
          <div className="grid grid-cols-1 gap-2">
            {quickMessages.map((quickMsg) => (
              <button
                key={quickMsg.status}
                onClick={() => sendWhatsAppMessage(quickMsg.message)}
                disabled={loading}
                className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                  quickMsg.status === 'review' 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900 flex items-center">
                  {quickMsg.status === 'review' && <Star className="h-4 w-4 mr-2 text-green-600" />}
                  {quickMsg.label}
                </div>
                <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {quickMsg.message.split('\n')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mensagem Personalizada */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Mensagem Personalizada</h4>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Digite sua mensagem personalizada..."
          />
          <button
            onClick={() => sendWhatsAppMessage(message)}
            disabled={loading || !message.trim()}
            className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem Personalizada
              </>
            )}
          </button>
        </div>

        {/* Preview da Mensagem */}
        {message && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Preview da Mensagem</h4>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {message}
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}












