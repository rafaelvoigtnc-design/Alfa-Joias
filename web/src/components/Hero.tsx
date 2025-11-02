import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-white">
      {/* Carousel placeholder background */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sua vitrine de Ótica, Relojoaria e Joalheria
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Qualidade, atendimento e estilo em um só lugar, em Nova Candelária.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://wa.me/5555991288464"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-animated bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2 shadow-lg"
              >
                <Phone className="h-5 w-5" />
                Falar no WhatsApp
              </a>
              <Link
                href="/produtos"
                className="btn-animated bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2 shadow-lg"
              >
                Ver Produtos
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
