# Script para enviar correções para o GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ENVIANDO CORRECOES PARA GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Dev\dash comercial"

Write-Host "[1/5] Verificando status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "[2/5] Adicionando arquivos corrigidos..." -ForegroundColor Yellow
git add components/geral-dashboard.tsx
git add components/vendedor-dashboard.tsx
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json

Write-Host ""
Write-Host "[3/5] Verificando o que sera commitado..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "[4/5] Fazendo commit..." -ForegroundColor Yellow
$commitMessage = @"
fix: corrige tipos TypeScript e erros de build

- Adiciona tipo 'personalizado' nas funcoes de grafico
- Corrige verificacoes de window/document para SSR
- Recria arquivos que estavam vazios (page.tsx, header.tsx)
- Configura Prisma para build na Vercel
"@

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "AVISO: Pode nao haver alteracoes para commitar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/5] Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Correcoes enviadas para o GitHub!" -ForegroundColor Green
    Write-Host "A Vercel fara o deploy automaticamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "Aguarde alguns minutos para o build." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERRO NO PUSH" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique sua conexao e tente novamente." -ForegroundColor Red
}

Write-Host ""
Read-Host "Pressione Enter para sair"




