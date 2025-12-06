# Script para limpar todo o cache do Next.js
Write-Host "=== LIMPANDO CACHE DO NEXT.JS ===" -ForegroundColor Yellow

# Remover .next
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Cache .next removido" -ForegroundColor Green
} else {
    Write-Host "✗ .next não existe" -ForegroundColor Gray
}

# Remover node_modules/.cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Cache node_modules removido" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules/.cache não existe" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Cache limpo! ===" -ForegroundColor Green
Write-Host "Agora execute: npm run dev" -ForegroundColor Cyan







