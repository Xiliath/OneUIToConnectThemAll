'use client'

// Simple toast hook stub
// For a full implementation, consider using a library like sonner or react-hot-toast

import { useState } from 'react'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props])

    // Simple console log for now
    console.log('[Toast]', props.title || props.description)

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
  }

  return { toast, toasts }
}
