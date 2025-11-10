@echo off
title Alfa Joias - Servidor
color 0A
echo.
echo ========================================
echo    ALFA JOIAS - INICIANDO SERVIDOR
echo ========================================
echo.
echo Navegando para a pasta web...
cd /d "%~dp0"
echo.
echo Verificando se estamos na pasta correta...
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo Certifique-se de estar na pasta web/
    pause
    exit /b 1
)
echo.
echo Iniciando servidor Next.js...
echo.
echo ========================================
echo    SERVIDOR INICIADO COM SUCESSO!
echo ========================================
echo.
echo Acesse: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
npm run dev






