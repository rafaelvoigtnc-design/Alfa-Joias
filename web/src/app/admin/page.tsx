'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, Settings, Plus, Edit, Trash2, Save, X, Image, Percent, Star, Package, Truck, CheckCircle, Clock, DollarSign, Shield, Lock, Search, Filter,
  Gem, Diamond, Watch, ShoppingBag, Box, Gift, Tag, Award, Sparkles, Crown, Heart, Star as StarIcon, Zap, Flame, Leaf,
  Music, Camera, Gamepad2, Book, Coffee, Beer, Wine, Pizza, Utensils, Car, Plane, Home, Building, Briefcase,
  Palette, Paintbrush, Scissors, Wrench, Hammer, Gauge, Cog, User, Users, Smile, ThumbsUp, Bell, Mail, Phone, Battery,
  RotateCcw, RefreshCw, FileCheck, ClipboardCheck, Calendar, Timer, FastForward, 
  Stethoscope, Activity, TrendingUp, Target, Layers, FileText, CreditCard, Key, Unlock, Lock as LockIcon,
  Glasses, Clipboard
} from 'lucide-react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import ImageUpload from '@/components/ImageUpload'
import ImageEditor from '@/components/ImageEditor'
import BannerImageEditor from '@/components/BannerImageEditor'
import BrandSelector from '@/components/BrandSelector'
import { useFirebaseOrders } from '@/hooks/useFirebaseOrders'
import { useFirebaseServices } from '@/hooks/useFirebaseServices'
import { useFirebaseProducts } from '@/hooks/useFirebaseProducts'
import { useFirebaseBrands } from '@/hooks/useFirebaseBrands'
import { useFirebaseBanners } from '@/hooks/useFirebaseBanners'
import { useFirebaseCategories } from '@/hooks/useFirebaseCategories'
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
  const { user, loading: authLoading, isAdmin, adminLoading } = useFirebaseAuth()
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'banners' | 'brands' | 'categories' | 'orders'>('products')
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { services, createService, updateService, deleteService, refresh: refreshServices } = useFirebaseServices()
  const { banners, createBanner, updateBanner, deleteBanner, refetch: refetchBanners } = useFirebaseBanners()
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
  const [productImage, setProductImage] = useState('')

  const [selectedServiceIcon, setSelectedServiceIcon] = useState<string>('wrench')
  
  useEffect(() => {
    if (editingBanner && showBannerForm) {
      setBannerImage(editingBanner.image || '')
    } else if (!showBannerForm && !editingBanner) {
      setBannerImage('')
    }
  }, [editingBanner, showBannerForm])

  useEffect(() => {
    if (editingBrand && showBrandForm) {
      setBrandImage(editingBrand.image || '')
    } else if (!showBrandForm && !editingBrand) {
      setBrandImage('')
    }
  }, [editingBrand, showBrandForm])

  useEffect(() => {
    if (showServiceForm && editingService) {
      setSelectedServiceIcon(editingService.icon || 'wrench')
    } else if (showServiceForm && !editingService) {
      setSelectedServiceIcon('wrench')
    } else {
      setSelectedServiceIcon('wrench')
    }
  }, [showServiceForm, editingService])

  useEffect(() => {
    if (!showProductForm && !editingProduct) {
      setSelectedBrand('')
      setProductImage('')
      setTimeout(() => {
        const form = document.getElementById('product-form') as HTMLFormElement
        if (form) form.reset()
      }, 200)
    }
  }, [showProductForm, editingProduct])

  useEffect(() => {
    if (showProductForm) {
      if (editingProduct) {
        setProductImage(editingProduct.image || '')
      } else {
        setProductImage('')
        setSelectedBrand('')
        setTimeout(() => {
          const form = document.getElementById('product-form') as HTMLFormElement
          if (form) form.reset()
        }, 50)
      }
    }
  }, [editingProduct, showProductForm])
  
  const productCategories = ['Joias', 'Relógios', 'Óculos', 'Semi-Joias', 'Afins', 'Serviços']
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showWhatsAppNotification, setShowWhatsAppNotification] = useState(false)

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/conta')
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, router])
  
  const { orders, loading: ordersLoading, updateOrderStatus, addTrackingNumber, refetch: refetchOrders } = useFirebaseOrders()
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('pickup')
  
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [productFilterCategory, setProductFilterCategory] = useState('Todas')
  const [productFilterBrand, setProductFilterBrand] = useState('Todas')
  const [productFilterStock, setProductFilterStock] = useState<'Todos' | 'Em Estoque' | 'Esgotados'>('Todos')
  const [productFilterOnSale, setProductFilterOnSale] = useState<'Todos' | 'Promoção' | 'Normal'>('Todos')
  const [productFilterFeatured, setProductFilterFeatured] = useState<'Todos' | 'Destaque' | 'Normal'>('Todos')
  const [showProductFilters, setShowProductFilters] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  
  const { products: firebaseProducts, loading: firebaseLoading, createProduct, updateProduct, deleteProduct, refetch: refetchProducts } = useFirebaseProducts()
  const { brands, loading: brandsLoading, createBrand, updateBrand, deleteBrand, refetch: refetchBrands } = useFirebaseBrands()
  const { categories: firebaseCategories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory, refetch: refetchCategories } = useFirebaseCategories()

  useEffect(() => {
    if (!firebaseLoading) {
      if (firebaseProducts && firebaseProducts.length > 0) {
        const mappedProducts = firebaseProducts.map((product: any) => ({
          ...product,
          additionalImages: product.additional_images || product.additionalImages || []
        }))
        setProducts(mappedProducts)
      } else {
        setProducts([])
      }
    }
  }, [firebaseProducts, firebaseLoading])

  const normalizeText = (text: string): string => {
    if (!text) return ''
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  }

  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([])
      return
    }

    let filtered = [...products]

    if (productFilterCategory !== 'Todas') {
      filtered = filtered.filter(p => p.category === productFilterCategory)
    }

    if (productFilterBrand !== 'Todas') {
      filtered = filtered.filter(p => p.brand === productFilterBrand)
    }

    if (productFilterStock === 'Esgotados') {
      filtered = filtered.filter(p => (p as any).stock === 0)
    } else if (productFilterStock === 'Em Estoque') {
      filtered = filtered.filter(p => {
        const stock = (p as any).stock
        return stock === undefined || stock > 0
      })
    }

    if (productFilterOnSale === 'Promoção') {
      filtered = filtered.filter(p => p.on_sale === true)
    } else if (productFilterOnSale === 'Normal') {
      filtered = filtered.filter(p => !p.on_sale)
    }

    if (productFilterFeatured === 'Destaque') {
      filtered = filtered.filter(p => p.featured === true)
    } else if (productFilterFeatured === 'Normal') {
      filtered = filtered.filter(p => !p.featured)
    }

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

    if (productFilterStock !== 'Esgotados') {
      filtered.sort((a, b) => {
        const stockA = (a as any).stock
        const stockB = (b as any).stock
        
        if (typeof stockA === 'number' && typeof stockB === 'number') {
          if (stockA === 0 && stockB > 0) return 1
          if (stockA > 0 && stockB === 0) return -1
        }
        if (typeof stockA === 'number' && stockA === 0 && (typeof stockB !== 'number' || stockB > 0)) return 1
        if (typeof stockB === 'number' && stockB === 0 && (typeof stockA !== 'number' || stockA > 0)) return -1
        
        return 0
      })
    }

    setFilteredProducts(filtered)
  }, [products, productSearchTerm, productFilterCategory, productFilterBrand, productFilterStock, productFilterOnSale, productFilterFeatured])

  useEffect(() => {
    if (!categoriesLoading) {
      if (firebaseCategories && firebaseCategories.length > 0) {
        setCategories(firebaseCategories)
      } else {
        setCategories([])
      }
    }
  }, [firebaseCategories, categoriesLoading])

  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { key, data } }))
    }
  }

  const updateCategoryImage = (categoryId: string, newImageUrl: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, image: newImageUrl } : cat
    )
    setCategories(updatedCategories)
    saveToStorage('alfajoias-categories-images', updatedCategories)
  }

  const normalizePrice = (price: string): string => {
    if (!price) return '0'
    const cleaned = price.replace(/[^\d.,]/g, '')
    const normalized = cleaned.replace(',', '.')
    const num = parseFloat(normalized)
    return isNaN(num) ? '0' : num.toString()
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const form = e.target as HTMLFormElement
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement
    const originalButtonText = submitButton?.textContent
    if (submitButton) {
      submitButton.disabled = true
      submitButton.textContent = 'Salvando...'
    }
    
    const reenableButton = () => {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText || 'Salvar'
      }
    }
    
    const currentEditingProductId = editingProduct?.id
    const isEditing = !!editingProduct && !!currentEditingProductId
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const stock = Math.max(1, parseInt(formData.get('stock') as string) || 1)
      
      const coverImage = productImage
      
      const onSale = formData.get('on_sale') === 'on'
      const originalPrice = String(formData.get('original_price') || '')
      const discountPercentage = String(formData.get('discount_percentage') || '')
      const salePrice = String(formData.get('sale_price') || '')
      
      const specialPromotion = formData.get('specialPromotion') === 'on'
      const specialPromotionText = formData.get('specialPromotionText') as string
      
      const productData: any = {
        name: String(formData.get('name') || ''),
        category: String(formData.get('category') || ''),
        brand: String(formData.get('brand') || ''),
        price: normalizePrice(formData.get('price') as string),
        image: coverImage,
        description: String(formData.get('description') || ''),
        detailedDescription: String(formData.get('detailedDescription') || ''),
        stock: stock,
        featured: formData.get('featured') === 'on',
        on_sale: onSale,
        gender: String(formData.get('gender') || ''),
        model: String(formData.get('model') || '')
      }
      
      if (onSale && originalPrice) {
        productData.original_price = normalizePrice(originalPrice)
        if (discountPercentage) productData.discount_percentage = parseFloat(discountPercentage)
        if (salePrice) productData.sale_price = normalizePrice(salePrice)
      }
      
      if (specialPromotion && specialPromotionText) {
        productData.specialPromotion = true
        productData.specialPromotionText = specialPromotionText
      }
      
      if (isEditing && currentEditingProductId) {
        await updateProduct(currentEditingProductId, productData)
        alert('Produto atualizado com sucesso!')
      } else {
        await createProduct(productData)
        alert('Produto criado com sucesso!')
      }
      
      await refetchProducts()
      setShowProductForm(false)
      setEditingProduct(null)
      setSelectedBrand('')
      setProductImage('')
      form.reset()
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto. Tente novamente.')
      reenableButton()
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id)
        await refetchProducts()
        alert('Produto excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
        alert('Erro ao excluir produto. Tente novamente.')
      }
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const features = (formData.get('features') as string).split('\n').filter(f => f.trim())
      
      const serviceData = {
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        features: features,
        whatsapp_message: String(formData.get('whatsapp_message') || ''),
        icon: selectedServiceIcon
      }
      
      if (editingService) {
        await updateService(editingService.id, serviceData)
        alert('Serviço atualizado com sucesso!')
      } else {
        await createService(serviceData)
        alert('Serviço criado com sucesso!')
      }
      
      await refreshServices()
      setShowServiceForm(false)
      setEditingService(null)
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      alert('Erro ao salvar serviço. Tente novamente.')
    }
  }

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService(id)
        await refreshServices()
        alert('Serviço excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir serviço:', error)
        alert('Erro ao excluir serviço. Tente novamente.')
      }
    }
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const bannerData = {
        title: String(formData.get('title') || ''),
        subtitle: String(formData.get('subtitle') || ''),
        image: bannerImage,
        cta_text: String(formData.get('cta_text') || ''),
        cta_link: String(formData.get('cta_link') || ''),
        active: formData.get('active') === 'on'
      }
      
      if (editingBanner) {
        await updateBanner(editingBanner.id, bannerData)
        alert('Banner atualizado com sucesso!')
      } else {
        await createBanner(bannerData)
        alert('Banner criado com sucesso!')
      }
      
      await refetchBanners()
      setShowBannerForm(false)
      setEditingBanner(null)
      setBannerImage('')
    } catch (error) {
      console.error('Erro ao salvar banner:', error)
      alert('Erro ao salvar banner. Tente novamente.')
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      try {
        await deleteBanner(id)
        await refetchBanners()
        alert('Banner excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir banner:', error)
        alert('Erro ao excluir banner. Tente novamente.')
      }
    }
  }

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const brandData = {
        name: String(formData.get('name') || ''),
        image: brandImage,
        active: true
      }
      
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandData)
        alert('Marca atualizada com sucesso!')
      } else {
        await createBrand(brandData)
        alert('Marca criada com sucesso!')
      }
      
      await refetchBrands()
      setShowBrandForm(false)
      setEditingBrand(null)
      setBrandImage('')
    } catch (error) {
      console.error('Erro ao salvar marca:', error)
      alert('Erro ao salvar marca. Tente novamente.')
    }
  }

  const handleDeleteBrand = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta marca?')) {
      try {
        await deleteBrand(id)
        await refetchBrands()
        alert('Marca excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir marca:', error)
        alert('Erro ao excluir marca. Tente novamente.')
      }
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const categoryData = {
        name: String(formData.get('name') || ''),
        description: String(formData.get('description') || ''),
        image: editingCategory?.image || '',
        icon: editingCategory?.icon || 'Gem'
      }
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        alert('Categoria atualizada com sucesso!')
      } else {
        await createCategory(categoryData)
        alert('Categoria criada com sucesso!')
      }
      
      await refetchCategories()
      setShowCategoryForm(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria. Tente novamente.')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory(id)
        await refetchCategories()
        alert('Categoria excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        alert('Erro ao excluir categoria. Tente novamente.')
      }
    }
  }

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie produtos, serviços, banners, marcas, categorias e pedidos</p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'products', label: 'Produtos', icon: Package },
              { id: 'services', label: 'Serviços', icon: Settings },
              { id: 'banners', label: 'Banners', icon: Image },
              { id: 'brands', label: 'Marcas', icon: Tag },
              { id: 'categories', label: 'Categorias', icon: Layers },
              { id: 'orders', label: 'Pedidos', icon: Truck }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex-1 mr-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowProductFilters(!showProductFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                Filtros
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Novo Produto
              </button>
            </div>

            {showProductFilters && (
              <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={productFilterCategory}
                      onChange={(e) => setProductFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Todas">Todas</option>
                      {productCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <select
                      value={productFilterBrand}
                      onChange={(e) => setProductFilterBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Todas">Todas</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                    <select
                      value={productFilterStock}
                      onChange={(e) => setProductFilterStock(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Em Estoque">Em Estoque</option>
                      <option value="Esgotados">Esgotados</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promoção</label>
                    <select
                      value={productFilterOnSale}
                      onChange={(e) => setProductFilterOnSale(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Promoção">Promoção</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destaque</label>
                    <select
                      value={productFilterFeatured}
                      onChange={(e) => setProductFilterFeatured(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Destaque">Destaque</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {showProductForm && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                  <button
                    onClick={() => {
                      setShowProductForm(false)
                      setEditingProduct(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form id="product-form" onSubmit={handleProductSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input name="name" defaultValue={editingProduct?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select name="category" defaultValue={editingProduct?.category} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        {productCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                      <select name="brand" defaultValue={editingProduct?.brand} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.name}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                      <input name="price" defaultValue={editingProduct?.price} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                      <input name="stock" type="number" defaultValue={editingProduct?.stock || 1} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                      <select name="gender" defaultValue={editingProduct?.gender || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Unissex">Unissex</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                      <input name="model" defaultValue={editingProduct?.model || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input name="featured" type="checkbox" defaultChecked={editingProduct?.featured} className="mr-2" />
                        Destaque
                      </label>
                      <label className="flex items-center">
                        <input name="on_sale" type="checkbox" defaultChecked={editingProduct?.on_sale} className="mr-2" />
                        Promoção
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea name="description" defaultValue={editingProduct?.description} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                    <ImageEditor
                      imageUrl={productImage}
                      onImageSelect={setProductImage}
                      placeholder="Selecione uma imagem"
                      aspectRatio={1}
                      cropSize={800}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {editingProduct ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingProduct(product)
                            setShowProductForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  setEditingService(null)
                  setShowServiceForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Novo Serviço
              </button>
            </div>

            {showServiceForm && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                  <button
                    onClick={() => {
                      setShowServiceForm(false)
                      setEditingService(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleServiceSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input name="title" defaultValue={editingService?.title} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea name="description" defaultValue={editingService?.description} rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Funcionalidades (uma por linha)</label>
                      <textarea name="features" defaultValue={editingService?.features?.join('\n')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem WhatsApp</label>
                      <textarea name="whatsapp_message" defaultValue={editingService?.whatsapp_message} rows={2} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {editingService ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingService(service)
                        setShowServiceForm(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  setEditingBanner(null)
                  setShowBannerForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Novo Banner
              </button>
            </div>

            {showBannerForm && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h2>
                  <button
                    onClick={() => {
                      setShowBannerForm(false)
                      setEditingBanner(null)
                      setBannerImage('')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleBannerSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input name="title" defaultValue={editingBanner?.title} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                      <input name="subtitle" defaultValue={editingBanner?.subtitle} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                      <BannerImageEditor
                        imageUrl={bannerImage}
                        onImageSelect={setBannerImage}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                      <input name="cta_text" defaultValue={editingBanner?.cta_text} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link do Botão</label>
                      <input name="cta_link" defaultValue={editingBanner?.cta_link} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input name="active" type="checkbox" defaultChecked={editingBanner?.active ?? true} className="mr-2" />
                        Ativo
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {editingBanner ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map(banner => (
                <div key={banner.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{banner.title}</h3>
                    <p className="text-gray-600 mb-4">{banner.subtitle}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingBanner(banner)
                          setShowBannerForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'brands' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  setEditingBrand(null)
                  setShowBrandForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Nova Marca
              </button>
            </div>

            {showBrandForm && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{editingBrand ? 'Editar Marca' : 'Nova Marca'}</h2>
                  <button
                    onClick={() => {
                      setShowBrandForm(false)
                      setEditingBrand(null)
                      setBrandImage('')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleBrandSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input name="name" defaultValue={editingBrand?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                      <ImageUpload
                        currentImage={brandImage}
                        onImageSelect={setBrandImage}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {editingBrand ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brands.map(brand => (
                <div key={brand.id} className="bg-white rounded-lg shadow-sm p-6">
                  <img src={brand.image} alt={brand.name} className="w-full h-24 object-contain mb-4" />
                  <h3 className="text-lg font-semibold mb-4">{brand.name}</h3>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingBrand(brand)
                        setShowBrandForm(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  setEditingCategory(null)
                  setShowCategoryForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Nova Categoria
              </button>
            </div>

            {showCategoryForm && (
              <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                  <button
                    onClick={() => {
                      setShowCategoryForm(false)
                      setEditingCategory(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCategorySubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input name="name" defaultValue={editingCategory?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea name="description" defaultValue={editingCategory?.description} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    {editingCategory && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                        <ImageEditor
                          imageUrl={editingCategory.image || ''}
                          onImageSelect={(newImageUrl) => updateCategoryImage(editingCategory.id, newImageUrl)}
                          placeholder="Selecione uma imagem"
                          aspectRatio={1}
                          cropSize={800}
                        />
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {editingCategory ? 'Atualizar' : 'Criar'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm p-6">
                  <img src={category.image} alt={category.name} className="w-full h-32 object-cover mb-4 rounded" />
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setShowCategoryForm(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(String(order.total))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'delivered' || order.status === 'picked_up' ? 'bg-green-100 text-green-800' :
                          order.status === 'confirmed' || order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderDetails(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalhes do Pedido #{selectedOrder.order_number}</h2>
              <button
                onClick={() => {
                  setShowOrderDetails(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Cliente</h3>
                <p className="text-gray-600">{selectedOrder.customer_name}</p>
                <p className="text-gray-600">{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Itens</h3>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-2 border-b">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPrice(String(item.price * item.quantity))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(String(selectedOrder.total))}</span>
              </div>
            </div>
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
                  onClick={async () => {
                    await updateOrderStatus(selectedOrder.id, 'preparing')
                    setShowOrderDetails(false)
                  }}
                  className="px-6 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700"
                >
                  Iniciar Preparação
                </button>
              )}
              {(selectedOrder.status === 'preparing' || selectedOrder.status === 'ready') && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(selectedOrder.id, 'ready_for_pickup')
                    setShowOrderDetails(false)
                  }}
                  className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700"
                >
                  Marcar como Pronto
                </button>
              )}
              {(selectedOrder.status === 'ready' || selectedOrder.status === 'ready_for_pickup') && (
                <button
                  onClick={async () => {
                    if (confirm('Confirmar que o pedido foi entregue/retirado?')) {
                      await updateOrderStatus(selectedOrder.id, 'delivered')
                      setShowOrderDetails(false)
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                >
                  Marcar como Entregue
                </button>
              )}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    const reason = prompt('Informe o motivo do cancelamento:')
                    if (reason) {
                      updateOrderStatus(selectedOrder.id, 'cancelled', { notes: reason })
                      setShowOrderDetails(false)
                    }
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

      {showDeliveryModal && pendingOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Como o cliente vai receber?</h3>
            <div className="space-y-4 mb-6">
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500">
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
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500">
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
                onClick={async () => {
                  await updateOrderStatus(pendingOrderId, 'confirmed', { delivery_method: deliveryMethod })
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

      {showWhatsAppNotification && selectedOrder && (
        <WhatsAppNotification
          order={selectedOrder}
          onClose={() => {
            setShowWhatsAppNotification(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}
