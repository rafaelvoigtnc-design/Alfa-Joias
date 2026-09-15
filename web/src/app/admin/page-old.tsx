'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Admin() {
  const router = useRouter()

  useEffect(() => {
    // Admin page temporarily disabled during Firebase migration
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Área administrativa temporariamente desabilitada</h1>
        <p className="text-gray-600 mb-6">Página de admin está sendo migrada para Firebase.</p>
        <p className="text-gray-500">Redirecionando para a página inicial...</p>
      </div>
    </div>
  )
}
