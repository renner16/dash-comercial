@echo off
echo Testando comandos Git...
cd /d "C:\Dev\dash comercial"
echo.
echo Status do Git:
git status --short
echo.
echo Ultimo commit:
git log -1 --oneline
echo.
echo Teste concluido!
pause




