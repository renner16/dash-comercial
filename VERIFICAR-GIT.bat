@echo off
echo Verificando status do Git...
cd /d "C:\Dev\dash comercial"
echo.
echo === STATUS DO REPOSITORIO ===
git status
echo.
echo === ULTIMO COMMIT ===
git log -1 --oneline
echo.
echo === ARQUIVOS MODIFICADOS ===
git status --short
echo.
echo Se houver arquivos modificados, execute ENVIAR.bat
pause




