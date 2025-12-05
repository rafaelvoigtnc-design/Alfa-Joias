# 📥 Instruções para Importar Produtos de Planilha

Este script permite importar produtos (relógios, joias, etc.) de uma planilha CSV diretamente para o banco de dados Supabase.

## 📋 Pré-requisitos

1. Ter o arquivo `.env.local` configurado com:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. Ter o arquivo `produtos.csv` na pasta `web/`

## 📝 Formato da Planilha CSV

A planilha deve ter as seguintes colunas (separadas por vírgula):

| Coluna | Obrigatório | Descrição | Exemplo |
|--------|-------------|-----------|---------|
| `name` | ✅ Sim | Nome do produto | Relógio Rolex Submariner |
| `category` | ✅ Sim | Categoria | Relógios |
| `brand` | ✅ Sim | Marca | Rolex |
| `price` | ✅ Sim | Preço (formato BR ou US) | 45000 ou 45.000,00 |
| `image` | ⚠️ Recomendado | URL da imagem | https://exemplo.com/imagem.jpg |
| `description` | ⚠️ Recomendado | Descrição do produto | Relógio submariner... |
| `stock` | ❌ Opcional | Estoque (número) | 5 |
| `gender` | ❌ Opcional | Gênero | Masculino, Feminino |
| `model` | ❌ Opcional | Modelo | Submariner |
| `featured` | ❌ Opcional | Em destaque (true/false) | true |
| `on_sale` | ❌ Opcional | Em promoção (true/false) | true |
| `original_price` | ❌ Opcional | Preço original (se em promoção) | 50000 |
| `discount_percentage` | ❌ Opcional | Percentual de desconto | 10 |
| `sale_price` | ❌ Opcional | Preço promocional | 45000 |

### Exemplo de CSV:

```csv
name,category,brand,price,image,description,stock,gender,model,featured,on_sale,original_price,discount_percentage,sale_price
Relógio Rolex Submariner,Relógios,Rolex,45000,https://exemplo.com/imagem.jpg,Relógio submariner original,3,Masculino,Submariner,true,false,,,
Relógio Omega Seamaster,Relógios,Omega,25000,https://exemplo.com/imagem2.jpg,Relógio elegante,5,Masculino,Seamaster,false,true,30000,17,25000
```

## 🚀 Como Usar

1. **Prepare sua planilha:**
   - Salve como CSV (separado por vírgula)
   - Coloque na pasta `web/` com o nome `produtos.csv`
   - Verifique se todas as colunas obrigatórias estão preenchidas

2. **Execute o script:**
   ```bash
   cd web
   node scripts/import-products.js
   ```

3. **Aguarde a importação:**
   - O script mostrará o progresso
   - Produtos serão inseridos em lotes de 10
   - Você verá um resumo no final

## ⚠️ Observações Importantes

- **Preços**: Podem estar no formato brasileiro (R$ 45.000,00) ou americano (45000). O script normaliza automaticamente.
- **Imagens**: Use URLs válidas. Se não tiver, deixe vazio (mas é recomendado ter imagens).
- **Categoria**: Deve ser uma das categorias existentes no banco (ex: "Relógios", "Joias", "Óculos", "Semi-Joias").
- **Marca**: Se a marca não existir, será criada automaticamente (mas é melhor criar antes no painel admin).

## 🔍 Verificar Resultado

Após a importação, você pode:
1. Acessar o painel admin (`/admin`)
2. Verificar a lista de produtos
3. Verificar se aparecem na página de produtos (`/produtos`)

## ❌ Resolver Problemas

**Erro: "Arquivo não encontrado"**
- Verifique se o arquivo está em `web/produtos.csv`
- Verifique se o nome está correto (case-sensitive)

**Erro: "Variáveis de ambiente não configuradas"**
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis estão corretas

**Erro ao inserir produtos**
- Verifique se a categoria existe no banco
- Verifique se os campos obrigatórios estão preenchidos
- Verifique a conexão com o Supabase

## 📞 Suporte

Se tiver problemas, verifique:
1. Console do script para mensagens de erro
2. Logs do Supabase
3. Estrutura da planilha (compare com o exemplo)

