'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getBet, addVote, getVotes, finalizeBet, deleteBet } from '@/lib/storage'
import { useSupabase } from '@/providers/supabase-provider'
import { Bet, Vote } from '@/types/bet'
import { ShareButton } from '@/components/share-button'
import { AuthButton } from '@/components/auth-button'
import { track } from '@/lib/posthog'
import { ANALYTICS_EVENTS, getBetProperties, getUserProperties, getVoteProperties } from '@/lib/analytics'
import Head from 'next/head'

export default function BetPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSupabase()
  const [bet, setBet] = useState<Bet | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [voterName, setVoterName] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [finalResult, setFinalResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [formInteractions, setFormInteractions] = useState(0)

  useEffect(() => {
    // Check if user is trying to access Supabase API directly
    if (typeof window !== 'undefined' && window.location.href.includes('supabase.co/rest/v1')) {
      // Extract bet ID from Supabase URL pattern
      const urlMatch = window.location.href.match(/id=eq\.([a-f0-9-]+)/);
      if (urlMatch) {
        const betId = urlMatch[1];
        // Redirect to correct application URL
        window.location.href = `${window.location.origin}/bet/${betId}`;
        return;
      }
    }

    const fetchData = async () => {
      if (!params.id) return

      // Track page view
      track(ANALYTICS_EVENTS.PAGE_VIEW, {
        page: 'Bet View',
        betId: params.id,
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });

      const betData = await getBet(params.id as string, user?.email)
      if (!betData) {
        setError('Aposta não encontrada ou você não tem permissão para visualizá-la')
        track('Error Loading Bet', {
          betId: params.id,
          error: 'Bet not found or access denied',
          user: user ? getUserProperties(user) : null,
          timestamp: new Date().toISOString()
        });
        return
      }

      setBet(betData)
      setIsCreator(user?.email === betData.email_criador)

      // Update page metadata dynamically
      if (typeof window !== 'undefined') {
        document.title = `${betData.titulo} - Aposta Fácil`
        
        // Update Open Graph meta tags
        const updateMetaTag = (property: string, content: string) => {
          let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
          if (!element) {
            element = document.createElement('meta')
            element.setAttribute('property', property)
            document.head.appendChild(element)
          }
          element.setAttribute('content', content)
        }

        updateMetaTag('og:title', betData.titulo)
        updateMetaTag('og:description', betData.descricao || `Aposta: ${betData.titulo}. Valor: R$ ${betData.valor_aposta}`)
        updateMetaTag('og:image', `${window.location.origin}/images/caesjogandopoker.png`)
        updateMetaTag('og:url', window.location.href)
        
        // Twitter meta tags
        const updateTwitterTag = (name: string, content: string) => {
          let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
          if (!element) {
            element = document.createElement('meta')
            element.setAttribute('name', name)
            document.head.appendChild(element)
          }
          element.setAttribute('content', content)
        }

        updateTwitterTag('twitter:title', betData.titulo)
        updateTwitterTag('twitter:description', betData.descricao || `Aposta: ${betData.titulo}. Valor: R$ ${betData.valor_aposta}`)
        updateTwitterTag('twitter:image', `${window.location.origin}/images/caesjogandopoker.png`)
      }

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
      
      let voterIdentification: string;
      
      if (bet.permitir_sem_login) {
        // Para apostas que permitem voto sem login, usa o nome inserido
        if (!voterName || !selectedOption) {
          throw new Error('Por favor, preencha seu nome e selecione uma opção')
        }
        voterIdentification = voterName;
      } else {
        // Para apostas que exigem login, usa o email do usuário
        if (!user || !user.email) {
          throw new Error('Você precisa estar logado para votar nesta aposta')
        }
        if (!selectedOption) {
          throw new Error('Por favor, selecione uma opção')
        }
        voterIdentification = user.user_metadata?.full_name || user.email;
      }

      const vote = await addVote({
        aposta_id: bet.id,
        nome_apostador: voterIdentification,
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
      const updatedBet = await finalizeBet(bet.id, finalResult)

      // Refresh bet data
      const refreshedBet = await getBet(bet.id, user?.email)
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

  const handleDeleteBet = async () => {
    if (!bet) return

    const confirmDelete = window.confirm('Tem certeza que deseja deletar esta aposta? Esta ação não pode ser desfeita.')
    if (!confirmDelete) return

    setIsDeleting(true)
    setError('')

    // Track delete attempt
    track('Bet Delete Submit', {
      ...getBetProperties(bet),
      user: user ? getUserProperties(user) : null,
      timestamp: new Date().toISOString()
    });

    try {
      await deleteBet(bet.id)

      // Track successful deletion
      track('Bet Delete Success', {
        ...getBetProperties(bet),
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Error deleting bet:', error)
      setError('Erro ao deletar aposta')

      // Track error
      track('Bet Delete Error', {
        ...getBetProperties(bet),
        error: error instanceof Error ? error.message : 'Unknown error',
        user: user ? getUserProperties(user) : null,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsDeleting(false)
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

  if (!bet) {
    return <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">Carregando...</div>
  }

  // Check if bet is deleted
  if (bet.deleted_at) {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-red-500/50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Aposta Deletada</h1>
              <p className="text-gray-300 mb-6">
                Esta aposta foi removida pelo criador em {new Date(bet.deleted_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Voltar para Apostas
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Check if bet is private and user is not logged in
  if (bet.visibilidade === 'private' && !user) {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-yellow-400 mb-4">🔒 Aposta Privada</h1>
              <p className="text-gray-300 mb-6">
                Esta é uma aposta privada. Você precisa fazer login para visualizá-la.
              </p>
              <div className="space-y-4">
                <AuthButton />
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Voltar para Apostas Públicas
                </button>
              </div>
              <p className="text-sm text-purple-300 mt-4">
                Após fazer login, você será redirecionado de volta para esta aposta.
              </p>
            </div>
          </div>
        </div>
      </main>
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

  const betUrl = `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/bet/${bet.id}`

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
          {/* Grid responsivo para mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
              <p className="font-medium text-white">
                {new Date(bet.data_encerramento).toLocaleDateString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })} às {new Date(bet.data_encerramento).toLocaleTimeString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
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

              {/* Delete button - always visible for creator */}
              <div className="mt-4">
                <button
                  onClick={handleDeleteBet}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-900/50 transition-colors"
                >
                  {isDeleting ? 'Deletando...' : 'Deletar Aposta'}
                </button>
              </div>
            </div>
          )}

          {!isCreator && !bet.resultado_final && (
            <>
              {/* Verificar se exige login para votar */}
              {!bet.permitir_sem_login && !user ? (
                <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-yellow-500/50">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4">🔐 Login Necessário</h3>
                    <p className="text-gray-300 mb-6">
                      Esta aposta exige login para votar. Faça login para participar e evitar votos falsos.
                    </p>
                    <AuthButton />
                    <p className="text-sm text-purple-300 mt-4">
                      Após fazer login, você será identificado pelo seu email do Google.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVote} className="space-y-4">
                  {/* Campo nome - só mostrar se permite voto sem login */}
                  {bet.permitir_sem_login && (
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
                  )}

                  {/* Mostrar info do usuário logado se exige login */}
                  {!bet.permitir_sem_login && user && (
                    <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
                      <p className="text-sm text-green-200 mb-1">Votando como:</p>
                      <p className="text-white font-medium">{user.user_metadata?.full_name || user.email}</p>
                      <p className="text-sm text-green-300">{user.email}</p>
                    </div>
                  )}

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
            </>
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

                {/* Prestação de Contas - Todos os Apostadores */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">Resultado</h3>
                  <div className="bg-white/5 p-4 rounded-lg">
                    
                    {/* Estatísticas por opção */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2">Distribuição de Apostas</h4>
                      {bet.opcoes.map((option) => {
                        const optionVoters = votes.filter(vote => vote.opcao_escolhida === option)
                        const isWinningOption = option === bet.resultado_final
                        return (
                          <div key={option} className={`flex justify-between items-center py-2 px-3 rounded mb-1 ${
                            isWinningOption ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'
                          }`}>
                            <span className={`font-medium ${isWinningOption ? 'text-green-200' : 'text-white'}`}>
                              {option} {isWinningOption && '🏆'}
                            </span>
                            <span className={`text-sm ${isWinningOption ? 'text-green-200' : 'text-purple-200'}`}>
                              {optionVoters.length} apostas (R$ {(optionVoters.length * parseFloat(bet.valor_aposta.replace(/[^0-9,]/g, '').replace(',', '.'))).toFixed(2)})
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Lista completa de apostadores */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Todos os Apostadores ({votes.length})</h4>
                      <div className="space-y-1">
                        {votes.map((vote, index) => {
                          const isWinner = vote.opcao_escolhida === bet.resultado_final
                          return (
                            <div key={index} className={`flex justify-between items-center py-2 px-3 rounded text-sm ${
                              isWinner ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isWinner ? 'text-green-200' : 'text-white'}`}>
                                  {vote.nome_apostador}
                                </span>
                                {isWinner && <span className="text-green-400">🏆</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`${isWinner ? 'text-green-200' : 'text-purple-200'}`}>
                                  {vote.opcao_escolhida}
                                </span>
                                <span className={`text-xs ${isWinner ? 'text-green-300' : 'text-purple-300'}`}>
                                  {isWinner ? `+R$ ${prizePerWinner.toFixed(2)}` : '-R$ ' + bet.valor_aposta}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-200">Data de finalização:</span>
                        <span className="text-white">
                          {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 