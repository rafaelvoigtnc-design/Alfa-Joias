# 🔧 Como Configurar Login com Google no Supabase

## Passo 1: Configurar no Google Cloud Console

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com/
   - Faça login com sua conta Google

2. **Criar um novo projeto ou selecionar existente:**
   - Clique em "Selecionar projeto" no topo
   - Clique em "Novo projeto"
   - Nome: "Alfa Joias" (ou qualquer nome)
   - Clique em "Criar"

3. **Habilitar a Google+ API:**
   - No menu lateral, vá em "APIs e serviços" > "Biblioteca"
   - Procure por "Google+ API"
   - Clique em "Ativar"

4. **Criar credenciais OAuth 2.0:**
   - Vá em "APIs e serviços" > "Credenciais"
   - Clique em "+ Criar credenciais" > "ID do cliente OAuth 2.0"
   - Tipo de aplicativo: "Aplicativo da Web"
   - Nome: "Alfa Joias Web"

5. **Configurar URIs de redirecionamento:**
   - URIs de redirecionamento autorizados:
     ```
     http://localhost:3000/auth/callback
     https://whvidictphebciuiabug.supabase.co/auth/v1/callback
     ```
   - Clique em "Criar"

6. **Copiar as credenciais:**
   - Anote o "ID do cliente" e "Chave secreta do cliente"

## Passo 2: Configurar no Supabase

1. **Acesse o painel do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto "whvidictphebciuiabug"

2. **Configurar autenticação:**
   - No menu lateral, clique em "Authentication"
   - Vá na aba "Providers"
   - Encontre "Google" e clique no toggle para ativar

3. **Inserir as credenciais:**
   - Client ID: (cole o ID do cliente do Google)
   - Client Secret: (cole a chave secreta do Google)
   - Clique em "Save"

4. **Configurar URLs de redirecionamento:**
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     ```
     http://localhost:3000/auth/callback
     https://whvidictphebciuiabug.supabase.co/auth/v1/callback
     ```

## Passo 3: Testar

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Teste o login:**
   - Acesse: http://localhost:3000/login
   - Clique em "Continuar com Google"
   - Deve abrir a janela de login do Google

## ⚠️ Problemas Comuns

### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de redirecionamento estão exatamente iguais no Google Console e Supabase

### Erro: "access_denied"
- Verifique se o Google+ API está ativado
- Verifique se o projeto está selecionado corretamente

### Erro: "invalid_client"
- Verifique se o Client ID e Secret estão corretos
- Certifique-se de que copiou as credenciais do projeto correto

## 🔗 Links Úteis

- Google Cloud Console: https://console.cloud.google.com/
- Supabase Dashboard: https://supabase.com/dashboard
- Documentação Supabase Auth: https://supabase.com/docs/guides/auth

## 📝 Notas

- Para produção, você precisará adicionar o domínio real nas URLs de redirecionamento
- O Google pode levar alguns minutos para propagar as configurações
- Sempre teste em ambiente de desenvolvimento primeiro
