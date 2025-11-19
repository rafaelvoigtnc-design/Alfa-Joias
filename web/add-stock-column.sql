-- ============================================
-- ALFA JÓIAS - Adicionar Coluna Stock
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para adicionar a coluna stock na tabela products
-- ============================================

-- Adicionar coluna stock se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    COMMENT ON COLUMN products.stock IS 'Quantidade em estoque do produto';
  END IF;
END $$;

-- Criar índice para melhor performance nas consultas de estoque
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock IS NOT NULL;








