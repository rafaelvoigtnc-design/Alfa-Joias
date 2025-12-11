-- ============================================
-- CORREÇÃO: Políticas RLS para Produtos (SEM AUTENTICAÇÃO)
-- ============================================
-- Este script adiciona políticas que permitem todas as operações
-- sem verificação de autenticação (para desenvolvimento/testes)
-- ============================================
-- ⚠️ ATENÇÃO: Use este script apenas se as políticas com autenticação
-- não funcionarem ou se você não tiver sistema de autenticação configurado
-- ============================================

-- Remover políticas antigas se existirem (para evitar duplicatas)
DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir deleção de produtos" ON products;

-- Política: Permitir inserção de produtos (sem autenticação)
CREATE POLICY "Permitir inserção de produtos" ON products 
  FOR INSERT 
  WITH CHECK (true);

-- Política: Permitir atualização de produtos (sem autenticação)
CREATE POLICY "Permitir atualização de produtos" ON products 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Política: Permitir deleção de produtos (sem autenticação)
CREATE POLICY "Permitir deleção de produtos" ON products 
  FOR DELETE 
  USING (true);

-- ============================================
-- SUCESSO!
-- ============================================
-- As políticas RLS foram adicionadas com sucesso.
-- Agora é possível criar, editar e deletar produtos sem autenticação.
-- ⚠️ LEMBRE-SE: Estas políticas são menos seguras. Use apenas para desenvolvimento.
-- ============================================

