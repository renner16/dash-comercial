@echo off
cd /d "C:\Dev\dash comercial"
git add components/geral-dashboard.tsx
git add components/vendedor-dashboard.tsx
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json
git commit -m "fix: corrige tipos TypeScript e erros de build"
git push origin main
echo.
echo Pronto! Verifique se funcionou acima.
pause
