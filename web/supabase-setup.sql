-- ============================================
-- ALFA JÓIAS - Setup Completo do Banco de Dados
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para criar todas as tabelas e dados iniciais
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: products (Produtos)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  original_price TEXT,
  discount_percentage INTEGER,
  sale_price TEXT,
  gender TEXT,
  model TEXT,
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABELA: categories (Categorias)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  image TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABELA: banners (Banners do Carrossel)
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  cta_text TEXT,
  cta_link TEXT,
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABELA: brands (Marcas)
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABELA: services (Serviços)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  features JSONB,
  whatsapp_message TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABELA: users (Usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABELA: orders (Pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  products JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(on_sale);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Produtos são visíveis publicamente" ON products FOR SELECT USING (true);
CREATE POLICY "Categorias são visíveis publicamente" ON categories FOR SELECT USING (true);
CREATE POLICY "Banners ativos são visíveis publicamente" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Marcas ativas são visíveis publicamente" ON brands FOR SELECT USING (active = true);
CREATE POLICY "Serviços ativos são visíveis publicamente" ON services FOR SELECT USING (active = true);

-- Políticas de usuários
CREATE POLICY "Usuários podem ver seu próprio perfil" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Permitir inserção de novos usuários" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas de pedidos
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar pedidos" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de produtos (INSERT, UPDATE, DELETE para admins)
-- Se você não tiver sistema de autenticação, descomente as políticas alternativas abaixo
-- e comente estas que requerem autenticação

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
-- ALTERNATIVA: Se não houver autenticação configurada,
-- descomente as políticas abaixo e comente as políticas acima
-- ============================================
-- DROP POLICY IF EXISTS "Admins podem inserir produtos" ON products;
-- DROP POLICY IF EXISTS "Admins podem atualizar produtos" ON products;
-- DROP POLICY IF EXISTS "Admins podem deletar produtos" ON products;
-- 
-- CREATE POLICY "Permitir inserção de produtos" ON products FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Permitir atualização de produtos" ON products FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Permitir deleção de produtos" ON products FOR DELETE USING (true);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- ============================================
-- Esta função cria automaticamente um registro na tabela users
-- quando um novo usuário se registra no auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DADOS INICIAIS - CATEGORIAS (APENAS 4)
-- ============================================
-- Limpar categorias incorretas primeiro
DELETE FROM categories WHERE name NOT IN ('Joias', 'Relógios', 'Óculos', 'Semi-Joias');

-- Inserir as 4 categorias corretas
INSERT INTO categories (name, description, image, icon) VALUES
('Joias', 'Anéis, colares, brincos e pulseiras em ouro e prata com pedras preciosas', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop', 'gem'),
('Relógios', 'Relógios masculinos e femininos das melhores marcas', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', 'clock'),
('Óculos', 'Óculos de sol e grau com tecnologia avançada', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop', 'eye'),
('Semi-Joias', 'Bijuterias elegantes e acessórios modernos', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop', 'diamond')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DADOS INICIAIS - MARCAS
-- ============================================
INSERT INTO brands (name, image, active) VALUES
('Rolex', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=100&fit=crop', true),
('Cartier', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=100&fit=crop', true),
('Ray-Ban', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=100&fit=crop', true),
('Omega', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=100&fit=crop', true),
('Tiffany & Co', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=100&fit=crop', true),
('Oakley', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=100&fit=crop', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DADOS INICIAIS - PRODUTOS
-- ============================================
INSERT INTO products (name, category, brand, price, image, description, featured, on_sale, original_price, discount_percentage, sale_price, gender, model, stock, in_stock) VALUES
('Anel de Ouro com Diamante', 'Joias', 'Alfa Jóias', 'R$ 1.200,00', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop', 'Anel elegante em ouro 18k com diamante central', true, true, 'R$ 1.200,00', 20, 'R$ 960,00', 'Feminino', 'Clássico', 5, true),
('Relógio Masculino Clássico', 'Relógios', 'Alfa Jóias', 'R$ 800,00', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', 'Relógio masculino com pulseira de couro', true, true, 'R$ 800,00', 15, 'R$ 680,00', 'Masculino', 'Clássico', 3, true),
('Óculos de Sol Premium', 'Óculos', 'Alfa Jóias', 'R$ 350,00', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop', 'Óculos de sol com lentes polarizadas', true, true, 'R$ 350,00', 25, 'R$ 262,50', 'Unissex', 'Moderno', 8, true),
('Pulseira Semi-Joias', 'Semi-Joias', 'Alfa Jóias', 'R$ 150,00', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop', 'Pulseira elegante em semi-joias', false, false, 'R$ 150,00', 0, 'R$ 150,00', 'Feminino', 'Moderno', 0, false);

-- ============================================
-- DADOS INICIAIS - BANNERS
-- ============================================
INSERT INTO banners (title, subtitle, image, cta_text, cta_link, active, order_index) VALUES
('Alfa Jóias', 'A Vitrine dos seus Olhos', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=800&fit=crop', 'Explorar', '/produtos', true, 1),
('Promoções Especiais', 'Até 50% de desconto em produtos selecionados', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop', 'Ver Ofertas', '/produtos?promocao=true', true, 2);

-- ============================================
-- DADOS INICIAIS - SERVIÇOS
-- ============================================
INSERT INTO services (title, description, features, whatsapp_message, icon, active) VALUES
('Manutenção de Relógios', 'Reparos e ajustes em relógios de todas as marcas', '["Troca de bateria", "Ajuste de pulseira", "Limpeza interna"]', 'Olá! Gostaria de solicitar informações sobre manutenção de relógios. Podem me ajudar?', 'wrench', true),
('Ajustes de Óculos', 'Ajustes precisos para melhor conforto e visual', '["Ajuste de hastes", "Correção de posição", "Troca de lentes"]', 'Olá! Gostaria de solicitar informações sobre ajustes de óculos. Podem me ajudar?', 'glasses', true),
('Garantia Estendida', 'Garantia adicional em produtos e serviços', '["Garantia de 1 ano", "Suporte técnico", "Troca sem burocracia"]', 'Olá! Gostaria de solicitar informações sobre garantia estendida. Podem me ajudar?', 'shield', true);

-- ============================================
-- SUCESSO!
-- ============================================
-- Banco de dados configurado com sucesso!
-- Todas as tabelas, índices e dados iniciais foram criados.
-- Agora você pode usar o site normalmente.
-- ============================================

