@echo off
echo Enviando correcoes para o GitHub...
cd /d "C:\Dev\dash comercial"
git add components/geral-dashboard.tsx components/vendedor-dashboard.tsx components/header.tsx components/theme-toggle.tsx app/page.tsx package.json
git commit -m "fix: corrige tipos TypeScript e erros de build"
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo SUCESSO! Correcoes enviadas!
) else (
    echo.
    echo ERRO! Verifique sua conexao.
)
pause




