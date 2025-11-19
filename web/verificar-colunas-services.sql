-- Script para verificar se as colunas whatsapp_message e icon existem na tabela services
-- Execute este script no Supabase SQL Editor para verificar

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- Verificar dados atuais (comentado caso as colunas não existam)
-- SELECT 
--     id,
--     title,
--     whatsapp_message,
--     icon,
--     updated_at
-- FROM services
-- LIMIT 5;

-- Se as colunas não existirem, execute o script: adicionar-colunas-services.sql
-- Ou execute diretamente:
-- ALTER TABLE services ADD COLUMN IF NOT EXISTS whatsapp_message TEXT;
-- ALTER TABLE services ADD COLUMN IF NOT EXISTS icon TEXT;

