'use client'

import { useState } from 'react'
import ImageUpload from './ImageUpload'
import ImageCropper from './ImageCropper'

interface CategoryImageEditorProps {
  imageUrl: string
  onImageSelect: (imageUrl: string) => void
  placeholder?: string
}

export default function CategoryImageEditor({ imageUrl, onImageSelect, placeholder = "Selecione uma imagem" }: CategoryImageEditorProps) {
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
      <div className="space-y-3">
        <ImageUpload
          onImageSelect={handleImageSelect}
          currentImage={imageUrl}
          placeholder={placeholder}
        />
        
        {imageUrl && (
          <div className="relative">
            <div className="text-xs text-gray-500 mb-2">Imagem atual:</div>
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setTempImageUrl(imageUrl)
                  setShowCropper(true)
                }}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Editar Imagem
              </button>
            </div>
          </div>
        )}
      </div>

      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
          aspectRatio={1} // Proporção quadrada para categorias
        />
      )}
    </>
  )
}


