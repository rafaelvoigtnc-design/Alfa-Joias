-- ============================================
-- REMOVER TODOS OS PRODUTOS DO BANCO DE DADOS
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para deletar TODOS os produtos
-- ============================================

-- Deletar TODOS os produtos
DELETE FROM products;

-- Verificar se foi deletado (deve retornar 0)
-- SELECT COUNT(*) as produtos_restantes FROM products;

-- ============================================
-- ATENÇÃO: Esta ação é IRREVERSÍVEL!
-- Todos os produtos serão permanentemente removidos.
-- ============================================

