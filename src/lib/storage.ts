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
  // Only update specific fields to avoid conflicts
  const updateData = {
    titulo: updatedBet.titulo,
    descricao: updatedBet.descricao,
    opcoes: updatedBet.opcoes,
    valor_aposta: updatedBet.valor_aposta,
    data_encerramento: updatedBet.data_encerramento,
    nome_criador: updatedBet.nome_criador,
    resultado_final: updatedBet.resultado_final,
    visibilidade: updatedBet.visibilidade,
    permitir_sem_login: updatedBet.permitir_sem_login
  }

  console.log('Updating bet with data:', updateData) // Debug log

  const { error } = await supabase
    .from('apostas')
    .update(updateData)
    .eq('id', updatedBet.id)

  if (error) {
    console.error('Error updating bet:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw error
  }

  console.log('Bet updated successfully')
  
  // Fetch the updated data separately to avoid 406 error
  const { data, error: fetchError } = await supabase
    .from('apostas')
    .select('*')
    .eq('id', updatedBet.id)
    .single()
    
  if (fetchError) {
    console.error('Error fetching updated bet:', fetchError)
    throw fetchError
  }
  
  return data
}

// Specific function for finalizing bets (updating only resultado_final)
export const finalizeBet = async (betId: string, resultado_final: string) => {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      throw new Error('Usuário não autenticado')
    }

    // First, verify the bet exists and user permissions
    const { data: currentBet, error: fetchError } = await supabase
      .from('apostas')
      .select('*')
      .eq('id', betId)
      .single()

    if (fetchError || !currentBet) {
      throw new Error(`Aposta não encontrada: ${betId}`)
    }

    // Check if user is the creator
    if (session.user.email !== currentBet.email_criador) {
      throw new Error('Apenas o criador da aposta pode finalizá-la')
    }

    // Check if bet is already finalized
    if (currentBet.resultado_final) {
      throw new Error('Esta aposta já foi finalizada')
    }

    // Use RPC function for the update
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('finalize_bet', {
        bet_id: betId,
        final_result: resultado_final,
        user_email: session.user.email
      })

    if (rpcError) {
      // Fallback to direct update
      const { error: updateError } = await supabase
        .from('apostas')
        .update({ resultado_final })
        .eq('id', betId)
        .eq('email_criador', session.user.email)

      if (updateError) {
        throw new Error(`Erro ao atualizar aposta: ${updateError.message}`)
      }
    }

    // Fetch the updated data
    const { data: afterUpdateBet, error: afterUpdateError } = await supabase
      .from('apostas')
      .select('*')
      .eq('id', betId)
      .single()

    if (afterUpdateError || !afterUpdateBet) {
      throw new Error('Erro ao verificar atualização')
    }

    // Check if the update actually worked
    if (afterUpdateBet.resultado_final !== resultado_final) {
      throw new Error('A atualização não foi persistida no banco de dados')
    }

    return afterUpdateBet

  } catch (error) {
    throw error
  }
}

// Specific function for soft deleting bets
export const deleteBet = async (betId: string) => {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      throw new Error('Usuário não autenticado')
    }

    // First, verify the bet exists and user permissions
    const { data: currentBet, error: fetchError } = await supabase
      .from('apostas')
      .select('*')
      .eq('id', betId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentBet) {
      throw new Error('Aposta não encontrada')
    }

    // Check if user is the creator
    if (session.user.email !== currentBet.email_criador) {
      throw new Error('Apenas o criador da aposta pode deletá-la')
    }

    // Use RPC function for the soft delete
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('delete_bet', {
        bet_id: betId,
        user_email: session.user.email
      })

    if (rpcError) {
      throw new Error(`Erro ao deletar aposta: ${rpcError.message}`)
    }

    return rpcResult

  } catch (error) {
    throw error
  }
}

export const getAllBets = async (userEmail?: string | null) => {
  console.log('Fetching bets for user:', userEmail) // Debug log

  let query = supabase
    .from('apostas')
    .select('*')
    .is('deleted_at', null) // Filter out deleted bets

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