'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Check if URL contains Supabase API endpoint
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      
      // Check for Supabase API URL pattern
      if (currentUrl.includes('supabase.co/rest/v1/apostas')) {
        const urlMatch = currentUrl.match(/id=eq\.([a-f0-9-]+)/)
        if (urlMatch) {
          const betId = urlMatch[1]
          // Redirect to correct application URL
          router.replace(`/bet/${betId}`)
          return
        }
      }
    }
  }, [router])

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Página não encontrada</h1>
          <p className="text-purple-200 mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voltar para Home
            </button>
            <p className="text-sm text-purple-300">
              Se você recebeu um link por WhatsApp ou outra rede social, tente acessar novamente ou peça para a pessoa reenviar o link.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}