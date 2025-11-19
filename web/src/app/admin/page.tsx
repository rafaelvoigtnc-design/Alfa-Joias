'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Settings, Plus, Edit, Trash2, Save, X, Image, Percent, Star, Package, Truck, CheckCircle, Clock, DollarSign, Shield, Lock, Search, Filter,
  Gem, Diamond, Watch, ShoppingBag, Box, Gift, Tag, Award, Sparkles, Crown, Heart, Star as StarIcon, Zap, Flame, Leaf,
  Music, Camera, Gamepad2, Book, Coffee, Beer, Wine, Pizza, Utensils, Car, Plane, Home, Building, Briefcase,
  Palette, Paintbrush, Scissors, Wrench, Hammer, Gauge, Cog, User, Users, Smile, ThumbsUp, Bell, Mail, Phone, Battery,
  RotateCcw, RefreshCw, FileCheck, ClipboardCheck, Calendar, Timer, FastForward, 
  Stethoscope, Activity, TrendingUp, Target, Layers, FileText, CreditCard, Key, Unlock, Lock as LockIcon
} from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import ImageUpload from '@/components/ImageUpload'
import CategoryImageEditor from '@/components/CategoryImageEditor'
import ImageEditor from '@/components/ImageEditor'
import BannerImageEditor from '@/components/BannerImageEditor'
import BrandSelector from '@/components/BrandSelector'
import { useOrders } from '@/hooks/useOrders'
import { useSupabaseServices } from '@/hooks/useSupabaseServices'
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts'
import { useBrands } from '@/hooks/useBrands'
import { useBanners } from '@/hooks/useBanners'
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories'
import { supabase } from '@/lib/supabase'
import WhatsAppNotification from '@/components/WhatsAppNotification'
import { formatPrice } from '@/lib/priceUtils'
import { clearCacheAndReload } from '@/lib/clearCache'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description: string
  detailedDescription?: string
  additionalImages?: string[]
  features?: string[]
  specifications?: { [key: string]: string }
  rating?: number
  reviews?: number
  featured?: boolean
  on_sale?: boolean
  original_price?: string
  discount_percentage?: number
  sale_price?: string
  stock?: number
  inStock?: boolean
  specialPromotion?: boolean
  specialPromotionText?: string
  gender?: string
  model?: string
}

interface Service {
  id: string
  title: string
  description: string
  features: string[]
  whatsapp_message: string
  icon?: string
}

interface Banner {
  id: string
  title: string
  subtitle: string
  image: string
  cta_text: string
  cta_link: string
  active: boolean
  created_at?: string
  updated_at?: string
}

interface Brand {
  id: string
  name: string
  image: string
  active?: boolean
}

