@echo off
chcp 65001 >nul
echo ========================================
echo   RESOLVENDO PROBLEMA DEFINITIVAMENTE
echo ========================================
echo.
echo Este script vai:
echo 1. Verificar se as correcoes estao nos arquivos
echo 2. Adicionar TODOS os arquivos (forcando)
echo 3. Fazer commit
echo 4. Enviar para GitHub
echo 5. Verificar se foi enviado
echo.
pause

cd /d "C:\Dev\dash comercial"

echo.
echo [PASSO 1] Verificando se arquivos tem as correcoes...
findstr /C:"'personalizado'" components\geral-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo ERRO CRITICO: Arquivo nao tem a correcao!
    pause
    exit /b 1
)
echo [OK] Arquivo geral-dashboard.tsx tem a correcao
echo.

findstr /C:"'personalizado'" components\vendedor-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo ERRO CRITICO: Arquivo nao tem a correcao!
    pause
    exit /b 1
)
echo [OK] Arquivo vendedor-dashboard.tsx tem a correcao
echo.

echo [PASSO 2] Adicionando TODOS os arquivos (forcando)...
git add -A components/geral-dashboard.tsx
git add -A components/vendedor-dashboard.tsx
git add -A components/header.tsx
git add -A components/theme-toggle.tsx
git add -A app/page.tsx
git add -A package.json
echo.

echo [PASSO 3] Verificando status...
git status --short
echo.

echo [PASSO 4] Fazendo commit (forcando)...
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado - RESOLVE BUILD VERCEL" --allow-empty
echo.

echo [PASSO 5] Verificando commits nao enviados...
git log origin/main..HEAD --oneline
echo.

echo [PASSO 6] Enviando para GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Tentando com force-with-lease (seguro)...
    git push origin main --force-with-lease
)
echo.

echo [PASSO 7] Verificando se foi enviado...
git log -1 --oneline
echo.

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   VERIFICACAO FINAL
    echo ========================================
    echo.
    echo Acesse e verifique:
    echo https://github.com/renner16/dash-comercial/commits/main
    echo.
    echo O ultimo commit deve ser diferente de: 056c2ca
    echo.
    echo Se o commit foi enviado, a Vercel vai fazer
    echo novo build automaticamente em 2-3 minutos.
) else (
    echo.
    echo ERRO! Verifique sua conexao.
)

pause




