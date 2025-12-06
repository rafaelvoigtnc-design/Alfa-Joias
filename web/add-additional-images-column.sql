-- ============================================
-- ALFA JÓIAS - Adicionar Coluna additional_images
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para adicionar a coluna additional_images na tabela products
-- ============================================

-- Adicionar coluna additional_images se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'additional_images'
  ) THEN
    ALTER TABLE products ADD COLUMN additional_images JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN products.additional_images IS 'Array de URLs de imagens adicionais do produto';
  END IF;
END $$;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_products_additional_images ON products USING GIN (additional_images) WHERE additional_images IS NOT NULL;



