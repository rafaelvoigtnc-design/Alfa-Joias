'use client'

import Link from 'next/link'
import { Home, Package, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Página não encontrada</h2>
          <p className="text-gray-600 mt-4">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="h-5 w-5 mr-2" />
            Voltar para o Início
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/produtos"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </Link>
            <Link
              href="/contato"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="h-4 w-4 mr-2" />
              Contato
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

