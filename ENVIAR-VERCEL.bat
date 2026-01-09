@echo off
chcp 65001 >nul
echo ========================================
echo   ENVIANDO PARA GIT E VERCEL
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando alterações...
git status --short

echo.
echo [2/4] Adicionando todas as alterações...
git add -A
git reset HEAD node_modules 2>nul
git reset HEAD .next 2>nul
git reset HEAD .env 2>nul
git reset HEAD .env.local 2>nul

echo.
echo [3/4] Fazendo commit...
git commit -m "feat: logo clicavel e melhorias no dashboard

- Logo agora redireciona para aba Geral
- Reorganizacao do layout (Vendas abaixo de Graficos de Relatorios)
- Correcao do calculo semanal na API
- Melhorias na navegacao"

if %errorlevel% neq 0 (
    echo Nenhuma alteracao para commitar ou commit ja existe
)

echo.
echo [4/4] Enviando para GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo A Vercel fara o deploy automaticamente.
    echo Verifique em: https://vercel.com/dashboard
) else (
    echo.
    echo ========================================
    echo   ERRO NO PUSH
    echo ========================================
    echo.
    echo Verifique sua conexao e tente novamente.
)

echo.
pause

