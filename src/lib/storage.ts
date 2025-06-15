import { Bet, Vote } from '@/types/bet'
import { supabase } from './supabase'

export const getBet = async (id: string) => {
  const { data, error } = await supabase
    .from('apostas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching bet:', error)
    return null
  }

  return data
}

export const addBet = async (bet: Omit<Bet, 'id' | 'created_at'>) => {
  console.log('Adding bet:', bet)
  
  // Ensure opcoes is a valid array
  if (!Array.isArray(bet.opcoes) || bet.opcoes.some(opt => typeof opt !== 'string')) {
    throw new Error('Opções inválidas: todas as opções devem ser strings')
  }
  
  const { data, error } = await supabase
    .from('apostas')
    .insert([
      {
        ...bet,
        opcoes: bet.opcoes, // Ensure it's passed as a proper array
        permitir_sem_login: bet.permitir_sem_login
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding bet:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw new Error(`Error adding bet: ${error.message}`)
  }

  console.log('Bet added successfully:', data)
  return data
}

export const updateBet = async (updatedBet: Bet) => {
  const { data, error } = await supabase
    .from('apostas')
    .update(updatedBet)
    .eq('id', updatedBet.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating bet:', error)
    throw error
  }

  return data
}

export const getAllBets = async (userEmail?: string | null) => {
  console.log('Fetching bets for user:', userEmail) // Debug log

  let query = supabase
    .from('apostas')
    .select('*')

  if (!userEmail) {
    console.log('No user email, filtering public bets only') // Debug log
    query = query.eq('visibilidade', 'public')
  } else {
    console.log('User email found, including private bets') // Debug log
    query = query.or(`and(visibilidade.eq.public),and(visibilidade.eq.private,email_criador.eq.${userEmail})`)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bets:', error)
    return []
  }

  console.log('Fetched bets:', data?.length, 'bets') // Debug log
  return data || []
}

export const addVote = async (vote: Omit<Vote, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('apostas_feitas')
    .insert([vote])
    .select()
    .single()

  if (error) {
    console.error('Error adding vote:', error)
    throw error
  }

  return data
}

export const getVotes = async (betId: string) => {
  const { data, error } = await supabase
    .from('apostas_feitas')
    .select('*')
    .eq('aposta_id', betId)

  if (error) {
    console.error('Error fetching votes:', error)
    return []
  }

  return data
} 