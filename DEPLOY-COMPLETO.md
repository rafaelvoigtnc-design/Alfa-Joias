# 🚀 GUIA COMPLETO - COLOCAR SITE ALFA JÓIAS NO AR

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Passo 1: GitHub](#passo-1-github)
3. [Passo 2: Enviar Código](#passo-2-enviar-código)
4. [Passo 3: Vercel](#passo-3-vercel)
5. [Passo 4: Configurar](#passo-4-configurar)
6. [Passo 5: Deploy](#passo-5-deploy)
7. [Passo 6: Testar](#passo-6-testar)
8. [Passo 7: Domínio (Opcional)](#passo-7-domínio-opcional)
9. [Atualizações Futuras](#atualizações-futuras)
10. [Troubleshooting](#troubleshooting)

---

## 📝 PRÉ-REQUISITOS

✅ Você precisa de:
- Conta no Supabase (já tem)
- Conta no GitHub (criar agora - 5 min)
- Conta na Vercel (criar agora - 3 min)
- Git instalado (Windows geralmente já tem)

**Tempo total:** ~30 minutos
**Custo:** R$ 0,00 (100% GRATUITO!)

---

## PASSO 1: GITHUB

### 1.1 Criar Conta (3 minutos)

1. **Acesse:** https://github.com/signup
2. **Preencha:**
   - Username (ex: `rafael-silva`)
   - Email (seu email)
   - Senha (forte, mínimo 8 caracteres)
3. **Resolva o captcha** (se aparecer)
4. **Confirme seu email** (verifique a caixa de entrada)
5. **Faça login**

### 1.2 Criar Repositório (2 minutos)

1. **Clique no "+"** → **"New repository"**
2. **Nome:** `alfajoias`
3. **Descrição:** "E-commerce Alfa Jóias - Joalheria e Ótica"
4. **Visibilidade:** 
   - ☑ **Private** (recomendado)
   - ⬜ Public
5. **NÃO marque** nenhuma opção adicional
6. **Clique em "Create repository"**

✅ Você verá uma página com instruções. **Guarde essa página aberta!**

---

## PASSO 2: ENVIAR CÓDIGO

### 2.1 Verificar Git (1 minuto)

Abra o **PowerShell** ou **Git Bash** e digite:

```bash
git --version
```

Se aparecer um número de versão (ex: `git version 2.40.0`), está instalado! ✅

**Se não aparecer:** Baixe em https://git-scm.com/download/win e instale.

### 2.2 Navegar para a Pasta do Projeto

```bash
cd C:\Users\rafae\Documents\AlfaJoias
```

### 2.3 Verificar se já é um repositório Git

```bash
git status
```

**Se aparecer:** "fatal: not a git repository"

Então execute:
```bash
git init
```

**Se aparecer:** Lista de arquivos, já está inicializado! ✅

### 2.4 Adicionar Arquivos

```bash
git add .
```

Isso adiciona todos os arquivos (exceto os no .gitignore).

### 2.5 Fazer Commit

```bash
git commit -m "Site Alfa Jóias - versão inicial"
```

**Se aparecer erro pedindo email/nome:**
```bash
git config --global user.email "seu@email.com"
git config --global user.name "Seu Nome"
```
Depois repita o `git commit`.

### 2.6 Conectar com GitHub

Na página do GitHub que você criou, copie os comandos:

**Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub!**

```bash
git remote add origin https://github.com/SEU-USUARIO/alfajoias.git
git branch -M main
git push -u origin main
```

**Quando pedir:**
- **Username:** seu usuário do GitHub
- **Password:** use um **Personal Access Token** (não a senha normal)

**Como criar Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Marque: `repo` (tudo relacionado a repositórios)
4. Generate token
5. **COPIE o token** (aparece só uma vez!)
6. Use esse token como senha no `git push`

✅ Se tudo der certo: "Writing objects: 100%" e "remote: Resolving deltas: 100%"

---

## PASSO 3: VERCEL

### 3.1 Criar Conta (2 minutos)

1. **Acesse:** https://vercel.com/signup
2. **Clique em "Continue with GitHub"**
3. **Autorize** a Vercel acessar seus repositórios
4. **Complete perfil** (nome, etc)

### 3.2 Importar Projeto (2 minutos)

1. **Clique em "Add New..."** → **"Project"**
2. **Encontre "alfajoias"** na lista
3. **Clique em "Import"**

---

## PASSO 4: CONFIGURAR

### 4.1 Configurações do Projeto (IMPORTANTE!)

Antes de fazer deploy:

**Root Directory:**
- Clique em **"Edit"** ao lado de "Root Directory"
- Digite: `web`
- ⚠️ **MUITO IMPORTANTE!** Sem isso, o deploy falhará!

**Framework Preset:**
- Deve mostrar "Next.js" automaticamente
- Se não, selecione manualmente

### 4.2 Variáveis de Ambiente (CRÍTICO!)

**NÃO clique em "Deploy" ainda!**

1. **Clique em "Environment Variables"**

2. **Adicionar NEXT_PUBLIC_SUPABASE_URL:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Cole a URL do Supabase
   
   **Onde pegar:**
   - Acesse: https://app.supabase.com
   - Seu projeto → **Settings** → **API**
   - Copie o **"Project URL"** (ex: `https://xxxxx.supabase.co`)
   
   - Selecione: ☑ Production ☑ Preview ☑ Development
   - Clique em **"Add"**

3. **Adicionar NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Cole a chave anônima
   
   **Onde pegar:**
   - Mesma página (Settings → API)
   - Copie o **"anon public"** key (começa com `eyJ...`)
   
   - Selecione: ☑ Production ☑ Preview ☑ Development
   - Clique em **"Add"**

4. **Adicionar NEXT_PUBLIC_SITE_URL (OPCIONAL):**
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: Você receberá após o deploy (ex: `https://alfajoias.vercel.app`)
   - Ou deixe sem configurar (usa padrão)
   - Selecione: ☑ Production ☑ Preview ☑ Development
   - Clique em **"Add"**

✅ **Agora sim!** Todas as variáveis estão configuradas.

---

## PASSO 5: DEPLOY

1. **Clique em "Deploy"** (canto inferior direito)

2. **Aguarde o build:**
   - Você verá os logs em tempo real
   - Primeira vez: 3-5 minutos
   - Próximas vezes: 1-2 minutos

3. **Quando terminar:**
   - ✅ Status: "Ready"
   - Você verá uma URL: `https://alfajoias-xxxxx.vercel.app`

4. **Clique na URL** ou no botão "Visit"

🎉 **SEU SITE ESTÁ NO AR!**

---

## PASSO 6: TESTAR

### 6.1 Testes Básicos

Abra o site e teste:

- [ ] ✅ Site carrega
- [ ] ✅ Página inicial aparece
- [ ] ✅ Produtos aparecem
- [ ] ✅ Navegação funciona
- [ ] ✅ Imagens carregam

### 6.2 Testes Funcionais

- [ ] ✅ Login funciona
- [ ] ✅ Cadastro funciona
- [ ] ✅ Carrinho funciona
- [ ] ✅ Checkout funciona
- [ ] ✅ Admin acessível (se for admin)
- [ ] ✅ WhatsApp abre corretamente

### 6.3 Se algo não funcionar:

**Produtos não aparecem:**
- Verifique variáveis de ambiente na Vercel
- Verifique console do navegador (F12)

**Erro 500:**
- Vercel → Deployments → Clique no deploy → Ver logs
- Verifique erros específicos

**Login não funciona:**
- Verifique redirect URLs no Supabase (Passo 7)

---

## PASSO 7: CONFIGURAR SUPABASE (Após Deploy)

### 7.1 Atualizar Redirect URLs

1. **Acesse:** https://app.supabase.com
2. **Seu projeto** → **Authentication** → **URL Configuration**

3. **Site URL:**
   - Adicione: `https://seu-dominio.vercel.app`

4. **Redirect URLs:**
   - Adicione: `https://seu-dominio.vercel.app/auth/callback`
   - Adicione: `https://seu-dominio.vercel.app/**` (wildcard)
   - Se tiver domínio próprio, adicione também

5. **Salve**

### 7.2 Google OAuth (se usar)

1. **Google Cloud Console:** https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Edite seu OAuth 2.0 Client ID**
4. **Authorized redirect URIs:**
   - Adicione: `https://seu-dominio.vercel.app/auth/callback`
5. **Salve**

---

## PASSO 8: DOMÍNIO PRÓPRIO (OPCIONAL)

Se quiser usar `alfajoias.com.br`:

### 8.1 Comprar Domínio

**Onde comprar:**
- Registro.br (R$ 40/ano) - Recomendado para .com.br
- GoDaddy
- Google Domains

### 8.2 Configurar na Vercel

1. **Vercel** → **Settings** → **Domains**
2. **Digite seu domínio:** `alfajoias.com.br`
3. **Add**
4. **Siga as instruções** para configurar DNS
5. **Aguarde propagação:** 5 minutos a 48 horas

✅ Quando propagar, seu site estará acessível pelo domínio!

---

## 🔄 ATUALIZAÇÕES FUTURAS

Quando fizer mudanças:

```bash
cd C:\Users\rafae\Documents\AlfaJoias
git add .
git commit -m "Descrição da mudança"
git push
```

**Automaticamente:**
- Vercel detecta mudanças
- Faz novo build
- Atualiza o site em 2-5 minutos

**Ver deploy:**
- Vercel → Deployments → Veja histórico

---

## 🆘 TROUBLESHOOTING

### "Build failed"

**Verifique:**
1. Root Directory está como `web`? ⚠️
2. Variáveis de ambiente configuradas?
3. Veja logs na Vercel

**Solução:**
- Vercel → Deployments → Clique no deploy → Veja "Build Logs"
- Procure por erros em vermelho

### "Produtos não aparecem"

**Verifique:**
1. `NEXT_PUBLIC_SUPABASE_URL` está correto?
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto?
3. Supabase está funcionando? (teste no app.supabase.com)

**Solução:**
- Vercel → Settings → Environment Variables
- Verifique se estão corretas
- Faça novo deploy

### "Erro 500 Internal Server Error"

**Verifique:**
- Console do navegador (F12)
- Logs da Vercel

**Possíveis causas:**
- Variáveis de ambiente incorretas
- Erro no código
- Supabase desconectado

### "Login não funciona"

**Verifique:**
1. Redirect URLs no Supabase incluem domínio da Vercel
2. Google OAuth URLs atualizadas (se usar)

**Solução:**
- Supabase → Authentication → URL Configuration
- Adicione URL da Vercel

### "Git push não funciona"

**Erro:** "authentication failed"

**Solução:**
- Use Personal Access Token (não a senha)
- Veja instruções no Passo 2.6

---

## ✅ CHECKLIST FINAL

Antes de considerar completo:

- [ ] Código enviado para GitHub
- [ ] Repositório criado e código enviado
- [ ] Conta Vercel criada
- [ ] Projeto importado na Vercel
- [ ] **Root Directory:** `web` ⚠️
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Site acessível e funcionando
- [ ] Redirect URLs atualizadas no Supabase
- [ ] Google OAuth atualizado (se usar)
- [ ] Testes realizados
- [ ] Domínio configurado (opcional)

---

## 📞 SUPORTE

**Documentação:**
- GitHub: https://docs.github.com
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs

**Comunidade:**
- Vercel Discord
- GitHub Discussions

---

## 🎊 PARABÉNS!

Seu site está no ar e funcionando! 🚀

**Próximos passos opcionais:**
- Comprar domínio próprio
- Configurar Google Analytics
- Otimizar SEO avançado
- Adicionar mais produtos

---

**💎 Alfa Jóias - A Vitrine dos seus Olhos** ✨

---

**Tempo total:** ~30 minutos  
**Custo:** R$ 0,00  
**Dificuldade:** ⭐⭐ (Fácil)

---

*Guia criado em: Novembro 2025*

