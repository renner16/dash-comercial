@echo off
chcp 65001 >nul
echo ========================================
echo   ENVIANDO CORRECOES DEFINITIVAS
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [1/6] Verificando correcoes...
findstr /C:"CORRIGIDO: Adicionado tipo" components\geral-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo ERRO: Arquivo nao tem a correcao completa!
    pause
    exit /b 1
)
echo [OK] Correcoes encontradas
echo.

echo [2/6] Adicionando arquivos...
git add -f components/geral-dashboard.tsx
git add -f components/vendedor-dashboard.tsx
git add -f components/header.tsx
git add -f components/theme-toggle.tsx
git add -f app/page.tsx
git add -f package.json
echo.

echo [3/6] Status dos arquivos...
git status --short
echo.

echo [4/6] Fazendo commit...
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado nas funcoes de grafico - CORRIGIDO build Vercel"
echo.

echo [5/6] Verificando commits locais...
git log origin/main..HEAD --oneline
echo.

echo [6/6] Enviando para GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Tentando com force-with-lease...
    git push origin main --force-with-lease
)
echo.

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo Correcoes enviadas para o GitHub!
    echo.
    echo Verifique o commit em:
    echo https://github.com/renner16/dash-comercial/commits/main
    echo.
    echo A Vercel vai fazer deploy automaticamente em 2-3 minutos.
) else (
    echo.
    echo ========================================
    echo   ERRO NO PUSH
    echo ========================================
    echo.
    echo Verifique sua conexao e tente novamente.
)

pause




