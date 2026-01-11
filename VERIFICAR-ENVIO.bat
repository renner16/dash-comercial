@echo off
echo ========================================
echo   VERIFICANDO SE FOI ENVIADO
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo [1] Verificando ultimo commit local...
git log -1 --oneline
echo.

echo [2] Verificando se ha commits nao enviados...
git log origin/main..HEAD --oneline
if %errorlevel% equ 0 (
    echo.
    echo ATENCAO: Ha commits locais nao enviados!
    echo.
    echo [3] Enviando agora...
    git push origin main
    if %errorlevel% equ 0 (
        echo.
        echo SUCESSO! Commits enviados!
    ) else (
        echo.
        echo ERRO no push. Tente novamente.
    )
) else (
    echo.
    echo [OK] Todos os commits foram enviados!
    echo.
    echo Verifique no GitHub:
    echo https://github.com/renner16/dash-comercial/commits/main
)

echo.
pause




