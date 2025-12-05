@echo off
title Alfa Joias - Servidor
echo.
echo ========================================
echo    ALFA JOIAS - INICIANDO SERVIDOR
echo ========================================
echo.
echo Navegando para a pasta web...
cd /d "%~dp0\web"
echo.
echo Pasta atual: %CD%
echo.
echo Verificando package.json...
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo.
    echo Arquivos na pasta atual:
    dir
    echo.
    pause
    exit /b 1
)
echo OK: package.json encontrado!
echo.
echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js em: https://nodejs.org
    pause
    exit /b 1
)
echo.
echo Verificando NPM...
npm --version
if %errorlevel% neq 0 (
    echo ERRO: NPM nao encontrado!
    pause
    exit /b 1
)
echo.
echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo.
echo ========================================
echo    SERVIDOR INICIANDO...
echo ========================================
echo.
echo Acesse: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
npm run dev











