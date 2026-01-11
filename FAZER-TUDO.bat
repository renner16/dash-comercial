@echo off
chcp 65001 >nul
echo ========================================
echo   FAZENDO TUDO AUTOMATICAMENTE
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [1/5] Verificando arquivos corrigidos...
findstr /C:"'personalizado'" components\geral-dashboard.tsx >nul
if %errorlevel% neq 0 (
    echo ERRO: Arquivos nao tem as correcoes!
    pause
    exit /b 1
)
echo [OK] Arquivos tem as correcoes
echo.

echo [2/5] Adicionando arquivos...
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
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado nas funcoes de grafico"
if %errorlevel% neq 0 (
    echo AVISO: Commit pode ter falhado ou ja existe
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
    echo A Vercel vai fazer deploy automaticamente.
    echo.
    echo Verifique em:
    echo https://github.com/renner16/dash-comercial/commits/main
) else (
    echo.
    echo ========================================
    echo   ERRO NO PUSH
    echo ========================================
    echo.
    echo Verifique sua conexao e tente novamente.
    echo Ou execute manualmente: git push origin main
)

echo.
pause




