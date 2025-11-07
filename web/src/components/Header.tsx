'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, User, LogIn, LogOut } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { cart, user, signOut, isAdmin } = useUnifiedAuth()
  const pathname = usePathname()

  // Fechar menu do usuário quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Promoções', href: '/promocoes' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Contato', href: '/contato' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - menor no mobile */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 no-underline hover:no-underline">
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-gray-800">
              Alf<span className="alpha-symbol">α</span> Jóias
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link text-sm smooth-transition relative ${
                  pathname === item.href
                    ? 'text-gray-800 font-medium'
                    : 'text-gray-700 hover:text-gray-800'
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-800"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions - sempre visível */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cart - sempre visível no mobile */}
            <Link href="/carrinho" className="relative flex items-center justify-center p-1.5 sm:p-2 text-gray-700 hover:text-gray-800 smooth-hover transition-all duration-300 active:scale-95">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold shadow-sm">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Mobile User Menu */}
            {user && (
              <div className="lg:hidden relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center p-1.5 sm:p-2 text-gray-700 hover:text-gray-800"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata.full_name || user.email} 
                      className="h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href="/conta" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setShowUserMenu(false)
                        setIsMenuOpen(false)
                      }}
                    >
                      Minha Conta
                    </Link>
                    <Link 
                      href="/pedidos" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setShowUserMenu(false)
                        setIsMenuOpen(false)
                      }}
                    >
                      Meus Pedidos
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => {
                          setShowUserMenu(false)
                          setIsMenuOpen(false)
                        }}
                      >
                        Painel Admin
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        await signOut()
                        setShowUserMenu(false)
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Admin Button - sempre visível se for admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="lg:hidden flex items-center justify-center p-1.5 sm:p-2 text-gray-700 hover:text-gray-800 active:scale-95 transition-transform"
                title="Painel Admin"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}

            {/* Desktop Cart, Admin e User */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white text-sm transition-all duration-300 rounded-md"
                  title="Painel Admin"
                >
                  Painel Admin
                </Link>
              )}

              {user ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1.5 text-gray-700 hover:text-gray-800 smooth-hover transition-all duration-300"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt={user.user_metadata.full_name || user.email} 
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="text-sm hidden xl:inline">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link 
                        href="/conta" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Minha Conta
                      </Link>
                      <Link 
                        href="/pedidos" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Meus Pedidos
                      </Link>
                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Painel Admin
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await signOut()
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-700 hover:text-gray-800 transition-colors text-sm">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden xl:inline">Entrar</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center p-1.5 sm:p-2 rounded-md text-gray-700 hover:text-gray-800 active:scale-95 transition-transform"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile login button */}
            {!user && (
              <Link href="/login" className="lg:hidden flex items-center justify-center p-1.5 sm:p-2 text-gray-700 hover:text-gray-800 active:scale-95 transition-transform">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Full Screen Overlay */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
              <nav className="flex flex-col py-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-3 text-base font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-gray-900 bg-gray-50 border-l-4 border-gray-900'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowUserMenu(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Mobile-only links */}
                {user && (
                  <>
                    <div className="border-t border-gray-200 my-2" />
                    <Link
                      href="/pedidos"
                      className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setShowUserMenu(false)
                      }}
                    >
                      Meus Pedidos
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setShowUserMenu(false)
                        }}
                      >
                        Painel Admin
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
