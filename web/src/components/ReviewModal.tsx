'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'

interface ReviewModalProps {
  orderId: string
  productId: string
  productName: string
  customerName?: string
  customerEmail?: string
  onClose: () => void
  onReviewSubmitted?: () => void
}

export default function ReviewModal({
  orderId,
  productId,
  productName,
  customerName,
  customerEmail,
  onClose,
  onReviewSubmitted
}: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addReview } = useReviews()

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação (de 1 a 5 estrelas)')
      return
    }

    setSubmitting(true)
    try {
      const result = await addReview({
        order_id: orderId,
        product_id: productId,
        rating,
        comment: comment.trim() || undefined,
        customer_name: customerName,
        customer_email: customerEmail
      })

      if (result.error) {
        console.error('❌ Erro ao enviar avaliação:', result.error)
        alert(`Erro ao enviar avaliação: ${result.error instanceof Error ? result.error.message : 'Tente novamente.'}`)
      } else {
        console.log('✅ Avaliação enviada com sucesso:', result.data)
        alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.')
        onReviewSubmitted?.()
        onClose()
        
        // Disparar evento customizado para atualizar páginas que mostram avaliações
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('review-added', { 
            detail: { productId, review: result.data } 
          }))
        }
      }
    } catch (error) {
      alert('Erro ao enviar avaliação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Avaliar Produto</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Produto:</p>
          <p className="font-semibold text-gray-900">{productName}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avaliação *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {rating} {rating === 1 ? 'estrela' : 'estrelas'}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentário (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Compartilhe sua opinião sobre o produto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  )
}


