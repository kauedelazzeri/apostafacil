import { NextResponse } from 'next/server'
import { Bet, Vote } from '@/types/bet'
import { getBet, updateBet } from '@/lib/storage'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const bet = getBet(params.id)

  if (!bet) {
    return NextResponse.json(
      { error: 'Bet not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(bet)
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bet = getBet(params.id)

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.voterName || !data.option) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate option
    if (!bet.options.includes(data.option)) {
      return NextResponse.json(
        { error: 'Invalid option' },
        { status: 400 }
      )
    }

    // Check if bet has ended
    if (new Date(bet.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'Bet has ended' },
        { status: 400 }
      )
    }

    // Create new vote
    const newVote: Vote = {
      id: Math.random().toString(36).substring(2, 9),
      betId: params.id,
      voterName: data.voterName,
      option: data.option,
      createdAt: new Date().toISOString(),
    }

    // Update bet with new vote
    bet.votes.push(newVote)
    updateBet(bet)

    return NextResponse.json(bet)
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 