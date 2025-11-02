# 🚀 Como Colocar o Site Alfa Jóias Online (GRÁTIS)

## ✅ O que você vai conseguir:
- 🌐 Site online 24/7
- 🔒 HTTPS automático (seguro)
- ⚡ Super rápido
- 💰 **100% GRATUITO**
- 🔄 Atualizações automáticas

---

## 📝 Pré-requisitos

1. ✅ Conta no GitHub (para guardar o código)
2. ✅ Conta no Vercel (criar é grátis)
3. ✅ Projeto funcionando localmente

---

## 🎯 Passo 1: Preparar o Projeto

### 1.1 Criar arquivo `.gitignore` (se não existir)

Crie ou verifique se existe o arquivo `.gitignore` na raiz do projeto:

```
# dependencies
node_modules/
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 1.2 Testar Build Local

Antes de fazer deploy, teste se o build funciona:

```bash
cd web
npm run build
```

Se der erro, corrija antes de continuar.

---

## 🐙 Passo 2: Subir para o GitHub

### 2.1 Criar Repositório no GitHub

1. Acesse: https://github.com
2. Clique em "+" → "New repository"
3. Nome: `alfajoias`
4. Marque como "Private" (recomendado)
5. Clique em "Create repository"

### 2.2 Enviar Código

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Primeira versão do site Alfa Jóias"

# Conectar com GitHub (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/alfajoias.git

# Enviar código
git branch -M main
git push -u origin main
```

---

## ☁️ Passo 3: Deploy na Vercel

### 3.1 Criar Conta na Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize a Vercel a acessar seus repositórios

### 3.2 Importar Projeto

1. No painel da Vercel, clique em "Add New..."
2. Selecione "Project"
3. Encontre o repositório `alfajoias`
4. Clique em "Import"

### 3.3 Configurar Projeto

Na tela de configuração:

**Root Directory:**
- Clique em "Edit"
- Selecione a pasta `web`
- ✅ Isso é importante!

**Framework Preset:**
- Deve detectar automaticamente "Next.js"
- Se não detectar, selecione "Next.js"

**Build and Output Settings:**
- Build Command: `npm run build` (já está correto)
- Output Directory: `.next` (já está correto)

### 3.4 Adicionar Variáveis de Ambiente

**IMPORTANTE!** Clique em "Environment Variables" e adicione:

```
Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: https://seu-projeto.supabase.co
```

```
Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: sua-chave-anon-do-supabase
```

**Como pegar esses valores:**
1. Acesse: https://app.supabase.com
2. Vá no seu projeto
3. Clique em "Settings" → "API"
4. Copie:
   - "Project URL" → NEXT_PUBLIC_SUPABASE_URL
   - "anon public" → NEXT_PUBLIC_SUPABASE_ANON_KEY

### 3.5 Deploy!

1. Clique em "Deploy"
2. Aguarde 2-3 minutos (a Vercel vai compilar tudo)
3. ✅ **PRONTO!** Seu site está no ar!

---

## 🌐 Resultado

Você receberá uma URL como:
- `https://alfajoias.vercel.app`
- `https://alfajoias-sei-usuario.vercel.app`

O site estará online 24/7!

---

## 🎨 Passo 4: Domínio Próprio (Opcional)

Se quiser usar seu próprio domínio (ex: `alfajoias.com.br`):

1. Compre um domínio (Registro.br, GoDaddy, etc.)
2. Na Vercel, vá em "Settings" → "Domains"
3. Adicione seu domínio
4. Configure o DNS conforme instruções
5. ✅ Pronto! Seu domínio aponta para o site

---

## 🔄 Atualizações Automáticas

**Melhor parte:** Toda vez que você fizer mudanças:

```bash
# Fazer alterações no código
# ...

# Salvar e enviar para GitHub
git add .
git commit -m "Descrição da mudança"
git push
```

A Vercel **automaticamente**:
1. Detecta a mudança
2. Faz novo build
3. Atualiza o site
4. Tudo em 2-3 minutos!

**Você nunca mais precisa se preocupar com servidor!**

---

## 🐛 Problemas Comuns

### ❌ Erro: "Module not found"
**Solução:** Execute `npm install` localmente e faça commit do `package-lock.json`

### ❌ Erro: "Build failed"
**Solução:** 
1. Teste localmente: `npm run build`
2. Corrija os erros
3. Faça commit e push novamente

### ❌ Erro: "Environment variable not found"
**Solução:** Verifique se adicionou as variáveis de ambiente na Vercel

### ❌ Site carrega mas não funciona
**Solução:** 
1. Verifique se o Supabase está configurado
2. Confira se as URLs nas variáveis de ambiente estão corretas
3. Veja os logs na Vercel: Settings → Functions → Logs

---

## 💰 Custos

**Vercel (Plano Hobby - GRÁTIS):**
- ✅ Domínio `.vercel.app` grátis
- ✅ SSL/HTTPS grátis
- ✅ 100 GB de bandwidth
- ✅ Deploy ilimitado
- ✅ Mais que suficiente para a Alfa Jóias!

**Supabase (Plano Free):**
- ✅ 500 MB de banco de dados
- ✅ 2 GB de transferência
- ✅ Autenticação grátis
- ✅ Suficiente para começar

**Total: R$ 0,00 / mês** 🎉

---

## 📞 Suporte

Se tiver problemas:
1. Veja os logs na Vercel
2. Entre no Discord da Vercel
3. Documentação: https://vercel.com/docs

---

## ✅ Checklist Final

Antes de fazer deploy, certifique-se:

- [ ] Site funciona localmente (`npm run dev`)
- [ ] Build funciona sem erros (`npm run build`)
- [ ] Arquivo `.gitignore` está configurado
- [ ] Código está no GitHub
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Supabase está ativo e configurado
- [ ] Templates de email personalizados (opcional)

---

## 🎉 Parabéns!

Seu site Alfa Jóias está online e acessível de qualquer lugar do mundo!

**Compartilhe a URL:**
- WhatsApp: (55) 9 9912-88464
- Instagram: @alfajoiasnc
- Facebook: Alfa Jóias Nova Candelária

**Próximos passos:**
1. Teste o site online
2. Configure o domínio próprio (se quiser)
3. Personalize os emails do Supabase
4. Adicione produtos reais no admin
5. Divulgue nas redes sociais!

---

**Boa sorte com seu e-commerce!** 🚀💎










