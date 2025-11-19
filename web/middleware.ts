import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Desabilitar cache para rotas de API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-Cache-Status', 'BYPASS')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes
     * Exclude static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
    '/api/:path*',
  ],
}

