'use client'

import { useState } from 'react'
import { Mail, Instagram, Phone } from 'lucide-react'
import { logger } from '@/lib/logger'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Newsletter via WhatsApp e Instagram - não precisa de banco
    logger.debug('Newsletter - usuário clicou em redes sociais')
    setEmail('')
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 tracking-wide">
            Não Perca Nossas Promoções
          </h2>
          <div className="w-20 h-0.5 bg-gray-800 mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Fique por dentro das melhores ofertas e novidades exclusivas
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-12 max-w-4xl mx-auto shadow-sm">
          <div className="text-center mb-8">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Fique Conectado
            </h3>
            <p className="text-gray-600 font-light max-w-xl mx-auto">
              Siga-nos nas redes sociais e fique por dentro das melhores ofertas e novidades
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://instagram.com/alfajoiasnc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-8 py-3 transition-all duration-300 font-medium hover:scale-105 active:scale-95 rounded-md"
            >
              <Instagram className="h-5 w-5 mr-2" />
              Seguir no Instagram
            </a>
            <a
              href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Gostaria de receber informações sobre promoções e novidades da Alfa Jóias.

Podem me adicionar na lista de contatos?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 px-8 py-3 transition-all duration-300 font-medium hover:scale-105 active:scale-95 rounded-md"
            >
              <Phone className="h-5 w-5 mr-2" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
