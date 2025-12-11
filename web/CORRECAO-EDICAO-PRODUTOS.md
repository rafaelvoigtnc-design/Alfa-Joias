# 🔧 Correção: Edição de Produtos Não Funciona

## Problemas Identificados e Corrigidos

### 1. ✅ API não retornava `additional_images` e `updated_at`
**Correção:** Adicionado `additional_images` e `updated_at` ao SELECT da API de produtos.

### 2. ✅ Inconsistência entre `additional_images` (banco) e `additionalImages` (código)
**Correção:** Adicionado mapeamento automático para converter `additional_images` → `additionalImages` ao carregar produtos.

### 3. ✅ Produto não era mapeado corretamente ao clicar em Editar
**Correção:** Garantido que o produto seja mapeado corretamente com todos os campos ao clicar em Editar.

### 4. ⚠️ Políticas RLS de UPDATE podem não estar aplicadas
**Ação necessária:** Execute o script SQL abaixo no Supabase.

## 🔴 AÇÃO URGENTE: Aplicar Políticas RLS

**O problema principal é que as políticas RLS de UPDATE não estão aplicadas no banco.**

### Passo 1: Acesse o Supabase Dashboard
1. Vá para https://supabase.com
2. Acesse seu projeto
3. Vá em **SQL Editor**

### Passo 2: Execute este script

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir deleção de produtos" ON products;

-- Criar políticas que permitem todas as operações (desenvolvimento)
CREATE POLICY "Permitir inserção de produtos" ON products 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de produtos" ON products 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir deleção de produtos" ON products 
  FOR DELETE 
  USING (true);
```

**OU** use o arquivo `APLICAR-POLITICAS-RLS-PRODUTOS.sql` que já está pronto.

### Passo 3: Teste novamente
1. Tente editar um produto existente
2. Altere a descrição
3. Adicione/remova imagens
4. Salve

## Arquivos Modificados

✅ `web/src/app/api/products/route.ts` - Adicionado `additional_images` e `updated_at` ao SELECT
✅ `web/src/app/admin/page.tsx` - Corrigido mapeamento de campos e inicialização de edição
✅ `web/APLICAR-POLITICAS-RLS-PRODUTOS.sql` - Script SQL pronto para aplicar

## Verificação

Após aplicar o script SQL, verifique:

1. ✅ Consegue criar produtos? (já estava funcionando)
2. ✅ Consegue editar produtos?
3. ✅ Consegue alterar descrição?
4. ✅ Consegue adicionar/remover imagens?
5. ✅ Consegue salvar as alterações?

## Se ainda não funcionar

1. Abra o Console do Navegador (F12)
2. Tente editar um produto
3. Veja se há erros no console
4. Verifique se há erros relacionados a:
   - "permission denied"
   - "row-level security"
   - "policy violation"

Se aparecer algum desses erros, significa que as políticas RLS não foram aplicadas corretamente.

## Nota Importante

O script acima usa políticas sem autenticação (mais permissivas). Se você quiser usar políticas com autenticação de admin, descomente a seção "OPÇÃO 1" no arquivo `APLICAR-POLITICAS-RLS-PRODUTOS.sql` e comente a "OPÇÃO 2".

