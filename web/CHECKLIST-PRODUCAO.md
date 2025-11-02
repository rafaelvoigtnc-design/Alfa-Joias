# ✅ CHECKLIST PRÉ-PRODUÇÃO - ALFA JÓIAS

## 🔐 CONFIGURAÇÃO DE AMBIENTE

### Variáveis de Ambiente (OBRIGATÓRIO)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada na Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada na Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` configurada (opcional, padrão: https://alfajoias.com.br)

**Como configurar na Vercel:**
1. Vá em Settings → Environment Variables
2. Adicione as variáveis acima
3. Selecione: Production, Preview e Development
4. Faça o deploy novamente

---

## 🗄️ BANCO DE DADOS (Supabase)

### Configurações Necessárias
- [x] Tabelas criadas (products, categories, brands, banners, services, users, orders)
- [ ] Row Level Security (RLS) configurado nas tabelas
- [ ] Políticas de acesso configuradas:
  - [ ] `products` - SELECT público, INSERT/UPDATE apenas para admins
  - [ ] `orders` - SELECT apenas para o dono do pedido ou admin
  - [ ] `users` - SELECT apenas para o próprio usuário ou admin
  - [ ] `banners` - SELECT público
  - [ ] `brands` - SELECT público
  - [ ] `categories` - SELECT público
  - [ ] `services` - SELECT público
- [ ] Storage configurado para upload de imagens (se usar Supabase Storage)

### Google OAuth
- [ ] Client ID e Secret configurados no Supabase
- [ ] Redirect URL configurado: `https://seu-dominio.com/auth/callback`
- [ ] Autorized Redirect URIs no Google Cloud Console incluem o domínio de produção

---

## 🌐 CONFIGURAÇÃO DE DOMÍNIO

### URLs Hardcoded
- [x] `metadataBase` usa variável de ambiente (corrigido)
- [x] `sitemap.ts` usa domínio correto
- [x] `robots.txt` atualizado
- [ ] Verificar se há outras referências a localhost no código

### Supabase
- [ ] Redirect URLs do Supabase incluem domínio de produção
- [ ] Site URL configurada no Supabase Settings

---

## 📄 PÁGINAS E ROTAS

### Páginas Principais
- [x] Home (`/`)
- [x] Produtos (`/produtos`)
- [x] Produto Individual (`/produto/[id]`)
- [x] Promoções (`/promocoes`)
- [x] Serviços (`/servicos`)
- [x] Contato (`/contato`)
- [x] Login (`/login`)
- [x] Carrinho (`/carrinho`)
- [x] Checkout (`/checkout`)
- [x] Pedidos (`/pedidos`)
- [x] Pedido Confirmado (`/pedido-confirmado`)
- [x] Admin (`/admin`)
- [x] Página 404 (`/not-found`)

### Funcionalidades Críticas
- [x] Autenticação (Email + Google)
- [x] Carrinho persistente
- [x] Checkout via WhatsApp
- [x] Múltiplas imagens por produto
- [x] Seleção de imagem de capa
- [x] Novas categorias (Carteiras, Cintos, Bebidas, Acessórios, Outros)
- [x] Avaliação via WhatsApp
- [x] Admin completo

---

## 🔒 SEGURANÇA

### Headers HTTP
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] X-XSS-Protection
- [x] Strict-Transport-Security (HSTS)
- [x] Referrer-Policy
- [x] Permissions-Policy

### Validação
- [x] Validação de inputs no frontend
- [ ] Validação no backend/Supabase (RLS)
- [ ] Sanitização de dados

### Autenticação
- [x] Sistema de admin funcional
- [ ] Verificar permissões de admin no Supabase
- [ ] Senhas seguras (política no Supabase)

---

## 📱 RESPONSIVIDADE

### Mobile
- [x] Header responsivo
- [x] Produtos 2 por linha no mobile
- [x] Serviços 3 por linha no mobile
- [x] Carrinho responsivo
- [x] Checkout responsivo
- [x] Admin responsivo (produtos 2 por linha)
- [x] Fonte otimizada para mobile
- [x] Touch targets adequados (mínimo 44x44px)

### Desktop
- [x] Layout otimizado
- [x] Navegação completa
- [x] Admin funcional

---

## ⚡ PERFORMANCE

