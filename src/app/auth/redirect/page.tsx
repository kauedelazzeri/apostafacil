'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/supabase-provider'

export default function AuthRedirectPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()

  useEffect(() => {
    if (!isLoading) {
      // Get the stored return URL from sessionStorage
      const returnToUrl = typeof window !== 'undefined' ? sessionStorage.getItem('returnToUrl') : null
      
      if (returnToUrl) {
        // Clear the stored URL
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('returnToUrl')
        }
        console.log('Redirecting to stored URL:', returnToUrl)
        router.replace(returnToUrl)
      } else {
        console.log('No stored URL, redirecting to home')
        router.replace('/')
      }
    }
  }, [isLoading, router])

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Redirecionando...</h1>
          <p className="text-purple-200">
            Login realizado com sucesso! Você será redirecionado em instantes.
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    </main>
  )
}