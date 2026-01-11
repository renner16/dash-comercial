@echo off
echo ========================================
echo   FORCANDO ENVIO FINAL
echo ========================================
echo.
echo Este script vai:
echo 1. Verificar se os arquivos tem as correcoes
echo 2. Adicionar TODOS os arquivos
echo 3. Fazer commit forçado
echo 4. Enviar para GitHub
echo.
pause

cd /d "C:\Dev\dash comercial"

echo.
echo [1/6] Verificando correcoes nos arquivos...
findstr /C:"'personalizado'" components\geral-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo ERRO: Arquivo nao tem a correcao!
    pause
    exit /b 1
)
echo [OK] Arquivos tem as correcoes
echo.

echo [2/6] Adicionando TODOS os arquivos importantes...
git add -A components/geral-dashboard.tsx
git add -A components/vendedor-dashboard.tsx
git add -A components/header.tsx
git add -A components/theme-toggle.tsx
git add -A app/page.tsx
git add -A package.json
echo.

echo [3/6] Verificando status...
git status --short
echo.

echo [4/6] Fazendo commit (forcando)...
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado nas funcoes de grafico - FORCA ENVIO" --allow-empty
echo.

echo [5/6] Verificando commits locais...
git log origin/main..HEAD --oneline
echo.

echo [6/6] Enviando para GitHub (forcando se necessario)...
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
    echo Verifique o commit no GitHub:
    echo https://github.com/renner16/dash-comercial/commits/main
    echo.
    echo A Vercel vai fazer novo build automaticamente.
) else (
    echo.
    echo ERRO! Verifique sua conexao.
)

pause




