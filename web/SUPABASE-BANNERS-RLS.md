# 🔐 Configuração RLS para Tabela Banners

## ⚠️ IMPORTANTE: RLS está DESABILITADO

A tabela `banners` atualmente tem RLS desabilitado, o que significa que:
- ❌ Qualquer pessoa com a chave anônima pode ler, modificar ou deletar banners
- ❌ Não há controle de acesso baseado em autenticação
- ⚠️ **ISSO É UM RISCO DE SEGURANÇA**

## ✅ Como Corrigir

### Passo 1: Habilitar RLS
1. No Supabase Dashboard, vá para a tabela `banners`
2. Clique no botão **"Enable RLS"**
3. RLS será ativado imediatamente

### Passo 2: Criar Políticas Necessárias

#### Política 1: Leitura Pública (Todos podem VER banners ativos)
```sql
-- Nome: "Allow public read access"
-- Command: SELECT
-- Target roles: public

CREATE POLICY "Allow public read access"
ON banners
FOR SELECT
TO public
USING (active = true);
```

#### Política 2: Administradores podem fazer tudo
```sql
-- Nome: "Admins can manage banners"
-- Command: ALL (SELECT, INSERT, UPDATE, DELETE)
-- Target roles: authenticated
-- WITH CHECK: verifica se é admin

CREATE POLICY "Admins can manage banners"
ON banners
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);
```

## 🎯 Políticas Recomendadas

### Opção A: Apenas Admins podem gerenciar (RECOMENDADO)

**SELECT (Leitura):**
- Público: pode ver banners com `active = true`
- Autenticados: podem ver todos os banners se forem admin

**INSERT/UPDATE/DELETE:**
- Apenas usuários autenticados que são admin

### Opção B: Mais Permissivo (para testes)

**SELECT:**
- Todos podem ver banners ativos

**INSERT/UPDATE/DELETE:**
- Qualquer usuário autenticado (não recomendado para produção)

## 🔧 Como Criar as Políticas no Supabase

1. **No Dashboard do Supabase:**
   - Vá para Table Editor → `banners`
   - Clique em "Enable RLS" (se ainda não habilitado)
   - Clique em "Create policy"

2. **Para cada política:**
   - Dê um nome descritivo
   - Selecione o comando (SELECT, INSERT, UPDATE, DELETE ou ALL)
   - Defina os roles (public, authenticated, etc.)
   - Adicione a condição USING/WITH CHECK

3. **OU use SQL direto:**
   - Vá para SQL Editor
   - Cole os comandos SQL acima
   - Execute

## ✅ Após Configurar

Teste:
1. ✅ Público (sem login) pode ver banners ativos
2. ✅ Admin pode criar/editar/deletar banners
3. ✅ Usuários não-admin NÃO podem modificar banners

## 🐛 Se Ainda Houver Erro de Autenticação

Mesmo com RLS configurado corretamente, se ainda houver "authenticator error" do Cloudflare, verifique:

1. **Variáveis de ambiente no Cloudflare:**
   - `NEXT_PUBLIC_SUPABASE_URL` está configurado?
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurado?

2. **Sessão do usuário:**
   - O usuário está realmente logado?
   - A sessão não expirou?
   - O token JWT é válido?

3. **Verifique no Console do Navegador:**
   - Procure por erros de autenticação
   - Veja se a sessão está sendo obtida corretamente





