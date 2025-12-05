/**
 * Script para importar produtos de uma planilha CSV para o Supabase
 * 
 * USO:
 * 1. Coloque sua planilha CSV na pasta web/ com o nome "produtos.csv"
 * 2. Configure as variáveis de ambiente no arquivo .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=sua_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
 * 3. Execute: node scripts/import-products.js
 * 
 * FORMATO DA PLANILHA CSV (separado por vírgula):
 * name,category,brand,price,image,description,stock,gender,model,featured,on_sale,original_price,discount_percentage,sale_price
 * 
 * Exemplo:
 * Relógio Rolex Submariner,Relógios,Rolex,45000,https://exemplo.com/imagem.jpg,Descrição do relógio,5,Masculino,Submariner,true,false,,,
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Função para normalizar preço (remover formatação)
function normalizePrice(price) {
  if (!price) return '0'
  // Remove tudo exceto dígitos, pontos e vírgulas
  const cleaned = String(price).replace(/[^\d.,]/g, '')
  // Se tem vírgula, substituir por ponto (formato BR -> US)
  const normalized = cleaned.replace(',', '.')
  // Converter para número e voltar para string
  const num = parseFloat(normalized)
  return isNaN(num) ? '0' : num.toString()
}

// Função para processar CSV
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV deve ter pelo menos um cabeçalho e uma linha de dados')
  }

  const headers = lines[0].split(',').map(h => h.trim())
  const products = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length !== headers.length) {
      console.warn(`⚠️ Linha ${i + 1} ignorada: número de colunas não corresponde ao cabeçalho`)
      continue
    }

    const product = {}
    headers.forEach((header, index) => {
      product[header] = values[index] || ''
    })
    products.push(product)
  }

  return products
}

// Função para mapear dados do CSV para o formato do banco
function mapProductData(csvProduct) {
  return {
    name: csvProduct.name || csvProduct.nome || '',
    category: csvProduct.category || csvProduct.categoria || 'Relógios',
    brand: csvProduct.brand || csvProduct.marca || '',
    price: normalizePrice(csvProduct.price || csvProduct.preco || '0'),
    image: csvProduct.image || csvProduct.imagem || '',
    description: csvProduct.description || csvProduct.descricao || '',
    stock: parseInt(csvProduct.stock || csvProduct.estoque || '0') || 0,
    gender: csvProduct.gender || csvProduct.genero || '',
    model: csvProduct.model || csvProduct.modelo || '',
    featured: csvProduct.featured === 'true' || csvProduct.featured === '1' || csvProduct.destaque === 'true' || false,
    on_sale: csvProduct.on_sale === 'true' || csvProduct.on_sale === '1' || csvProduct.promocao === 'true' || false,
    original_price: csvProduct.original_price ? normalizePrice(csvProduct.original_price) : '',
    discount_percentage: parseInt(csvProduct.discount_percentage || csvProduct.desconto || '0') || 0,
    sale_price: csvProduct.sale_price ? normalizePrice(csvProduct.sale_price) : '',
  }
}

// Função principal de importação
async function importProducts() {
  try {
    // Ler arquivo CSV
    const csvPath = path.join(__dirname, '..', 'produtos.csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Arquivo não encontrado: ${csvPath}`)
      console.log('\n📝 Crie um arquivo "produtos.csv" na pasta web/ com o seguinte formato:')
      console.log('name,category,brand,price,image,description,stock,gender,model,featured,on_sale,original_price,discount_percentage,sale_price')
      process.exit(1)
    }

    console.log('📖 Lendo arquivo CSV...')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvProducts = parseCSV(csvContent)

    console.log(`✅ ${csvProducts.length} produtos encontrados na planilha`)

    // Mapear e validar produtos
    const products = csvProducts.map(mapProductData)
    
    // Validar produtos obrigatórios
    const invalidProducts = products.filter(p => !p.name || !p.category || !p.brand)
    if (invalidProducts.length > 0) {
      console.error(`❌ ${invalidProducts.length} produtos inválidos (faltam campos obrigatórios: name, category, brand)`)
      invalidProducts.forEach((p, i) => {
        console.error(`  ${i + 1}. ${p.name || 'SEM NOME'}`)
      })
      process.exit(1)
    }

    console.log('\n🚀 Iniciando importação...\n')

    let successCount = 0
    let errorCount = 0

    // Inserir produtos em lotes de 10
    for (let i = 0; i < products.length; i += 10) {
      const batch = products.slice(i, i + 10)
      
      try {
        const { data, error } = await supabase
          .from('products')
          .insert(batch)
          .select()

        if (error) {
          console.error(`❌ Erro ao inserir lote ${Math.floor(i / 10) + 1}:`, error.message)
          errorCount += batch.length
        } else {
          console.log(`✅ Lote ${Math.floor(i / 10) + 1}: ${batch.length} produtos inseridos`)
          successCount += batch.length
          
          // Mostrar produtos inseridos
          data.forEach((p, idx) => {
            console.log(`   ✓ ${p.name} (${p.brand})`)
          })
        }
      } catch (err) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i / 10) + 1}:`, err.message)
        errorCount += batch.length
      }

      // Pequeno delay entre lotes para não sobrecarregar
      if (i + 10 < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Importação concluída!`)
    console.log(`   ✓ Sucesso: ${successCount} produtos`)
    console.log(`   ✗ Erros: ${errorCount} produtos`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Erro durante importação:', error.message)
    process.exit(1)
  }
}

// Executar importação
importProducts()

