/**
 * Script para corrigir descrições dos produtos
 * Remove código do início e modelo do meio, coloca código no final
 * Execute: node scripts/fix-product-descriptions.js
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

function generateNewDescription(marca, cor, codigo) {
  const descricoes = [
    `Relógio ${marca} em ${cor.toLowerCase()}. Design elegante e moderno.`,
    `Relógio ${marca} ${cor.toLowerCase()}. Qualidade e estilo em um só produto.`,
    `${marca} ${cor.toLowerCase()}. Relógio com acabamento refinado e durabilidade.`,
    `Relógio ${marca} em ${cor.toLowerCase()}. Perfeito para o dia a dia.`,
    `${marca} ${cor.toLowerCase()}. Design clássico e atemporal.`,
    `Relógio ${marca} na cor ${cor.toLowerCase()}. Estilo e funcionalidade.`,
    `${marca} ${cor.toLowerCase()}. Relógio com excelente acabamento.`,
    `Relógio ${marca} ${cor.toLowerCase()}. Ideal para quem busca qualidade.`
  ]
  const index = codigo.length % descricoes.length
  return `${descricoes[index]} [${codigo}]`
}

async function fixProductDescriptions() {
  try {
    console.log('📖 Buscando produtos de relógios...\n')

    // Buscar todos os produtos que começam com "Relógio"
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, description, model, brand')
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
        // Extrair código do modelo ou da descrição atual
        let codigo = product.model || ''
        
        // Se não tiver modelo, tentar extrair da descrição atual
        if (!codigo && product.description) {
          // Procurar código entre colchetes no início: [codigo]
          const inicioMatch = product.description.match(/^\[([^\]]+)\]/)
          if (inicioMatch) {
            codigo = inicioMatch[1]
          } else {
            // Procurar código entre colchetes no final: [codigo]
            const finalMatch = product.description.match(/\[([^\]]+)\]\.?\s*$/)
            if (finalMatch) {
              codigo = finalMatch[1]
            }
          }
        }

        if (!codigo) {
          console.log(`⚠️ Produto ${product.id} (${product.name}) não tem código identificável, pulando...`)
          continue
        }

        // Extrair cor da descrição atual (se possível)
        let cor = 'prata' // padrão
        if (product.description) {
          const corMatch = product.description.match(/em\s+(\w+)|(\w+),/i)
          if (corMatch) {
            const corEncontrada = corMatch[1] || corMatch[2]
            if (corEncontrada && !corEncontrada.match(/^(Relógio|modelo|Design|Qualidade|Ideal|Perfeito|Design|Estilo)$/i)) {
              cor = corEncontrada.toLowerCase()
            }
          }
        }

        // Gerar nova descrição
        const newDescription = generateNewDescription(product.brand || 'Relógio', cor, codigo)

        console.log(`✏️ Atualizando: ${product.name}`)
        console.log(`   Antes: ${product.description?.substring(0, 80)}...`)
        console.log(`   Depois: ${newDescription}`)

        const { error: updateError } = await supabase
          .from('products')
          .update({
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
fixProductDescriptions()

