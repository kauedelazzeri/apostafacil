'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getBet, addVote, getVotes, updateBet } from '@/lib/storage'
import { useSupabase } from '@/providers/supabase-provider'
import { Bet, Vote } from '@/types/bet'
import { ShareButton } from '@/components/share-button'

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
  const [error, setError] = useState('')
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return

      const betData = await getBet(params.id as string)
      if (!betData) {
        setError('Aposta não encontrada')
        return
      }

      setBet(betData)
      setIsCreator(user?.email === betData.email_criador)

      const votesData = await getVotes(params.id as string)
      setVotes(votesData)
    }

    fetchData()
  }, [params.id, user])

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!bet) return
      if (!voterName || !selectedOption) {
        throw new Error('Por favor, preencha seu nome e selecione uma opção')
      }

      await addVote({
        aposta_id: bet.id,
        nome_apostador: voterName,
        opcao_escolhida: selectedOption,
      })

      // Refresh votes
      const votesData = await getVotes(bet.id)
      setVotes(votesData)
      
      // Clear form
      setVoterName('')
      setSelectedOption('')
      
      alert('Aposta registrada com sucesso!')
    } catch (error) {
      console.error('Error adding vote:', error)
      setError(error instanceof Error ? error.message : 'Erro ao registrar aposta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalizeBet = async () => {
    if (!bet || !finalResult) return

    try {
      await updateBet({
        ...bet,
        resultado_final: finalResult,
      })

      // Refresh bet data
      const updatedBet = await getBet(bet.id)
      if (updatedBet) {
        setBet(updatedBet)
      }

      alert('Aposta finalizada com sucesso!')
    } catch (error) {
      console.error('Error finalizing bet:', error)
      setError('Erro ao finalizar aposta')
    }
  }

  if (!bet) {
    return <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">Carregando...</div>
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
            onClick={() => router.push('/')}
            className="text-white hover:text-purple-200 transition-colors"
          >
            ← Voltar
          </button>
          <ShareButton url={betUrl} title={bet.titulo} />
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
                <label className="block text-sm font-medium text-white mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  required
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Sua Aposta *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {bet.opcoes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedOption(option)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedOption === option
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedOption}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-900/50"
              >
                {isLoading ? 'Registrando...' : 'Fazer Aposta'}
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