-- ============================================
-- APLICAR POLÍTICAS RLS PARA PRODUTOS
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para permitir criação e edição de produtos
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir deleção de produtos" ON products;

-- ============================================
-- OPÇÃO 1: COM AUTENTICAÇÃO (Recomendado)
-- ============================================
-- Descomente as linhas abaixo se você tem sistema de autenticação:

-- CREATE POLICY "Admins podem inserir produtos" ON products 
--   FOR INSERT 
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.is_admin = true
--     )
--   );

-- CREATE POLICY "Admins podem atualizar produtos" ON products 
--   FOR UPDATE 
--   USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.is_admin = true
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.is_admin = true
--     )
--   );

-- CREATE POLICY "Admins podem deletar produtos" ON products 
--   FOR DELETE 
--   USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.is_admin = true
--     )
--   );

-- ============================================
-- OPÇÃO 2: SEM AUTENTICAÇÃO (Desenvolvimento)
-- ============================================
-- Use esta opção se a Opção 1 não funcionar ou se não tiver autenticação:

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

-- ============================================
-- SUCESSO!
-- ============================================
-- As políticas foram aplicadas.
-- Agora você pode criar, editar e deletar produtos.
-- ============================================

