// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Eventos específicos para e-commerce
export const trackProductView = (productId: string, productName: string, price: number) => {
  event({
    action: 'view_item',
    category: 'Ecommerce',
    label: `${productName} (${productId})`,
    value: price
  })
}

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number) => {
  event({
    action: 'add_to_cart',
    category: 'Ecommerce',
    label: `${productName} (${productId})`,
    value: price * quantity
  })
}

export const trackRemoveFromCart = (productId: string, productName: string) => {
  event({
    action: 'remove_from_cart',
    category: 'Ecommerce',
    label: `${productName} (${productId})`
  })
}

export const trackPurchase = (orderId: string, total: number, items: number) => {
  event({
    action: 'purchase',
    category: 'Ecommerce',
    label: orderId,
    value: total
  })
}

export const trackWhatsAppClick = (context: string) => {
  event({
    action: 'whatsapp_click',
    category: 'Engagement',
    label: context
  })
}

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Engagement',
    label: searchTerm,
    value: resultsCount
  })
}

export const trackCategoryView = (category: string) => {
  event({
    action: 'view_category',
    category: 'Navigation',
    label: category
  })
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}
