/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Cloudflare Pages
  // Usando @cloudflare/next-on-pages para suporte completo
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Desabilitar ESLint durante build para evitar falhas por warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desabilitar verificação de tipos durante build se necessário
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 ano
  },
  // Otimizações de performance
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Cache otimizado - desabilitar em desenvolvimento
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Desabilitar cache em desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    generateBuildId: async () => {
      return `dev-${Date.now()}`
    }
  }),
  // Configuração para Cloudflare Pages - desabilitar cache do webpack completamente
  webpack: (config, { isServer, dev, webpack }) => {
    // Desabilitar completamente o cache do webpack (tanto client quanto server)
    // Isso evita gerar arquivos .pack grandes que excedem o limite do Cloudflare
    config.cache = false
    
    // Em desenvolvimento, forçar recompilação completa
    if (dev) {
      config.cache = false
      // Desabilitar cache de módulos
      config.module = config.module || {}
      config.module.unsafeCache = false
    }
    
    // Remover configurações de cache persistent
    if (config.optimization) {
      config.optimization.moduleIds = 'deterministic'
      config.optimization.chunkIds = 'deterministic'
    }
    
    // Desabilitar cache filesystem
    if (config.cache && typeof config.cache === 'object' && config.cache.type) {
      config.cache = false
    }
    
    return config
  },
  // Headers de segurança e cache
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Desabilitar cache em desenvolvimento
          ...(process.env.NODE_ENV === 'development' ? [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
            },
            {
              key: 'Pragma',
              value: 'no-cache'
            },
            {
              key: 'Expires',
              value: '0'
            }
          ] : []),
          // Segurança
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Não force Content-Type globalmente; deixa o Next definir por recurso (JS/CSS/JSON)
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig