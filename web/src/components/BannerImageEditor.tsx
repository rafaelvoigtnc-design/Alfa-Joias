'use client'

import { useState, useEffect, useRef } from 'react'
import { Monitor, Smartphone, AlertCircle } from 'lucide-react'
import ImageEditor from './ImageEditor'

interface BannerImageEditorProps {
  imageUrl: string
  onImageSelect: (imageUrl: string) => void
  placeholder?: string
}

interface BannerImages {
  desktop?: string
  mobile?: string
  original?: string
}

// Parsear imagem (pode ser string simples ou JSON)
function parseImageData(imageUrl: string): BannerImages {
  if (!imageUrl) return {}
  
  try {
    const parsed = JSON.parse(imageUrl)
    if (typeof parsed === 'object' && (parsed.desktop || parsed.mobile || parsed.original)) {
      return parsed
    }
  } catch {
    // Não é JSON, tratar como string simples
    return {
      desktop: imageUrl,
      mobile: imageUrl,
      original: imageUrl
    }
  }
  
  return {
    desktop: imageUrl,
    mobile: imageUrl,
    original: imageUrl
  }
}

// Serializar imagens - SEMPRE retornar JSON quando há desktop e mobile
function serializeImageData(images: BannerImages): string {
  return JSON.stringify({
    desktop: images.desktop || '',
    mobile: images.mobile || '',
    original: images.original || images.desktop || images.mobile || ''
  })
}

export default function BannerImageEditor({ 
  imageUrl, 
  onImageSelect, 
  placeholder = "Selecione uma imagem para o banner"
}: BannerImageEditorProps) {
  const [images, setImages] = useState<BannerImages>(() => parseImageData(imageUrl))
  const isInternalUpdate = useRef(false)
  
  const desktopAspectRatio = 2.4 // 12:5
  const mobileAspectRatio = 1.2 // 6:5

  // Atualizar quando imageUrl mudar externamente
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    
    if (imageUrl) {
      const parsed = parseImageData(imageUrl)
      setImages(parsed)
    } else if (!imageUrl && !images.original) {
      setImages({})
    }
  }, [imageUrl])

  const handleDesktopImageSelect = (url: string) => {
    const newImages = {
      ...images,
      desktop: url,
      original: url
    }
    setImages(newImages)
    isInternalUpdate.current = true
    const serialized = serializeImageData(newImages)
    onImageSelect(serialized)
  }

  const handleMobileImageSelect = (url: string) => {
    const newImages = {
      ...images,
      mobile: url,
      original: images.original || images.desktop || url
    }
    setImages(newImages)
    isInternalUpdate.current = true
    const serialized = serializeImageData(newImages)
    onImageSelect(serialized)
  }

  const desktopImage = images.desktop || ''
  const mobileImage = images.mobile || ''

  return (
    <div className="space-y-4">
      {/* Aviso sobre upload obrigatório */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">⚠️ Importante:</p>
            <p>É obrigatório fazer upload de imagens separadas para Desktop e Mobile para garantir a melhor qualidade e proporção em cada dispositivo.</p>
          </div>
        </div>
      </div>

      {/* Desktop and Mobile Uploads Separados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desktop Upload */}
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-800">Desktop <span className="text-red-600">*</span></span>
            <span className="text-xs text-gray-500">(2.4:1)</span>
          </div>
          <ImageEditor
            imageUrl={desktopImage}
            onImageSelect={handleDesktopImageSelect}
            placeholder="Upload imagem Desktop (obrigatório)"
            aspectRatio={desktopAspectRatio}
          />
        </div>

        {/* Mobile Upload */}
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-800">Mobile <span className="text-red-600">*</span></span>
            <span className="text-xs text-gray-500">(1.2:1)</span>
          </div>
          <ImageEditor
            imageUrl={mobileImage}
            onImageSelect={handleMobileImageSelect}
            placeholder="Upload imagem Mobile (obrigatório)"
            aspectRatio={mobileAspectRatio}
          />
        </div>
      </div>

      {/* Validação */}
      {(!desktopImage || !mobileImage) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-800">
              <p className="font-semibold mb-1">⚠️ Atenção:</p>
              <p>É obrigatório fazer upload de ambas as imagens (Desktop e Mobile) para salvar o banner.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
