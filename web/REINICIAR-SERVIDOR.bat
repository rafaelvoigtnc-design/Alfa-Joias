@echo off
title Reiniciar Servidor Alfa Joias
echo.
echo ========================================
echo    REINICIANDO SERVIDOR
echo ========================================
echo.
echo Parando processos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Limpando cache do Next.js...
if exist ".next" (
    rmdir /s /q .next
    echo Cache limpo!
)
echo.
echo Iniciando servidor...
echo.
npm run dev



