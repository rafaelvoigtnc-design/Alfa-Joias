/**
 * Script para DELETAR TODOS OS PRODUTOS do banco de dados
 * Execute: node scripts/delete-all-products.js
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

async function deleteAllProducts() {
  try {
    console.log('🔍 Buscando todos os produtos no banco...\n')
    
    // Buscar todos os produtos
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category')
    
    if (fetchError) {
      throw fetchError
    }
    
    if (!products || products.length === 0) {
      console.log('ℹ️  Não há produtos para excluir.')
      return
    }
    
    console.log(`📋 Encontrados ${products.length} produto(s):`)
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.category}) - ID: ${product.id}`)
    })
    console.log('')
    
    // Deletar todos os produtos
    console.log('🗑️  Excluindo todos os produtos...\n')
    
    // Deletar todos os produtos de uma vez
    const { error: deleteError, count } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos (usando neq com UUID inválido)
      .select('*', { count: 'exact', head: true })
    
    if (deleteError) {
      // Se der erro com neq, tentar deletar todos diretamente
      console.log('⚠️  Tentando método alternativo...')
      const { error: deleteError2 } = await supabase
        .from('products')
        .delete()
        .gte('created_at', '1970-01-01') // Deletar todos (data sempre verdadeira)
      
      if (deleteError2) {
        throw deleteError2
      }
      console.log(`✅ SUCESSO! Todos os produtos foram excluídos!`)
    } else {
      console.log(`✅ SUCESSO! Todos os ${products.length} produto(s) foram excluídos!`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao excluir produtos:', error.message)
    process.exit(1)
  }
}

deleteAllProducts()

