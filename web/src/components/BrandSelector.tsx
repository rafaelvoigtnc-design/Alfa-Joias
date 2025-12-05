'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

interface Brand {
  id: string
  name: string
  image: string
  active?: boolean
}

interface BrandSelectorProps {
  value?: string
  onChange: (brandName: string) => void
  brands: Brand[]
  placeholder?: string
}

export default function BrandSelector({ 
  value = '', 
  onChange, 
  brands, 
  placeholder = "Selecione uma marca (opcional)" 
}: BrandSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeBrands = brands.filter(brand => brand.active !== false)

  useEffect(() => {
    if (searchTerm) {
      setFilteredBrands(
        activeBrands.filter(brand => 
          brand.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredBrands(activeBrands)
    }
  }, [searchTerm, activeBrands])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBrandSelect = (brandName: string) => {
    onChange(brandName)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
    setSearchTerm('')
  }

  const selectedBrand = activeBrands.find(brand => brand.name === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
          <div className="flex items-center space-x-2">
            {selectedBrand && selectedBrand.image && (
              <img 
                src={selectedBrand.image} 
                alt={selectedBrand.name}
                className="w-5 h-5 object-contain"
                style={{ background: 'transparent' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <span className={selectedBrand ? 'text-gray-900' : 'text-gray-500'}>
              {selectedBrand ? selectedBrand.name : placeholder}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="py-1">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleBrandSelect(brand.name)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {brand.image && (
                    <img 
                      src={brand.image} 
                      alt={brand.name}
                      className="w-5 h-5 object-contain"
                      style={{ background: 'transparent' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-900">{brand.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'Nenhuma marca encontrada' : 'Nenhuma marca disponível'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}




