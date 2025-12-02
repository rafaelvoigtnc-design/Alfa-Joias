import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext'
import { SimpleAuthProvider } from '@/contexts/SimpleAuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConnectionStatus from '@/components/ConnectionStatus'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://alfajoias.com.br'),
  title: {
    default: 'Alfa Jóias - A Vitrine dos seus Olhos',
    template: '%s | Alfa Jóias'
  },
  description: 'Ótica, Relojoaria e Joalheria em Nova Candelária-RS. Óculos, relógios, joias e semi-joias das melhores marcas. Atendimento personalizado via WhatsApp.',
  keywords: ['ótica', 'relojoaria', 'joalheria', 'óculos', 'relógios', 'joias', 'semi-joias', 'Nova Candelária', 'RS', 'ouro', 'prata', 'diamante', 'Ray-Ban', 'Oakley', 'Rolex', 'Cartier'],
  authors: [{ name: 'Alfa Jóias', url: 'https://alfajoias.com.br' }],
  creator: 'Alfa Jóias',
  publisher: 'Alfa Jóias',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Alfa Jóias - A Vitrine dos seus Olhos',
    description: 'Joias, relógios, óculos e semi-joias das melhores marcas em Nova Candelária-RS',
    url: 'https://alfajoias.com.br',
    siteName: 'Alfa Jóias',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Alfa Jóias - Joalheria, Relojoaria e Ótica',
      }
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alfa Jóias - A Vitrine dos seus Olhos',
    description: 'Joias, relógios e óculos das melhores marcas',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'shopping',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <SimpleAuthProvider>
          <UnifiedAuthProvider>
            <ConnectionStatus />
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </UnifiedAuthProvider>
        </SimpleAuthProvider>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
      </body>
    </html>
  )
}
