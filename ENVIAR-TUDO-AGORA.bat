@echo off
echo ========================================
echo   ENVIANDO TUDO AGORA
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [1] Adicionando TODOS os arquivos...
git add -A
git reset HEAD node_modules 2>nul
git reset HEAD .next 2>nul
echo.

echo [2] Status dos arquivos...
git status --short
echo.

echo [3] Fazendo commit de TUDO...
git commit -m "fix: corrige tipos TypeScript - adiciona personalizado - FORCA ENVIO COMPLETO"
echo.

echo [4] Enviando para GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo Verifique: https://github.com/renner16/dash-comercial/commits/main
    echo A Vercel vai fazer novo build!
) else (
    echo.
    echo ERRO! Execute VERIFICAR-ENVIO.bat
)

pause




