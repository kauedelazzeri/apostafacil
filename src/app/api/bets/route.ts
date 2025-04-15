import { NextResponse } from 'next/server'
import { Bet } from '@/types/bet'
import { addBet, getAllBets } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.options || !data.endDate || !data.betValue || !data.creatorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate options
    if (data.options.length < 2 || data.options.length > 10) {
      return NextResponse.json(
        { error: 'Number of options must be between 2 and 10' },
        { status: 400 }
      )
    }

    // Create new bet
    const newBet: Bet = {
      id: Math.random().toString(36).substring(2, 9),
      title: data.title,
      description: data.description,
      options: data.options,
      endDate: data.endDate,
      betValue: data.betValue,
      creatorName: data.creatorName,
      createdAt: new Date().toISOString(),
      votes: [],
    }

    addBet(newBet)

    return NextResponse.json(newBet)
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(getAllBets())
} 