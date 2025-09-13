import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback called with:', { code: !!code, origin: requestUrl.origin })

  if (code) {
    try {
      const cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 })
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
      } else {
        console.log('Successfully exchanged code for session:', !!data.session)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Redirect to a special page that will handle the client-side redirect
  const redirectUrl = new URL('/auth/redirect', requestUrl.origin)
  console.log('Redirecting to:', redirectUrl.toString())

  return NextResponse.redirect(redirectUrl)
} 