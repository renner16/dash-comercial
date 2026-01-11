@echo off
echo ========================================
echo   DIAGNOSTICO DO GIT
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [1] Verificando se estamos no diretorio correto...
cd
echo Diretorio atual: %CD%
echo.

echo [2] Verificando status do Git...
git status
echo.

echo [3] Verificando arquivos modificados...
git status --short
echo.

echo [4] Verificando se os arquivos tem alteracoes...
git diff components/geral-dashboard.tsx | findstr /C:"personalizado"
if %errorlevel% equ 0 (
    echo ENCONTRADO: tipo personalizado no arquivo local
) else (
    echo NAO ENCONTRADO: verifique se o arquivo tem a correcao
)
echo.

echo [5] Verificando ultimo commit...
git log -1 --oneline
echo.

echo [6] Verificando se ha commits nao enviados...
git log origin/main..HEAD --oneline
if %errorlevel% equ 0 (
    echo HA commits locais nao enviados!
) else (
    echo Nenhum commit local pendente
)
echo.

echo [7] Verificando conexao com GitHub...
git remote -v
echo.

echo [8] Testando conexao...
git ls-remote --heads origin main
if %errorlevel% equ 0 (
    echo Conexao OK!
) else (
    echo ERRO na conexao com GitHub!
)
echo.

echo ========================================
echo   FIM DO DIAGNOSTICO
echo ========================================
pause




