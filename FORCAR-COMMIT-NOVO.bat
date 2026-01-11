@echo off
echo ========================================
echo   FORCANDO NOVO COMMIT E PUSH
echo ========================================
echo.
echo Este script vai criar um commit vazio
echo para forcar a Vercel a fazer novo build.
echo.
pause

cd /d "C:\Dev\dash comercial"

echo.
echo [1/4] Adicionando TODOS os arquivos importantes...
git add components/geral-dashboard.tsx
git add components/vendedor-dashboard.tsx
git add components/header.tsx
git add components/theme-toggle.tsx
git add app/page.tsx
git add package.json
echo.

echo [2/4] Verificando status...
git status --short
echo.

echo [3/4] Criando commit vazio para forcar novo build...
git commit --allow-empty -m "chore: forca novo build na Vercel - corrige tipos TypeScript personalizado"
echo.

echo [4/4] Enviando para GitHub...
git push origin main
echo.

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCESSO!
    echo ========================================
    echo.
    echo Novo commit enviado para o GitHub!
    echo A Vercel vai fazer novo build agora.
    echo.
    echo Aguarde 2-3 minutos e verifique:
    echo https://vercel.com/dashboard
) else (
    echo.
    echo ERRO no push. Verifique sua conexao.
)

pause




