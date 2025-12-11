# 🔧 Correção: Salvamento e Edição de Produtos

## Problema Identificado

O salvamento e edição de produtos não estavam funcionando porque **faltavam políticas RLS (Row Level Security)** para operações de INSERT e UPDATE na tabela `products`.

A tabela tinha apenas uma política de SELECT (leitura pública), mas não tinha políticas para:
- ✅ INSERT (criar produtos)
- ✅ UPDATE (editar produtos)  
- ✅ DELETE (deletar produtos)

## Solução

Foram criados scripts SQL para adicionar as políticas RLS necessárias.

### Opção 1: Com Autenticação (Recomendado)

**Arquivo:** `fix-products-rls-policies.sql`

Este script adiciona políticas que permitem apenas usuários **autenticados e com permissão de admin** (`is_admin = true`) para gerenciar produtos.

**Como aplicar:**
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `fix-products-rls-policies.sql`
4. Execute o script

### Opção 2: Sem Autenticação (Desenvolvimento/Testes)

**Arquivo:** `fix-products-rls-policies-no-auth.sql`

Este script adiciona políticas que permitem **todas as operações sem verificação de autenticação**.

⚠️ **ATENÇÃO:** Use apenas se:
- Você não tem sistema de autenticação configurado
- Você está em ambiente de desenvolvimento/testes
- As políticas com autenticação não funcionarem

**Como aplicar:**
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `fix-products-rls-policies-no-auth.sql`
4. Execute o script

## Verificação

Após aplicar o script, teste:

1. ✅ Criar um novo produto no painel admin
2. ✅ Editar um produto existente
3. ✅ Deletar um produto

Se ainda houver problemas:

1. Verifique se você está logado como admin no painel
2. Verifique se o usuário tem `is_admin = true` na tabela `users`
3. Verifique o console do navegador para erros
4. Tente usar a Opção 2 (sem autenticação) se a Opção 1 não funcionar

## Arquivos Modificados

- ✅ `web/supabase-setup.sql` - Atualizado com as políticas RLS para produtos
- ✅ `web/fix-products-rls-policies.sql` - Script de correção com autenticação
- ✅ `web/fix-products-rls-policies-no-auth.sql` - Script de correção sem autenticação

## Próximos Passos

1. Execute um dos scripts SQL no Supabase
2. Teste criar/editar um produto
3. Se funcionar, está resolvido! 🎉

