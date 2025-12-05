/**
 * Script para remover códigos dos nomes dos produtos e adicionar na descrição
 * Execute: node scripts/fix-product-names.js
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

async function fixProductNames() {
  try {
    console.log('📖 Buscando produtos de relógios...\n')

    // Buscar todos os produtos que começam com "Relógio"
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, description, model')
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
        // Extrair código do nome (última parte após espaço)
        const nameParts = product.name.split(' ')
        const code = nameParts[nameParts.length - 1]
        
        // Novo nome sem código: "Relógio [Marca]" ou apenas "Relógio [Marca]" se já tiver marca
        let newName = product.name
        if (nameParts.length > 2) {
          // Formato: "Relógio Technos t20547" -> "Relógio Technos"
          newName = nameParts.slice(0, -1).join(' ')
        } else if (nameParts.length === 2) {
          // Formato: "Relógio t20547" -> "Relógio"
          newName = nameParts[0]
        }

        // Atualizar descrição para incluir código entre colchetes no início
        let newDescription = product.description || ''
        const codeInBrackets = `[${code}]`
        
        // Se a descrição já tem o código, não adicionar novamente
        if (!newDescription.includes(codeInBrackets)) {
          // Adicionar código no início da descrição
          newDescription = `${codeInBrackets} ${newDescription}`
        }

        console.log(`✏️ Atualizando: "${product.name}" -> "${newName}"`)
        console.log(`   Descrição: [${code}] adicionado`)

        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: newName,
            description: newDescription
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
fixProductNames()

