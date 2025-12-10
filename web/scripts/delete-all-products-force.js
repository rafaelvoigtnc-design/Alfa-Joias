/**
 * Script para DELETAR TODOS OS PRODUTOS do banco de dados (FORÇADO)
 * Execute: node scripts/delete-all-products-force.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas!')
  console.error('   Certifique-se de que .env.local existe com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteAllProductsForce() {
  try {
    console.log('🔍 Verificando produtos no banco...\n')
    
    // Primeiro, contar quantos produtos existem
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.warn('⚠️  Erro ao contar produtos:', countError.message)
    } else {
      console.log(`📊 Total de produtos encontrados: ${count || 0}\n`)
    }
    
    // Buscar todos os produtos para mostrar
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category')
      .limit(1000)
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('⚠️  Erro ao buscar produtos:', fetchError.message)
    }
    
    if (products && products.length > 0) {
      console.log(`📋 Produtos encontrados (mostrando até 20):`)
      products.slice(0, 20).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.category})`)
      })
      if (products.length > 20) {
        console.log(`   ... e mais ${products.length - 20} produto(s)`)
      }
      console.log('')
    }
    
    // Deletar todos os produtos usando RPC ou múltiplas queries
    console.log('🗑️  Excluindo TODOS os produtos...\n')
    
    // Método 1: Tentar deletar em lotes
    let deletedCount = 0
    let hasMore = true
    
    while (hasMore) {
      const { data: batch, error: batchError } = await supabase
        .from('products')
        .select('id')
        .limit(100)
      
      if (batchError) {
        if (batchError.code === 'PGRST116') {
          // Tabela vazia
          hasMore = false
          break
        }
        throw batchError
      }
      
      if (!batch || batch.length === 0) {
        hasMore = false
        break
      }
      
      const ids = batch.map(p => p.id)
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', ids)
      
      if (deleteError) {
        throw deleteError
      }
      
      deletedCount += batch.length
      console.log(`   ✅ Deletados ${deletedCount} produto(s)...`)
    }
    
    // Verificar se ainda há produtos
    const { count: finalCount, error: finalCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (finalCountError && finalCountError.code !== 'PGRST116') {
      console.warn('⚠️  Erro ao verificar contagem final:', finalCountError.message)
    }
    
    console.log('')
    console.log(`✅ SUCESSO! Todos os produtos foram excluídos!`)
    console.log(`📊 Produtos restantes no banco: ${finalCount || 0}`)
    
  } catch (error) {
    console.error('❌ Erro ao excluir produtos:', error.message)
    console.error('   Detalhes:', error)
    process.exit(1)
  }
}

deleteAllProductsForce()

