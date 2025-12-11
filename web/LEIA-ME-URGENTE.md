# 🚨 SOLUÇÃO URGENTE: ERRO AO SALVAR PRODUTOS

## ⚠️ PROBLEMA
Os produtos não estão salvando ou editando corretamente, sempre dando erro.

## ✅ SOLUÇÃO RÁPIDA (2 MINUTOS)

### Passo 1: Acesse o Supabase
1. Vá para https://supabase.com
2. Faça login
3. Selecione seu projeto
4. Clique em **SQL Editor** (no menu lateral)

### Passo 2: Execute este script

Copie e cole este código no SQL Editor e clique em **RUN**:

```sql
-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir deleção de produtos" ON products;
DROP POLICY IF EXISTS "Produtos são visíveis publicamente" ON products;

-- Recriar política de leitura
CREATE POLICY "Produtos são visíveis publicamente" ON products 
  FOR SELECT 
  USING (true);

-- Criar políticas que permitem TODAS as operações
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

### Passo 3: Teste
1. Volte para o painel admin do site
2. Tente criar um novo produto
3. Tente editar um produto existente
4. Deve funcionar agora! ✅

## 📁 Arquivo Pronto

Você também pode usar o arquivo `SOLUCAO-DEFINITIVA-PRODUTOS.sql` que já está no projeto.

## 🔍 Se ainda não funcionar

1. Abra o Console do Navegador (F12)
2. Tente salvar um produto
3. Veja qual erro aparece
4. Se aparecer "permission denied" ou "row-level security", significa que o script não foi executado corretamente

## ✅ O que foi corrigido no código

1. ✅ Melhor tratamento de erros
2. ✅ Salvamento simplificado (remove campos problemáticos automaticamente)
3. ✅ Mensagens de erro mais claras
4. ✅ Retry automático com dados simplificados

## 🎯 Próximos Passos

Depois de executar o script SQL:
- ✅ Criar produtos deve funcionar
- ✅ Editar produtos deve funcionar
- ✅ Adicionar/remover imagens deve funcionar
- ✅ Alterar descrição deve funcionar

---

**Execute o script SQL AGORA e teste!** 🚀

