@echo off
echo ========================================
echo   ENVIANDO ARQUIVOS CORRIGIDOS
echo ========================================
echo.
echo Este script vai FORCAR o commit dos
echo arquivos corrigidos mesmo que o Git
echo nao detecte mudancas.
echo.
pause

cd /d "C:\Dev\dash comercial"

echo.
echo [1/5] Verificando arquivos locais...
findstr /C:"'personalizado'" components\geral-dashboard.tsx >nul
if %errorlevel% equ 0 (
    echo [OK] geral-dashboard.tsx tem a correcao
) else (
    echo [ERRO] geral-dashboard.tsx NAO tem a correcao!
    pause
    exit /b 1
)
echo.

echo [2/5] Adicionando arquivos forçadamente...
git add -f components/geral-dashboard.tsx
git add -f components/vendedor-dashboard.tsx
git add -f components/header.tsx
git add -f components/theme-toggle.tsx
git add -f app/page.tsx
git add -f package.json
echo.

echo [3/5] Verificando status...
git status --short
echo.

echo [4/5] Fazendo commit dos arquivos corrigidos...
git commit -m "fix: adiciona tipo personalizado nas funcoes de grafico - corrige erro TypeScript no build - arquivos: geral-dashboard, vendedor-dashboard, header, theme-toggle, page, package.json"
echo.

echo [5/5] Enviando para GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo Arquivos corrigidos enviados!
    echo A Vercel vai fazer novo build agora.
    echo.
    echo Aguarde 2-3 minutos e verifique:
    echo https://vercel.com/dashboard
) else (
    echo.
    echo ERRO no push. Verifique sua conexao.
)

pause




