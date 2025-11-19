import { Phone, MapPin, Clock, Instagram, Mail, MessageCircle, Award, Wrench, Settings, Battery, Shield } from 'lucide-react'

export default function Contato() {
  const stats = [
    { icon: Award, label: 'Anos de Experiência', value: '25+' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos prontos para atender você! Venha nos visitar ou entre em contato conosco
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
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

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Informações de Contato
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefone / WhatsApp</h3>
                    <a 
                      href="tel:+5555991288464" 
                      className="text-gray-600 hover:text-gray-800 transition-colors text-lg"
                    >
                      (55) 9 9912-88464
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      Atendimento via WhatsApp disponível
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Endereço</h3>
                    <p className="text-gray-600">
                      Av. Santa Clara 137, Centro<br />
                      Nova Candelária - RS
                    </p>
                    <a
                      href="https://maps.google.com/?q=Av.+Santa+Clara+137,+Nova+Candelária,+RS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition-colors text-sm mt-1 inline-block"
                    >
                      Ver no Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Horários de Funcionamento</h3>
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
                    <h3 className="font-semibold text-gray-900 mb-1">Instagram</h3>
                    <a 
                      href="https://instagram.com/alfajoiasnc" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      @alfajoiasnc
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      Siga-nos para novidades e promoções
                    </p>
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
                className="btn-animated w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chamar no WhatsApp</span>
              </a>
              
              <a
                href="tel:+5555991288464"
                className="btn-animated w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Ligar Agora</span>
              </a>
            </div>
          </div>

          {/* Map and Additional Info */}
          <div className="space-y-8">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Nossa Localização
              </h3>
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Av. Santa Clara 137, Centro</p>
                  <p className="text-gray-600 mb-4">Nova Candelária - RS</p>
                  <a
                    href="https://maps.google.com/?q=Av.+Santa+Clara+137,+Nova+Candelária,+RS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    Ver no Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Sobre a Alfa Jóias
              </h3>
              <p className="text-gray-600 mb-4">
                Há mais de 25 anos, a Alfa Jóias é referência em ótica, relojoaria e joalheria 
                em Nova Candelária-RS. Nossa missão é oferecer produtos de qualidade e 
                atendimento personalizado para cada cliente.
              </p>
              <p className="text-gray-600">
                Com uma equipe especializada e produtos das melhores marcas, garantimos 
                satisfação total e durabilidade em cada compra. Venha nos conhecer e 
                descubra por que somos a escolha certa para seus acessórios.
              </p>
            </div>

            {/* Services Preview */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Nossos Serviços
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Wrench className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Manutenção</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Settings className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Ajustes</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Battery className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Troca de Bateria</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Garantia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
