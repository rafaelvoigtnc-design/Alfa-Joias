/**
 * Script para importar relógios da planilha para o Supabase
 * Execute: node scripts/import-relogios.js
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

// Função para normalizar preço
function normalizePrice(price) {
  if (!price) return '0'
  const cleaned = String(price).replace(/[^\d.,]/g, '')
  const normalized = cleaned.replace(',', '.')
  const num = parseFloat(normalized)
  return isNaN(num) ? '0' : num.toString()
}

// Função para gerar descrição persuasiva (código no final entre colchetes)
function generateDescription(marca, cor, codigo) {
  const corLower = cor.toLowerCase()
  const descricoes = [
    `Descubra o relógio ${marca} em ${corLower} que combina elegância e sofisticação. Perfeito para quem valoriza qualidade e estilo, este modelo oferece durabilidade excepcional e um design atemporal que complementa qualquer look. Garanta já o seu e eleve seu estilo pessoal.`,
    `O relógio ${marca} ${corLower} é a escolha ideal para quem busca excelência em cada detalhe. Com acabamento impecável e design refinado, este modelo se destaca pela sua versatilidade e resistência. Não perca a oportunidade de adquirir um produto de alta qualidade.`,
    `Apresentamos o ${marca} ${corLower}, um relógio que une tradição e modernidade em um único acessório. Seu acabamento premium e design sofisticado fazem dele a peça perfeita para momentos especiais e uso diário. Invista em qualidade e estilo duradouro.`,
    `Eleve seu estilo com o relógio ${marca} em ${corLower}. Este modelo exclusivo combina funcionalidade e elegância, sendo perfeito para quem busca um acessório que reflita personalidade e bom gosto. Adquira agora e transforme seu visual.`,
    `O ${marca} ${corLower} representa o equilíbrio perfeito entre clássico e contemporâneo. Com design atemporal e qualidade superior, este relógio é um investimento em estilo e durabilidade. Garanta o seu e destaque-se com sofisticação.`,
    `Descubra a excelência do relógio ${marca} na cor ${corLower}. Projetado para impressionar, este modelo oferece estilo único e funcionalidade excepcional. Ideal para quem busca um acessório que combine elegância e praticidade no dia a dia.`,
    `O ${marca} ${corLower} é mais que um relógio, é uma declaração de estilo. Com acabamento impecável e design refinado, este modelo se adapta perfeitamente a diferentes ocasiões. Não deixe passar esta oportunidade de adquirir qualidade superior.`,
    `Apresentamos o relógio ${marca} ${corLower}, a escolha perfeita para quem valoriza qualidade e bom gosto. Este modelo exclusivo combina sofisticação e resistência, sendo ideal para quem busca um acessório que reflita personalidade e elegância.`
  ]
  // Usar código para escolher descrição de forma consistente
  const index = codigo.length % descricoes.length
  // Adicionar código no final entre colchetes
  return `${descricoes[index]} [${codigo}]`
}

// Dados dos relógios
const relogios = [
  { marca: 'Technos', cor: 'Prata', codigo: 't20547', valor: 'R$ 600,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'js15en', valor: 'R$ 840,00' },
  { marca: 'Orient', cor: 'Prata', codigo: 'ppim195', valor: 'R$ 520,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'jr00aa', valor: 'R$ 560,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'os10eq', valor: 'R$ 1.020,00' },
  { marca: 'Condor', cor: 'Prata', codigo: 'copc32df', valor: 'R$ 335,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2015bzbs', valor: 'R$ 412,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'bj3496ab', valor: 'R$ 845,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115msas', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'bj3758aa', valor: 'R$ 886,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115knv', valor: 'R$ 480,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115klm', valor: 'R$ 420,00' },
  { marca: 'Condor', cor: 'Prata', codigo: 'co2036kwds', valor: 'R$ 320,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115kss', valor: 'R$ 422,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'js25am', valor: 'R$ 665,00' },
  { marca: 'Condor', cor: 'Prata', codigo: 'co2115myv', valor: 'R$ 330,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115mpm', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115kzzs', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'bj3589aa', valor: 'R$ 625,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '6p27ds', valor: 'R$ 590,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2035lye', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '6p25ax', valor: 'R$ 630,00' },
  { marca: 'Technos', cor: 'Preto/Grafite', codigo: 'js25bce', valor: 'R$ 820,00' },
  { marca: 'Condor', cor: 'Preto/Grafite', codigo: 'co2036mui', valor: 'R$ 320,00' },
  { marca: 'Technos', cor: 'Preto/Grafite', codigo: '2115moas', valor: 'R$ 548,00' },
  { marca: 'Euro', cor: 'Preto/Grafite', codigo: 'eu2035ysb', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Preto/Grafite', codigo: '2035mlb', valor: 'R$ 980,00' },
  { marca: 'Dumont', cor: 'Dourado', codigo: 'du2315ah', valor: 'R$ 330,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115lna', valor: 'R$ 490,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115mqy', valor: 'R$ 570,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115gr', valor: 'R$ 480,00' },
  { marca: 'Technos', cor: 'Preto/Grafite', codigo: '1l45b', valor: 'R$ 640,00' },
  { marca: 'Condor', cor: 'Prata', codigo: 'co2035mxc', valor: 'R$ 340,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115mpn', valor: 'R$ 480,00' },
  { marca: 'Technos', cor: 'Titânio', codigo: '2115mtw', valor: 'R$ 950,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'vd77ad', valor: 'R$ 620,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115mols', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115nbq', valor: 'R$ 420,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115kne', valor: 'R$ 412,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115kmb', valor: 'R$ 650,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'os20hw', valor: 'R$ 748,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'gl20ah', valor: 'R$ 570,00' },
  { marca: 'Condor', cor: 'Dourado', codigo: 'co2115vq', valor: 'R$ 320,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2015byytds', valor: 'R$ 490,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115kpc', valor: 'R$ 352,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2115tvd', valor: 'R$ 440,00' },
  { marca: 'Condor', cor: 'Dourado', codigo: 'kl80028', valor: 'R$ 398,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'gm10yg', valor: 'R$ 540,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '1n12ab', valor: 'R$ 460,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2117lfm', valor: 'R$ 490,00' },
  { marca: 'Condor', cor: 'Prata', codigo: 'co2036dd', valor: 'R$ 340,00' },
  { marca: 'Condor', cor: 'Prata', codigo: 'covd54aq', valor: 'R$ 479,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115lam', valor: 'R$ 480,00' },
  { marca: 'Technos', cor: 'Prata', codigo: 'bj3496ab', valor: 'R$ 790,00' },
  { marca: 'Technos', cor: 'Prata', codigo: '2415dp', valor: 'R$ 437,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115mng', valor: 'R$ 490,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115mpt', valor: 'R$ 317,00' },
  { marca: 'Technos', cor: 'Dourado', codigo: '2115mzo', valor: 'R$ 493,00' }
]

// Função principal de importação
async function importRelogios() {
  try {
    console.log(`📖 Processando ${relogios.length} relógios...\n`)

    // Mapear e preparar produtos
    const products = relogios.map(relogio => {
      const nome = `Relógio ${relogio.marca}` // Sem código no nome
      const descricao = generateDescription(relogio.marca, relogio.cor, relogio.codigo) // Código já vem no final da função
      
      return {
        name: nome,
        category: 'Relógios',
        brand: relogio.marca,
        price: normalizePrice(relogio.valor),
        image: '', // Sem imagem por enquanto
        description: descricao,
        model: relogio.codigo,
        gender: '', // Deixar vazio
        stock: 1, // Estoque padrão
        featured: false,
        on_sale: false
      }
    })

    console.log('🚀 Iniciando importação...\n')

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
          console.log(`✅ Lote ${Math.floor(i / 10) + 1}: ${batch.length} relógios inseridos`)
          successCount += batch.length
          
          // Mostrar produtos inseridos
          data.forEach((p) => {
            console.log(`   ✓ ${p.name} - ${p.brand}`)
          })
        }
      } catch (err) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i / 10) + 1}:`, err.message)
        errorCount += batch.length
      }

      // Pequeno delay entre lotes
      if (i + 10 < products.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Importação concluída!`)
    console.log(`   ✓ Sucesso: ${successCount} relógios`)
    console.log(`   ✗ Erros: ${errorCount} relógios`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Erro durante importação:', error.message)
    process.exit(1)
  }
}

// Executar importação
importRelogios()

