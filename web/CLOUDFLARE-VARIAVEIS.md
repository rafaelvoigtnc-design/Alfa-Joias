# ⚙️ Configurar Variáveis de Ambiente no Cloudflare Pages

## 🔑 Variáveis Necessárias

Para o site funcionar, você **DEVE** configurar estas variáveis no Cloudflare Pages:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Valor: `https://whvidictphebciuiabug.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndodmlkaWN0cGhlYmNpdWlhYnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTk4NzgsImV4cCI6MjA3NDQ5NTg3OH0.sbXPX4RiHO-ppXn7HOQ7Db6L_XPKxnWLkq9WyqIjg_c`

## 📋 Como Configurar:

1. Acesse: https://dash.cloudflare.com
2. Vá em **Workers & Pages**
3. Clique no seu projeto **alfa-joias-nc**
4. Vá em **Settings** → **Environment Variables**
5. Adicione as duas variáveis acima
6. Certifique-se de que estão marcadas para **Production** e **Preview**
7. Salve e faça um novo deploy

## ⚠️ IMPORTANTE:

- Sem essas variáveis, o site não consegue conectar ao banco de dados
- Isso causa o problema de "Carregando categorias..." infinito
- Após configurar, o site deve funcionar normalmente

