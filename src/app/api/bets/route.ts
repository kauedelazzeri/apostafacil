import { NextResponse } from 'next/server'
import { Bet } from '@/types/bet'
import { addBet, getAllBets } from '@/lib/storage'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.titulo || !data.opcoes || !data.data_encerramento || !data.valor_aposta || !data.nome_criador) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate options
    if (data.opcoes.length < 2 || data.opcoes.length > 10) {
      return NextResponse.json(
        { error: 'Number of options must be between 2 and 10' },
        { status: 400 }
      )
    }

    // Create new bet
    const newBet: Omit<Bet, 'id' | 'created_at'> = {
      titulo: data.titulo,
      descricao: data.descricao,
      opcoes: data.opcoes,
      valor_aposta: data.valor_aposta,
      data_encerramento: data.data_encerramento,
      nome_criador: data.nome_criador,
      email_criador: data.email_criador,
      visibilidade: data.visibilidade || 'public',
      permitir_sem_login: data.permitir_sem_login ?? false,
    }

    const createdBet = await addBet(newBet)
    return NextResponse.json(createdBet)
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get the user's session from cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      // If there's a session error, treat as not logged in
      const publicBets = await getAllBets(null)
      return NextResponse.json(publicBets, {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
    }

    console.log('Session user:', session?.user?.email) // Debug log
    
    // Get bets using the user's email (if logged in)
    const bets = await getAllBets(session?.user?.email)
    
    return NextResponse.json(bets, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error in GET /api/bets:', error)
    // In case of error, return only public bets
    const publicBets = await getAllBets(null)
    return NextResponse.json(publicBets, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  }
} 