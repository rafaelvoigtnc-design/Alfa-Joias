-- ============================================
-- ALFA JÓIAS - Adicionar Campos de Entrega e Avaliações
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para adicionar campos de entrega/retirada e sistema de avaliações
-- ============================================

-- Adicionar campo delivery_method na tabela orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'pickup' CHECK (delivery_method IN ('delivery', 'pickup')),
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela de avaliações (reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name TEXT,
  customer_email TEXT,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

-- Habilitar RLS para reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Política: Reviews aprovados são visíveis publicamente
CREATE POLICY "Reviews aprovados são visíveis publicamente" ON reviews 
  FOR SELECT USING (approved = true);

-- Política: Usuários podem criar suas próprias avaliações
CREATE POLICY "Usuários podem criar avaliações" ON reviews 
  FOR INSERT WITH CHECK (true);

-- Política: Admins podem gerenciar todas as avaliações
CREATE POLICY "Admins podem gerenciar avaliações" ON reviews 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Função para calcular rating médio do produto
CREATE OR REPLACE FUNCTION calculate_product_rating(product_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
  SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
  FROM reviews
  WHERE product_id = product_uuid AND approved = true;
$$ LANGUAGE SQL;