export default function Admin() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin, adminLoading } = useUnifiedAuth()
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'banners' | 'brands' | 'categories' | 'orders'>('products')
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { services, addService, updateService, deleteService, refresh: refreshServices } = useSupabaseServices()
  const { banners, addBanner, updateBanner, deleteBanner } = useBanners()
  const [categories, setCategories] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [showBrandForm, setShowBrandForm] = useState(false)
  const [brandImage, setBrandImage] = useState('')
  const [bannerImage, setBannerImage] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [productImages, setProductImages] = useState<string[]>([])
  const [coverImageIndex, setCoverImageIndex] = useState(0)
  const [selectedServiceIcon, setSelectedServiceIcon] = useState<string>('wrench')
  
  // Inicializar bannerImage quando editar banner
  useEffect(() => {
    if (editingBanner && showBannerForm) {
      setBannerImage(editingBanner.image || '')
    } else if (!showBannerForm) {
      setBannerImage('')
    }
  }, [editingBanner, showBannerForm])

  // Log quando o formulário de serviço é aberto/fechado
  useEffect(() => {
    if (showServiceForm && editingService) {
      console.log('📋 Formulário de serviço ABERTO - EDITANDO')
      console.log('📋 Serviço sendo editado:', editingService)
      console.log('📋 Ícone do serviço:', editingService.icon)
      // Inicializar ícone selecionado com o ícone do serviço sendo editado
      setSelectedServiceIcon(editingService.icon || 'wrench')
    } else if (showServiceForm && !editingService) {
      console.log('📋 Formulário de serviço ABERTO - NOVO')
      setSelectedServiceIcon('wrench')
    } else {
      console.log('📋 Formulário de serviço FECHADO')
      setSelectedServiceIcon('wrench')
    }
  }, [showServiceForm, editingService])

  // Inicializar imagens quando editar produto
  useEffect(() => {
    if (editingProduct) {
      const allImages: string[] = []
      if (editingProduct.image) {
        allImages.push(editingProduct.image)
      }
      if (editingProduct.additionalImages && editingProduct.additionalImages.length > 0) {
        allImages.push(...editingProduct.additionalImages)
      }
      setProductImages(allImages)
      setCoverImageIndex(0)
    } else {
      setProductImages([])
      setCoverImageIndex(0)
    }
  }, [editingProduct])
  
  // Controlar estado do checkbox de promoção especial
  useEffect(() => {
    if (showProductForm) {
      const onSaleCheckbox = document.querySelector('input[name="on_sale"]') as HTMLInputElement
      const specialPromotionCheckbox = document.querySelector('input[name="specialPromotion"]') as HTMLInputElement
      
      if (onSaleCheckbox && specialPromotionCheckbox) {
        // Configurar estado inicial
        specialPromotionCheckbox.disabled = !onSaleCheckbox.checked
        
        // Se não está em promoção, desmarcar promoção especial
        if (!onSaleCheckbox.checked) {
          specialPromotionCheckbox.checked = false
          const specialPromotionFields = document.getElementById('specialPromotionFields')
          if (specialPromotionFields) {
            specialPromotionFields.classList.add('hidden')
            specialPromotionFields.classList.remove('block')
          }
        }
      }
    }
  }, [showProductForm, editingProduct])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showWhatsAppNotification, setShowWhatsAppNotification] = useState(false)

  // Verificar acesso de admin
  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        console.log('❌ Usuário não logado, redirecionando para login...')
        router.push('/login')
      } else if (!isAdmin) {
        console.log('❌ Usuário não é admin, redirecionando para conta...')
        router.push('/conta')
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, router])
  
  // Hook para pedidos
  const { orders, loading: ordersLoading, updateOrderStatus, addTrackingNumber, refetch: refetchOrders } = useOrders()
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup')
  
  // Estados para busca e filtros de produtos no admin
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [productFilterCategory, setProductFilterCategory] = useState('Todas')
  const [productFilterBrand, setProductFilterBrand] = useState('Todas')
  const [productFilterStock, setProductFilterStock] = useState<'Todos' | 'Em Estoque' | 'Esgotados'>('Todos')
  const [productFilterOnSale, setProductFilterOnSale] = useState<'Todos' | 'Promoção' | 'Normal'>('Todos')
  const [productFilterFeatured, setProductFilterFeatured] = useState<'Todos' | 'Destaque' | 'Normal'>('Todos')
  const [showProductFilters, setShowProductFilters] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  
  // Hook para produtos do Supabase
  const { products: supabaseProducts, loading: supabaseLoading, addProduct: addSupabaseProduct, updateProduct: updateSupabaseProduct, deleteProduct: deleteSupabaseProduct } = useSupabaseProducts()
  
  // Hook para marcas do Supabase
  const { brands, loading: brandsLoading, addBrand, updateBrand, deleteBrand } = useBrands()
  
  // Hook para categorias do Supabase
  const { categories: supabaseCategories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory, refetch: refetchCategories } = useSupabaseCategories()

  useEffect(() => {
    // SEMPRE usar APENAS Supabase - sem fallback
    if (!supabaseLoading) {
      if (supabaseProducts && supabaseProducts.length > 0) {
        setProducts(supabaseProducts)
        console.log('✅ Produtos carregados do BANCO:', supabaseProducts.length, 'produtos')
        console.log('⭐ Produtos em destaque:', supabaseProducts.filter(p => p.featured).length)
        console.log('🏷️ Produtos em promoção:', supabaseProducts.filter(p => p.on_sale).length)
      } else {
        console.log('⚠️ Nenhum produto no banco de dados')
        setProducts([])
      }
    }
  }, [supabaseProducts, supabaseLoading])

  // Função para normalizar texto (busca sem acentos)
  const normalizeText = (text: string): string => {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  // Aplicar filtros aos produtos
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([])
      return
    }

    let filtered = [...products]

    // Filtro por categoria
    if (productFilterCategory !== 'Todas') {
      filtered = filtered.filter(p => p.category === productFilterCategory)
    }

    // Filtro por marca
    if (productFilterBrand !== 'Todas') {
      filtered = filtered.filter(p => p.brand === productFilterBrand)
    }

    // Filtro por estoque
    if (productFilterStock === 'Esgotados') {
      filtered = filtered.filter(p => (p as any).stock === 0)
    } else if (productFilterStock === 'Em Estoque') {
      filtered = filtered.filter(p => {
        const stock = (p as any).stock
        return stock === undefined || stock > 0
      })
    }

    // Filtro por promoção
    if (productFilterOnSale === 'Promoção') {
      filtered = filtered.filter(p => p.on_sale === true)
    } else if (productFilterOnSale === 'Normal') {
      filtered = filtered.filter(p => !p.on_sale)
    }

    // Filtro por destaque
    if (productFilterFeatured === 'Destaque') {
      filtered = filtered.filter(p => p.featured === true)
    } else if (productFilterFeatured === 'Normal') {
      filtered = filtered.filter(p => !p.featured)
    }

    // Filtro por busca (texto)
    if (productSearchTerm) {
      const normalizedSearch = normalizeText(productSearchTerm)
      filtered = filtered.filter(p => {
        const normalizedName = normalizeText(p.name)
        const normalizedBrand = normalizeText(p.brand || '')
        const normalizedDescription = normalizeText(p.description || '')
        const normalizedCategory = normalizeText(p.category || '')
        
        return normalizedName.includes(normalizedSearch) ||
               normalizedBrand.includes(normalizedSearch) ||
               normalizedDescription.includes(normalizedSearch) ||
               normalizedCategory.includes(normalizedSearch)
      })
    }

    // Ordenar: produtos com estoque primeiro, esgotados no final (exceto se estiver filtrando por "Esgotados")
    if (productFilterStock !== 'Esgotados') {
      filtered.sort((a, b) => {
        const stockA = (a as any).stock
        const stockB = (b as any).stock
        
        // Se ambos têm estoque definido
        if (typeof stockA === 'number' && typeof stockB === 'number') {
          if (stockA === 0 && stockB > 0) return 1 // a esgotado, b em estoque -> b primeiro
          if (stockA > 0 && stockB === 0) return -1 // a em estoque, b esgotado -> a primeiro
        }
        // Se apenas um é esgotado
        if (typeof stockA === 'number' && stockA === 0 && (typeof stockB !== 'number' || stockB > 0)) return 1
        if (typeof stockB === 'number' && stockB === 0 && (typeof stockA !== 'number' || stockA > 0)) return -1
        
        // Se ambos estão em estoque ou ambos sem definição, manter ordem original
        return 0
      })
    }

    setFilteredProducts(filtered)
  }, [products, productSearchTerm, productFilterCategory, productFilterBrand, productFilterStock, productFilterOnSale, productFilterFeatured])

  useEffect(() => {
    // USAR CATEGORIAS DO SUPABASE
    if (!categoriesLoading) {
      if (supabaseCategories && supabaseCategories.length > 0) {
        setCategories(supabaseCategories)
        console.log('✅ Categorias carregadas do BANCO:', supabaseCategories.length, 'categorias')
      } else {
        console.log('⚠️ Nenhuma categoria no banco de dados')
        setCategories([])
      }
    }
  }, [supabaseCategories, categoriesLoading])

  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
      // Disparar evento customizado para notificar outras páginas
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { key, data } 
      }))
    }
  }

  const updateCategoryImage = (categoryId: string, newImageUrl: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, image: newImageUrl } : cat
    )
    setCategories(updatedCategories)
    saveToStorage('alfajoias-categories-images', updatedCategories)
  }


  // Função para normalizar preços (remover formatação e converter para número)
  const normalizePrice = (price: string): string => {
    if (!price) return '0'
    // Remove tudo exceto dígitos, pontos e vírgulas
    const cleaned = price.replace(/[^\d.,]/g, '')
    // Se tem vírgula, substituir por ponto (formato BR -> US)
    const normalized = cleaned.replace(',', '.')
    // Converter para número e voltar para string
    const num = parseFloat(normalized)
    return isNaN(num) ? '0' : num.toString()
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const stock = Math.max(1, parseInt(formData.get('stock') as string) || 1)
    
    // Processar imagens
    const coverImage = formData.get('image') as string || productImages[coverImageIndex] || ''
    const additionalImagesJson = formData.get('additionalImages') as string
    let additionalImages: string[] = []
    
    try {
      if (additionalImagesJson) {
        additionalImages = JSON.parse(additionalImagesJson)
      } else {
        // Se não vem do form, calcular das imagens que não são a capa
        additionalImages = productImages.filter((_, i) => i !== coverImageIndex)
      }
    } catch (e) {
      console.error('Erro ao parsear additionalImages:', e)
      additionalImages = productImages.filter((_, i) => i !== coverImageIndex)
    }
    
    // Preparar dados do produto (remover additionalImages se não existe no banco)
    const productData: any = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      brand: (selectedBrand || formData.get('brand') as string || '').trim() || '',
      price: normalizePrice(formData.get('price') as string),
      image: coverImage,
      description: formData.get('description') as string,
      featured: formData.get('featured') === 'on',
      on_sale: formData.get('on_sale') === 'on',
      original_price: normalizePrice(formData.get('original_price') as string || ''),
      discount_percentage: parseInt(formData.get('discount_percentage') as string) || 0,
      sale_price: normalizePrice(formData.get('sale_price') as string || ''),
      gender: formData.get('gender') as string || '',
      model: formData.get('model') as string || '',
      stock: stock,
    }
    
    // Armazenar imagens adicionais em JSON na descrição ou não salvar por enquanto
    // TODO: Adicionar coluna additional_images na tabela products no Supabase
    // Por enquanto, não salvamos additionalImages para evitar erro

    // Padronização: calcular preço promocional se necessário
    if (productData.on_sale) {
      const original = parseFloat(productData.original_price || productData.price || '0')
      const discount = productData.discount_percentage || 0
      const sale = parseFloat(productData.sale_price || '0')
      if (!sale && original && discount) {
        const calculated = original * (1 - discount / 100)
        productData.sale_price = calculated.toString()
      }
      if (!productData.original_price && original) {
        productData.original_price = original.toString()
      }
    } else {
      // Se não está em promoção, limpar campos de promoção
      productData.original_price = ''
      productData.discount_percentage = 0
      productData.sale_price = ''
    }

    // Validação de dados
    const validation = await import('@/lib/validation').then(m => m.validateProductData(productData))
    if (!validation.valid) {
      alert('Erros de validação:\n' + validation.errors.join('\n'))
      return
    }

    try {
      if (editingProduct) {
        // Atualizar produto APENAS no Supabase
        await updateSupabaseProduct(editingProduct.id, productData)
        console.log('✅ Produto atualizado no BANCO:', productData)
        alert('✅ Produto atualizado com sucesso no banco de dados!')
      } else {
        // Adicionar produto APENAS no Supabase
        await addSupabaseProduct(productData)
        console.log('✅ Produto adicionado no BANCO:', productData)
        alert('✅ Produto adicionado com sucesso ao banco de dados!')
      }
      
      setEditingProduct(null)
      setShowProductForm(false)
      setSelectedBrand('')
      setProductImages([])
      setCoverImageIndex(0)
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar produto no banco:', error)
      alert(`❌ ERRO AO SALVAR NO BANCO DE DADOS\n\n${error?.message || 'Erro desconhecido'}\n\n💡 Verifique:\n• Configuração do Supabase\n• Conexão com a internet\n• Permissões no banco`)
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    // Coletar dados do formulário
    const title = (formData.get('title') as string) || ''
    const description = (formData.get('description') as string) || ''
    const featuresText = formData.get('features')?.toString() || ''
    const features = featuresText.split('\n').filter(f => f.trim())
    const whatsapp_message = (formData.get('whatsapp_message') as string) || ''
    const icon = selectedServiceIcon || 'wrench'
    
    console.log('📝 Dados coletados do formulário:', {
      title,
      description,
      features,
      whatsapp_message,
      icon,
      'whatsapp_message length': whatsapp_message.length,
      'whatsapp_message presente?': !!whatsapp_message
    })
    
    // Validar campos obrigatórios
    if (!title || !description) {
      alert('❌ Título e descrição são obrigatórios!')
      return
    }
    
    const serviceData = {
      title: title.trim(),
      description: description.trim(),
      features,
      whatsapp_message: whatsapp_message.trim() || `Olá! Gostaria de solicitar o serviço: ${title.trim()}. Podem me ajudar?`,
      icon: icon.trim() || 'wrench',
    }
    
    console.log('💾 Dados que serão enviados para a API:', serviceData)
    console.log('💾 WhatsApp message length:', serviceData.whatsapp_message.length)
    console.log('💾 Icon:', serviceData.icon)

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData)
        alert('✅ Serviço atualizado com sucesso!')
      } else {
        await addService(serviceData)
        alert('✅ Serviço adicionado com sucesso!')
      }
      
      // Fechar formulário e recarregar
      setEditingService(null)
      setShowServiceForm(false)
      
      // Recarregar serviços
      if (refreshServices) {
        await refreshServices()
      }
    } catch (error) {
      console.error('❌ Erro ao salvar serviço:', error)
      alert(`❌ Erro ao salvar serviço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 ========== SALVANDO BANNER ==========')
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const bannerData = {
        title: formData.get('title') as string,
        subtitle: formData.get('subtitle') as string,
        image: formData.get('image') as string,
        cta_text: formData.get('ctaText') as string,
        cta_link: formData.get('ctaLink') as string,
        active: formData.get('active') === 'on',
      }

      console.log('📝 Dados do banner:', bannerData)

      if (editingBanner) {
        console.log('✏️ Modo: EDITAR banner')
        await updateBanner(editingBanner.id, bannerData)
      } else {
        console.log('➕ Modo: ADICIONAR banner')
        await addBanner(bannerData)
      }
      
      console.log('✅ Banner salvo com sucesso!')
      
      setEditingBanner(null)
      setShowBannerForm(false)
      setBannerImage('')
      
    } catch (error) {
      console.error('❌ Erro ao salvar banner:', error)
      alert(`Erro ao salvar banner: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 ========== INICIANDO SALVAMENTO ==========')
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const brandData = {
        name: formData.get('name') as string,
        image: formData.get('image') as string || brandImage,
        // Removido 'active' - coluna não existe no banco
      }

      console.log('📝 Dados extraídos do formulário:', brandData)
      
      // Validar dados básicos
      if (!brandData.name || brandData.name.trim() === '') {
        alert('Nome da marca é obrigatório!')
        return
      }

      if (editingBrand) {
        console.log('✏️ Modo: EDITAR marca existente')
        await updateBrand(editingBrand.id, brandData)
      } else {
        console.log('➕ Modo: ADICIONAR nova marca')
        await addBrand(brandData)
      }
      
      console.log('✅ Operação concluída com sucesso!')
      
      // Fechar formulário
      setEditingBrand(null)
      setShowBrandForm(false)
      setBrandImage('')
      
      console.log('🎉 Formulário fechado - SUCESSO TOTAL!')
      
    } catch (error) {
      console.error('❌ ========== ERRO CAPTURADO ==========')
      console.error('❌ Tipo do erro:', typeof error)
      console.error('❌ Mensagem:', error instanceof Error ? error.message : String(error))
      console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A')
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`ERRO: ${errorMessage}`)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const categoryData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      image: formData.get('image') as string,
      icon: formData.get('icon') as string
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        console.log('✅ Categoria atualizada no BANCO:', categoryData)
      } else {
        await addCategory(categoryData)
        console.log('✅ Categoria adicionada no BANCO:', categoryData)
      }
      
      // Disparar evento para atualizar categorias na página inicial
      window.dispatchEvent(new CustomEvent('category-updated', { 
        detail: { action: editingCategory ? 'updated' : 'created', category: categoryData } 
      }))
      
      setEditingCategory(null)
      setShowCategoryForm(false)
      
      // Recarregar categorias do hook
      await refetchCategories()
    } catch (error) {
      console.error('❌ Erro ao salvar categoria no banco:', error)
      alert(`❌ ERRO AO SALVAR NO BANCO DE DADOS\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n💡 Verifique:\n• Configuração do Supabase\n• Conexão com a internet\n• Permissões no banco`)
    }
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return
    }
    
    switch (type) {
      case 'product':
        try {
          // Deletar APENAS do Supabase
          await deleteSupabaseProduct(id)
          console.log('✅ Produto deletado do BANCO:', id)
          alert('✅ Produto excluído com sucesso do banco de dados!')
        } catch (error: any) {
          console.error('❌ Erro ao deletar produto do banco:', error)
          alert(`❌ ERRO AO DELETAR DO BANCO\n\n${error?.message || 'Erro desconhecido'}\n\nVerifique a conexão com o Supabase.`)
        }
        break
      case 'service':
        try {
          await deleteService(id)
          alert('✅ Serviço excluído com sucesso!')
        } catch (error) {
          console.error('Erro ao deletar serviço:', error)
          alert('❌ Erro ao deletar serviço. Tente novamente.')
        }
        break
      case 'banner':
        try {
          await deleteBanner(id)
          console.log('✅ Banner deletado do banco:', id)
          alert('✅ Banner excluído com sucesso do banco de dados!')
        } catch (error) {
          console.error('❌ Erro ao deletar banner:', error)
          alert('❌ Erro ao deletar banner. Tente novamente.')
        }
        break
      case 'brand':
        try {
          await deleteBrand(id)
          console.log('✅ Marca deletada do banco:', id)
          alert('✅ Marca excluída com sucesso do banco de dados!')
        } catch (error) {
          console.error('❌ Erro ao deletar marca:', error)
          alert('❌ Erro ao deletar marca. Tente novamente.')
        }
        break
      case 'category':
        try {
          await deleteCategory(id)
          console.log('✅ Categoria deletada do banco:', id)
          alert('✅ Categoria excluída com sucesso do banco de dados!')
        } catch (error) {
          console.error('❌ Erro ao deletar categoria do banco:', error)
          alert('❌ Erro ao deletar categoria. Tente novamente.')
        }
        break
    }
  }

  // Categorias de produtos disponíveis
  const productCategories = ['Joias', 'Relógios', 'Óculos', 'Semi-Joias', 'Carteiras', 'Cintos', 'Bebidas', 'Acessórios', 'Outros', 'Afins', 'Serviços']
  
  // Função para categorias iniciais
  const initialCategoriesData = () => [
    {
      id: '1',
      name: 'Joias',
      description: 'Anéis, colares, brincos e pulseiras em ouro e prata',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
      icon: 'gem',
      href: '/produtos?categoria=Joias'
    },
    {
      id: '2',
      name: 'Relógios',
      description: 'Relógios masculinos e femininos das melhores marcas',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
      icon: 'clock',
      href: '/produtos?categoria=Relógios'
    },
    {
      id: '3',
      name: 'Óculos',
      description: 'Óculos de sol e grau com tecnologia avançada',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=600&fit=crop',
      icon: 'eye',
      href: '/produtos?categoria=Óculos'
    },
    {
      id: '4',
      name: 'Semi-Joias',
      description: 'Bijuterias elegantes e acessórios modernos',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop',
      icon: 'diamond',
      href: '/produtos?categoria=Semi-Joias'
    },
    {
      id: '5',
      name: 'Carteiras',
      description: 'Carteiras masculinas e femininas de qualidade',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=600&fit=crop',
      icon: 'package',
      href: '/produtos?categoria=Carteiras'
    },
    {
      id: '6',
      name: 'Cintos',
      description: 'Cintos de couro e sintético para todos os estilos',
      image: 'https://images.unsplash.com/photo-1624378515194-962d17c79896?w=800&h=600&fit=crop',
      icon: 'package',
      href: '/produtos?categoria=Cintos'
    },
    {
      id: '7',
      name: 'Bebidas',
      description: 'Bebidas premium e especiais',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
      icon: 'package',
      href: '/produtos?categoria=Bebidas'
    },
    {
      id: '8',
      name: 'Acessórios',
      description: 'Diversos acessórios e produtos variados',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=600&fit=crop',
      icon: 'package',
      href: '/produtos?categoria=Acessórios'
    },
    {
      id: '9',
      name: 'Outros',
      description: 'Outros produtos diversos',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop',
      icon: 'package',
      href: '/produtos?categoria=Outros'
    },
    {
      id: '10',
      name: 'Afins',
      description: 'Produtos variados e categorias relacionadas',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=600&fit=crop',
      icon: 'package',
      href: '/produtos?categoria=Afins'
    }
  ]

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Verificar se tem acesso
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
          <a
            href="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Apenas administradores podem acessar esta página.</p>
          <div className="space-x-4">
            <a
              href="/conta"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Minha Conta
            </a>
            <a
              href="/"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Voltar ao Site
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Gerencie produtos, serviços, banners e marcas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <a
                href="/"
                target="_blank"
                className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2 sm:px-0"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Visualizar site</span>
                <span className="sm:hidden">Site</span>
              </a>
              <button
                onClick={clearCacheAndReload}
                className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                title="Limpar cache e recarregar dados"
              >
                🔄
              </button>
            </div>
            {/* Botões removidos: Reset, Atualizar pedidos antigos, Sincronizar Dados */}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-8 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 px-2 sm:px-6 overflow-x-auto scrollbar-hide">
              {[
                { id: 'products', name: 'Produtos', count: products.length },
                { id: 'services', name: 'Serviços', count: services.length },
                { id: 'banners', name: 'Banners', count: banners.length },
                { id: 'brands', name: 'Marcas', count: brands.length },
                { id: 'categories', name: 'Categorias', count: categories.length },
                { id: 'orders', name: 'Pedidos', count: orders.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.name} ({tab.count})</span>
                  <span className="sm:hidden">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Produtos</h2>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </button>
              </div>
              {/* Botão "Sincronizar Dados" removido */}

              {supabaseLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando produtos do banco de dados...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum produto no banco de dados</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Comece adicionando seu primeiro produto no banco de dados clicando no botão abaixo.
                  </p>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Adicionar Primeiro Produto
                  </button>
                </div>
              ) : (
                <>
                  {/* Indicador de conexão com banco */}
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Conectado ao Banco de Dados ({products.length} produtos)
                      {products.filter(p => (p as any).stock === 0).length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                          {products.filter(p => (p as any).stock === 0).length} esgotado(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Busca e Filtros */}
                  <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {/* Barra de Busca */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar produtos por nome, marca, categoria ou descrição..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {productSearchTerm && (
                          <button
                            onClick={() => setProductSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Botão para mostrar/ocultar filtros */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setShowProductFilters(!showProductFilters)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros {showProductFilters ? '▼' : '▶'}
                      </button>
                      <div className="text-sm text-gray-600">
                        Mostrando {filteredProducts.length} de {products.length} produtos
                      </div>
                    </div>

                    {/* Painel de Filtros */}
                    {showProductFilters && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                        {/* Filtro por Categoria */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                          <select
                            value={productFilterCategory}
                            onChange={(e) => setProductFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Todas">Todas</option>
                            {productCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            {/* Adicionar categorias dinâmicas do banco que não estão na lista fixa */}
                            {/* EXCLUIR "Serviços" pois tem página própria */}
                            {Array.from(new Set([
                              ...products.map(p => p.category),
                              ...(supabaseCategories || []).map((c: any) => c.name)
                            ].filter(cat => {
                              if (!cat) return false
                              const lower = cat.toLowerCase().trim()
                              return !productCategories.includes(cat) && 
                                     lower !== 'serviços' && 
                                     lower !== 'servicos' && 
                                     !lower.includes('serviço')
                            }))).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Filtro por Marca */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                          <select
                            value={productFilterBrand}
                            onChange={(e) => setProductFilterBrand(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Todas">Todas</option>
                            {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).map(brand => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                        </div>

                        {/* Filtro por Estoque */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                          <select
                            value={productFilterStock}
                            onChange={(e) => setProductFilterStock(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Todos">Todos</option>
                            <option value="Em Estoque">Em Estoque</option>
                            <option value="Esgotados">Esgotados</option>
                          </select>
                        </div>

                        {/* Filtro por Promoção */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Promoção</label>
                          <select
                            value={productFilterOnSale}
                            onChange={(e) => setProductFilterOnSale(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Todos">Todos</option>
                            <option value="Promoção">Em Promoção</option>
                            <option value="Normal">Normal</option>
                          </select>
                        </div>

                        {/* Filtro por Destaque */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Destaque</label>
                          <select
                            value={productFilterFeatured}
                            onChange={(e) => setProductFilterFeatured(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Todos">Todos</option>
                            <option value="Destaque">Em Destaque</option>
                            <option value="Normal">Normal</option>
                          </select>
                        </div>

                        {/* Botão Limpar Filtros */}
                        <div className="lg:col-span-5 flex justify-end">
                          <button
                            onClick={() => {
                              setProductSearchTerm('')
                              setProductFilterCategory('Todas')
                              setProductFilterBrand('Todas')
                              setProductFilterStock('Todos')
                              setProductFilterOnSale('Todos')
                              setProductFilterFeatured('Todos')
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Limpar Filtros
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Lista de Produtos */}
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum produto encontrado com os filtros selecionados.</p>
                      <button
                        onClick={() => {
                          setProductSearchTerm('')
                          setProductFilterCategory('Todas')
                          setProductFilterBrand('Todas')
                          setProductFilterStock('Todos')
                          setProductFilterOnSale('Todos')
                          setProductFilterFeatured('Todos')
                        }}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Limpar filtros
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {filteredProducts.map((product) => {
                        const isOutOfStock = (product as any).stock === 0
                        return (
                          <div 
                            key={product.id} 
                            className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative ${
                              isOutOfStock ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                          >
                            {/* Badge de Esgotado */}
                            {isOutOfStock && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                                  ESGOTADO
                                </span>
                              </div>
                            )}
                            
                            <div className={`relative ${isOutOfStock ? 'opacity-75' : ''}`}>
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className={`w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg mb-2 sm:mb-3 md:mb-4 ${isOutOfStock ? 'grayscale' : ''}`}
                              />
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base line-clamp-2">{product.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                              {product.brand || 'Sem marca'} - {product.category}
                            </p>
                            
                            {/* Indicador de Estoque */}
                            {(product as any).stock !== undefined && (
                              <div className="mb-2">
                                {isOutOfStock ? (
                                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                    Estoque: 0
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    Estoque: {(product as any).stock}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs sm:text-sm md:text-lg font-bold text-blue-600 mb-2 sm:mb-3 md:mb-4">
                              {product.on_sale && product.sale_price ? (
                                <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="line-through text-gray-400 text-[10px] sm:text-xs md:text-sm">{formatPrice(product.price)}</span>
                                  <span>{formatPrice(product.sale_price)}</span>
                                </span>
                              ) : (
                                formatPrice(product.price)
                              )}
                            </p>
                            
                            {product.featured && (
                              <div className="mb-1 sm:mb-2">
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs font-medium rounded-full">
                                  ⭐ Destaque
                                </span>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product)
                                  setSelectedBrand(product.brand || '')
                                  setShowProductForm(true)
                                }}
                                className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Editar</span>
                                <span className="sm:hidden">Ed.</span>
                              </button>
                              <button
                                onClick={() => deleteItem('product', product.id)}
                                className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 border border-red-300 text-xs sm:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Excluir</span>
                                <span className="sm:hidden">Exc.</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Serviços</h2>
                <button
                  onClick={() => {
                    console.log('➕ Abrindo formulário para adicionar serviço')
                    setShowServiceForm(true)
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Características:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* WhatsApp Message Preview */}
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Mensagem do WhatsApp:</h4>
                      <p className="text-sm text-green-700">{service.whatsapp_message}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('✏️ Editando serviço:', service)
                          setEditingService(service)
                          setShowServiceForm(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => deleteItem('service', service.id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Banners do Hero</h2>
                <button
                  onClick={() => setShowBannerForm(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Banner
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((banner) => (
                  <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{banner.title}</h3>
                      <p className="text-gray-600 mb-4">{banner.subtitle}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingBanner(banner)
                            setShowBannerForm(true)
                          }}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => deleteItem('banner', banner.id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brands Tab */}
          {activeTab === 'brands' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Marcas</h2>
                <button
                  onClick={() => setShowBrandForm(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Marca
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map((brand) => (
                  <div key={brand.id} className="border border-gray-200 rounded-lg p-4">
                    {brand.image && (
                      <img src={brand.image} alt={brand.name} className="w-full h-32 object-contain mb-4" />
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2">{brand.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingBrand(brand)
                          setShowBrandForm(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => deleteItem('brand', brand.id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Categorias</h2>
                <button
                  onClick={() => {
                    setEditingCategory(null)
                    setShowCategoryForm(true)
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Categoria
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mostrar todas as categorias editáveis, incluindo Serviços e Afins */}
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <img src={category.image} alt={category.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    
                    {/* Configurações de Filtro */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Configurações de Filtro</h4>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                          <strong>URL do Filtro:</strong> {category.href || '/produtos'}
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>Ícone:</strong> {category.icon || 'gem'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category)
                          setShowCategoryForm(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => deleteItem('category', category.id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Pedidos</h2>
                <div className="text-sm text-gray-500">
                  {orders.length} pedido(s) encontrado(s)
                </div>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando pedidos...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (order.status === 'pending' || order.status === 'pending_whatsapp') ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'ready' || order.status === 'ready_for_pickup' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? (
                              (order as any).picked_up_at && !(order as any).delivered_at 
                                ? 'bg-blue-100 text-blue-800' 
                                : (order as any).delivered_at && !(order as any).picked_up_at
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-green-100 text-green-800'
                            ) :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {(order.status === 'pending' || order.status === 'pending_whatsapp') ? 'Aguardando Confirmação' :
                             order.status === 'confirmed' ? 'Confirmado' :
                             order.status === 'preparing' ? 'Preparando' :
                             order.status === 'ready' || order.status === 'ready_for_pickup' ? 'Pronto para Retirar/Entregar' :
                             order.status === 'delivered' ? (
                               (order as any).picked_up_at && !(order as any).delivered_at
                                 ? 'Retirado'
                                 : (order as any).delivered_at && !(order as any).picked_up_at
                                   ? 'Entregue'
                                   : 'Entregue'
                             ) :
                             order.status === 'cancelled' ? 'Cancelado' :
                             order.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'confirmed' ? 'Confirmado' :
                             order.status === 'pending' ? 'Pendente' :
                             order.status || 'Desconhecido'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4">
                        {/* Produtos */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Produtos</h4>
                          <div className="space-y-2">
                            {order.products.map((product: any, index: number) => (
                              <div key={index} className="flex items-center space-x-3">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Qtd: {product.quantity} • R$ {formatPrice(product.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cliente */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{order.customer_name || 'Nome não informado'}</p>
                            <p>{order.customer_phone || 'Telefone não informado'}</p>
                            {order.customer_email && (
                              <p className="text-xs text-gray-500">{order.customer_email}</p>
                            )}
                            {order.notes && (
                              <p className="text-xs text-gray-500 mt-2">
                                <strong>Observações:</strong> {order.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Resumo Financeiro */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>R$ {formatPrice(order.subtotal)}</span>
                            </div>
                            {order.shipping && (typeof order.shipping === 'number' ? order.shipping > 0 : parseFloat(order.shipping.toString()) > 0) && (
                              <div className="flex justify-between">
                                <span>Frete:</span>
                                <span>R$ {formatPrice(order.shipping)}</span>
                              </div>
                            )}
                            {order.discount && (typeof order.discount === 'number' ? order.discount > 0 : parseFloat(order.discount.toString()) > 0) && (
                              <div className="flex justify-between text-green-600">
                                <span>Desconto:</span>
                                <span>-R$ {formatPrice(order.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Total:</span>
                              <span>R$ {formatPrice(order.total)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Status: {order.status || 'Pendente'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          {order.tracking_number && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Truck className="h-4 w-4" />
                              <span>Rastreamento: {order.tracking_number}</span>
                            </div>
                          )}
                          {order.shipped_at && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Enviado em: {new Date(order.shipped_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDetails(true)
                            }}
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Ver Detalhes
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowWhatsAppNotification(true)
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                          >
                            WhatsApp
                          </button>
                          
                          {(order.status === 'pending' || order.status === 'pending_whatsapp') && (
                            <button
                              onClick={() => {
                                setPendingOrderId(order.id)
                                setShowDeliveryModal(true)
                              }}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                              Confirmar Pedido
                            </button>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
                            >
                              Iniciar Preparação
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                            >
                              Pronto para Retirar/Entregar
                            </button>
                          )}
                          
                          {(order.status === 'ready' || order.status === 'ready_for_pickup') && (
                            <>
                              {(order as any).delivery_method === 'delivery' ? (
                                <button
                                  onClick={async () => {
                                    if (confirm('Confirmar que o pedido foi entregue no endereço do cliente?')) {
                                      try {
                                        const result = await updateOrderStatus(order.id, 'delivered', { delivered_at: new Date().toISOString() })
                                        if (result.error) {
                                          console.error('❌ Erro ao marcar como entregue:', result.error)
                                          const errorMessage = result.error instanceof Error 
                                            ? result.error.message 
                                            : (result.error as any)?.message || String(result.error) || 'Erro desconhecido'
                                          alert(`Erro ao marcar como entregue: ${errorMessage}\n\nTente novamente ou verifique o console para mais detalhes.`)
                                        } else {
                                          console.log('✅ Marcado como entregue com sucesso')
                                          
                                          // Enviar mensagem automática pedindo opinião via WhatsApp
                                          const customerPhone = order.customer_phone
                                          if (customerPhone) {
                                            const cleanPhone = customerPhone.replace(/\D/g, '')
                                            const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
                                            
                                            // Construir mensagem pedindo opinião
                                            const message = `✅ *Pedido Entregue!*\n\nOlá! Seu pedido #${order.order_number} foi entregue com sucesso!\n\n✨ Esperamos que tenha gostado dos seus produtos!\n\n💬 Gostaríamos muito de saber sua opinião sobre sua compra e os produtos que você recebeu. Se quiser compartilhar conosco o que achou, é só responder esta mensagem!\n\nObrigado por escolher a Alfa Jóias! 💎`
                                            
                                            const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
                                            
                                            // Perguntar se quer enviar mensagem
                                            if (confirm('Deseja enviar mensagem automática ao cliente pedindo sua opinião via WhatsApp?')) {
                                              window.open(whatsappUrl, '_blank')
                                            }
                                          }
                                          
                                          alert('✅ Pedido marcado como entregue com sucesso!')
                                          // Recarregar pedidos após atualização
                                          setTimeout(() => refetchOrders(), 500)
                                        }
                                      } catch (err: any) {
                                        console.error('❌ Erro ao marcar como entregue:', err)
                                        const errorMessage = err?.message || err?.toString() || 'Erro desconhecido'
                                        alert(`Erro ao marcar como entregue: ${errorMessage}\n\nTente novamente ou verifique o console para mais detalhes.`)
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                                >
                                  Marcar como Entregue
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (confirm('Confirmar que o cliente retirou o pedido na loja?')) {
                                      try {
                                        const result = await updateOrderStatus(order.id, 'picked_up', { picked_up_at: new Date().toISOString() })
                                        if (result.error) {
                                          console.error('❌ Erro ao marcar como retirado:', result.error)
                                          const errorMessage = result.error instanceof Error 
                                            ? result.error.message 
                                            : (result.error as any)?.message || String(result.error) || 'Erro desconhecido'
                                          alert(`Erro ao marcar como retirado: ${errorMessage}\n\nTente novamente ou verifique o console para mais detalhes.`)
                                        } else {
                                          console.log('✅ Marcado como retirado com sucesso')
                                          
                                          // Enviar mensagem automática pedindo opinião via WhatsApp
                                          const customerPhone = order.customer_phone
                                          if (customerPhone) {
                                            const cleanPhone = customerPhone.replace(/\D/g, '')
                                            const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
                                            
                                            // Construir mensagem pedindo opinião
                                            const message = `✅ *Pedido Retirado!*\n\nOlá! Confirmamos a retirada do seu pedido #${order.order_number}!\n\n✨ Esperamos que tenha gostado dos seus produtos!\n\n💬 Gostaríamos muito de saber sua opinião sobre sua compra e os produtos que você retirou. Se quiser compartilhar conosco o que achou, é só responder esta mensagem!\n\nObrigado por escolher a Alfa Jóias! 💎`
                                            
                                            const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
                                            
                                            // Perguntar se quer enviar mensagem
                                            if (confirm('Deseja enviar mensagem automática ao cliente pedindo sua opinião via WhatsApp?')) {
                                              window.open(whatsappUrl, '_blank')
                                            }
                                          }
                                          
                                          // Recarregar pedidos após atualização
                                          setTimeout(() => refetchOrders(), 500)
                                        }
                                      } catch (err) {
                                        console.error('❌ Erro ao marcar como retirado:', err)
                                        alert('Erro ao marcar como retirado. Tente novamente.')
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                >
                                  Marcar como Retirado
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-20 mx-auto p-4 sm:p-5 border-0 sm:border w-full sm:w-11/12 max-w-2xl shadow-lg rounded-none sm:rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </h3>
              <button
                onClick={() => {
                  setShowProductForm(false)
                  setEditingProduct(null)
                  setSelectedBrand('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct?.name || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Selecione uma categoria</option>
                    {productCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca</label>
                  <BrandSelector
                    value={editingProduct?.brand || selectedBrand}
                    onChange={setSelectedBrand}
                    brands={brands}
                    placeholder="Selecione uma marca (opcional)"
                  />
                  <input type="hidden" name="brand" value={selectedBrand} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço</label>
                  <input
                    type="text"
                    name="price"
                    defaultValue={editingProduct?.price || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gênero</label>
                  <select
                    name="gender"
                    defaultValue={editingProduct?.gender || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Selecione o gênero</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modelo</label>
                  <input
                    type="text"
                    name="model"
                    defaultValue={editingProduct?.model || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ex: Clássico, Moderno, Esportivo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Imagens do Produto</label>
                <p className="text-xs text-gray-500 mb-2">Adicione múltiplas imagens e selecione qual será a imagem de capa</p>
                
                {/* Gerenciador de Imagens */}
                <div className="space-y-3">
                  {/* Imagens adicionadas */}
                  {productImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Imagem ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                              coverImageIndex === index 
                                ? 'border-blue-500 ring-2 ring-blue-300' 
                                : 'border-gray-200'
                            }`}
                          />
                          {coverImageIndex === index && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                              CAPA
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = productImages.filter((_, i) => i !== index)
                                setProductImages(newImages)
                                if (coverImageIndex === index && newImages.length > 0) {
                                  setCoverImageIndex(0)
                                } else if (coverImageIndex > index) {
                                  setCoverImageIndex(coverImageIndex - 1)
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {coverImageIndex !== index && (
                              <button
                                type="button"
                                onClick={() => setCoverImageIndex(index)}
                                className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-opacity"
                              >
                                Definir Capa
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload de nova imagem com editor */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <ImageEditor
                      imageUrl={productImages[coverImageIndex] || ''}
                      onImageSelect={(imageUrl) => {
                        if (imageUrl) {
                          const newImages = [...productImages]
                          if (coverImageIndex < newImages.length) {
                            newImages[coverImageIndex] = imageUrl
                          } else {
                            newImages.push(imageUrl)
                            setCoverImageIndex(newImages.length - 1)
                          }
                          setProductImages(newImages)
                        }
                      }}
                      placeholder="Adicionar/editar imagem principal"
                      aspectRatio={1} // Quadrado para produtos
                    />
                  </div>
                  
                  {/* Upload de imagens adicionais sem editor (apenas upload simples) */}
                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagens Adicionais (opcional)
                      </label>
                      <ImageUpload
                        onImageSelect={(imageUrl) => {
                          if (imageUrl && !productImages.includes(imageUrl)) {
                            setProductImages([...productImages, imageUrl])
                          }
                        }}
                        currentImage=""
                        placeholder="Adicionar imagem adicional"
                      />
                    </div>
                  )}
                  
                  {/* Inputs hidden para enviar no form */}
                  <input
                    type="hidden"
                    name="image"
                    value={productImages[coverImageIndex] || ''}
                  />
                  <input
                    type="hidden"
                    name="additionalImages"
                    value={JSON.stringify(productImages.filter((_, i) => i !== coverImageIndex))}
                  />
                </div>
                
                {productImages.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">É necessário adicionar pelo menos uma imagem</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Descrição do produto (opcional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estoque *</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock || 1}
                    min="1"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Quantidade em estoque (mínimo: 1)"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={editingProduct?.featured || false}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Produto em destaque</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="on_sale"
                      defaultChecked={editingProduct?.on_sale || false}
                      onChange={(e) => {
                        const promotionFields = document.getElementById('promotionFields')
                        const specialPromotionCheckbox = document.querySelector('input[name="specialPromotion"]') as HTMLInputElement
                        const specialPromotionFields = document.getElementById('specialPromotionFields')
                        
                        if (promotionFields) {
                          if (e.target.checked) {
                            promotionFields.classList.remove('hidden')
                            promotionFields.classList.add('block')
                            // Habilitar checkbox de promoção especial
                            if (specialPromotionCheckbox) {
                              specialPromotionCheckbox.disabled = false
                            }
                          } else {
                            promotionFields.classList.add('hidden')
                            promotionFields.classList.remove('block')
                            // Desabilitar e desmarcar promoção especial
                            if (specialPromotionCheckbox) {
                              specialPromotionCheckbox.disabled = true
                              specialPromotionCheckbox.checked = false
                            }
                            if (specialPromotionFields) {
                              specialPromotionFields.classList.add('hidden')
                              specialPromotionFields.classList.remove('block')
                            }
                          }
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Em promoção</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="specialPromotion"
                      defaultChecked={editingProduct?.specialPromotion || false}
                      disabled={!editingProduct?.on_sale}
                      onChange={(e) => {
                        const specialPromotionFields = document.getElementById('specialPromotionFields')
                        if (specialPromotionFields) {
                          if (e.target.checked) {
                            specialPromotionFields.classList.remove('hidden')
                            specialPromotionFields.classList.add('block')
                          } else {
                            specialPromotionFields.classList.add('hidden')
                            specialPromotionFields.classList.remove('block')
                          }
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="ml-2 text-sm text-gray-700">Promoção especial</span>
                    <span className="ml-1 text-xs text-gray-500">(requer &quot;Em promoção&quot;)</span>
                  </label>
                </div>
              </div>

              {/* Campos de Promoção - Aparecem apenas quando "Em promoção" está marcado */}
              <div id="promotionFields" className={editingProduct?.on_sale ? 'block' : 'hidden'}>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-3">Configurações de Promoção</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preço Original</label>
                      <input
                        type="text"
                        name="original_price"
                        defaultValue={editingProduct?.original_price || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="R$ 1.200,00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">% de Desconto</label>
                      <input
                        type="number"
                        name="discount_percentage"
                        defaultValue={editingProduct?.discount_percentage || ''}
                        min="1"
                        max="99"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preço Promocional</label>
                      <input
                        type="text"
                        name="sale_price"
                        defaultValue={editingProduct?.sale_price || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="R$ 960,00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos de Promoção Especial - Aparecem apenas quando "Promoção especial" está marcado E "Em promoção" está ativo */}
              <div id="specialPromotionFields" className={editingProduct?.specialPromotion && editingProduct?.on_sale ? 'block' : 'hidden'}>
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-3">Configurações de Promoção Especial</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Texto da Promoção Especial</label>
                      <input
                        type="text"
                        name="specialPromotionText"
                        defaultValue={editingProduct?.specialPromotionText || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Ex: Black Friday, Liquidação, Oferta Limitada"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Este texto aparecerá como destaque especial no produto
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false)
                    setEditingProduct(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Form Modal */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-20 mx-auto p-4 sm:p-5 border-0 sm:border w-full sm:w-11/12 max-w-2xl shadow-lg rounded-none sm:rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBanner ? 'Editar Banner' : 'Adicionar Banner'}
              </h3>
              <button
                onClick={() => {
                  setShowBannerForm(false)
                  setEditingBanner(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingBanner?.title || ''}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={editingBanner?.subtitle || ''}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem do Banner</label>
                <p className="text-xs text-gray-500 mb-2">Edite o enquadramento separadamente para desktop e mobile</p>
                <BannerImageEditor
                  imageUrl={bannerImage || editingBanner?.image || ''}
                  onImageSelect={(imageUrl) => {
                    setBannerImage(imageUrl)
                    const input = document.querySelector('input[name="image"]') as HTMLInputElement
                    if (input) input.value = imageUrl
                  }}
                  placeholder="Selecione uma imagem para o banner"
                />
                <input
                  type="hidden"
                  name="image"
                  value={bannerImage || editingBanner?.image || ''}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Texto do Botão</label>
                  <input
                    type="text"
                    name="ctaText"
                    defaultValue={editingBanner?.cta_text || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Link do Botão</label>
                  <input
                    type="text"
                    name="ctaLink"
                    defaultValue={editingBanner?.cta_link || ''}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingBanner?.active || false}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Banner ativo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBannerForm(false)
                    setEditingBanner(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-20 mx-auto p-4 sm:p-5 border-0 sm:border w-full sm:w-11/12 max-w-2xl shadow-lg rounded-none sm:rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
              </h3>
              <button
                onClick={() => {
                  console.log('❌ Fechando formulário de serviço')
                  setShowServiceForm(false)
                  setEditingService(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4" id="service-form" key={editingService?.id || 'new'}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingService?.title || ''}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
                  required
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Características (uma por linha)</label>
                <textarea
                  name="features"
                  defaultValue={editingService?.features?.join('\n') || ''}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="my-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  <span className="text-red-600 mr-2">*</span> Ícone do Serviço
                </label>
                
                {/* Ícone selecionado atual */}
                <div className="mb-4 p-3 bg-white rounded-lg border-2 border-blue-500">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">Ícone selecionado:</span>
                    {(() => {
                      const IconComponent = (() => {
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
                          lock: LockIcon,
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
                        return iconMap[selectedServiceIcon] || Wrench
                      })()
                      return <IconComponent className="h-8 w-8 text-blue-600" />
                    })()}
                    <span className="text-sm font-medium text-gray-600 capitalize">{selectedServiceIcon.replace('-', ' ')}</span>
                  </div>
                </div>

                {/* Grid de seleção de ícones */}
                <div className="max-h-96 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 bg-white">
                  {/* Organizar por categorias de serviços */}
                  <div className="space-y-4">
                    {/* Manutenção e Reparo */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">🔧 Manutenção e Reparo</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'wrench', label: 'Chave', icon: Wrench },
                          { value: 'hammer', label: 'Martelo', icon: Hammer },
                          { value: 'scissors', label: 'Tesoura', icon: Scissors },
                          { value: 'rotate-ccw', label: 'Restaurar', icon: RotateCcw },
                          { value: 'refresh-cw', label: 'Atualizar', icon: RefreshCw },
                          { value: 'settings', label: 'Configuração', icon: Settings },
                          { value: 'cog', label: 'Engrenagem', icon: Cog }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Relógios e Óculos */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">⌚ Relógios e Óculos</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'clock', label: 'Relógio', icon: Clock },
                          { value: 'watch', label: 'Pulso', icon: Watch },
                          { value: 'eye', label: 'Óculos', icon: Eye },
                          { value: 'battery', label: 'Bateria', icon: Battery }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Qualidade e Garantia */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">🛡️ Qualidade e Garantia</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'shield', label: 'Proteção', icon: Shield },
                          { value: 'award', label: 'Prêmio', icon: Award },
                          { value: 'check-circle', label: 'Aprovado', icon: CheckCircle },
                          { value: 'file-check', label: 'Verificado', icon: FileCheck },
                          { value: 'clipboard-check', label: 'Checklist', icon: ClipboardCheck },
                          { value: 'star', label: 'Destaque', icon: Star },
                          { value: 'crown', label: 'Premium', icon: Crown }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Velocidade e Agilidade */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">⚡ Velocidade e Agilidade</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'zap', label: 'Rápido', icon: Zap },
                          { value: 'flame', label: 'Urgente', icon: Flame },
                          { value: 'truck', label: 'Entrega', icon: Truck },
                          { value: 'fast-forward', label: 'Expresso', icon: FastForward },
                          { value: 'timer', label: 'Tempo', icon: Timer }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Serviços Especializados */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">🎯 Serviços Especializados</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'gauge', label: 'Precisão', icon: Gauge },
                          { value: 'stethoscope', label: 'Diagnóstico', icon: Stethoscope },
                          { value: 'activity', label: 'Atividade', icon: Activity },
                          { value: 'target', label: 'Foco', icon: Target },
                          { value: 'layers', label: 'Camadas', icon: Layers },
                          { value: 'trending-up', label: 'Crescimento', icon: TrendingUp }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Documentação e Processos */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">📄 Documentação e Processos</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'file-text', label: 'Documento', icon: FileText },
                          { value: 'credit-card', label: 'Pagamento', icon: CreditCard },
                          { value: 'key', label: 'Chave', icon: Key },
                          { value: 'unlock', label: 'Acesso', icon: Unlock },
                          { value: 'lock', label: 'Segurança', icon: LockIcon },
                          { value: 'calendar', label: 'Agendamento', icon: Calendar }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Joias e Acessórios */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">💎 Joias e Acessórios</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'gem', label: 'Gema', icon: Gem },
                          { value: 'diamond', label: 'Diamante', icon: Diamond },
                          { value: 'sparkles', label: 'Brilho', icon: Sparkles }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comunicação */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">📞 Comunicação</h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {[
                          { value: 'phone', label: 'Telefone', icon: Phone },
                          { value: 'mail', label: 'Email', icon: Mail },
                          { value: 'bell', label: 'Notificação', icon: Bell },
                          { value: 'user', label: 'Usuário', icon: User },
                          { value: 'users', label: 'Equipe', icon: Users },
                          { value: 'smile', label: 'Atendimento', icon: Smile },
                          { value: 'thumbs-up', label: 'Aprovação', icon: ThumbsUp }
                        ].map(({ value, label, icon: IconComponent }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedServiceIcon(value)}
                            className={`
                              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                              ${selectedServiceIcon === value
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            title={label}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedServiceIcon === value ? 'text-blue-600' : 'text-gray-600'}`} />
                            <span className={`text-xs mt-1 text-center ${selectedServiceIcon === value ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Campo hidden para manter compatibilidade com o formulário */}
                <input type="hidden" name="icon" value={selectedServiceIcon} />
                
                <p className="mt-3 text-sm text-gray-700 font-medium">⚠️ Clique em um ícone acima para selecioná-lo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mensagem do WhatsApp <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="whatsapp_message"
                  key={editingService?.id || 'new'} // Forçar re-render quando editar
                  defaultValue={editingService?.whatsapp_message || ''}
                  rows={4}
                  required
                  placeholder="Ex: Olá! Gostaria de solicitar informações sobre [nome do serviço]. Podem me ajudar?"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Esta mensagem será enviada automaticamente quando o cliente clicar no botão do WhatsApp.
                  {editingService?.whatsapp_message && (
                    <span className="block mt-1 text-green-600 font-medium">
                      ✓ Mensagem atual: {editingService.whatsapp_message.substring(0, 50)}...
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceForm(false)
                    setEditingService(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Form Modal */}
      {showBrandForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-20 mx-auto p-4 sm:p-5 border-0 sm:border w-full sm:w-11/12 max-w-2xl shadow-lg rounded-none sm:rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBrand ? 'Editar Marca' : 'Adicionar Marca'}
              </h3>
              <button
                onClick={() => {
                  setShowBrandForm(false)
                  setEditingBrand(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Marca</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingBrand?.name || ''}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">Logo da Marca</label>
                <p className="text-xs text-gray-500 mb-2">Recomendado: logo horizontal (aspect ratio 2:1)</p>
                <ImageEditor
                  imageUrl={editingBrand?.image || brandImage}
                  onImageSelect={(image) => setBrandImage(image)}
                  placeholder="Selecione o logo da marca"
                  aspectRatio={2} // Logo horizontal
                  cropSize={400}
                />
                <input type="hidden" name="image" value={brandImage} />
              </div>

              <div className="flex items-center">
                {/* Campo 'active' removido - coluna não existe no banco */}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBrandForm(false)
                    setEditingBrand(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40">
          <div className="relative top-0 sm:top-20 mx-auto p-4 sm:p-5 border-0 sm:border w-full sm:w-11/12 max-w-2xl shadow-lg rounded-none sm:rounded-md bg-white min-h-screen sm:min-h-0 mb-0 sm:mb-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingCategory?.name || ''}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={editingCategory?.description || ''}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem da Categoria</label>
                <p className="text-xs text-gray-500 mb-2">Selecione uma imagem e ajuste para preencher sem bordas</p>
                <CategoryImageEditor
                  imageUrl={editingCategory?.image || ''}
                  onImageSelect={(imageUrl) => {
                    const input = document.querySelector('input[name="image"]') as HTMLInputElement
                    if (input) input.value = imageUrl
                  }}
                  placeholder="Selecione uma imagem para a categoria"
                />
                <input
                  type="hidden"
                  name="image"
                  defaultValue={editingCategory?.image || ''}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <select
                  name="icon"
                  defaultValue={editingCategory?.icon || 'gem'}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <optgroup label="Joias e Acessórios">
                    <option value="gem">💎 Gem (Joias)</option>
                    <option value="diamond">💍 Diamond (Diamante)</option>
                    <option value="crown">👑 Crown (Coroa)</option>
                    <option value="sparkles">✨ Sparkles (Brilho)</option>
                    <option value="award">🏆 Award (Prêmio)</option>
                  </optgroup>
                  <optgroup label="Relógios e Óculos">
                    <option value="clock">⌚ Clock (Relógio)</option>
                    <option value="watch">⌚ Watch (Relógio)</option>
                    <option value="eye">👓 Eye (Óculos)</option>
                  </optgroup>
                  <optgroup label="Produtos e Embalagem">
                    <option value="package">📦 Package (Pacote)</option>
                    <option value="box">📦 Box (Caixa)</option>
                    <option value="gift">🎁 Gift (Presente)</option>
                    <option value="shopping-bag">🛍️ Shopping Bag (Sacola)</option>
                  </optgroup>
                  <optgroup label="Categorias Gerais">
                    <option value="tag">🏷️ Tag (Etiqueta)</option>
                    <option value="star">⭐ Star (Estrela)</option>
                    <option value="heart">❤️ Heart (Coração)</option>
                    <option value="zap">⚡ Zap (Raio)</option>
                    <option value="flame">🔥 Flame (Chama)</option>
                    <option value="leaf">🍃 Leaf (Folha)</option>
                  </optgroup>
                  <optgroup label="Bebidas e Comida">
                    <option value="coffee">☕ Coffee (Café)</option>
                    <option value="beer">🍺 Beer (Cerveja)</option>
                    <option value="wine">🍷 Wine (Vinho)</option>
                    <option value="pizza">🍕 Pizza</option>
                    <option value="utensils">🍴 Utensils (Talheres)</option>
                  </optgroup>
                  <optgroup label="Entretenimento">
                    <option value="music">🎵 Music (Música)</option>
                    <option value="camera">📷 Camera (Câmera)</option>
                    <option value="gamepad2">🎮 Gamepad (Jogo)</option>
                    <option value="book">📚 Book (Livro)</option>
                  </optgroup>
                  <optgroup label="Locais e Viagem">
                    <option value="home">🏠 Home (Casa)</option>
                    <option value="building">🏢 Building (Prédio)</option>
                    <option value="car">🚗 Car (Carro)</option>
                    <option value="plane">✈️ Plane (Avião)</option>
                    <option value="briefcase">💼 Briefcase (Mala)</option>
                  </optgroup>
                  <optgroup label="Ferramentas">
                    <option value="wrench">🔧 Wrench (Chave)</option>
                    <option value="hammer">🔨 Hammer (Martelo)</option>
                    <option value="scissors">✂️ Scissors (Tesoura)</option>
                    <option value="gauge">⏱️ Gauge (Medidor)</option>
                    <option value="cog">⚙️ Cog (Engrenagem)</option>
                    <option value="paintbrush">🖌️ Paintbrush (Pincel)</option>
                    <option value="palette">🎨 Palette (Paleta)</option>
                    <option value="settings">⚙️ Settings (Configurações)</option>
                  </optgroup>
                  <optgroup label="Pessoas e Comunicação">
                    <option value="user">👤 User (Usuário)</option>
                    <option value="users">👥 Users (Usuários)</option>
                    <option value="smile">😊 Smile (Sorriso)</option>
                    <option value="thumbs-up">👍 Thumbs Up (Joinha)</option>
                    <option value="bell">🔔 Bell (Sino)</option>
                    <option value="mail">✉️ Mail (Email)</option>
                    <option value="phone">📞 Phone (Telefone)</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-gray-500">Selecione um ícone para representar a categoria</p>
              </div>

              {/* Configurações de Filtro - Para categorias normais */}
              {editingCategory?.name !== 'Serviços' && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Configurações de Filtro</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL do Filtro</label>
                    <input
                      type="text"
                      name="href"
                      defaultValue={editingCategory?.href || (editingCategory?.name ? `/produtos?categoria=${editingCategory.name}` : '')}
                      placeholder="/produtos?categoria=Joias"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL que será chamada quando a categoria for clicada
                    </p>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Nome para Filtro</label>
                    <input
                      type="text"
                      name="filterName"
                      defaultValue={editingCategory?.filterName || editingCategory?.name || ''}
                      placeholder="Joias"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nome usado para filtrar produtos (deve corresponder ao campo &quot;categoria&quot; dos produtos)
                    </p>
                  </div>
                </div>
              )}
              
              {/* Para Serviços, mostrar campo de URL manual */}
              {editingCategory?.name === 'Serviços' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-700 mb-3">Configuração Especial - Serviços</h4>
                  <div>
                    <label className="block text-sm font-medium text-blue-700">URL de Redirecionamento</label>
                    <input
                      type="text"
                      name="href"
                      defaultValue={editingCategory?.href || '/servicos'}
                      placeholder="/servicos"
                      className="mt-1 block w-full border border-blue-300 rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Quando clicada, esta categoria redireciona para a página de serviços
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-20 mx-auto p-4 sm:p-5 border-0 sm:border w-full sm:w-11/12 max-w-4xl shadow-lg rounded-none sm:rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Detalhes do Pedido #{selectedOrder.order_number}
              </h3>
              <button
                onClick={() => {
                  setShowOrderDetails(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações do Cliente */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome:</label>
                    <p className="text-gray-900">{selectedOrder.customer_name || 'Nome não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone:</label>
                    <p className="text-gray-900">{selectedOrder.customer_phone || 'Telefone não informado'}</p>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email:</label>
                      <p className="text-gray-900">{selectedOrder.customer_email}</p>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Observações:</label>
                      <p className="text-gray-900">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo do Pedido */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'pending_whatsapp' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                      selectedOrder.status === 'ready' || selectedOrder.status === 'ready_for_pickup' ? 'bg-purple-100 text-purple-800' :
                      selectedOrder.status === 'delivered' ? (
                        (selectedOrder as any).picked_up_at && !(selectedOrder as any).delivered_at
                          ? 'bg-blue-100 text-blue-800'
                          : (selectedOrder as any).delivered_at && !(selectedOrder as any).picked_up_at
                            ? 'bg-green-100 text-green-800'
                            : 'bg-green-100 text-green-800'
                      ) :
                      selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status === 'pending_whatsapp' ? 'Aguardando WhatsApp' :
                       selectedOrder.status === 'confirmed' ? 'Confirmado' :
                       selectedOrder.status === 'preparing' ? 'Preparando' :
                       selectedOrder.status === 'ready' || selectedOrder.status === 'ready_for_pickup' ? 'Pronto para Retirar/Entregar' :
                       selectedOrder.status === 'delivered' ? (
                         (selectedOrder as any).picked_up_at && !(selectedOrder as any).delivered_at
                           ? 'Retirado'
                           : (selectedOrder as any).delivered_at && !(selectedOrder as any).picked_up_at
                             ? 'Entregue'
                             : 'Entregue'
                       ) :
                       selectedOrder.status === 'cancelled' ? 'Cancelado' :
                       selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagamento:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status === 'confirmed' ? 'Confirmado' :
                       selectedOrder.status === 'pending' ? 'Pendente' :
                       selectedOrder.status || 'Desconhecido'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-gray-900">{selectedOrder.status || 'Pendente'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data do Pedido:</span>
                    <span className="text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {selectedOrder.shipped_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Envio:</span>
                      <span className="text-gray-900">
                        {new Date(selectedOrder.shipped_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {selectedOrder.delivered_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Entrega:</span>
                      <span className="text-gray-900">
                        {new Date(selectedOrder.delivered_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Produtos do Pedido */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Produtos</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                  {selectedOrder.products.map((product: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded border">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{product.name}</h5>
                        <p className="text-sm text-gray-600">Quantidade: {product.quantity}</p>
                        <p className="text-sm text-gray-600">
                          Preço unitário: R$ {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          R$ {formatPrice(typeof product.price === 'number' ? product.price * product.quantity : parseFloat(product.price.toString()) * product.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Resumo Financeiro */}
                <div className="mt-6 pt-4 border-t">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">R$ {formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.shipping && (typeof selectedOrder.shipping === 'number' ? selectedOrder.shipping > 0 : parseFloat(selectedOrder.shipping.toString()) > 0) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frete:</span>
                        <span className="text-gray-900">R$ {formatPrice(selectedOrder.shipping)}</span>
                      </div>
                    )}
                    {selectedOrder.discount && (typeof selectedOrder.discount === 'number' ? selectedOrder.discount > 0 : parseFloat(selectedOrder.discount.toString()) > 0) && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto:</span>
                        <span>-R$ {formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowOrderDetails(false)
                  setSelectedOrder(null)
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Fechar
              </button>
              
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'pending_whatsapp' || !selectedOrder.status) && (
                <button
                  onClick={() => {
                    setPendingOrderId(selectedOrder.id)
                    setShowDeliveryModal(true)
                  }}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Confirmar Pedido
                </button>
              )}
              
              {selectedOrder.status === 'confirmed' && (
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'preparing')
                    setShowOrderDetails(false)
                  }}
                      className="px-6 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
                >
                      Iniciar Preparação
                </button>
              )}
              
              {(selectedOrder.status === 'preparing' || selectedOrder.status === 'ready') && (
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'ready_for_pickup')
                    setShowOrderDetails(false)
                  }}
                      className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
                >
                      Marcar como Pronto para Retirar
                </button>
              )}

              {(selectedOrder.status === 'ready' || selectedOrder.status === 'ready_for_pickup') && (
                <>
                  {(selectedOrder as any).delivery_method === 'delivery' ? (
                    <button
                      onClick={async () => {
                        if (confirm('Confirmar que o pedido foi entregue no endereço do cliente?')) {
                          try {
                            const result = await updateOrderStatus(selectedOrder.id, 'delivered', { delivered_at: new Date().toISOString() })
                            if (result.error) {
                              console.error('❌ Erro ao marcar como entregue:', result.error)
                              const errorMessage = result.error instanceof Error 
                                ? result.error.message 
                                : (result.error as any)?.message || String(result.error) || 'Erro desconhecido'
                              alert(`Erro ao marcar como entregue: ${errorMessage}\n\nTente novamente ou verifique o console para mais detalhes.`)
                            } else {
                              console.log('✅ Marcado como entregue com sucesso')
                              
                              // Enviar mensagem automática pedindo avaliação
                              const customerPhone = selectedOrder.customer_phone || selectedOrder.customer?.phone
                              if (customerPhone) {
                                const cleanPhone = customerPhone.replace(/\D/g, '')
                                const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
                                
                                // Construir mensagem pedindo opinião
                                const message = `✅ *Pedido Entregue!*\n\nOlá! Seu pedido #${selectedOrder.order_number} foi entregue com sucesso!\n\n✨ Esperamos que tenha gostado dos seus produtos!\n\n💬 Gostaríamos muito de saber sua opinião sobre sua compra e os produtos que você recebeu. Se quiser compartilhar conosco o que achou, é só responder esta mensagem!\n\nObrigado por escolher a Alfa Jóias! 💎`
                                
                                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
                                
                                // Perguntar se quer enviar mensagem
                                if (confirm('Deseja enviar mensagem automática ao cliente pedindo sua opinião via WhatsApp?')) {
                                  window.open(whatsappUrl, '_blank')
                                }
                              }
                              
                              alert('✅ Pedido marcado como entregue com sucesso!')
                              setShowOrderDetails(false)
                              // Recarregar pedidos após atualização
                              setTimeout(() => refetchOrders(), 500)
                            }
                          } catch (err: any) {
                            console.error('❌ Erro ao marcar como entregue:', err)
                            const errorMessage = err?.message || err?.toString() || 'Erro desconhecido'
                            alert(`Erro ao marcar como entregue: ${errorMessage}\n\nTente novamente ou verifique o console para mais detalhes.`)
                          }
                        }
                      }}
                      className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      Marcar como Entregue
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (confirm('Confirmar que o cliente retirou o pedido na loja?')) {
                          try {
                            const result = await updateOrderStatus(selectedOrder.id, 'picked_up', { picked_up_at: new Date().toISOString() })
                            if (result.error) {
                              console.error('❌ Erro ao marcar como retirado:', result.error)
                              const errorMessage = result.error instanceof Error 
                                ? result.error.message 
                                : (result.error as any)?.message || String(result.error) || 'Erro desconhecido'
                              alert(`Erro ao marcar como retirado: ${errorMessage}\n\nTente novamente ou verifique o console para mais detalhes.`)
                            } else {
                              console.log('✅ Marcado como retirado com sucesso')
                              
                              // Enviar mensagem automática pedindo avaliação
                              const customerPhone = selectedOrder.customer_phone || selectedOrder.customer?.phone
                              if (customerPhone) {
                                const cleanPhone = customerPhone.replace(/\D/g, '')
                                const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
                                
                                // Construir mensagem com link para página de pedidos
                                const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://alfajoias.com.br'
                                const message = `✅ *Pedido Retirado!*\n\nOlá! Confirmamos a retirada do seu pedido #${selectedOrder.order_number}!\n\n✨ Esperamos que tenha gostado dos seus produtos!\n\n⭐ Gostaríamos muito de saber sua opinião! Avalie seus produtos em:\n${siteUrl}/pedidos\n\nObrigado por escolher a Alfa Jóias! 💎`
                                
                                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
                                
                                // Perguntar se quer enviar mensagem
                                if (confirm('Deseja enviar mensagem automática ao cliente pedindo avaliação?')) {
                                  window.open(whatsappUrl, '_blank')
                                }
                              }
                              
                              setShowOrderDetails(false)
                              // Recarregar pedidos após atualização
                              setTimeout(() => refetchOrders(), 500)
                            }
                          } catch (err) {
                            console.error('❌ Erro ao marcar como retirado:', err)
                            alert('Erro ao marcar como retirado. Tente novamente.')
                          }
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      Marcar como Retirado
                    </button>
                  )}
                </>
              )}

              {/* Cancelar pedido em quaisquer estados não entregues */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    const reason = prompt('Informe o motivo do cancelamento (obrigatório):')
                    if (!reason || !reason.trim()) {
                      alert('O motivo do cancelamento é obrigatório.')
                      return
                    }
                    const newNotes = `${selectedOrder.notes ? selectedOrder.notes + ' | ' : ''}Cancelamento: ${reason.trim()}`
                    updateOrderStatus(selectedOrder.id, 'cancelled', { notes: newNotes })
                    setShowOrderDetails(false)
                  }}
                  className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  Cancelar Pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Notification Modal */}
      {showWhatsAppNotification && selectedOrder && (
        <WhatsAppNotification
          order={selectedOrder}
          onClose={() => {
            setShowWhatsAppNotification(false)
            setSelectedOrder(null)
          }}
        />
      )}

      {/* Modal de Seleção de Entrega/Retirada */}
      {showDeliveryModal && pendingOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Como o cliente vai receber?</h3>
            <div className="space-y-4 mb-6">
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'delivery' | 'pickup')}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Entrega no Endereço</div>
                  <div className="text-sm text-gray-600">Endereço combinado via WhatsApp</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'delivery' | 'pickup')}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Retirada na Loja</div>
                  <div className="text-sm text-gray-600">Cliente retira no local</div>
                </div>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false)
                  setPendingOrderId(null)
                  setDeliveryMethod('pickup')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(pendingOrderId, 'confirmed', { delivery_method: deliveryMethod })
                  setShowDeliveryModal(false)
                  setPendingOrderId(null)
                  setDeliveryMethod('pickup')
                  if (showOrderDetails) {
                    setShowOrderDetails(false)
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}