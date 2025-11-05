'use client'

import { useState, useRef, useEffect } from 'react'
import { Crop, ZoomIn, ZoomOut, Move, RotateCw, X, RotateCcw } from 'lucide-react'

interface ImageCropperProps {
  imageUrl: string
  onCrop: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number // Proporção desejada (largura/altura)
}

export default function ImageCropper({ imageUrl, onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [initialScale, setInitialScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.current = img
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Ajustar tamanho do canvas para o container
        const container = containerRef.current
        if (container) {
          const containerWidth = container.clientWidth - 40
          const containerHeight = container.clientHeight - 40
          
          // Calcular dimensões mantendo proporção
          let displayWidth = img.width
          let displayHeight = img.height
          
          if (displayWidth > containerWidth) {
            const ratio = containerWidth / displayWidth
            displayWidth = containerWidth
            displayHeight = displayHeight * ratio
          }
          
          if (displayHeight > containerHeight) {
            const ratio = containerHeight / displayHeight
            displayHeight = containerHeight
            displayWidth = displayWidth * ratio
          }

          canvas.width = displayWidth
          canvas.height = displayHeight
          
          // Ajustar escala inicial para preencher o espaço (sem exagerar)
          const scaleX = containerWidth / img.width
          const scaleY = containerHeight / img.height
          const calculatedScale = Math.max(scaleX, scaleY) * 1.05 // 5% a mais, mais conservador
          setInitialScale(calculatedScale)
          setScale(calculatedScale)
          setPosition({ x: 0, y: 0 })
          setRotation(0)
        }
        
        drawImage()
      }
      img.src = imageUrl
    }
  }, [imageUrl])

  useEffect(() => {
    drawImage()
  }, [scale, position, rotation])

  const drawImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Aplicar transformações
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)
      ctx.translate(-img.width / 2 + position.x / scale, -img.height / 2 + position.y / scale)
      
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }
    img.src = imageUrl
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3))
  }

  const handleResetZoom = () => {
    setScale(initialScale)
    setPosition({ x: 0, y: 0 })
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleResetRotation = () => {
    setRotation(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Criar canvas temporário para o crop
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      // Tamanho final da imagem (proporção desejada)
      const finalWidth = 800
      const finalHeight = finalWidth / aspectRatio

      tempCanvas.width = finalWidth
      tempCanvas.height = finalHeight

      // Calcular posição e escala para preencher sem bordas
      const scaleX = finalWidth / img.width
      const scaleY = finalHeight / img.height
      const scaleToUse = Math.max(scaleX, scaleY) * scale

      const centerX = finalWidth / 2
      const centerY = finalHeight / 2

      // Aplicar transformações
      tempCtx.save()
      tempCtx.translate(centerX, centerY)
      tempCtx.rotate((rotation * Math.PI) / 180)
      tempCtx.scale(scaleToUse, scaleToUse)
      tempCtx.translate(-img.width / 2 + position.x / scale, -img.height / 2 + position.y / scale)
      
      tempCtx.drawImage(img, 0, 0)
      tempCtx.restore()

      // Converter para base64
      const croppedImageUrl = tempCanvas.toDataURL('image/jpeg', 0.9)
      onCrop(croppedImageUrl)
    }
    img.src = imageUrl
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Só fechar se clicar diretamente no backdrop, não nos filhos
    if (e.target === e.currentTarget) {
      // Não fechar automaticamente - requer clicar no X ou Cancelar
      return
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Editar Imagem</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className="flex-1 p-4 overflow-auto bg-gray-100 flex items-center justify-center min-h-[400px]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="border border-gray-300 bg-white shadow-lg cursor-move"
            onMouseDown={handleMouseDown}
          />
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <button
              onClick={handleZoomOut}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              type="button"
            >
              <ZoomOut className="h-4 w-4" />
              <span className="text-sm">Diminuir</span>
            </button>
            <button
              onClick={handleZoomIn}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              type="button"
            >
              <ZoomIn className="h-4 w-4" />
              <span className="text-sm">Aumentar</span>
            </button>
            <button
              onClick={handleResetZoom}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors text-blue-600"
              type="button"
            >
              <ZoomOut className="h-4 w-4" />
              <span className="text-sm">Resetar Zoom</span>
            </button>
            <button
              onClick={handleRotate}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              type="button"
            >
              <RotateCw className="h-4 w-4" />
              <span className="text-sm">Girar 90°</span>
            </button>
            <button
              onClick={handleResetRotation}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors text-blue-600"
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm">Resetar Rotação</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md">
              <Move className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Arraste para mover</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-colors"
              type="button"
            >
              <Crop className="h-4 w-4" />
              Aplicar e Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

