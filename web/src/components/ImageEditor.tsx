'use client'

import { useState } from 'react'
import ImageUpload from './ImageUpload'
import ImageCropper from './ImageCropper'

interface ImageEditorProps {
  imageUrl: string
  onImageSelect: (imageUrl: string) => void
  placeholder?: string
  aspectRatio?: number // Proporção desejada (largura/altura). Padrão: 1 (quadrado)
  cropSize?: number // Tamanho final da imagem em pixels. Padrão: 800
}

export default function ImageEditor({ 
  imageUrl, 
  onImageSelect, 
  placeholder = "Selecione uma imagem",
  aspectRatio = 1,
  cropSize = 800
}: ImageEditorProps) {
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string>('')

  const handleImageSelect = (url: string) => {
    if (url) {
      setTempImageUrl(url)
      setShowCropper(true)
    } else {
      onImageSelect('')
    }
  }

  const handleCrop = (croppedUrl: string) => {
    onImageSelect(croppedUrl)
    setShowCropper(false)
    setTempImageUrl('')
  }

  const handleCancelCrop = () => {
    setShowCropper(false)
    setTempImageUrl('')
  }

  return (
    <>
      <div className="space-y-4">
        <ImageUpload
          onImageSelect={handleImageSelect}
          currentImage={imageUrl}
          placeholder={placeholder}
        />
        
        {imageUrl && (
          <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">Preview da Imagem</div>
              <button
                type="button"
                onClick={() => {
                  setTempImageUrl(imageUrl)
                  setShowCropper(true)
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                ✏️ Editar
              </button>
            </div>
            <div className="relative inline-block bg-white rounded-lg p-2 shadow-sm">
              <img
                src={imageUrl}
                alt="Preview"
                className="object-cover rounded border-2 border-gray-300"
                style={{
                  aspectRatio: aspectRatio.toString(),
                  width: aspectRatio >= 1 ? '160px' : `${160 * aspectRatio}px`,
                  height: aspectRatio >= 1 ? `${160 / aspectRatio}px` : '160px',
                  maxWidth: '100%'
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Aspect ratio: {aspectRatio}:1</p>
          </div>
        )}
      </div>

      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
          aspectRatio={aspectRatio}
        />
      )}
    </>
  )
}

