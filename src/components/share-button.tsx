'use client'

import { useState } from 'react'

interface ShareButtonProps {
  url: string
  title: string
  onClick?: () => void
  onSuccess?: () => void
}

export function ShareButton({ url, title, onClick, onSuccess }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    onClick?.()
    
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        })
        onSuccess?.()
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47A3 3 0 0015 8z" />
      </svg>
      {copied ? 'Link copiado!' : 'Compartilhar'}
    </button>
  )
}
