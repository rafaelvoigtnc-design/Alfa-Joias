import { Phone, MapPin, Clock, Instagram, Mail, MessageCircle } from 'lucide-react'

export default function Contact() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Entre em Contato
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos prontos para atender você! Venha nos visitar ou entre em contato conosco
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Informações de Contato
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Telefone / WhatsApp</h4>
                    <a 
                      href="tel:+5555991288464" 
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      (55) 9 9912-88464
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Endereço</h4>
                    <p className="text-gray-600">
                      Av. Santa Clara 137, Centro<br />
                      Nova Candelária - RS
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Horários de Funcionamento</h4>
                    <div className="text-gray-600">
                      <p>Segunda a Sexta: 8h às 12h e 13h30 às 18h30</p>
                      <p>Sábados: 8h às 12h</p>
                      <p>Domingos: Fechado</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Instagram className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instagram</h4>
                    <a 
                      href="https://instagram.com/alfajoiasnc" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      @alfajoiasnc
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <a
                href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Gostaria de entrar em contato com a Alfa Jóias.

Podem me ajudar com informações sobre produtos e serviços?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chamar no WhatsApp</span>
              </a>
              
              <a
                href="tel:+5555991288464"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Ligar Agora</span>
              </a>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Nossa Localização
            </h3>
            <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Av. Santa Clara 137, Centro</p>
                <p className="text-gray-600">Nova Candelária - RS</p>
                <a
                  href="https://maps.google.com/?q=Av.+Santa+Clara+137,+Nova+Candelária,+RS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 transition-colors text-sm mt-2 inline-block"
                >
                  Ver no Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
