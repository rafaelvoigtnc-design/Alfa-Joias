// Supabase autoInit disabled during Firebase migration
// import { supabase } from './supabase'
// import { initialProducts, initialCategories, initialBanners, initialServices, initialBrands } from '@/data/initial-data'

// Flag para evitar múltiplas execuções simultâneas
let isInitializing = false

export async function autoInitializeData() {
  // Supabase autoInit disabled during Firebase migration
  console.log('⚠️ Supabase autoInit temporariamente desabilitado durante migração para Firebase')
  return { success: true, message: 'AutoInit desabilitado durante migração' }

  // // Evitar múltiplas execuções simultâneas
  // if (isInitializing) {
  //   console.log('⏳ Inicialização já em andamento, aguardando...')
  //   return { success: true, message: 'Inicialização já em andamento' }
  // }
  
  // isInitializing = true
  
  // try {
  //   console.log('🔄 Verificando dados iniciais...')

  //   // Verificar produtos
  //   const { data: existingProducts } = await supabase
  //     .from('products')
  //     .select('id')
  //     .limit(1)
    
  //   if (!existingProducts || existingProducts.length === 0) {
  //     console.log('📝 Inserindo produtos iniciais...')
  //     const { error: productsError } = await supabase
  //       .from('products')
  //       .insert(initialProducts)
      
  //     if (productsError) {
  //       console.error('❌ Erro ao inserir produtos:', productsError.message)
  //     } else {
  //       console.log('✅ Produtos iniciais inseridos')
  //     }
  //   } else {
  //     console.log('ℹ️ Produtos já existem')
  //   }

  //   // Verificar banners
  //   const { data: existingBanners } = await supabase
  //     .from('banners')
  //     .select('id')
  //     .limit(1)
    
  //   if (!existingBanners || existingBanners.length === 0) {
  //     console.log('📝 Inserindo banners iniciais...')
  //     const { error: bannersError } = await supabase
  //       .from('banners')
  //       .insert(initialBanners)
      
  //     if (bannersError) {
  //       console.error('❌ Erro ao inserir banners:', bannersError.message)
  //     } else {
  //       console.log('✅ Banners iniciais inseridos')
  //     }
  //   } else {
  //     console.log('ℹ️ Banners já existem')
  //   }

  //   // Verificar serviços
  //   const { data: existingServices } = await supabase
  //     .from('services')
  //     .select('id')
  //     .limit(1)
    
  //   if (!existingServices || existingServices.length === 0) {
  //     console.log('📝 Inserindo serviços iniciais...')
  //     const { error: servicesError } = await supabase
  //       .from('services')
  //       .insert(initialServices)
      
  //     if (servicesError) {
  //       console.error('❌ Erro ao inserir serviços:', servicesError.message)
  //     } else {
  //       console.log('✅ Serviços iniciais inseridos')
  //     }
  //   } else {
  //     console.log('ℹ️ Serviços já existem')
  //   }

  //   // Verificar marcas
  //   const { data: existingBrands } = await supabase
  //     .from('brands')
  //     .select('id')
  //     .limit(1)
    
  //   if (!existingBrands || existingBrands.length === 0) {
  //     console.log('📝 Inserindo marcas iniciais...')
  //     const { error: brandsError } = await supabase
  //       .from('brands')
  //       .insert(initialBrands)
      
  //     if (brandsError) {
  //       console.error('❌ Erro ao inserir marcas:', brandsError.message)
  //     } else {
  //       console.log('✅ Marcas iniciais inseridas')
  //     }
  //   } else {
  //     console.log('ℹ️ Marcas já existem')
  //   }

  //   console.log('✅ Inicialização automática concluída!')
  //   return { success: true, message: 'Sistema inicializado com sucesso' }

  // } catch (error) {
  //   console.error('❌ Erro na inicialização automática:', error)
  //   return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  // } finally {
  //   isInitializing = false
  // }
}