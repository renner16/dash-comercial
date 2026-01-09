@echo off
echo ========================================
echo   ENVIANDO TODOS OS DADOS DO PROJETO
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [1/5] Verificando status...
git status

echo.
echo [2/5] Adicionando TODOS os arquivos...
git add -A

echo.
echo [3/5] Removendo arquivos que nao devem ir...
git reset HEAD node_modules
git reset HEAD .next
git reset HEAD .env
git reset HEAD .env.local

echo.
echo [4/5] Fazendo commit...
git commit -m "chore: reenvia todos os dados do projeto - %date% %time%"

echo.
echo [5/5] Enviando para GitHub...
git push origin main

echo.
echo ========================================
echo   CONCLUIDO!
echo ========================================
echo.
echo A Vercel fara o deploy automaticamente.
echo.
pause

