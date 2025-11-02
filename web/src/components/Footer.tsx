import Link from 'next/link'
import { Phone, MapPin, Clock, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl font-bold">
                <span className="text-gray-600 logo-text">
                  Alf<span className="alpha-symbol">α</span>
                </span>
                <span className="text-gray-600 logo-text ml-2">
                  Jóias
                </span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              A Vitrine dos seus Olhos
            </p>
            <p className="text-gray-400 text-sm">
              Especializada em ótica, relojoaria e joalheria, oferecemos produtos de qualidade 
              e atendimento personalizado em Nova Candelária-RS.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="text-gray-300 hover:text-white transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/servicos" className="text-gray-300 hover:text-white transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <a 
                  href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Gostaria de entrar em contato com a Alfa Jóias.

Podem me ajudar com informações sobre produtos e serviços?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  (55) 9 9912-88464
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-gray-300">
                  Av. Santa Clara 137, Centro<br />
                  Nova Candelária - RS
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <div className="text-gray-300 text-sm">
                  <div>Seg-Sex: 8h-12h e 13h30-18h30</div>
                  <div>Sáb: 8h-12h</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-gray-600" />
                <a 
                  href="https://instagram.com/alfajoiasnc" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  @alfajoiasnc
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Alfa Jóias. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
