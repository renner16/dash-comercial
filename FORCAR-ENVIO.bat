@echo off
echo ========================================
echo   FORCANDO ENVIO DAS CORRECOES
echo ========================================
echo.
echo Este script vai FORCAR o envio mesmo se
echo os arquivos ja foram commitados antes.
echo.
pause

cd /d "C:\Dev\dash comercial"

echo.
echo [1/6] Verificando status atual...
git status
echo.

echo [2/6] Adicionando arquivos especificos (forcando)...
git add -f components/geral-dashboard.tsx
git add -f components/vendedor-dashboard.tsx
git add -f components/header.tsx
git add -f components/theme-toggle.tsx
git add -f app/page.tsx
git add -f package.json
echo.

echo [3/6] Verificando o que sera commitado...
git status --short
echo.

echo [4/6] Fazendo commit (mesmo se nao houver alteracoes)...
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado nas funcoes de grafico" --allow-empty
echo.

echo [5/6] Verificando se ha commits nao enviados...
git log origin/main..HEAD --oneline
echo.

echo [6/6] Enviando para GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Tentando com force-with-lease (seguro)...
    git push origin main --force-with-lease
)
echo.

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo Correcoes enviadas!
    echo A Vercel vai fazer deploy automaticamente.
    echo.
    echo Verifique em: https://github.com/renner16/dash-comercial
) else (
    echo.
    echo ========================================
    echo   ERRO NO PUSH
    echo ========================================
    echo.
    echo Execute DIAGNOSTICO-GIT.bat para mais detalhes.
)

pause




