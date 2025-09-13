import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback called with:', { code: !!code, origin: requestUrl.origin }) // Debug log

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  // Use the same origin as the request to ensure it works in both localhost and production
  const redirectUrl = requestUrl.origin

  console.log('Redirecting to:', redirectUrl) // Debug log

  return NextResponse.redirect(new URL('/', redirectUrl))
} 