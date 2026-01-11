# Script de Instalação Automatizada - Cultura Builder Sales Ops
# Para Windows PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Cultura Builder | Sales Ops Setup  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js não encontrado. Instale Node.js 18+ antes de continuar." -ForegroundColor Red
    Write-Host "  Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Instalar dependências
Write-Host "Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependências instaladas" -ForegroundColor Green

Write-Host ""

# Configurar banco de dados
Write-Host "Configurando banco de dados..." -ForegroundColor Yellow
npm run prisma:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erro ao configurar banco de dados" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Banco de dados configurado" -ForegroundColor Green

Write-Host ""

# Popular com dados iniciais
Write-Host "Populando com dados iniciais..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erro ao popular banco de dados" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dados iniciais carregados" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ✓ Instalação concluída com sucesso! " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o servidor:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""







