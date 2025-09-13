'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { supabase } from '@/lib/supabase'

export function AuthButton() {
  const { user, isLoading } = useSupabase()

  const handleSignIn = async () => {
    // Store current URL in sessionStorage for redirect after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnToUrl', window.location.pathname)
    }

    // Determine the correct redirect URL based on the environment
    const isLocalhost = window.location.hostname === 'localhost'
    const redirectUrl = isLocalhost 
      ? `${window.location.origin}/auth/callback`
      : `${window.location.origin}/auth/callback`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="bg-gray-200 text-gray-500 px-4 py-2 rounded-md font-medium cursor-not-allowed"
      >
        Carregando...
      </button>
    )
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        className="bg-red-600 text-white px-3 py-2 text-sm rounded-md font-medium hover:bg-red-700 transition-colors"
      >
        Sair
      </button>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-3 py-2 text-sm rounded-md font-medium shadow hover:bg-gray-100 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 488 512" aria-hidden="true" focusable="false">
        <path d="M488 261.8c0-17-1.4-33.7-4-49.6H249v94h134c-5.8 31.3-22.7 57.8-48.1 75.5v62.7h77.9c45.7-42 71.9-103.9 71.9-182.6z" fill="#4285F4" />
        <path d="M249 512c65.7 0 120.9-21.7 161.2-59.3l-77.9-62.7c-21.7 14.5-49.6 23.2-83.3 23.2-63.9 0-118-43.1-137.3-101.3H31.1v63.5C71.3 464 154.9 512 249 512z" fill="#34A853" />
        <path d="M111.7 311.9c-6.9-20.7-10.8-42.8-10.8-65.9s3.9-45.2 10.8-65.9V116.6H31.1A249.6 249.6 0 000 245.9c0 39.6 9.4 77.1 26.1 112.1l85.6-46.1z" fill="#FBBC05" />
        <path d="M249 97.5c35.6 0 67.4 12.3 92.5 36.3l69.3-69.3C365.9 24.5 310.7 0 249 0 154.9 0 71.3 48 31.1 116.6l85.6 65.9c19.3-58.2 73.4-101.3 137.3-101.3z" fill="#EA4335" />
        <path fill="none" d="M0 0h488v512H0z" />
      </svg>
      <span className="hidden sm:inline">Entrar com Google</span>
      <span className="sm:hidden">Google</span>
    </button>
  )
}
