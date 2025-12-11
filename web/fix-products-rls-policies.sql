-- ============================================
-- CORREÇÃO: Políticas RLS para Produtos
-- ============================================
-- Este script adiciona as políticas de INSERT e UPDATE
-- que estão faltando para permitir que admins gerenciem produtos
-- ============================================

-- Remover políticas antigas se existirem (para evitar duplicatas)
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;

-- Política: Admins podem inserir produtos
CREATE POLICY "Admins podem inserir produtos" ON products 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Política: Admins podem atualizar produtos
CREATE POLICY "Admins podem atualizar produtos" ON products 
  FOR UPDATE 
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

-- Política: Admins podem deletar produtos
CREATE POLICY "Admins podem deletar produtos" ON products 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- ============================================
-- ALTERNATIVA: Se não houver autenticação, permitir todas as operações
-- (Use apenas se não houver sistema de autenticação configurado)
-- ============================================
-- Se as políticas acima não funcionarem (erro de autenticação),
-- descomente as linhas abaixo para permitir operações sem autenticação:
-- 
-- DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
-- DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
-- DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;
-- 
-- CREATE POLICY "Permitir inserção de produtos" ON products FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Permitir atualização de produtos" ON products FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Permitir deleção de produtos" ON products FOR DELETE USING (true);

-- ============================================
-- SUCESSO!
-- ============================================
-- As políticas RLS foram adicionadas com sucesso.
-- Agora admins podem criar, editar e deletar produtos.
-- ============================================

