// Script para limpar arquivos grandes de cache após o build
// Isso resolve o problema do Cloudflare Pages que tem limite de 25MB por arquivo

const fs = require('fs')
const path = require('path')

const nextDir = path.join(__dirname, '..', '.next')
const vercelDir = path.join(__dirname, '..', '.vercel')

function deleteLargeFiles(dir, maxSize = 25 * 1024 * 1024) {
  // 25MB em bytes
  if (!fs.existsSync(dir)) {
    console.log(`Diretório não existe: ${dir}`)
    return
  }

  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    const filePath = path.join(dir, file.name)
    
    if (file.isDirectory()) {
      // Recursivamente limpar subdiretórios
      if (file.name === 'cache') {
        // Remover toda a pasta de cache
        console.log(`🗑️ Removendo pasta de cache: ${filePath}`)
        fs.rmSync(filePath, { recursive: true, force: true })
      } else {
        deleteLargeFiles(filePath, maxSize)
      }
    } else {
      // Verificar tamanho do arquivo
      try {
        const stats = fs.statSync(filePath)
        if (stats.size > maxSize) {
          console.log(`🗑️ Removendo arquivo grande (${(stats.size / 1024 / 1024).toFixed(2)}MB): ${filePath}`)
          fs.unlinkSync(filePath)
        }
      } catch (err) {
        console.warn(`⚠️ Erro ao verificar arquivo ${filePath}:`, err.message)
      }
    }
  }
}

console.log('🧹 Limpando arquivos grandes de cache do Next.js...')
deleteLargeFiles(nextDir)

// Limpar também a pasta .vercel se existir
if (fs.existsSync(vercelDir)) {
  console.log(`🗑️ Removendo pasta .vercel: ${vercelDir}`)
  fs.rmSync(vercelDir, { recursive: true, force: true })
}

console.log('✅ Limpeza concluída!')

