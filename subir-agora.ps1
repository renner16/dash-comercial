# Script para enviar correções para o GitHub
Set-Location "C:\Dev\dash comercial"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ENVIANDO CORRECOES PARA GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Adicionando arquivos..." -ForegroundColor Yellow
git add components/geral-dashboard.tsx
git add components/vendedor-dashboard.tsx
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json

Write-Host ""
Write-Host "[2/4] Status dos arquivos..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "[3/4] Fazendo commit..." -ForegroundColor Yellow
git commit -m "fix: corrige tipos TypeScript e erros de build - Adiciona tipo personalizado nas funcoes de grafico - Corrige verificacoes SSR - Recria arquivos vazios - Configura Prisma para build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: Pode nao haver alteracoes para commitar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Correcoes enviadas para o GitHub!" -ForegroundColor Green
    Write-Host "A Vercel fara o deploy automaticamente." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERRO" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique sua conexao e tente novamente." -ForegroundColor Red
}

Write-Host ""
Read-Host "Pressione Enter para sair"




