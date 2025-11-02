-- Script para adicionar dados iniciais ao banco Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. ADICIONAR MARCAS INICIAIS
INSERT INTO brands (name, image, active, created_at, updated_at) VALUES
('Rolex', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=100&fit=crop', true, NOW(), NOW()),
('Cartier', 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=200&h=100&fit=crop', true, NOW(), NOW()),
('Omega', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&h=100&fit=crop', true, NOW(), NOW()),
('TAG Heuer', 'https://images.unsplash.com/photo-1523170335258-f5c6b6c2c55bf1?w=200&h=100&fit=crop', true, NOW(), NOW()),
('Ray-Ban', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=100&fit=crop', true, NOW(), NOW()),
('Oakley', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=100&fit=crop', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. ADICIONAR BANNERS INICIAIS
INSERT INTO banners (title, subtitle, image, cta_text, cta_link, active, created_at, updated_at) VALUES
('Alfa Jóias', 'A Vitrine dos seus Olhos', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=800&fit=crop', 'Explorar', '/produtos', true, NOW(), NOW()),
('Promoções Especiais', 'Até 50% de desconto', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop', 'Ver Ofertas', '/promocoes', true, NOW(), NOW()),
('Serviços Especializados', 'Manutenção e reparos', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop', 'Conhecer', '/servicos', true, NOW(), NOW())
ON CONFLICT (title) DO NOTHING;

-- 3. VERIFICAR SE AS CATEGORIAS JÁ EXISTEM (devem ter sido criadas pelo supabase-setup.sql)
-- Se não existirem, adicionar:
INSERT INTO categories (name, description, image, icon, created_at, updated_at) VALUES
('Joias', 'Anéis, colares, brincos e pulseiras em ouro e prata', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop', 'gem', NOW(), NOW()),
('Relógios', 'Relógios masculinos e femininos das melhores marcas', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', 'clock', NOW(), NOW()),
('Óculos', 'Óculos de sol e grau com tecnologia avançada', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop', 'eye', NOW(), NOW()),
('Semi-Joias', 'Bijuterias elegantes e acessórios modernos', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop', 'diamond', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. ADICIONAR PRODUTOS INICIAIS (se não existirem)
INSERT INTO products (name, category, brand, price, image, description, featured, on_sale, original_price, discount_percentage, sale_price, stock, created_at, updated_at) VALUES
('Anel de Ouro 18k', 'Joias', 'Cartier', 'R$ 2.500,00', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop', 'Anel de ouro 18k com design elegante e sofisticado', true, false, null, null, null, 10, NOW(), NOW()),
('Relógio Rolex Submariner', 'Relógios', 'Rolex', 'R$ 45.000,00', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop', 'Relógio submariner original Rolex com resistência à água', true, false, null, null, null, 3, NOW(), NOW()),
('Óculos Ray-Ban Aviador', 'Óculos', 'Ray-Ban', 'R$ 800,00', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop', 'Óculos de sol aviador clássico com lentes polarizadas', false, true, 'R$ 1.200,00', 33, 'R$ 800,00', 15, NOW(), NOW()),
('Pulseira Semi-Joia', 'Semi-Joias', 'Cartier', 'R$ 350,00', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop', 'Pulseira elegante em semi-joia com design moderno', false, false, null, null, null, 25, NOW(), NOW()),
('Colar de Prata', 'Joias', 'Cartier', 'R$ 1.200,00', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop', 'Colar de prata 925 com pingente em formato de coração', false, true, 'R$ 1.800,00', 33, 'R$ 1.200,00', 8, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 5. ADICIONAR SERVIÇOS INICIAIS (se não existirem)
INSERT INTO services (title, description, features, whatsapp_message, created_at, updated_at) VALUES
('Limpeza e Polimento', 'Cuidado especializado para manter suas jóias sempre brilhando', 
 ARRAY['Limpeza profunda', 'Polimento profissional', 'Inspeção de segurança'], 
 'Olá! Gostaria de solicitar o serviço de limpeza e polimento. Podem me ajudar?', NOW(), NOW()),
('Engaste e Montagem', 'Serviço especializado de engaste e montagem de pedras preciosas', 
 ARRAY['Engaste seguro', 'Montagem personalizada', 'Garantia de qualidade'], 
 'Olá! Gostaria de solicitar o serviço de engaste e montagem. Podem me ajudar?', NOW(), NOW()),
('Consultoria em Joalheria', 'Orientação especializada para escolha e compra de jóias', 
 ARRAY['Avaliação de autenticidade', 'Consultoria personalizada', 'Relatório detalhado'], 
 'Olá! Gostaria de solicitar consultoria em joalheria. Podem me ajudar?', NOW(), NOW()),
('Redimensionamento', 'Ajuste perfeito de tamanho para anéis, pulseiras e colares', 
 ARRAY['Redimensionamento preciso', 'Mantém design original', 'Acabamento profissional'], 
 'Olá! Gostaria de solicitar o serviço de redimensionamento. Podem me ajudar?', NOW(), NOW()),
('Reparo e Restauração', 'Restauramos suas peças favoritas com técnicas especializadas', 
 ARRAY['Reparo de danos', 'Restauração completa', 'Materiais originais'], 
 'Olá! Gostaria de solicitar o serviço de reparo e restauração. Podem me ajudar?', NOW(), NOW()),
('Avaliação e Certificação', 'Avaliação profissional para seguro e investimento', 
 ARRAY['Certificado oficial', 'Avaliação detalhada', 'Valor de mercado'], 
 'Olá! Gostaria de solicitar avaliação e certificação. Podem me ajudar?', NOW(), NOW())
ON CONFLICT (title) DO NOTHING;

-- Verificar dados inseridos
SELECT 'Marcas inseridas:' as info, COUNT(*) as quantidade FROM brands;
SELECT 'Banners inseridos:' as info, COUNT(*) as quantidade FROM banners;
SELECT 'Categorias inseridas:' as info, COUNT(*) as quantidade FROM categories;
SELECT 'Produtos inseridos:' as info, COUNT(*) as quantidade FROM products;
SELECT 'Serviços inseridos:' as info, COUNT(*) as quantidade FROM services;







