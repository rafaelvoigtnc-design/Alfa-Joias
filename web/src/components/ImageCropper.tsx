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
  const imageRef = useRef<HTMLImageElement | null>(null)
  
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropWidth, setCropWidth] = useState(400)
  const [cropHeight, setCropHeight] = useState(400)

  // Carregar imagem e calcular escala inicial
  useEffect(() => {
    if (imageUrl && containerRef.current) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.current = img
        
        // Calcular tamanho do container
        const container = containerRef.current
        if (!container) return
        
        const containerWidth = container.clientWidth - 40
        const containerHeight = container.clientHeight - 40
        
        // Calcular dimensões da área de crop baseado no aspect ratio
        const maxWidth = Math.min(containerWidth * 0.9, 800)
        const maxHeight = Math.min(containerHeight * 0.8, 600)
        
        let cropWidthValue: number
        let cropHeightValue: number
        
        if (aspectRatio >= 1) {
          // Largura >= Altura (horizontal ou quadrado)
          cropWidthValue = Math.min(maxWidth, maxHeight * aspectRatio)
          cropHeightValue = cropWidthValue / aspectRatio
        } else {
          // Altura > Largura (vertical)
          cropHeightValue = Math.min(maxHeight, maxWidth / aspectRatio)
          cropWidthValue = cropHeightValue * aspectRatio
        }
        
        setCropWidth(cropWidthValue)
        setCropHeight(cropHeightValue)
        
        // Calcular escala inicial para preencher a área de crop
        const scaleX = cropWidthValue / img.width
        const scaleY = cropHeightValue / img.height
        const initialScale = Math.max(scaleX, scaleY) * 1.1 // 10% a mais para garantir preenchimento
        
        setScale(initialScale)
        setPosition({ x: 0, y: 0 })
        setRotation(0)
        
        drawImage()
      }
      img.src = imageUrl
    }
  }, [imageUrl, aspectRatio])

  useEffect(() => {
    drawImage()
  }, [scale, position, rotation, cropWidth, cropHeight, aspectRatio])

  const drawImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const container = containerRef.current
    if (!container) return

    // Definir tamanho do canvas
    const containerWidth = container.clientWidth - 40
    const containerHeight = container.clientHeight - 40
    canvas.width = containerWidth
    canvas.height = containerHeight

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar fundo escuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calcular posição da área de crop (centralizada)
    const cropX = (canvas.width - cropWidth) / 2
    const cropY = (canvas.height - cropHeight) / 2

    // Criar clipping path para a área de crop
    ctx.save()
    ctx.beginPath()
    ctx.rect(cropX, cropY, cropWidth, cropHeight)
    ctx.clip()

    // Calcular transformações para a imagem
    const centerX = cropX + cropWidth / 2
    const centerY = cropY + cropHeight / 2

    // Aplicar transformações
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    
    // Limitar posição para que a imagem nunca saia dos limites
    const imgWidth = img.width
    const imgHeight = img.height
    
    // Calcular limites máximos de posição
    const maxX = (imgWidth * scale) / 2 - cropWidth / 2
    const maxY = (imgHeight * scale) / 2 - cropHeight / 2
    
    const constrainedX = Math.max(-maxX, Math.min(maxX, position.x))
    const constrainedY = Math.max(-maxY, Math.min(maxY, position.y))
    
    ctx.translate(-imgWidth / 2 + constrainedX / scale, -imgHeight / 2 + constrainedY / scale)
    
    // Desenhar imagem
    ctx.drawImage(img, 0, 0)
    ctx.restore()

    // Desenhar borda da área de crop
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)

    // Desenhar guias de grade (regra dos terços)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    const thirdX = cropWidth / 3
    const thirdY = cropHeight / 3
    ctx.beginPath()
    // Linhas verticais
    ctx.moveTo(cropX + thirdX, cropY)
    ctx.lineTo(cropX + thirdX, cropY + cropHeight)
    ctx.moveTo(cropX + thirdX * 2, cropY)
    ctx.lineTo(cropX + thirdX * 2, cropY + cropHeight)
    // Linhas horizontais
    ctx.moveTo(cropX, cropY + thirdY)
    ctx.lineTo(cropX + cropWidth, cropY + thirdY)
    ctx.moveTo(cropX, cropY + thirdY * 2)
    ctx.lineTo(cropX + cropWidth, cropY + thirdY * 2)
    ctx.stroke()
  }

  const handleZoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.1, 5)
      constrainPosition(newScale, position)
      return newScale
    })
  }

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.1, 0.3)
      constrainPosition(newScale, position)
      return newScale
    })
  }

  const constrainPosition = (currentScale: number, currentPosition: { x: number; y: number }) => {
    if (!imageRef.current) return currentPosition

    const img = imageRef.current
    const imgWidth = img.width
    const imgHeight = img.height
    
    // Calcular limites máximos de posição
    const maxX = (imgWidth * currentScale) / 2 - cropWidth / 2
    const maxY = (imgHeight * currentScale) / 2 - cropHeight / 2
    
    return {
      x: Math.max(-maxX, Math.min(maxX, currentPosition.x)),
      y: Math.max(-maxY, Math.min(maxY, currentPosition.y))
    }
  }

  const handleResetZoom = () => {
    if (!imageRef.current) return
    
    const img = imageRef.current
    const scaleX = cropWidth / img.width
    const scaleY = cropHeight / img.height
    const initialScale = Math.max(scaleX, scaleY) * 1.1
    
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
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Verificar se o clique está dentro da área de crop
    const cropX = (canvas.width - cropWidth) / 2
    const cropY = (canvas.height - cropHeight) / 2
    
    if (x >= cropX && x <= cropX + cropWidth && y >= cropY && y <= cropY + cropHeight) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageRef.current) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
      
      // Aplicar restrições de posição
      const constrained = constrainPosition(scale, newPosition)
      setPosition(constrained)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    const img = imageRef.current
    
    // Criar canvas temporário para o crop final
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    // Tamanho final baseado no aspect ratio
    // Usar tamanho fixo maior para melhor qualidade (pode ser ajustado)
    const finalWidth = Math.round(cropWidth * 2) // 2x para melhor qualidade
    const finalHeight = Math.round(cropHeight * 2)
    
    tempCanvas.width = finalWidth
    tempCanvas.height = finalHeight

    // Calcular posição final com restrições
    const imgWidth = img.width
    const imgHeight = img.height
    const maxX = (imgWidth * scale) / 2 - cropWidth / 2
    const maxY = (imgHeight * scale) / 2 - cropHeight / 2
    const constrainedX = Math.max(-maxX, Math.min(maxX, position.x))
    const constrainedY = Math.max(-maxY, Math.min(maxY, position.y))

    // Aplicar transformações
    tempCtx.save()
    tempCtx.translate(finalWidth / 2, finalHeight / 2)
    tempCtx.rotate((rotation * Math.PI) / 180)
    tempCtx.scale(scale * 2, scale * 2) // Escalar 2x para corresponder ao tamanho do canvas
    tempCtx.translate(-imgWidth / 2 + constrainedX / scale, -imgHeight / 2 + constrainedY / scale)
    
    tempCtx.drawImage(img, 0, 0)
    tempCtx.restore()

    // Converter para base64
    const croppedImageUrl = tempCanvas.toDataURL('image/jpeg', 0.9)
    onCrop(croppedImageUrl)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Não fechar automaticamente
    if (e.target === e.currentTarget) {
      return
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 flex flex-col max-h-[calc(100vh-4rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
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
          style={{ maxHeight: 'calc(100vh - 400px)' }}
        >
          <canvas
            ref={canvasRef}
            className="border border-gray-300 bg-white shadow-lg cursor-move"
            onMouseDown={handleMouseDown}
          />
        </div>

        <div className="p-4 border-t bg-gray-50 flex-shrink-0 overflow-y-auto max-h-[300px]">
          <div className="mb-3 text-center">
            <p className="text-sm text-gray-600">
              A imagem deve preencher a área de recorte. Arraste para mover, ajuste o zoom e gire se necessário.
            </p>
          </div>
          
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

          <div className="flex justify-end gap-3 flex-wrap">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-colors"
              type="button"
            >
              <Crop className="h-4 w-4" />
              Salvar Imagem
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
