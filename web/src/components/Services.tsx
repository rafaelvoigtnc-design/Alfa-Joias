'use client'

import { useEffect } from 'react'
import { 
  Wrench, Battery, Settings, Shield, Clock, Award, Gem, Diamond, Watch, 
  ShoppingBag, Box, Gift, Tag, Star, Sparkles, Crown, Heart, Zap, Flame, 
  Leaf, Music, Camera, Gamepad2, Book, Coffee, Beer, Wine, Pizza, Utensils, 
  Car, Plane, Home, Building, Briefcase, Palette, Paintbrush, Scissors, 
  Hammer, Gauge, Cog, User, Users, Smile, ThumbsUp, Bell, Mail, Phone, Truck,
  CheckCircle, Eye, RotateCcw, RefreshCw, FileCheck, ClipboardCheck, Calendar, 
  Timer, FastForward, Stethoscope, Activity, TrendingUp, Target, Layers, 
  FileText, CreditCard, Key, Unlock, Lock
} from 'lucide-react'
import { useSupabaseServices } from '@/hooks/useSupabaseServices'

export default function Services() {
  const { services, loading } = useSupabaseServices()
  
  // Debug
  useEffect(() => {
    if (services.length > 0) {
      console.log('🔍 Services carregados:', services)
      console.log('🔍 Primeiro serviço:', services[0])
      console.log('🔍 Mensagem WhatsApp:', services[0]?.whatsapp_message)
    }
  }, [services])

  const getServiceIcon = (iconName?: string) => {
    const iconMap: { [key: string]: any } = {
      // Manutenção e Reparo
      wrench: Wrench,
      hammer: Hammer,
      scissors: Scissors,
      'rotate-ccw': RotateCcw,
      'refresh-cw': RefreshCw,
      // Relógios e Óculos
      clock: Clock,
      watch: Watch,
      eye: Eye,
      battery: Battery,
      // Qualidade e Garantia
      shield: Shield,
      award: Award,
      'check-circle': CheckCircle,
      'file-check': FileCheck,
      'clipboard-check': ClipboardCheck,
      star: Star,
      crown: Crown,
      // Velocidade e Agilidade
      zap: Zap,
      flame: Flame,
      truck: Truck,
      'fast-forward': FastForward,
      timer: Timer,
      // Serviços Especializados
      settings: Settings,
      cog: Cog,
      gauge: Gauge,
      stethoscope: Stethoscope,
      activity: Activity,
      target: Target,
      // Documentação e Processos
      'file-text': FileText,
      'credit-card': CreditCard,
      key: Key,
      unlock: Unlock,
      lock: Lock,
      calendar: Calendar,
      // Joias e Acessórios
      gem: Gem,
      diamond: Diamond,
      sparkles: Sparkles,
      // Outros
      heart: Heart,
      leaf: Leaf,
      package: Box,
      box: Box,
      gift: Gift,
      'shopping-bag': ShoppingBag,
      tag: Tag,
      music: Music,
      camera: Camera,
      gamepad2: Gamepad2,
      book: Book,
      coffee: Coffee,
      beer: Beer,
      wine: Wine,
      pizza: Pizza,
      utensils: Utensils,
      car: Car,
      plane: Plane,
      home: Home,
      building: Building,
      briefcase: Briefcase,
      palette: Palette,
      paintbrush: Paintbrush,
      user: User,
      users: Users,
      smile: Smile,
      'thumbs-up': ThumbsUp,
      bell: Bell,
      mail: Mail,
      phone: Phone,
      layers: Layers,
      'trending-up': TrendingUp
    }
    
    return iconMap[iconName || 'wrench'] || Wrench
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media screen and (max-width: 640px) {
          /* Descrição - 11px */
          #services-section p.service-card-desc {
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          
          /* Características - 8px (MENOR que descrição) - MÁXIMA ESPECIFICIDADE */
          #services-section ul li span.service-card-feat {
            font-size: 8px !important;
            line-height: 1.2 !important;
            display: inline-block !important;
            -webkit-text-size-adjust: none !important;
            text-size-adjust: none !important;
          }
        }
      `}} />
    <section id="services-section" className="py-20 bg-white">
      {/* Banner de Serviços com Imagem */}
      <div className="relative h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] mb-8 sm:mb-12 md:mb-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/servicos-banner.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4 md:mb-6 tracking-wide">
              Nossos Serviços
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 bg-white mb-3 sm:mb-4 md:mb-6"></div>
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed">
              Oferecemos serviços especializados para manter seus produtos sempre em perfeito estado
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Conheça nossos serviços especializados
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando serviços...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-light">Nenhum serviço cadastrado no banco de dados.</p>
            <p className="text-sm text-gray-400 mt-2">Adicione serviços pelo painel administrativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 lg:gap-8">
            {services.map((service, index) => {
            const IconComponent = getServiceIcon(service.icon)
            return (
              <div
                key={service.id}
                className="bg-white border border-gray-200 md:hover:border-gray-800 transition-all duration-300 p-2 sm:p-2.5 md:p-6 lg:p-8 md:hover:shadow-lg md:hover:-translate-y-1 active:scale-[0.98] touch-manipulation flex flex-col min-h-[240px] sm:min-h-[260px] md:min-h-0"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-1 md:mb-6 flex-shrink-0">
                  <IconComponent className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-8 md:w-8 text-gray-800" />
                </div>

                <h3 className="text-[2.5px] sm:text-[3px] md:text-lg lg:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-0.5 md:mb-4 text-center leading-tight px-0.5">
                  {service.title}
                </h3>

                <p className="text-gray-700 mb-1 sm:mb-1.5 md:mb-4 text-center font-light leading-tight px-0.5 service-card-desc">
                  {service.description}
                </p>

                <ul className="space-y-0.5 mb-1.5 sm:mb-2 md:mb-4">
                  {service.features.slice(0, 2).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-1 text-gray-600">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1 md:w-2 md:h-2 bg-gray-800 rounded-full mt-0.5 flex-shrink-0"></div>
                      <span className="leading-tight service-card-feat">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/5555991288464?text=${encodeURIComponent(service.whatsapp_message || `Olá! Gostaria de solicitar o serviço: ${service.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="service-card-btn w-full bg-gray-800 hover:bg-gray-900 text-white px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-3 rounded font-medium transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 mt-auto"
                  style={{ fontSize: 'inherit' }}
                >
                  <span>Solicitar</span>
                </a>
              </div>
              )
            })}
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="text-center mt-16">
          <div className="bg-gray-50 border border-gray-200 p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Precisa de um serviço específico?
            </h3>
            <p className="text-lg text-gray-600 mb-8 font-light">
              Entre em contato conosco e solicite um orçamento personalizado
            </p>
            <a
              href={`https://wa.me/5555991288464?text=${encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para serviços na Alfa Jóias.

Podem me ajudar com informações sobre os serviços disponíveis?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-3 transition-all duration-300 font-medium hover:scale-105 active:scale-95"
            >
              <span>Solicitar Orçamento</span>
              <Wrench className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
            </a>
          </div>
        </div>
        )}
      </div>
    </section>
    </>
  )
}