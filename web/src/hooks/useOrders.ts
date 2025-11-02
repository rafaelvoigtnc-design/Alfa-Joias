import { useState, useEffect } from 'react'
import { supabase, Order } from '@/lib/supabase'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Carregando pedidos do Supabase...')
      
      // Carregar pedidos do Supabase
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar pedidos do Supabase:', error)
        setError(error.message)
        setOrders([])
        return
      }
      
      console.log('✅ Pedidos carregados do Supabase:', data?.length || 0)
      console.log('📦 Pedidos do Supabase:', data)
      
      setOrders(data || [])
    } catch (err) {
      console.error('❌ Erro geral ao carregar pedidos:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, extraUpdates?: Record<string, any>) => {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString()
      } else if (status === 'delivered') {
        // Quando é entregue, usar delivered_at do extraUpdates (passado pelo admin) ou criar novo
        // IMPORTANTE: garantir que picked_up_at seja explicitamente null quando é entregue
        const deliveredDate = extraUpdates?.delivered_at || new Date().toISOString()
        updates.delivered_at = deliveredDate
        updates.status = 'delivered'
        // Definir picked_up_at como null explicitamente para limpar qualquer valor anterior
        updates.picked_up_at = null
      } else if (status === 'picked_up') {
        // Quando é retirado, usar picked_up_at do extraUpdates (passado pelo admin) ou criar novo
        // IMPORTANTE: garantir que delivered_at seja explicitamente null quando é retirado
        const pickedUpDate = extraUpdates?.picked_up_at || new Date().toISOString()
        updates.picked_up_at = pickedUpDate
        updates.status = 'delivered' // Status final é delivered mas com picked_up_at preenchido
        // Definir delivered_at como null explicitamente para limpar qualquer valor anterior
        updates.delivered_at = null
      }

      // Mesclar outros campos do extraUpdates (ex: notas, etc), mas não sobrescrever os campos críticos
      if (extraUpdates && typeof extraUpdates === 'object') {
        // Copiar campos extras, mas não sobrescrever delivered_at, picked_up_at ou status
        // Esses já foram definidos acima corretamente
        Object.keys(extraUpdates).forEach(key => {
          if (key !== 'delivered_at' && key !== 'picked_up_at' && key !== 'status') {
            updates[key] = extraUpdates[key]
          }
        })
      }

      // Garantir que quando é entregue, picked_up_at é null
      if (status === 'delivered') {
        updates.picked_up_at = null
      }
      
      // Garantir que quando é retirado, delivered_at é null  
      if (status === 'picked_up') {
        updates.delivered_at = null
      }

      // Log para debug
      console.log('🔄 Atualizando status do pedido:', {
        orderId,
        status,
        updates: { ...updates },
        extraUpdates
      })

      // Atualizar no Supabase
      // Se delivered_at ou picked_up_at não existirem, tentar atualizar sem esses campos
      const safeUpdates: any = { ...updates }
      
      // Verificar se o erro é de coluna não encontrada e tentar novamente sem as colunas problemáticas
      let { data, error } = await supabase
        .from('orders')
        .update(safeUpdates)
        .eq('id', orderId)
        .select()
        .single()

      // Se o erro for sobre coluna não encontrada, tentar atualizar sem delivered_at/picked_up_at
      if (error && (error.message?.includes("delivered_at") || error.message?.includes("picked_up_at") || error.message?.includes("Could not find"))) {
        console.warn('⚠️ Colunas delivered_at ou picked_up_at não existem. Tentando atualizar sem essas colunas...')
        
        // Remover delivered_at e picked_up_at do update
        delete safeUpdates.delivered_at
        delete safeUpdates.picked_up_at
        
        // Tentar atualizar novamente sem essas colunas
        const retryResult = await supabase
          .from('orders')
          .update(safeUpdates)
          .eq('id', orderId)
          .select()
          .single()
        
        if (retryResult.error) {
          console.error('❌ Erro ao atualizar status no Supabase (tentativa sem colunas de entrega):', {
            error: retryResult.error,
            message: retryResult.error.message,
            details: retryResult.error.details,
            hint: retryResult.error.hint,
            code: retryResult.error.code,
            orderId,
            updates: safeUpdates
          })
          throw new Error(`Colunas de entrega não existem no banco. Execute o script SQL: add-missing-order-columns.sql\n\nErro: ${retryResult.error.message}`)
        }
        
        data = retryResult.data
        error = retryResult.error
      } else if (error) {
        console.error('❌ Erro ao atualizar status no Supabase:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          orderId,
          updates
        })
        throw error
      }

      if (!data) {
        console.error('❌ Supabase retornou sem dados após atualização')
        throw new Error('Nenhum dado retornado após atualização')
      }

      console.log('✅ Status atualizado com sucesso no banco:', data)

      // Atualizar lista local com os dados retornados do banco (que são os valores corretos)
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...data } : order
      ))
      
      return { data: data, error: null }
    } catch (err: any) {
      console.error('❌ Erro geral ao atualizar status do pedido:', {
        error: err,
        message: err?.message || 'Erro desconhecido',
        stack: err?.stack,
        orderId,
        status
      })
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error(err?.message || 'Erro ao atualizar status do pedido')
      }
    }
  }

  const addTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const updates = { 
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString()
      }

      // Atualizar no Supabase
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      // Atualizar lista local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ))
      
      return { data: updates, error: null }
    } catch (err) {
      console.error('Erro ao adicionar número de rastreamento:', err)
      return { data: null, error: err }
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    addTrackingNumber,
    refetch: fetchOrders
  }
}
