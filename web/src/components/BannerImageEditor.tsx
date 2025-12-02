'use client'

import { useState, useEffect, useRef } from 'react'
import { Monitor, Smartphone, Upload, Edit2, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import ImageUpload from './ImageUpload'
import ImageCropper from './ImageCropper'

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

// Serializar imagens
function serializeImageData(images: BannerImages): string {
  // Se só tem original, retornar string simples
  if (images.original && !images.desktop && !images.mobile) {
    return images.original
  }
  
  // Se tem crops separados, retornar JSON
  return JSON.stringify({
    desktop: images.desktop || images.original || '',
    mobile: images.mobile || images.original || '',
    original: images.original || images.desktop || images.mobile || ''
  })
}

export default function BannerImageEditor({ 
  imageUrl, 
  onImageSelect, 
  placeholder = "Selecione uma imagem para o banner"
}: BannerImageEditorProps) {
  const [images, setImages] = useState<BannerImages>(() => parseImageData(imageUrl))
  const [showCropper, setShowCropper] = useState(false)
  const [croppingMode, setCroppingMode] = useState<'desktop' | 'mobile' | null>(null)
  const [tempImageUrl, setTempImageUrl] = useState<string>('')
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

  const handleImageSelect = (url: string) => {
    if (url && url.trim()) {
      const newImages = {
        original: url,
        desktop: images.desktop,
        mobile: images.mobile
      }
      setImages(newImages)
      isInternalUpdate.current = true
      const serialized = serializeImageData(newImages)
      onImageSelect(serialized)
    } else {
      setImages({})
      isInternalUpdate.current = true
      onImageSelect('')
    }
  }

  const handleCropComplete = (croppedUrl: string) => {
    if (!croppingMode) return
    
    const newImages = {
      ...images,
      [croppingMode]: croppedUrl
    }
    setImages(newImages)
    isInternalUpdate.current = true
    const serialized = serializeImageData(newImages)
    onImageSelect(serialized)
    
    setShowCropper(false)
    setCroppingMode(null)
    setTempImageUrl('')
  }

  const handleStartCrop = (mode: 'desktop' | 'mobile') => {
    const baseImage = images.original || images.desktop || images.mobile || imageUrl
    if (baseImage) {
      setTempImageUrl(baseImage)
      setCroppingMode(mode)
      setShowCropper(true)
    }
  }

  const handleCancelCrop = () => {
    setShowCropper(false)
    setCroppingMode(null)
    setTempImageUrl('')
  }

  const handleRemoveImage = () => {
    setImages({})
    isInternalUpdate.current = true
    onImageSelect('')
  }

  const displayImage = images.original || imageUrl || ''
  const desktopImage = images.desktop || displayImage
  const mobileImage = images.mobile || displayImage

  return (
    <>
      <div className="space-y-4">
        {/* Upload Section */}
        {!displayImage ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage=""
              placeholder={placeholder}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Upload with Current Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagem Original
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Remover
                </button>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                currentImage={displayImage}
                placeholder="Trocar imagem"
              />
              {displayImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={displayImage}
                    alt="Original"
                    className="w-full h-auto max-h-40 object-contain bg-white"
                  />
                </div>
              )}
            </div>

            {/* Desktop and Mobile Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Desktop Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Desktop</span>
                    <span className="text-xs text-gray-500">(2.4:1)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartCrop('desktop')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {images.desktop ? 'Editar' : 'Configurar'}
                  </button>
                </div>
                
                <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                  {desktopImage ? (
                    <>
                      <img
                        src={desktopImage}
                        alt="Desktop Preview"
                        className="w-full object-cover"
                        style={{
                          aspectRatio: desktopAspectRatio.toString(),
                          minHeight: '120px'
                        }}
                        draggable={false}
                      />
                      {!images.desktop && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Não configurado
                        </div>
                      )}
                      {images.desktop && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Configurado
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-8 text-gray-400" style={{ aspectRatio: desktopAspectRatio.toString(), minHeight: '120px' }}>
                      <div className="text-center">
                        <Monitor className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">Sem imagem</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">Mobile</span>
                    <span className="text-xs text-gray-500">(1.2:1)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartCrop('mobile')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium shadow-sm"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {images.mobile ? 'Editar' : 'Configurar'}
                  </button>
                </div>
                
                <div className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                  {mobileImage ? (
                    <>
                      <img
                        src={mobileImage}
                        alt="Mobile Preview"
                        className="w-full object-cover"
                        style={{
                          aspectRatio: mobileAspectRatio.toString(),
                          minHeight: '120px'
                        }}
                        draggable={false}
                      />
                      {!images.mobile && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Não configurado
                        </div>
                      )}
                      {images.mobile && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Configurado
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-8 text-gray-400" style={{ aspectRatio: mobileAspectRatio.toString(), minHeight: '120px' }}>
                      <div className="text-center">
                        <Smartphone className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">Sem imagem</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Message */}
            {(!images.desktop || !images.mobile) && displayImage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">💡 Dica:</p>
                    <p>Configure os enquadramentos separados para desktop e mobile para garantir a melhor exibição em cada dispositivo. Se não configurar, a imagem original será usada automaticamente.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {showCropper && tempImageUrl && croppingMode && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center gap-3">
                {croppingMode === 'desktop' ? (
                  <Monitor className="h-5 w-5 text-white" />
                ) : (
                  <Smartphone className="h-5 w-5 text-white" />
                )}
                <h3 className="text-lg font-bold text-white">
                  Configurar Enquadramento - {croppingMode === 'desktop' ? 'Desktop' : 'Mobile'}
                </h3>
                <span className="text-sm text-white/90">
                  ({croppingMode === 'desktop' ? '2.4:1' : '1.2:1'})
                </span>
              </div>
              <button
                onClick={handleCancelCrop}
                className="text-white/90 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Info Bar */}
            <div className="p-3 bg-blue-50 border-b flex-shrink-0">
              <p className="text-sm text-gray-700 text-center">
                <span className="font-semibold">💡</span> Ajuste o zoom e posição da imagem para o melhor enquadramento. 
                O retângulo mostra como será exibido no {croppingMode === 'desktop' ? 'desktop' : 'mobile'}.
              </p>
            </div>

            {/* Cropper */}
            <div 
              className="flex-1 overflow-hidden relative bg-white"
              style={{ touchAction: 'none', minHeight: '500px' }}
            >
              <ImageCropper
                imageUrl={tempImageUrl}
                onCrop={handleCropComplete}
                onCancel={handleCancelCrop}
                aspectRatio={croppingMode === 'desktop' ? desktopAspectRatio : mobileAspectRatio}
                noModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
