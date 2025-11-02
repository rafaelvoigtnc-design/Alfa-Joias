import { MapPin, Clock, Phone, Instagram, Award, Users, Star } from 'lucide-react'

export default function About() {
  const stats = [
    { icon: Award, label: 'Anos de Experiência', value: '25+' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Sobre a Alfa Jóias
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6">
              Há mais de 25 anos, a Alfa Jóias é referência em ótica, relojoaria e joalheria 
              em Nova Candelária-RS. Nossa missão é oferecer produtos de qualidade e 
              atendimento personalizado para cada cliente.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
              Com uma equipe especializada e produtos das melhores marcas, garantimos 
              satisfação total e durabilidade em cada compra. Venha nos conhecer e 
              descubra por que somos a escolha certa para seus acessórios.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">
                  Av. Santa Clara 137, Centro - Nova Candelária/RS
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">
                  Seg-Sex: 8h-12h e 13h30-18h30 | Sáb: 8h-12h
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <a 
                  href="tel:+5555991288464" 
                  className="text-gray-700 hover:text-gray-800 transition-colors"
                >
                  (55) 9 9912-88464
                </a>
              </div>
            </div>
          </div>

          {/* Stats and Image */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="flex justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  25+
                </div>
                <div className="text-sm text-gray-600">
                  Anos de Experiência
                </div>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-600 mb-4">
                    <span className="logo-text">
                      Alf<span className="alpha-symbol">α</span>
                    </span>
                    <span className="logo-text ml-2">
                      Jóias
                    </span>
                  </div>
                  <p className="text-lg text-gray-600">
                    A Vitrine dos seus Olhos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
