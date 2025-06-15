'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getBet, addVote, getVotes, updateBet } from '@/lib/storage'
import { useSupabase } from '@/providers/supabase-provider'
import { Bet, Vote } from '@/types/bet'
import { ShareButton } from '@/components/share-button'
import { AuthButton } from '@/components/auth-button'
import { track } from '@/lib/amplitude'
import { ANALYTICS_EVENTS, getBetProperties, getUserProperties, getVoteProperties } from '@/lib/analytics'

export default function BetPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useSupabase()
  const [bet, setBet] = useState<Bet | null>(null)
  const [isBetLoading, setIsBetLoading] = useState(true)
  const [votes, setVotes] = useState<Vote[]>([])
  const [voterName, setVoterName] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [finalResult, setFinalResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [formInteractions, setFormInteractions] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return

      setIsBetLoading(true)

      // Track page view
      track(ANALYTICS_EVENTS.PAGE_VIEW, {
        page: 'Bet View',
        betId: params.id,
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });

      const betData = await getBet(params.id as string)
      if (!betData) {
        setError('Aposta não encontrada')
        track('Error Loading Bet', {
          betId: params.id,
          error: 'Bet not found',
          user: user ? getUserProperties(user) : null,
          timestamp: new Date().toISOString()
        });
        setIsBetLoading(false)
        return
      }

      setBet(betData)
      setIsCreator(user?.email === betData.email_criador)

      const votesData = await getVotes(params.id as string)
      setVotes(votesData)

      // Track successful data load
      track('Bet Data Loaded', {
        ...getBetProperties(betData),
        votesCount: votesData.length,
        isCreator: user?.email === betData.email_criador,
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });
      setIsBetLoading(false)
    }

    fetchData()
  }, [params.id, user])

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Track vote submission attempt
    track(ANALYTICS_EVENTS.BET_VOTE_SUBMIT, {
      betId: bet?.id,
      betTitle: bet?.titulo,
      voterName,
      selectedOption,
      formInteractions,
      user: user ? getUserProperties(user) : null,
      timestamp: new Date().toISOString()
    });

    try {
      if (!bet) return
      if (!voterName || !selectedOption) {
        throw new Error('Por favor, preencha seu nome e selecione uma opção')
      }

      const vote = await addVote({
        aposta_id: bet.id,
        nome_apostador: voterName,
        opcao_escolhida: selectedOption,
      })

      // Refresh votes
      const votesData = await getVotes(bet.id)
      setVotes(votesData)
      
      // Track successful vote
      track(ANALYTICS_EVENTS.BET_VOTE_SUCCESS, {
        ...getBetProperties(bet),
        ...getVoteProperties(vote),
        formInteractions,
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });
      
      // Clear form
      setVoterName('')
      setSelectedOption('')
      setFormInteractions(0)
      
      alert('Aposta registrada com sucesso!')
    } catch (error) {
      console.error('Error adding vote:', error)
      setError(error instanceof Error ? error.message : 'Erro ao registrar aposta')

      // Track error
      track(ANALYTICS_EVENTS.BET_VOTE_ERROR, {
        betId: bet?.id,
        betTitle: bet?.titulo,
        error: error instanceof Error ? error.message : 'Unknown error',
        formData: {
          voterName,
          selectedOption,
          formInteractions
        },
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalizeBet = async () => {
    if (!bet || !finalResult) return

    // Track finalize attempt
    track(ANALYTICS_EVENTS.BET_FINALIZE_SUBMIT, {
      ...getBetProperties(bet),
      finalResult,
      user: user ? getUserProperties(user) : null,
      timestamp: new Date().toISOString()
    });

    try {
      const updatedBet = await updateBet({
        ...bet,
        resultado_final: finalResult,
      })

      // Refresh bet data
      const refreshedBet = await getBet(bet.id)
      if (refreshedBet) {
        setBet(refreshedBet)
      }

      // Track successful finalization
      track(ANALYTICS_EVENTS.BET_FINALIZE_SUCCESS, {
        ...getBetProperties(updatedBet),
        finalResult,
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });

      alert('Aposta finalizada com sucesso!')
    } catch (error) {
      console.error('Error finalizing bet:', error)
      setError('Erro ao finalizar aposta')

      // Track error
      track(ANALYTICS_EVENTS.BET_FINALIZE_ERROR, {
        ...getBetProperties(bet),
        finalResult,
        error: error instanceof Error ? error.message : 'Unknown error',
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track form field changes
  const trackFieldChange = (field: string, value: string) => {
    setFormInteractions(prev => prev + 1)
    track(ANALYTICS_EVENTS.BET_VOTE_START, {
      betId: bet?.id,
      betTitle: bet?.titulo,
      field,
      valueLength: value.length,
      formInteractions: formInteractions + 1,
      user: user ? getUserProperties(user) : null,
      timestamp: new Date().toISOString()
    });
  }

  if (isAuthLoading || isBetLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
        Carregando...
      </div>
    )
  }

  if (!bet) {
    if (!user) {
      return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <p>Você precisa estar logado via Google para visualizar esta aposta.</p>
            <AuthButton />
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
        {error || 'Aposta não encontrada ou você não tem permissão para visualizá-la.'}
      </div>
    )
  }

  // Calculate vote counts and winners
  const voteCounts = bet.opcoes.reduce((acc, option) => {
    acc[option] = votes.filter(vote => vote.opcao_escolhida === option).length
    return acc
  }, {} as Record<string, number>)

  // Calculate winners and prizes
  const winners = bet.resultado_final ? votes.filter(vote => vote.opcao_escolhida === bet.resultado_final) : []
  const totalValue = votes.length * (parseFloat(bet.valor_aposta.replace(/[^0-9,]/g, '').replace(',', '.')) || 0)
  const prizePerWinner = winners.length > 0 ? totalValue / winners.length : 0

  const betUrl = `${window.location.origin}/bet/${bet.id}`

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              track('Back Button Clicked', {
                pageFrom: 'Bet View',
                pageTo: 'Home',
                betId: bet.id,
                user: user ? getUserProperties(user) : null,
                timestamp: new Date().toISOString()
              });
              router.push('/')
            }}
            className="text-white hover:text-purple-200 transition-colors"
          >
            ← Voltar
          </button>
          <ShareButton 
            url={betUrl} 
            title={bet.titulo}
            onClick={() => {
              track(ANALYTICS_EVENTS.BET_SHARE_CLICK, {
                ...getBetProperties(bet),
                shareUrl: betUrl,
                user: user ? getUserProperties(user) : null,
                timestamp: new Date().toISOString()
              });
            }}
            onSuccess={() => {
              track(ANALYTICS_EVENTS.BET_SHARE_SUCCESS, {
                ...getBetProperties(bet),
                shareUrl: betUrl,
                user: user ? getUserProperties(user) : null,
                timestamp: new Date().toISOString()
              });
            }}
          />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">{bet.titulo}</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-purple-200">Criado por</p>
              <p className="font-medium text-white">{bet.nome_criador}</p>
            </div>
            <div>
              <p className="text-sm text-purple-200">Valor da aposta</p>
              <p className="font-medium text-white">R$ {bet.valor_aposta}</p>
            </div>
            <div>
              <p className="text-sm text-purple-200">Encerra em</p>
              <div className="flex items-center gap-2">
                <span className="text-purple-300">Data de Encerramento:</span>
                <span className="font-medium">
                  {new Date(bet.data_encerramento).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-200">Total de apostas</p>
              <p className="font-medium text-white">{votes.length}</p>
            </div>
          </div>

          {bet.descricao && (
            <p className="text-purple-100 mb-6">{bet.descricao}</p>
          )}

          {isCreator && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Resultados</h2>
              <div className="space-y-2">
                {bet.opcoes.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <span className="font-medium text-white">{option}:</span>
                    <span className="text-purple-200">{voteCounts[option] || 0} votos</span>
                  </div>
                ))}
              </div>

              {!bet.resultado_final && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-white">Finalizar Aposta</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {bet.opcoes.map((option) => (
                      <button
                        key={option}
                        onClick={() => setFinalResult(option)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          finalResult === option
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleFinalizeBet}
                    disabled={!finalResult}
                    className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-900/50 transition-colors"
                  >
                    Finalizar Aposta
                  </button>
                </div>
              )}
            </div>
          )}

          {!isCreator && !bet.resultado_final && (
            <form onSubmit={handleVote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Seu Nome *</label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => {
                    setVoterName(e.target.value)
                    trackFieldChange('voterName', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Como você quer ser identificado"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sua Escolha *</label>
                <select
                  value={selectedOption}
                  onChange={(e) => {
                    setSelectedOption(e.target.value)
                    trackFieldChange('selectedOption', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                >
                  <option value="">Selecione uma opção</option>
                  {bet.opcoes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-900/50"
              >
                {isLoading ? 'Registrando...' : 'Registrar Aposta'}
              </button>
            </form>
          )}

          {bet.resultado_final && (
            <div className="space-y-6">
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <h3 className="text-lg font-medium text-green-200">Resultado Final</h3>
                <p className="text-green-100">{bet.resultado_final}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Resumo Financeiro</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-purple-200">Total Apostado</p>
                      <p className="font-medium text-white">R$ {totalValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-200">Número de Ganhadores</p>
                      <p className="font-medium text-white">{winners.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-200">Valor por Ganhador</p>
                      <p className="font-medium text-white">R$ {prizePerWinner.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {winners.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-white">Ganhadores</h3>
                    <div className="space-y-2">
                      {winners.map((winner, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-500/20 rounded-lg">
                          <span className="font-medium text-white">{winner.nome_apostador}</span>
                          <span className="text-sm text-green-200">(R$ {prizePerWinner.toFixed(2)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 