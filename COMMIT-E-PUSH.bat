@echo off
echo Fazendo commit e push das correcoes...
cd /d "C:\Dev\dash comercial"
git add components/geral-dashboard.tsx components/vendedor-dashboard.tsx components/header.tsx components/theme-toggle.tsx app/page.tsx package.json
git commit -m "fix: adiciona tipo personalizado nas funcoes de grafico - corrige erro TypeScript build"
git push origin main
echo.
echo Pronto! Verifique se funcionou acima.
pause




