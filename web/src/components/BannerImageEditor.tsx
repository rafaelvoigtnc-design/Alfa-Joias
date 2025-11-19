'use client'

import { useState, useEffect } from 'react'
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
  original?: string // Imagem original antes dos crops
}

// Função para parsear a imagem (pode ser string simples ou JSON)
function parseImageData(imageUrl: string): BannerImages {
  if (!imageUrl) return {}
  
  // Tentar parsear como JSON primeiro
  try {
    const parsed = JSON.parse(imageUrl)
    if (typeof parsed === 'object' && (parsed.desktop || parsed.mobile || parsed.original)) {
      return parsed
    }
  } catch {
    // Não é JSON, tratar como string simples (compatibilidade com banners antigos)
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

// Função para serializar as imagens
function serializeImageData(images: BannerImages): string {
  // Se só tem uma imagem (original), retornar string simples para compatibilidade
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
  const [tempImageUrl, setTempImageUrl] = useState<string>('')
  const [cropMode, setCropMode] = useState<'desktop' | 'mobile'>('desktop')
  
  // Aspect ratios: desktop é mais largo (2.4:1), mobile é mais vertical (1.2:1)
  const desktopAspectRatio = 2.4
  const mobileAspectRatio = 1.2

  // Atualizar imagens quando imageUrl mudar
  useEffect(() => {
    setImages(parseImageData(imageUrl))
  }, [imageUrl])

  const handleImageSelect = (url: string) => {
    if (url) {
      // Quando uma nova imagem é selecionada, salvar como original e abrir editor para desktop
      const newImages = {
        ...images,
        original: url
      }
      setImages(newImages)
      setTempImageUrl(url)
      setCropMode('desktop')
      setShowCropper(true)
    } else {
      setImages({})
      onImageSelect('')
    }
  }

  const handleCrop = (croppedUrl: string) => {
    // Salvar o crop no modo atual (desktop ou mobile)
    const newImages = {
      ...images,
      [cropMode]: croppedUrl
    }
    setImages(newImages)
    
    // Serializar e enviar para o parent
    const serialized = serializeImageData(newImages)
    onImageSelect(serialized)
    
    setShowCropper(false)
  }

  const handleCancelCrop = () => {
    setShowCropper(false)
  }

  const switchCropMode = (mode: 'desktop' | 'mobile') => {
    setCropMode(mode)
  }

  const handleEditCrop = (mode: 'desktop' | 'mobile') => {
    // Usar a imagem original ou a do modo oposto como base para editar
    const baseImage = images.original || images.desktop || images.mobile || ''
    if (baseImage) {
      setTempImageUrl(baseImage)
      setCropMode(mode)
      setShowCropper(true)
    }
  }

  const displayImage = images.original || imageUrl || ''
  const desktopImage = images.desktop || displayImage
  const mobileImage = images.mobile || displayImage

  return (
    <>
      <div className="space-y-3">
        <ImageUpload
          onImageSelect={handleImageSelect}
          currentImage={displayImage}
          placeholder={placeholder}
        />
        
        {(displayImage || imageUrl) && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500 mb-2">Preview das imagens:</div>
            
            {/* Preview Desktop */}
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-gray-700">🖥️ Desktop (2.4:1)</div>
                <button
                  type="button"
                  onClick={() => handleEditCrop('desktop')}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Editar
                </button>
              </div>
              <div className="relative w-full overflow-hidden rounded border border-gray-200 bg-white">
                <img
                  src={desktopImage}
                  alt="Preview Desktop"
                  className="w-full h-32 object-cover"
                  style={{
                    aspectRatio: desktopAspectRatio.toString(),
                    objectPosition: 'center'
                  }}
                />
              </div>
              {!images.desktop && (
                <p className="text-xs text-yellow-600 mt-1">⚠️ Crop não configurado - usando imagem original</p>
              )}
            </div>

            {/* Preview Mobile */}
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-gray-700">📱 Mobile (1.2:1)</div>
                <button
                  type="button"
                  onClick={() => handleEditCrop('mobile')}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Editar
                </button>
              </div>
              <div className="relative w-48 mx-auto overflow-hidden rounded border border-gray-200 bg-white">
                <img
                  src={mobileImage}
                  alt="Preview Mobile"
                  className="w-full h-40 object-cover"
                  style={{
                    aspectRatio: mobileAspectRatio.toString(),
                    objectPosition: 'center'
                  }}
                />
              </div>
              {!images.mobile && (
                <p className="text-xs text-yellow-600 mt-1">⚠️ Crop não configurado - usando imagem original</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showCropper && tempImageUrl && (
        <BannerCropperModal
          imageUrl={tempImageUrl}
          cropMode={cropMode}
          onCropModeChange={switchCropMode}
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
          desktopAspectRatio={desktopAspectRatio}
          mobileAspectRatio={mobileAspectRatio}
        />
      )}
    </>
  )
}

// Componente modal separado para o cropper de banner
function BannerCropperModal({
  imageUrl,
  cropMode,
  onCropModeChange,
  onCrop,
  onCancel,
  desktopAspectRatio,
  mobileAspectRatio
}: {
  imageUrl: string
  cropMode: 'desktop' | 'mobile'
  onCropModeChange: (mode: 'desktop' | 'mobile') => void
  onCrop: (url: string) => void
  onCancel: () => void
  desktopAspectRatio: number
  mobileAspectRatio: number
}) {
  const [currentMode, setCurrentMode] = useState(cropMode)
  const [key, setKey] = useState(0) // Key para forçar remontagem do ImageCropper
  
  const handleModeChange = (mode: 'desktop' | 'mobile') => {
    setCurrentMode(mode)
    onCropModeChange(mode)
    setKey(prev => prev + 1) // Força remontagem do cropper com novo aspect ratio
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Editar Enquadramento do Banner</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Seletor de modo */}
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('desktop')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              type="button"
            >
              🖥️ Desktop (2.4:1)
            </button>
            <button
              onClick={() => handleModeChange('mobile')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              type="button"
            >
              📱 Mobile (1.2:1)
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600 text-center">
            Edite o enquadramento separadamente para cada dispositivo. A imagem será otimizada para o formato selecionado.
          </p>
        </div>

        {/* Cropper com aspect ratio baseado no modo */}
        <div className="flex-1 overflow-hidden relative min-h-[500px]">
          <ImageCropper
            key={key}
            imageUrl={imageUrl}
            onCrop={(croppedUrl) => {
              onCrop(croppedUrl)
              // Não fechar - permitir continuar editando
              const nextMode = currentMode === 'desktop' ? 'mobile' : 'desktop'
              // Perguntar se quer continuar editando o outro modo
              const continueEditing = window.confirm(`Crop ${currentMode === 'desktop' ? 'desktop' : 'mobile'} salvo! Deseja editar o modo ${nextMode} agora?`)
              if (!continueEditing) {
                onCancel()
              } else {
                handleModeChange(nextMode)
              }
            }}
            onCancel={onCancel}
            aspectRatio={currentMode === 'desktop' ? desktopAspectRatio : mobileAspectRatio}
            noModal={true}
          />
        </div>
      </div>
    </div>
  )
}

