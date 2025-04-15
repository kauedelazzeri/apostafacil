import { Bet } from '@/types/bet'

const STORAGE_KEY = 'apostafacil_bets'

// Initialize storage from localStorage
const initializeStorage = () => {
  if (typeof window !== 'undefined') {
    const storedBets = localStorage.getItem(STORAGE_KEY)
    if (storedBets) {
      return JSON.parse(storedBets)
    }
  }
  return []
}

// In-memory storage with localStorage backup
const bets: Bet[] = initializeStorage()

// Helper functions
export const getBet = (id: string) => {
  return bets.find((bet) => bet.id === id)
}

export const addBet = (bet: Bet) => {
  bets.push(bet)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
  }
  return bet
}

export const updateBet = (updatedBet: Bet) => {
  const index = bets.findIndex((bet) => bet.id === updatedBet.id)
  if (index !== -1) {
    bets[index] = updatedBet
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
    }
  }
  return updatedBet
}

export const getAllBets = () => {
  return bets
} 