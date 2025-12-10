-- ============================================
-- REMOVER TODOS OS RELÓGIOS DO BANCO DE DADOS
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para deletar todos os produtos da categoria "Relógios"
-- ============================================

-- Deletar todos os produtos da categoria "Relógios"
DELETE FROM products 
WHERE category = 'Relógios';

-- Verificar quantos produtos foram deletados
-- (Execute separadamente para ver o resultado)
-- SELECT COUNT(*) as produtos_deletados 
-- FROM products 
-- WHERE category = 'Relógios';

-- ============================================
-- NOTA: Este script NÃO remove a categoria "Relógios"
-- apenas os produtos dessa categoria.
-- Se quiser remover a categoria também, execute:
-- DELETE FROM categories WHERE name = 'Relógios';
-- ============================================

