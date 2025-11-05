import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

function normalizeStatus(raw: any): 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'ready_for_pickup' {
  const s = String(raw || '').toLowerCase().trim()
  if (['pending', 'pedido_feito', 'aguardando', 'feito'].includes(s)) return 'pending'
  if (['confirmed', 'confirmado'].includes(s)) return 'confirmed'
  if (['preparing', 'preparando'].includes(s)) return 'preparing'
  if (['delivered', 'entregue'].includes(s)) return 'delivered'
  if (['ready_for_pickup', 'pronto_para_retirar', 'retirada'].includes(s)) return 'ready_for_pickup'
  return 'pending'
}

function generateOrderNumber(): string {
  const now = new Date()
  const yyyy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AJ-${yyyy}${mm}${dd}-${rnd}`
}

export async function POST() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const updates: any[] = []
    for (const o of orders || []) {
      const next: any = {}

      // status
      const normalized = normalizeStatus(o.status)
      if (o.status !== normalized) {
        next.status = normalized
      }

      // order_number
      if (!o.order_number || typeof o.order_number !== 'string' || !o.order_number.trim()) {
        next.order_number = generateOrderNumber()
      }

      // products: garantir array
      if (!Array.isArray(o.products)) {
        try {
          const parsed = typeof o.products === 'string' ? JSON.parse(o.products) : []
          if (Array.isArray(parsed)) next.products = parsed
          else next.products = []
        } catch {
          next.products = []
        }
      }

      // total/subtotal: garantir número
      const total = Number(o.total)
      if (!isFinite(total)) {
        // tenta somar dos itens
        const items: any[] = next.products ?? o.products ?? []
        const sum = items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0)
        next.total = Number(sum.toFixed(2))
      }
      const subtotal = Number(o.subtotal)
      if (!isFinite(subtotal)) {
        next.subtotal = next.total ?? total ?? 0
      }

      if (Object.keys(next).length > 0) {
        updates.push({ id: o.id, ...next })
      }
    }

    let updated = 0
    const errors: any[] = []
    for (const u of updates) {
      const { id, ...fields } = u
      const { error: upErr } = await supabase.from('orders').update(fields).eq('id', id)
      if (upErr) errors.push({ id, error: upErr.message })
      else updated += 1
    }

    return NextResponse.json({ success: true, scanned: orders?.length || 0, updated, errors })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Erro desconhecido' }, { status: 500 })
  }
}





