/**
 * Script para DELETAR TODOS OS RELÓGIOS do banco de dados
 * Execute: node scripts/delete-all-watches.js
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

async function deleteAllWatches() {
  try {
    console.log('🔍 Buscando todos os relógios no banco...\n')
    
    // Buscar todos os produtos da categoria Relógios
    const { data: watches, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('category', 'Relógios')
    
    if (fetchError) {
      throw fetchError
    }
    
    if (!watches || watches.length === 0) {
      console.log('ℹ️  Não há relógios para excluir.')
      return
    }
    
    console.log(`📋 Encontrados ${watches.length} relógio(s):`)
    watches.forEach((watch, index) => {
      console.log(`   ${index + 1}. ${watch.name} (ID: ${watch.id})`)
    })
    console.log('')
    
    // Deletar todos os relógios
    console.log('🗑️  Excluindo todos os relógios...\n')
    
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('category', 'Relógios')
    
    if (deleteError) {
      throw deleteError
    }
    
    console.log(`✅ SUCESSO! Todos os ${watches.length} relógio(s) foram excluídos!`)
    
  } catch (error) {
    console.error('❌ Erro ao excluir relógios:', error.message)
    process.exit(1)
  }
}

deleteAllWatches()

