export interface Bet {
  id: string
  titulo: string
  descricao?: string
  opcoes: string[]
  valor_aposta: string
  data_encerramento: string
  nome_criador: string
  email_criador: string
  /**
   * Define se esta aposta permite participantes não autenticados.
   */
  permitir_sem_login: boolean
  resultado_final?: string
  visibilidade: 'public' | 'private'
  created_at: string
  deleted_at?: string
}

export interface Vote {
  id: string
  aposta_id: string
  nome_apostador: string
  opcao_escolhida: string
  considerado: boolean
  created_at: string
}

// Supabase types
export type Database = {
  public: {
    Tables: {
      apostas: {
        Row: Bet
        Insert: Omit<Bet, 'id' | 'created_at'>
        Update: Partial<Omit<Bet, 'id' | 'created_at'>>
      }
      apostas_feitas: {
        Row: Vote
        Insert: Omit<Vote, 'id' | 'created_at'>
        Update: Partial<Omit<Vote, 'id' | 'created_at'>>
      }
    }
  }
} 