@echo off
echo ========================================
echo   VERIFICANDO SE AS CORRECOES ESTAO NOS ARQUIVOS
echo ========================================
echo.

cd /d "C:\Dev\dash comercial"

echo Verificando components/geral-dashboard.tsx...
findstr /C:"'personalizado'" components\geral-dashboard.tsx >nul
if %errorlevel% equ 0 (
    echo [OK] Tipo 'personalizado' encontrado em geral-dashboard.tsx
) else (
    echo [ERRO] Tipo 'personalizado' NAO encontrado em geral-dashboard.tsx
)
echo.

echo Verificando components/vendedor-dashboard.tsx...
findstr /C:"'personalizado'" components\vendedor-dashboard.tsx >nul
if %errorlevel% equ 0 (
    echo [OK] Tipo 'personalizado' encontrado em vendedor-dashboard.tsx
) else (
    echo [ERRO] Tipo 'personalizado' NAO encontrado em vendedor-dashboard.tsx
)
echo.

echo Verificando se app/page.tsx existe e nao esta vazio...
if exist app\page.tsx (
    for %%A in (app\page.tsx) do if %%~zA gtr 100 (
        echo [OK] app/page.tsx existe e tem conteudo
    ) else (
        echo [ERRO] app/page.tsx esta vazio ou muito pequeno
    )
) else (
    echo [ERRO] app/page.tsx nao existe
)
echo.

echo Verificando se package.json tem scripts de build...
findstr /C:"prisma generate" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] package.json tem script de build com Prisma
) else (
    echo [ERRO] package.json nao tem script de build correto
)
echo.

echo ========================================
echo   FIM DA VERIFICACAO
echo ========================================
pause




