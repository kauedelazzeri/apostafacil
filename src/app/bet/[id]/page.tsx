'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Bet } from '@/types/bet'

export default function BetPage() {
  const params = useParams()
  const [bet, setBet] = useState<Bet | null>(null)
  const [voterName, setVoterName] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBet = async () => {
      try {
        const response = await fetch(`/api/bets/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setBet(data)
          setShowResults(new Date(data.endDate) < new Date())
        } else {
          setError('Aposta não encontrada')
        }
      } catch (error) {
        setError('Erro ao carregar a aposta')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBet()
  }, [params.id])

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!voterName || !selectedOption) {
      alert('Por favor, preencha seu nome e selecione uma opção')
      return
    }

    try {
      const response = await fetch(`/api/bets/${params.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterName,
          option: selectedOption,
        }),
      })

      if (response.ok) {
        const updatedBet = await response.json()
        setBet(updatedBet)
        setVoterName('')
        setSelectedOption('')
        alert('Aposta registrada com sucesso!')
      } else {
        throw new Error('Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      setError('Erro ao registrar sua aposta. Por favor, tente novamente.')
      alert('Erro ao registrar sua aposta. Por favor, tente novamente.')
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copiado para a área de transferência!')
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!bet) {
    return <div>Aposta não encontrada</div>
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{bet.title}</h1>
        
        {bet.description && (
          <p className="text-gray-700 mb-6">{bet.description}</p>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Criado por</p>
              <p className="font-medium">{bet.creatorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valor da aposta</p>
              <p className="font-medium">{bet.betValue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Encerra em</p>
              <p className="font-medium">
                {new Date(bet.endDate).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de apostas</p>
              <p className="font-medium">{bet.votes.length}</p>
            </div>
          </div>

          {!showResults ? (
            <form onSubmit={handleVote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome *
                </label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sua aposta *
                </label>
                <div className="space-y-2">
                  {bet.options.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="option"
                        value={option}
                        checked={selectedOption === option}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-2"
                        required
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Registrar aposta
              </button>
            </form>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Resultados</h2>
              <div className="space-y-4">
                {bet.options.map((option) => {
                  const votes = bet.votes.filter((vote) => vote.option === option)
                  return (
                    <div key={option} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{option}</span>
                        <span className="text-sm text-gray-500">
                          {votes.length} votos
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${(votes.length / bet.votes.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={copyLink}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
        >
          Copiar link para compartilhar
        </button>
      </div>
    </main>
  )
} 