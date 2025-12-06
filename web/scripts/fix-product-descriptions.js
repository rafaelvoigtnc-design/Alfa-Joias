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
    `Descubra o relógio ${marca} em ${cor.toLowerCase()} que combina elegância e sofisticação. Perfeito para quem valoriza qualidade e estilo, este modelo oferece durabilidade excepcional e um design atemporal que complementa qualquer look. Garanta já o seu e eleve seu estilo pessoal.`,
    `O relógio ${marca} ${cor.toLowerCase()} é a escolha ideal para quem busca excelência em cada detalhe. Com acabamento impecável e design refinado, este modelo se destaca pela sua versatilidade e resistência. Não perca a oportunidade de adquirir um produto de alta qualidade.`,
    `Apresentamos o ${marca} ${cor.toLowerCase()}, um relógio que une tradição e modernidade em um único acessório. Seu acabamento premium e design sofisticado fazem dele a peça perfeita para momentos especiais e uso diário. Invista em qualidade e estilo duradouro.`,
    `Eleve seu estilo com o relógio ${marca} em ${cor.toLowerCase()}. Este modelo exclusivo combina funcionalidade e elegância, sendo perfeito para quem busca um acessório que reflita personalidade e bom gosto. Adquira agora e transforme seu visual.`,
    `O ${marca} ${cor.toLowerCase()} representa o equilíbrio perfeito entre clássico e contemporâneo. Com design atemporal e qualidade superior, este relógio é um investimento em estilo e durabilidade. Garanta o seu e destaque-se com sofisticação.`,
    `Descubra a excelência do relógio ${marca} na cor ${cor.toLowerCase()}. Projetado para impressionar, este modelo oferece estilo único e funcionalidade excepcional. Ideal para quem busca um acessório que combine elegância e praticidade no dia a dia.`,
    `O ${marca} ${cor.toLowerCase()} é mais que um relógio, é uma declaração de estilo. Com acabamento impecável e design refinado, este modelo se adapta perfeitamente a diferentes ocasiões. Não deixe passar esta oportunidade de adquirir qualidade superior.`,
    `Apresentamos o relógio ${marca} ${cor.toLowerCase()}, a escolha perfeita para quem valoriza qualidade e bom gosto. Este modelo exclusivo combina sofisticação e resistência, sendo ideal para quem busca um acessório que reflita personalidade e elegância.`
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

        // Extrair cor da descrição atual (se possível) - melhorar lógica
        let cor = 'prata' // padrão
        if (product.description) {
          // Tentar encontrar cor após "em" ou "na cor" ou no início
          const patterns = [
            /em\s+([a-záê]+)/i,
            /na cor\s+([a-záê]+)/i,
            /^([A-Z][a-z]+)\s+([a-záê]+)/i,
            /\b(prata|dourado|preto|grafite|titânio|ouro|rosa|azul)\b/i
          ]
          
          for (const pattern of patterns) {
            const match = product.description.match(pattern)
            if (match) {
              const corEncontrada = (match[1] || match[2] || '').toLowerCase()
              const coresValidas = ['prata', 'dourado', 'preto', 'grafite', 'titânio', 'ouro', 'rosa', 'azul']
              if (coresValidas.includes(corEncontrada)) {
                cor = corEncontrada
                break
              }
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

