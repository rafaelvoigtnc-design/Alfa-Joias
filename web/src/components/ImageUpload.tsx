'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void
  currentImage?: string
  placeholder?: string
}

export default function ImageUpload({ onImageSelect, currentImage, placeholder = "Selecione uma imagem" }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage)
    }
    // Não limpar preview quando currentImage está vazio, para evitar que desapareça durante operações
  }, [currentImage])

  const handleDrag = (e: React.DragEvent) => {
    // Só interferir se houver arquivos sendo arrastados
    const hasFiles = e.dataTransfer.types.includes('Files')
    if (!hasFiles) {
      // Permitir scroll normal se não há arquivos
      return
    }
    
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    // Só processar se houver arquivos
    const hasFiles = e.dataTransfer.types.includes('Files')
    if (!hasFiles) {
      return
    }
    
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleFile(file)
      }
    }
  }

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        // Atualizar preview primeiro para garantir que a imagem apareça imediatamente
        setPreview(result)
        // Depois notificar o parent
        onImageSelect(result)
      }
      reader.onerror = () => {
        console.error('Erro ao ler arquivo')
        setPreview(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeImage = () => {
    setPreview(null)
    onImageSelect('')
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={(e) => {
          // Só processar se houver arquivos E não houver preview (para não interferir com scroll)
          if (e.dataTransfer.types.includes('Files') && !preview) {
            e.preventDefault()
            e.stopPropagation()
            handleDrag(e)
          }
        }}
        onDragLeave={(e) => {
          // Só processar se houver arquivos E não houver preview
          if (e.dataTransfer.types.includes('Files') && !preview) {
            e.preventDefault()
            e.stopPropagation()
            // Só desativar drag se realmente saiu do elemento
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX
            const y = e.clientY
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
              handleDrag(e)
            }
          }
        }}
        onDragOver={(e) => {
          // Só processar se houver arquivos E não houver preview
          if (e.dataTransfer.types.includes('Files') && !preview) {
            e.preventDefault()
            e.stopPropagation()
            handleDrag(e)
          }
        }}
        onDrop={(e) => {
          // Só processar se houver arquivos E não houver preview
          if (e.dataTransfer.types.includes('Files') && !preview) {
            e.preventDefault()
            e.stopPropagation()
            handleDrop(e)
          }
        }}
        style={preview ? { pointerEvents: 'none' } : {}}
      >
        {!preview && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}
        
        <div className="text-center">
          {preview ? (
            <div className="relative inline-block" style={{ pointerEvents: 'auto' }}>
              <img
                src={preview}
                alt="Preview"
                className="mx-auto h-32 w-32 object-cover rounded-lg select-none"
                draggable="false"
                onDragStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  return false
                }}
                onMouseDown={(e) => {
                  // Não fazer nada, permitir que o evento passe para scroll
                  return false
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Criar um input temporário para selecionar nova imagem
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        handleFile(file)
                      }
                    }
                    input.click()
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Trocar imagem
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500">
                Arraste e solte uma imagem ou clique para selecionar
              </p>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ImageIcon className="h-4 w-4" />
          <span>Imagem selecionada</span>
        </div>
      )}
    </div>
  )
}
