@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🚀 DEPLOY SETUP - Alfa Jóias                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Voltar para a pasta raiz do projeto
cd ..

echo 📋 PASSO 1: Verificando Git...
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git não encontrado no PATH!
    echo.
    echo 🔧 SOLUÇÃO:
    echo    1. Feche TODAS as janelas do PowerShell
    echo    2. Abra uma NOVA janela do PowerShell
    echo    3. Execute novamente: .\web\deploy-setup.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Git instalado corretamente!
echo.

echo 📋 PASSO 2: Configurando Git...
echo.

git config --global user.name "Alfa Joias" >nul 2>&1
git config --global user.email "contato@alfajoias.com.br" >nul 2>&1

echo ✅ Git configurado!
echo.

echo 📋 PASSO 3: Criando arquivo .gitignore...
echo.

if not exist ".gitignore" (
    (
        echo node_modules/
        echo .next/
        echo .env.local
        echo .env*.local
        echo npm-debug.log*
        echo .DS_Store
        echo *.log
        echo .vercel
    ) > .gitignore
    echo ✅ .gitignore criado!
) else (
    echo ✅ .gitignore já existe!
)
echo.

echo 📋 PASSO 4: Inicializando repositório Git...
echo.

if not exist ".git" (
    git init
    echo ✅ Repositório Git criado!
) else (
    echo ✅ Repositório Git já existe!
)
echo.

echo 📋 PASSO 5: Adicionando arquivos...
echo.
git add .
echo ✅ Arquivos adicionados!
echo.

echo 📋 PASSO 6: Fazendo commit inicial...
echo.
git commit -m "Site Alfa Joias completo - pronto para producao" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Commit realizado!
) else (
    echo ⚠️ Nada para commitar ou commit já existe
)
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ PREPARAÇÃO COMPLETA!                                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🎯 PRÓXIMOS PASSOS:
echo.
echo 1. 🌐 Acesse: https://github.com/new
echo    - Nome do repositório: alfajoias
echo    - Marque como Private (recomendado)
echo    - NÃO adicione README, .gitignore ou license
echo    - Clique em "Create repository"
echo.
echo 2. 📤 Copie e execute os comandos que aparecerem (segunda opção):
echo    git remote add origin https://github.com/SEU-USUARIO/alfajoias.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. 🚀 Deploy na Vercel:
echo    - Acesse: https://vercel.com
echo    - Login com GitHub
echo    - Import projeto "alfajoias"
echo    - Root Directory: web
echo    - Adicione variáveis de ambiente (copie do .env.local)
echo    - Deploy!
echo.
echo 💡 IMPORTANTE: Copie as variáveis do arquivo web\.env.local
echo.
pause








