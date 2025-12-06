-- ============================================
-- POLÍTICAS RLS PARA TABELA BANNERS
-- ============================================
-- 
-- IMPORTANTE: Execute este SQL no Supabase Dashboard
-- Vá em: SQL Editor > New Query > Cole este código > Run
--
-- ============================================

-- 1. Habilitar RLS na tabela banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se houver)
DROP POLICY IF EXISTS "Allow public read access" ON banners;
DROP POLICY IF EXISTS "Banners are viewable by everyone" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;

-- 3. Política: Todos podem VER banners ativos (para exibição no site)
CREATE POLICY "Allow public read access"
ON banners
FOR SELECT
TO public
USING (active = true);

-- 4. Política: Usuários autenticados que são admin podem ver todos os banners
CREATE POLICY "Admins can view all banners"
ON banners
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- 5. Política: Apenas admins podem INSERIR banners
CREATE POLICY "Admins can insert banners"
ON banners
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- 6. Política: Apenas admins podem ATUALIZAR banners
CREATE POLICY "Admins can update banners"
ON banners
FOR UPDATE
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

-- 7. Política: Apenas admins podem DELETAR banners
CREATE POLICY "Admins can delete banners"
ON banners
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- 
-- Para verificar se as políticas foram criadas corretamente:
-- SELECT * FROM pg_policies WHERE tablename = 'banners';
--
-- ============================================





