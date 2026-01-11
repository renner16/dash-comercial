@echo off
echo ========================================
echo   SOLUCAO DEFINITIVA
echo ========================================
echo.
echo Este script vai:
echo 1. Verificar o status
echo 2. Adicionar TODOS os arquivos modificados
echo 3. Fazer commit
echo 4. Enviar para GitHub
echo.
pause

cd /d "C:\Dev\dash comercial"

echo.
echo [1/5] Verificando status atual...
git status --short
echo.

echo [2/5] Adicionando TODOS os arquivos modificados...
git add -A
git reset HEAD node_modules 2>nul
git reset HEAD .next 2>nul
git reset HEAD .env 2>nul
git reset HEAD .env.local 2>nul
echo.

echo [3/5] Verificando o que sera commitado...
git status --short
echo.

echo [4/5] Fazendo commit (forcando se necessario)...
git commit -m "fix: corrige tipos TypeScript e erros de build" --allow-empty
if %errorlevel% neq 0 (
    echo Tentando commit normal...
    git commit -m "fix: corrige tipos TypeScript e erros de build"
)
echo.

echo [5/5] Enviando para GitHub...
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
    echo A Vercel fara o deploy automaticamente.
) else (
    echo.
    echo ========================================
    echo   ERRO
    echo ========================================
    echo.
    echo Possiveis problemas:
    echo 1. Sem conexao com internet
    echo 2. Problema de autenticacao Git
    echo 3. Branch protegido
    echo.
    echo Execute DIAGNOSTICO-GIT.bat para mais detalhes.
)

pause




