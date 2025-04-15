'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllBets } from '@/lib/storage'
import { Bet } from '@/types/bet'
import { AuthButton } from '@/components/auth-button'
import { ShareButton } from '@/components/share-button'
import { useSupabase } from '@/providers/supabase-provider'

export default function Home() {
  const router = useRouter()
  const { user } = useSupabase()
  const [bets, setBets] = useState<Bet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const betsData = await getAllBets()
        setBets(betsData)
      } catch (error) {
        console.error('Error fetching bets:', error)
        setError('Erro ao carregar apostas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBets()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
        <div className="max-w-2xl mx-auto">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Apostas</h1>
          <AuthButton />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {bets.map((bet) => {
            const isOpen = !bet.resultado_final
            const betUrl = `${window.location.origin}/bet/${bet.id}`

            return (
              <div
                key={bet.id}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => router.push(`/bet/${bet.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{bet.titulo}</h2>
                    <p className="text-purple-200 mb-4">{bet.descricao}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-purple-200">Criado por</p>
                        <p className="font-medium">{bet.nome_criador}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-200">Valor</p>
                        <p className="font-medium">R$ {bet.valor_aposta}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-200">Encerra em</p>
                        <p className="font-medium">
                          {new Date(bet.data_encerramento).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-200">Status</p>
                        <p className={`font-medium ${isOpen ? 'text-green-200' : 'text-red-200'}`}>
                          {isOpen ? 'Aberta' : 'Finalizada'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ShareButton url={betUrl} title={bet.titulo} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/create')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              user
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
            disabled={!user}
          >
            {user ? 'Criar Nova Aposta' : 'Logue para criar uma aposta'}
          </button>
        </div>
      </div>
    </main>
  )
}
