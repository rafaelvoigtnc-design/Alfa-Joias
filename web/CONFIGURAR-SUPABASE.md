# 🔧 CONFIGURAÇÃO DO SUPABASE

## ❌ PROBLEMA IDENTIFICADO

O erro "Erro ao salvar marca" acontece porque o **Supabase não está configurado**!

## ✅ SOLUÇÃO

### 1. Criar arquivo de configuração

Crie um arquivo `.env.local` na pasta `web/` com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 2. Obter as credenciais do Supabase

1. Acesse https://supabase.com
2. Faça login na sua conta
3. Vá para o seu projeto AlfaJoias
4. Clique em **Settings** > **API**
5. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Exemplo de configuração

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0MDQwMCwiZXhwIjoxOTU4MTE2NDAwfQ.exemplo
```

### 4. Reiniciar o servidor

Após criar o arquivo `.env.local`:

1. Pare o servidor (Ctrl+C)
2. Execute: `npm run dev`
3. Teste novamente no admin

## 🚨 IMPORTANTE

- **NUNCA** commite o arquivo `.env.local` no Git
- Mantenha suas chaves seguras
- Use apenas a chave **anon public** (não a service role)

## ✅ VERIFICAÇÃO

Após configurar, você deve ver no console do navegador:
```
🔍 Supabase Config: {
  urlConfigured: true,
  urlValid: true,
  keyConfigured: true,
  keyValid: true
}
```

Se aparecer `false` em algum campo, verifique as credenciais.







