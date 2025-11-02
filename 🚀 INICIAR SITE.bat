@echo off
chcp 65001 >nul
title 🚀 Alfa Jóias - Inicialização Automática

echo.
echo 🚀 Alfa Jóias - Iniciando Sistema Completo
echo =========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 📥 Baixe e instale Node.js de: https://nodejs.org
    echo 💡 Após instalar, execute este arquivo novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!

REM Verificar se npm está funcionando
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM não está funcionando!
    echo 🔧 Reinstale o Node.js para corrigir o NPM
    pause
    exit /b 1
)

echo ✅ NPM funcionando!
echo.

REM Navegar para pasta web
echo 📁 Navegando para pasta web...
if not exist "web" (
    echo ❌ Pasta 'web' não encontrada!
    echo 🔍 Verifique se você está na pasta correta do projeto
    pause
    exit /b 1
)
cd web

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    echo ⏳ Isso pode levar alguns minutos na primeira vez...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas com sucesso!
) else (
    echo ✅ Dependências já instaladas!
)

echo.

REM Verificar se .env.local existe
if not exist ".env.local" (
    echo ⚙️ Configurando ambiente automaticamente...
    echo.
    echo 🔑 IMPORTANTE: Configure suas credenciais do Supabase!
    echo.
    echo 📝 Abra o site https://supabase.com e obtenha:
    echo    1. Project URL
    echo    2. anon public key
    echo.
    set /p SUPABASE_URL="Digite a URL do Supabase (ou pressione Enter para pular): "
    set /p SUPABASE_KEY="Digite a chave anon do Supabase (ou pressione Enter para pular): "
    
    if not defined SUPABASE_URL set SUPABASE_URL=https://seu-projeto.supabase.co
    if not defined SUPABASE_KEY set SUPABASE_KEY=sua-chave-anonima-aqui
    
    (
        echo # Configuração do Supabase
        echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL%
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_KEY%
    ) > .env.local
    
    echo.
    echo ✅ Arquivo .env.local criado!
    if "%SUPABASE_URL%"=="https://seu-projeto.supabase.co" (
        echo ⚠️ Configure o Supabase editando o arquivo web\.env.local
    ) else (
        echo ✅ Supabase configurado!
    )
) else (
    echo ✅ Configuração de ambiente encontrada!
)

echo.

REM Iniciar servidor
echo 🚀 Iniciando servidor de desenvolvimento...
echo 🌐 O site estará disponível em: http://localhost:3000
echo 👨‍💼 Admin em: http://localhost:3000/admin
echo 📱 Site responsivo funcionando!
echo.
echo 💡 DICAS:
echo    • Para parar o servidor: Ctrl+C
echo    • Para configurar Supabase: npm run setup
echo    • Para ver instruções: npm run setup-db
echo.
echo 🎉 Tudo pronto! Iniciando servidor...
echo.

REM Abrir navegador automaticamente após 5 segundos
start /min cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

npm run dev

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar servidor!
    echo 🔧 Tente executar 'npm install' manualmente
    pause
    exit /b 1
)
