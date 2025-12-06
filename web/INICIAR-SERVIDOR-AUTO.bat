@echo off
title Alfa Joias - Servidor Auto
color 0A
echo.
echo ========================================
echo    ALFA JOIAS - SERVIDOR AUTOMATICO
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar se já está rodando
echo Verificando se o servidor ja esta rodando...
netstat -ano | findstr ":3000" >nul
if %errorlevel% == 0 (
    echo.
    echo ⚠️  Servidor ja esta rodando na porta 3000!
    echo.
    echo Deseja reiniciar? (S/N)
    set /p RESPOSTA="> "
    if /i "%RESPOSTA%"=="S" (
        echo.
        echo Parando servidor existente...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
    ) else (
        echo.
        echo Servidor ja esta rodando. Acesse: http://localhost:3000
        echo.
        pause
        exit /b 0
    )
)

echo.
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo Instale Node.js em: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependencias pela primeira vez...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo    INICIANDO SERVIDOR...
echo ========================================
echo.
echo 🌐 O site estara disponivel em: http://localhost:3000
echo 👨‍💼 Admin em: http://localhost:3000/admin
echo.
echo 💡 DICAS:
echo    • Para parar: Ctrl+C
echo    • Este servidor e apenas para DESENVOLVIMENTO
echo    • Em PRODUCAO (Vercel/Cloudflare) o servidor roda automaticamente!
echo.
echo 🎉 Iniciando...
echo.

REM Abrir navegador após 3 segundos
start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao iniciar servidor!
    echo.
    pause
    exit /b 1
)




