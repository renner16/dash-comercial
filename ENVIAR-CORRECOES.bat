@echo off
chcp 65001 >nul
echo ========================================
echo   ENVIANDO CORRECOES PARA GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando status...
git status --short

echo.
echo [2/5] Adicionando arquivos corrigidos...
git add components/geral-dashboard.tsx
git add components/vendedor-dashboard.tsx
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json

echo.
echo [3/5] Verificando o que sera commitado...
git status --short

echo.
echo [4/5] Fazendo commit...
git commit -m "fix: corrige tipos TypeScript e erros de build

- Adiciona tipo 'personalizado' nas funcoes de grafico
- Corrige verificacoes de window/document para SSR
- Recria arquivos que estavam vazios (page.tsx, header.tsx)
- Configura Prisma para build na Vercel"

if %errorlevel% neq 0 (
    echo.
    echo AVISO: Pode nao haver alteracoes para commitar
    echo Verificando se ja existe commit...
)

echo.
echo [5/5] Enviando para GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo Correcoes enviadas para o GitHub!
    echo A Vercel fara o deploy automaticamente.
    echo.
    echo Aguarde alguns minutos para o build.
) else (
    echo.
    echo ========================================
    echo   ERRO NO PUSH
    echo ========================================
    echo.
    echo Verifique:
    echo 1. Se esta conectado a internet
    echo 2. Se tem permissao no repositorio
    echo 3. Se o branch esta correto (main)
    echo.
)

pause




