/**
 * Script para adicionar modelo no título no final entre []
 * Execute: node scripts/add-model-to-title.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addModelToTitle() {
  try {
    console.log('📖 Buscando produtos de relógios...\n')

    // Buscar todos os produtos que começam com "Relógio"
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, model')
      .like('name', 'Relógio%')

    if (fetchError) {
      console.error('❌ Erro ao buscar produtos:', fetchError.message)
      process.exit(1)
    }

    if (!products || products.length === 0) {
      console.log('⚠️ Nenhum produto encontrado.')
      return
    }

    console.log(`🔍 Encontrados ${products.length} produtos para atualizar...\n`)

    let successCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        if (!product.model) {
          console.log(`⚠️ Produto ${product.id} (${product.name}) não tem modelo, pulando...`)
          continue
        }

        // Verificar se o título já tem o modelo no final
        if (product.name.endsWith(` [${product.model}]`)) {
          console.log(`✓ ${product.name} já tem modelo no título, pulando...`)
          continue
        }

        // Adicionar modelo no final entre colchetes
        const newName = `${product.name} [${product.model}]`

        console.log(`✏️ Atualizando: "${product.name}" -> "${newName}"`)

        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: newName
          })
          .eq('id', product.id)

        if (updateError) {
          console.error(`   ❌ Erro: ${updateError.message}`)
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Erro ao processar ${product.name}:`, err.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Atualização concluída!`)
    console.log(`   ✓ Sucesso: ${successCount} produtos`)
    console.log(`   ✗ Erros: ${errorCount} produtos`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Erro durante atualização:', error.message)
    process.exit(1)
  }
}

// Executar atualização
addModelToTitle()

