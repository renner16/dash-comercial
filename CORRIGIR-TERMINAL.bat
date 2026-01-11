@echo off
echo ========================================
echo   DIAGNOSTICO E CORRECAO DO TERMINAL
echo ========================================
echo.

echo [1] Verificando PowerShell...
where powershell.exe
if %errorlevel% equ 0 (
    echo [OK] PowerShell encontrado
) else (
    echo [ERRO] PowerShell nao encontrado no PATH
)
echo.

echo [2] Verificando Git...
where git.exe
if %errorlevel% equ 0 (
    echo [OK] Git encontrado
    git --version
) else (
    echo [ERRO] Git nao encontrado no PATH
)
echo.

echo [3] Testando comandos basicos...
cd /d "C:\Dev\dash comercial"
if %errorlevel% equ 0 (
    echo [OK] Diretorio acessivel
    echo Diretorio atual: %CD%
) else (
    echo [ERRO] Nao foi possivel acessar o diretorio
)
echo.

echo [4] Testando Git no diretorio...
git status --short
if %errorlevel% equ 0 (
    echo [OK] Git funciona no diretorio
) else (
    echo [ERRO] Git nao funciona
)
echo.

echo ========================================
echo   FIM DO DIAGNOSTICO
echo ========================================
echo.
echo Se tudo estiver OK acima, o terminal deve funcionar.
echo Se houver erros, verifique as configuracoes do sistema.
echo.
pause




