// Dados iniciais para teste do sistema

export const initialProducts = [
  {
    id: '1',
    name: 'Anel de Ouro com Diamante',
    category: 'Joias',
    brand: 'Alfa Jóias',
    price: 'R$ 1.200,00',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    description: 'Anel elegante em ouro 18k com diamante central',
    featured: true,
    on_sale: true,
    original_price: 'R$ 1.200,00',
    discount_percentage: 20,
    sale_price: 'R$ 960,00',
    gender: 'Feminino',
    model: 'Clássico'
  },
  {
    id: '2',
    name: 'Relógio Masculino Clássico',
    category: 'Relógios',
    brand: 'Alfa Jóias',
    price: 'R$ 800,00',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    description: 'Relógio masculino com pulseira de couro',
    featured: true,
    on_sale: true,
    original_price: 'R$ 800,00',
    discount_percentage: 15,
    sale_price: 'R$ 680,00',
    gender: 'Masculino',
    model: 'Clássico'
  },
  {
    id: '3',
    name: 'Óculos de Sol Premium',
    category: 'Óculos',
    brand: 'Alfa Jóias',
    price: 'R$ 350,00',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
    description: 'Óculos de sol com lentes polarizadas',
    featured: true,
    on_sale: true,
    original_price: 'R$ 350,00',
    discount_percentage: 25,
    sale_price: 'R$ 262,50',
    gender: 'Unissex',
    model: 'Moderno'
  },
  {
    id: '4',
    name: 'Pulseira Semi-Joias',
    category: 'Semi-Joias',
    brand: 'Alfa Jóias',
    price: 'R$ 150,00',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    description: 'Pulseira elegante em semi-joias',
    featured: false,
    on_sale: false,
    gender: 'Feminino',
    model: 'Moderno'
  }
]

// APENAS 4 CATEGORIAS CORRETAS
export const initialCategories = [
  {
    id: '1',
    name: 'Joias',
    description: 'Anéis, colares, brincos e pulseiras em ouro e prata',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
    icon: 'gem'
  },
  {
    id: '2',
    name: 'Relógios',
    description: 'Relógios masculinos e femininos das melhores marcas',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    icon: 'clock'
  },
  {
    id: '3',
    name: 'Óculos',
    description: 'Óculos de sol e grau com tecnologia avançada',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
    icon: 'eye'
  },
  {
    id: '4',
    name: 'Semi-Joias',
    description: 'Bijuterias elegantes e acessórios modernos',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
    icon: 'diamond'
  }
]

export const initialBanners = [
  {
    id: '1',
    title: 'Alfa Jóias',
    subtitle: 'A Vitrine dos seus Olhos',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=800&fit=crop',
    cta_text: 'Explorar',
    cta_link: '/produtos',
    active: true
  },
  {
    id: '2',
    title: 'Promoções Especiais',
    subtitle: 'Até 50% de desconto em produtos selecionados',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=800&fit=crop',
    cta_text: 'Ver Ofertas',
    cta_link: '/produtos?promocao=true',
    active: true
  }
]

export const initialServices = [
  {
    id: '1',
    title: 'Manutenção de Relógios',
    description: 'Reparos e ajustes em relógios de todas as marcas',
    features: ['Troca de bateria', 'Ajuste de pulseira', 'Limpeza interna'],
    whatsappMessage: 'Olá! Gostaria de solicitar informações sobre manutenção de relógios. Podem me ajudar?'
  },
  {
    id: '2',
    title: 'Ajustes de Óculos',
    description: 'Ajustes precisos para melhor conforto e visual',
    features: ['Ajuste de hastes', 'Correção de posição', 'Troca de lentes'],
    whatsappMessage: 'Olá! Gostaria de solicitar informações sobre ajustes de óculos. Podem me ajudar?'
  },
  {
    id: '3',
    title: 'Garantia Estendida',
    description: 'Garantia adicional em produtos e serviços',
    features: ['Garantia de 1 ano', 'Suporte técnico', 'Troca sem burocracia'],
    whatsappMessage: 'Olá! Gostaria de solicitar informações sobre garantia estendida. Podem me ajudar?'
  }
]

export const initialBrands = [
  {
    id: '1',
    name: 'Rolex',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=100&fit=crop',
    active: true
  },
  {
    id: '2',
    name: 'Cartier',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=100&fit=crop',
    active: true
  },
  {
    id: '3',
    name: 'Ray-Ban',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=100&fit=crop',
    active: true
  },
  {
    id: '4',
    name: 'Omega',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=100&fit=crop',
    active: true
  },
  {
    id: '5',
    name: 'Tiffany & Co',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=100&fit=crop',
    active: true
  },
  {
    id: '6',
    name: 'Oakley',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=100&fit=crop',
    active: true
  }
]





