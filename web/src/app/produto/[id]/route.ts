// Route handler para garantir Edge Runtime no Cloudflare Pages
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Este arquivo garante que a rota dinâmica seja tratada corretamente pelo Cloudflare
// A página em si é client-side e não precisa de Edge Runtime

