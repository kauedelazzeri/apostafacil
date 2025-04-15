export interface Bet {
  id: string
  title: string
  description?: string
  options: string[]
  endDate: string
  betValue: string
  creatorName: string
  createdAt: string
  votes: Vote[]
  winningOption?: string
}

export interface Vote {
  id: string
  betId: string
  voterName: string
  option: string
  createdAt: string
} 