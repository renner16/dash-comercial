@echo off
chcp 65001 >nul
echo ========================================
echo   ENVIANDO PARA GIT
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando status...
git status --short

echo.
echo [2/5] Adicionando arquivos...
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json
git add FIX-BUILD.md
git add CORRECOES-BUILD.md

echo.
echo [3/5] Verificando o que sera commitado...
git status --short

echo.
echo [4/5] Fazendo commit...
git commit -m "fix: corrige erros de build na Vercel - Adiciona verificacoes de window/document para SSR - Corrige uso de localStorage no servidor - Configura Prisma para build na Vercel"

if %errorlevel% neq 0 (
    echo.
    echo AVISO: Nenhuma alteracao para commitar ou commit ja existe
    echo Continuando com o push...
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
    echo Alteracoes enviadas para o GitHub.
    echo A Vercel fara o deploy automaticamente.
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
    echo Tente executar manualmente:
    echo   git push origin main
)

echo.
pause