### Otimizações
- [x] Imagens otimizadas (WebP, AVIF)
- [x] Cache de imagens (1 ano)
- [x] Compressão habilitada
- [x] SWC minification
- [x] API routes com cache adequado
- [ ] Lazy loading de componentes (verificar se necessário)

### Build
- [ ] `npm run build` executa sem erros
- [ ] Nenhum warning crítico no build
- [ ] Todas as páginas geram corretamente

---

## 🔍 SEO

### Meta Tags
- [x] Title e description configurados
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Robots meta tags
- [x] Canonical URLs (via metadataBase)

### Outros
- [x] Sitemap dinâmico (`/sitemap.ts`)
- [x] Robots.txt (`/public/robots.txt`)
- [x] Estrutura semântica HTML
- [ ] Verificar se há conteúdo duplicado

---

## 🧪 TESTES FINAIS

### Antes do Deploy
- [ ] Testar login/cadastro
- [ ] Testar carrinho completo
- [ ] Testar checkout
- [ ] Testar admin (CRUD de produtos)
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari, Edge)
- [ ] Testar em dispositivos móveis reais
- [ ] Testar modo offline (PWA)
- [ ] Verificar console do navegador (sem erros críticos)

### Após o Deploy
- [ ] Site carrega corretamente
- [ ] Autenticação funciona
- [ ] Supabase conecta
- [ ] Imagens carregam
- [ ] WhatsApp abre corretamente
- [ ] Admin acessível apenas para admins
- [ ] SSL/HTTPS funcionando

---

## 📝 DOCUMENTAÇÃO

### Arquivos Disponíveis
- [x] README.md
- [x] DEPLOY-VERCEL.md
- [x] CONFIGURAR-SUPABASE.md
- [x] CONFIGURAR-GOOGLE-OAUTH.md
- [x] CHECKLIST-PRODUCAO.md (este arquivo)

---

## ⚠️ PONTOS DE ATENÇÃO

### Antes de Colocar no Ar

1. **Variáveis de Ambiente:**
   - Configure TODAS na Vercel antes do primeiro deploy
   - NUNCA commite `.env.local` no Git

2. **Supabase RLS:**
   - Teste permissões antes de ir ao ar
   - Verifique se usuários não-admin não podem acessar dados sensíveis

3. **Google OAuth:**
   - Configure redirect URLs para produção
   - Teste login com Google após deploy

4. **WhatsApp:**
   - Verifique número do WhatsApp (5555991288464) - está correto?
   - Teste envio de mensagens

5. **Domínio:**
   - Se usar domínio próprio, configure DNS antes
   - Aguarde propagação DNS (pode levar até 48h)

6. **Backup:**
   - Faça backup do banco antes de grandes mudanças
   - Documente configurações importantes

---

## 🚀 DEPLOY

### Passos para Deploy na Vercel

1. **GitHub:**
   ```bash
   git add .
   git commit -m "Preparação para produção"
   git push origin main
   ```

2. **Vercel:**
   - Importar projeto do GitHub
   - Root Directory: `web`
   - Framework: Next.js (detectado automaticamente)
   - Adicionar variáveis de ambiente
   - Clicar em "Deploy"

3. **Aguardar:**
   - Build leva ~2-5 minutos
   - Verificar logs de build

4. **Testar:**
   - Acessar URL fornecida pela Vercel
   - Testar todas as funcionalidades principais

---

## ✅ STATUS ATUAL

- ✅ Página 404 criada
- ✅ Metadata base configurado
- ✅ Sitemap atualizado com novas categorias
- ✅ Configuração de imagens do Supabase
- ✅ Headers de segurança configurados
- ✅ Responsividade mobile completa
- ✅ Funcionalidades principais implementadas
- ⚠️ Verificar RLS no Supabase (importante!)
- ⚠️ Configurar variáveis de ambiente na Vercel
- ⚠️ Testar build antes do deploy

---

## 📞 SUPORTE

**Documentação:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

**Problemas Comuns:**
- Build falha: Verificar variáveis de ambiente
- Erro 500: Verificar logs da Vercel
- Imagens não carregam: Verificar remotePatterns no next.config.js
- Auth não funciona: Verificar redirect URLs no Supabase

---

**Última atualização:** $(date)
**Status:** ✅ Pronto para produção (após configurar variáveis de ambiente e RLS)

