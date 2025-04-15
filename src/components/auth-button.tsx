'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { supabase } from '@/lib/supabase'

export function AuthButton() {
  const { user, isLoading } = useSupabase()

  const handleSignIn = async () => {
    const redirectUrl = window.location.origin.includes('localhost')
      ? `${window.location.origin}/auth/callback`
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`

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
      <div className="flex items-center gap-4">
        <span className="text-sm text-white">
          Olá, {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
    >
      Entrar com Google
    </button>
  )
} 