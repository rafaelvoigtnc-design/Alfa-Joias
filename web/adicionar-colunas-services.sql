-- Script para adicionar as colunas whatsapp_message e icon na tabela services
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna whatsapp_message se não existir
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS whatsapp_message TEXT;

-- Adicionar coluna icon se não existir
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'services'
  AND column_name IN ('whatsapp_message', 'icon')
ORDER BY column_name;

-- Atualizar serviços existentes com valores padrão se necessário
UPDATE services 
SET 
    whatsapp_message = COALESCE(whatsapp_message, 'Olá! Gostaria de solicitar informações sobre ' || title || '. Podem me ajudar?'),
    icon = COALESCE(icon, 'wrench')
WHERE whatsapp_message IS NULL OR icon IS NULL;

-- Verificar dados atualizados
SELECT 
    id,
    title,
    whatsapp_message,
    icon,
    updated_at
FROM services
LIMIT 5;

