-- ============================================
-- Script para identificar e remover marcas duplicadas
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR MARCAS DUPLICADAS POR NOME
SELECT 
  name,
  COUNT(*) as quantidade,
  array_agg(id::text) as ids,
  array_agg(created_at::text) as datas_criacao
FROM brands
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 2. VERIFICAR MARCAS DUPLICADAS POR ID (não deveria acontecer, mas vamos verificar)
SELECT 
  id,
  COUNT(*) as quantidade
FROM brands
GROUP BY id
HAVING COUNT(*) > 1;

-- 3. REMOVER DUPLICATAS POR NOME (manter apenas a mais recente)
-- ATENÇÃO: Este script mantém apenas a marca mais recente de cada nome duplicado
-- Execute com cuidado e faça backup antes!

DELETE FROM brands
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at DESC) as rn
    FROM brands
  ) t
  WHERE t.rn > 1
);

-- 4. VERIFICAR RESULTADO APÓS REMOÇÃO
SELECT 
  name,
  COUNT(*) as quantidade
FROM brands
GROUP BY name
HAVING COUNT(*) > 1;

-- Se não retornar nenhuma linha, todas as duplicatas foram removidas!

-- 5. ADICIONAR CONSTRAINT UNIQUE SE NÃO EXISTIR (prevenir duplicatas futuras)
-- Verificar se já existe constraint unique
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'brands' 
  AND constraint_type = 'UNIQUE';

-- Se não existir, criar constraint unique no nome
-- Descomente a linha abaixo se necessário:
-- ALTER TABLE brands ADD CONSTRAINT brands_name_unique UNIQUE (name);

