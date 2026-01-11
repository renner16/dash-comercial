@echo off
chcp 65001 >nul
cls
echo ========================================
echo   SOLUCAO FINAL - ENVIANDO CORRECOES
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [VERIFICACAO 1/7] Verificando se geral-dashboard.tsx tem a correcao...
findstr /C:"tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'" components\geral-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo [ERRO] Arquivo geral-dashboard.tsx NAO tem a correcao!
    pause
    exit /b 1
)
echo [OK] geral-dashboard.tsx tem tipo 'personalizado'
echo.

echo [VERIFICACAO 2/7] Verificando se vendedor-dashboard.tsx tem a correcao...
findstr /C:"tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'" components\vendedor-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo [ERRO] Arquivo vendedor-dashboard.tsx NAO tem a correcao!
    pause
    exit /b 1
)
echo [OK] vendedor-dashboard.tsx tem tipo 'personalizado'
echo.

echo [ACAO 3/7] Adicionando arquivos corrigidos...
git add components/geral-dashboard.tsx
git add components/vendedor-dashboard.tsx
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json
echo [OK] Arquivos adicionados
echo.

echo [ACAO 4/7] Verificando status...
git status --short
echo.

echo [ACAO 5/7] Fazendo commit...
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado nas funcoes de grafico - RESOLVE BUILD VERCEL"
if %errorlevel% neq 0 (
    echo [AVISO] Commit pode ter falhado ou ja existe
)
echo.

echo [ACAO 6/7] Verificando commits nao enviados...
git log origin/main..HEAD --oneline
echo.

echo [ACAO 7/7] Enviando para GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [TENTATIVA 2] Tentando com force-with-lease...
    git push origin main --force-with-lease
)
echo.

echo ========================================
echo   RESULTADO
echo ========================================
echo.

git log -1 --oneline
echo.

echo Verifique no GitHub:
echo https://github.com/renner16/dash-comercial/commits/main
echo.
echo O ultimo commit deve ser DIFERENTE de: 056c2ca
echo.
echo Se o commit foi enviado, a Vercel vai fazer
echo novo build automaticamente em 2-3 minutos.
echo.

pause




