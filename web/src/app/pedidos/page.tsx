'use client'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { Package, Calendar, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Orders() {
  const { user, loading: authLoading } = useFirebaseAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user?.email) {
      // Firebase migration - load orders from localStorage temporarily
      try {
        const savedOrders = JSON.parse(localStorage.getItem('alfajoias-orders') || '[]')
        setOrders(savedOrders)
      } catch (e) {
        setOrders([])
      }
      setLoading(false)
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const getStatusLabel = (status: string | null | undefined) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'pending':
        return 'Aguardando Confirmação'
      case 'confirmed':
        return 'Confirmado'
      case 'preparing':
        return 'Preparando'
      case 'delivered':
        return 'Entregue'
      case 'ready_for_pickup':
        return 'Pronto para Retirar'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Aguardando Confirmação'
    }
  }

  const getStatusIcon = (status: string | null | undefined) => {
    const label = getStatusLabel(status)
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

  const getStatusColor = (status: string | null | undefined) => {
    const label = getStatusLabel(status)
    switch (label) {
      case 'Aguardando Confirmação':
        return 'text-gray-700 bg-gray-100'
      case 'Confirmado':
        return 'text-blue-700 bg-blue-100'
      case 'Preparando':
        return 'text-yellow-700 bg-yellow-100'
      case 'Pronto para Retirar':
        return 'text-emerald-700 bg-emerald-100'
      case 'Entregue':
        return 'text-green-700 bg-green-100'
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
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando seus pedidos...</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h2>
            <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido.</p>
            <Link
              href="/produtos"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_number} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pedido {order.order_number}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Itens do pedido:</h4>
                  <div className="space-y-3 mb-4">
                    {(order.products || []).map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Quantidade: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> O histórico de pedidos está temporariamente limitado ao localStorage durante a migração para Firebase.
          </p>
        </div>
      </div>
    </div>
  )
}