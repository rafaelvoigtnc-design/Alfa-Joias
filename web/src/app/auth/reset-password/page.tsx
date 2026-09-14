'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperação de Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Esta funcionalidade está temporariamente desabilitada durante a migração para Firebase.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}