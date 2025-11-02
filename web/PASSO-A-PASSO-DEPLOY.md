# 🚀 PASSO A PASSO COMPLETO - COLOCAR SITE NO AR

## 📋 PRÉ-REQUISITOS

Antes de começar, você precisa ter:
- [x] Conta no Supabase (já tem)
- [ ] Conta no GitHub (gratuita)
- [ ] Conta na Vercel (gratuita)
- [ ] Código do site pronto (já está pronto!)

---

## PASSO 1: CRIAR CONTA NO GITHUB (5 minutos)

1. **Acesse:** https://github.com/signup
2. **Crie sua conta** (email, senha, nome de usuário)
3. **Confirme seu email** (verifique a caixa de entrada)
4. **Faça login** no GitHub

✅ **Pronto!** Agora você tem uma conta no GitHub.

---

## PASSO 2: CRIAR REPOSITÓRIO NO GITHUB (3 minutos)

1. **Clique no "+"** no canto superior direito → **"New repository"**
2. **Nome do repositório:** Qualquer nome que você quiser (ex: `alfajoias`, `loja-alfajoias`, `meu-ecommerce`, etc.)
   - ⚠️ **Importante:** O nome não afeta o funcionamento. Use o nome que preferir!
3. **Descrição:** "E-commerce Alfa Jóias" (opcional)
4. **Visibilidade:** 
   - ✅ **Private** (recomendado - só você vê)
   - ⬜ Public (qualquer um pode ver o código)
5. **NÃO marque** "Add a README file"
6. **Clique em "Create repository"**

✅ Você verá uma tela com instruções. **NÃO feche ainda!**

---

## PASSO 3: ENVIAR CÓDIGO PARA O GITHUB (10 minutos)

### 3.1 Instalar Git (se ainda não tiver)

**Windows:**
1. Baixe em: https://git-scm.com/download/win
2. Instale com todas as opções padrão
3. Abra o **Git Bash** (não o CMD normal)

**Ou use o PowerShell** se preferir (já funciona).

### 3.2 Preparar o código

Abra o **PowerShell** ou **Git Bash** na pasta do projeto:

```bash
cd C:\Users\rafae\Documents\AlfaJoias
```

### 3.3 Inicializar Git (se ainda não estiver)

```bash
git init
```

### 3.4 Adicionar todos os arquivos

```bash
git add .
```

### 3.5 Fazer primeiro commit

```bash
git commit -m "Primeira versão do site Alfa Jóias"
```

### 3.6 Conectar com o GitHub

Na página do GitHub que você criou, copie o comando que está escrito:

**Exemplo:** (substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub)

```bash
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
git branch -M main
git push -u origin main
```

**Substitua:**
- `SEU-USUARIO` = seu nome de usuário do GitHub
- `NOME-DO-REPOSITORIO` = o nome que você escolheu para o repositório

**Digite seu usuário e senha do GitHub** quando solicitado.

✅ Se tudo der certo, você verá: "Writing objects: 100%"

---

## PASSO 4: CRIAR CONTA NA VERCEL (3 minutos)

1. **Acesse:** https://vercel.com/signup
2. **Clique em "Continue with GitHub"**
3. **Autorize** a Vercel a acessar seus repositórios
4. **Complete o cadastro** (nome, etc)

✅ **Pronto!** Agora você está na Vercel.

---

## PASSO 5: IMPORTAR PROJETO NA VERCEL (5 minutos)

1. **No painel da Vercel**, clique em **"Add New..."** → **"Project"**

2. **Importar repositório:**
   - Você verá seus repositórios do GitHub
   - Encontre o repositório que você criou (qualquer nome que tenha usado)
   - Clique em **"Import"**

3. **Configuração do projeto:**

   **IMPORTANTE:** Antes de clicar em "Deploy", configure:
   
   - **Root Directory:** 
     - Clique em **"Edit"**
     - Digite: `web`
     - ✅ Isso é CRUCIAL!

   - **Framework Preset:** 
     - Deve detectar automaticamente "Next.js"
     - Se não, selecione manualmente

   - **Build and Output Settings:**
     - Build Command: `npm run build` (já está correto)
     - Output Directory: `.next` (já está correto)
     - Install Command: `npm install` (já está correto)

---

## PASSO 6: CONFIGURAR VARIÁVEIS DE AMBIENTE (5 minutos)

**ANTES de clicar em "Deploy":**

1. **Clique em "Environment Variables"** (na tela de configuração)

2. **Adicionar primeira variável:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Cole a URL do seu Supabase
     - Para obter: https://app.supabase.com → Seu projeto → Settings → API → Project URL
   - **Selecione:** ☑ Production ☑ Preview ☑ Development
   - Clique em **"Add"**

3. **Adicionar segunda variável:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Cole a chave anônima
     - Para obter: https://app.supabase.com → Seu projeto → Settings → API → anon public
   - **Selecione:** ☑ Production ☑ Preview ☑ Development
   - Clique em **"Add"**

4. **Adicionar terceira variável (OPCIONAL):**
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://seu-dominio.vercel.app` (você receberá depois do deploy)
   - Ou deixe sem configurar (usa o padrão)

✅ **Agora sim!** Clique em **"Deploy"**

