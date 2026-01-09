# Script de Instalação com Neon - Cultura Builder Sales Ops
# Para Windows PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Cultura Builder | Sales Ops Setup  " -ForegroundColor Cyan
Write-Host "  com Neon Database                   " -ForegroundColor Cyan
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

# Verificar .env
Write-Host "Verificando configuração do banco..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "✗ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Você precisa configurar o Neon primeiro:" -ForegroundColor Yellow
    Write-Host "1. Acesse https://neon.tech/" -ForegroundColor White
    Write-Host "2. Crie um projeto" -ForegroundColor White
    Write-Host "3. Copie a Connection String" -ForegroundColor White
    Write-Host "4. Crie arquivo .env com:" -ForegroundColor White
    Write-Host '   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 Guia completo: SETUP_NEON.md" -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content .env -Raw
if ($envContent -notmatch "DATABASE_URL") {
    Write-Host "✗ DATABASE_URL não encontrada no .env!" -ForegroundColor Red
    Write-Host "  Adicione a connection string do Neon" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Arquivo .env configurado" -ForegroundColor Green
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
Write-Host "Criando tabelas no Neon..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erro ao configurar banco de dados" -ForegroundColor Red
    Write-Host "  Verifique se a DATABASE_URL está correta" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Tabelas criadas" -ForegroundColor Green
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
Write-Host "💡 Dica: Use 'npx prisma studio' para visualizar o banco" -ForegroundColor Gray
Write-Host ""


