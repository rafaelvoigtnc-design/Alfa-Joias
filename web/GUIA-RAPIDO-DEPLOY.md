# ⚡ GUIA RÁPIDO - COLOCAR SITE NO AR

## 🎯 RESUMO EM 10 PASSOS

### 1️⃣ GITHUB (5 min)
- Criar conta: https://github.com/signup
- Criar repositório (qualquer nome: `alfajoias`, `loja-alfajoias`, etc.)
- Subir código:
```bash
cd C:\Users\rafae\Documents\AlfaJoias
git init
git add .
git commit -m "Primeira versão"
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
# (Substitua SEU-USUARIO e NOME-DO-REPOSITORIO pelos seus valores)
git push -u origin main
```

### 2️⃣ VERCEL (10 min)
- Criar conta: https://vercel.com/signup (Continue with GitHub)
- Importar projeto (o repositório que você criou no GitHub)
- **Root Directory:** `web` ⚠️ IMPORTANTE!

### 3️⃣ VARIÁVEIS (5 min)
Antes de fazer deploy, adicione:
- `NEXT_PUBLIC_SUPABASE_URL` = URL do Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Chave do Supabase

**Onde pegar:**
- Supabase → Settings → API

### 4️⃣ DEPLOY
- Clique em "Deploy"
- Aguarde 2-5 minutos
- ✅ Site no ar!

---

## 🔑 DADOS NECESSÁRIOS

**Do Supabase:**
1. Project URL
2. anon public key

**Localização:** Supabase → Settings → API

---

## ⚠️ ATENÇÃO

- **Root Directory DEVE ser:** `web`
- Configure variáveis ANTES do deploy
- Aguarde build terminar (2-5 min)

---

**Guia completo:** Veja `PASSO-A-PASSO-DEPLOY.md`