---

## PASSO 7: AGUARDAR DEPLOY (2-5 minutos)

1. **Aguarde o build:**
   - Você verá os logs do build em tempo real
   - Pode levar 2-5 minutos na primeira vez

2. **Quando terminar:**
   - Você verá: ✅ "Ready" ou "Deployment Successful"
   - Uma URL será gerada: `https://alfajoias-xxxxx.vercel.app`

3. **Clique na URL** para ver seu site no ar! 🎉

---

## PASSO 8: TESTAR O SITE (5 minutos)

### 8.1 Testes Básicos

Acesse a URL que a Vercel forneceu e teste:

- [ ] Site carrega
- [ ] Página inicial aparece
- [ ] Produtos aparecem
- [ ] Login funciona
- [ ] Admin acessível (se for admin)
- [ ] WhatsApp abre corretamente

### 8.2 Testes de Funcionalidades

- [ ] Adicionar produto ao carrinho
- [ ] Finalizar checkout
- [ ] Ver pedidos (se logado)
- [ ] Admin funciona

### 8.3 Se algo não funcionar:

- **Erro ao carregar produtos:**
  - Verifique se as variáveis de ambiente estão corretas
  - Verifique console do navegador (F12)

- **Erro 500:**
  - Vá na Vercel → Deployments → Clique no deploy → Ver logs
  - Verifique se há erros nos logs

---

## PASSO 9: CONFIGURAR DOMÍNIO PRÓPRIO (OPCIONAL) (10-15 minutos)

Se quiser usar um domínio como `alfajoias.com.br`:

### 9.1 Comprar Domínio

1. Escolha onde comprar:
   - Registro.br (R$ 40/ano)
   - GoDaddy
   - Google Domains

2. Compre o domínio desejado

### 9.2 Configurar na Vercel

1. **Na Vercel**, vá em **Settings** → **Domains**

2. **Adicione seu domínio:**
   - Digite: `alfajoias.com.br`
   - Clique em **"Add"**

3. **Configure o DNS:**
   - A Vercel fornecerá instruções
   - Você precisa adicionar registros no seu provedor de domínio
   - Geralmente leva 5 minutos a 48 horas para propagar

4. **Aguardar propagação:**
   - Quando propagar, seu site estará acessível pelo domínio!

---

## PASSO 10: ATUALIZAR CONFIGURAÇÕES (5 minutos)

### 10.1 Supabase - Redirect URLs

1. **Acesse:** https://app.supabase.com
2. **Seu projeto** → **Authentication** → **URL Configuration**
3. **Site URL:** Adicione `https://seu-dominio.vercel.app`
4. **Redirect URLs:** Adicione:
   - `https://seu-dominio.vercel.app/auth/callback`
   - `https://seu-dominio.com.br/auth/callback` (se tiver domínio próprio)
5. **Salve**

### 10.2 Google OAuth (se usar)

1. **Google Cloud Console:** https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Edite o OAuth 2.0 Client ID**
4. **Authorized redirect URIs:**
   - Adicione: `https://seu-dominio.vercel.app/auth/callback`
   - Adicione: `https://seu-dominio.com.br/auth/callback` (se tiver domínio)
5. **Salve**

---

## 🎉 PRONTO! SEU SITE ESTÁ NO AR!

### ✅ O que você tem agora:

1. **Site funcionando:** `https://seu-dominio.vercel.app`
2. **Deploy automático:** Toda mudança no GitHub atualiza o site
3. **SSL gratuito:** Site seguro com HTTPS
4. **CDN global:** Site rápido em todo o mundo
5. **Backup automático:** Código seguro no GitHub

---

## 🔄 ATUALIZAÇÕES FUTURAS

Quando fizer mudanças no código:

```bash
cd C:\Users\rafae\Documents\AlfaJoias
git add .
git commit -m "Descrição da mudança"
git push
```

**Automaticamente:**
- Vercel detecta mudanças no GitHub
- Faz novo build
- Atualiza o site em 2-5 minutos

---

## 📞 AJUDA

### Problemas Comuns

**"Build failed" na Vercel:**
- Verifique variáveis de ambiente
- Veja logs do build na Vercel
- Verifique se Root Directory está como `web`

**"Site não carrega produtos":**
- Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verifique se Supabase está funcionando

**"Login não funciona":**
- Verifique redirect URLs no Supabase
- Verifique Google OAuth URLs (se usar)

**"Erro 404":**
- Verifique se Root Directory está como `web`

---

## ✅ CHECKLIST FINAL

Antes de considerar completo:

- [ ] Código enviado para GitHub
- [ ] Projeto importado na Vercel
- [ ] Root Directory configurado como `web`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Site acessível e funcionando
- [ ] Redirect URLs atualizadas no Supabase
- [ ] Google OAuth atualizado (se usar)

---

## 🎊 PARABÉNS!

Seu site está **100% no ar** e funcionando!

**Próximos passos opcionais:**
- Comprar domínio próprio
- Adicionar Google Analytics
- Configurar email profissional
- Otimizar para SEO avançado

---

**💎 Alfa Jóias - A Vitrine dos seus Olhos** ✨

---

**Última atualização:** Novembro 2025

