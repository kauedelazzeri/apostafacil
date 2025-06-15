import { getAllBets } from '../storage'

const mockFrom = jest.fn()

jest.mock('../supabase', () => ({
  supabase: { from: mockFrom }
}))

describe('getAllBets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('filters public bets when no email is provided', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    }
    mockFrom.mockReturnValueOnce(query)

    await getAllBets()

    expect(mockFrom).toHaveBeenCalledWith('apostas')
    expect(query.select).toHaveBeenCalledWith('*')
    expect(query.eq).toHaveBeenCalledWith('visibilidade', 'public')
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('includes private bets for creator when email is provided', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    }
    mockFrom.mockReturnValueOnce(query)

    await getAllBets('user@example.com')

    expect(query.or).toHaveBeenCalledWith(
      'and(visibilidade.eq.public),and(visibilidade.eq.private,email_criador.eq.user@example.com)'
    )
  })
})
