import { NextResponse } from 'next/server'
import { Bet } from '@/types/bet'
import { addBet, getAllBets } from '@/lib/storage'

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
    const bets = await getAllBets()

    return NextResponse.json(bets, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error in GET /api/bets:', error)
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  }
}
