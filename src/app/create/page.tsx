'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addBet } from '@/lib/storage'
import { useSupabase } from '@/providers/supabase-provider'

export default function CreateBetPage() {
  const router = useRouter()
  const { user } = useSupabase()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [betValue, setBetValue] = useState('')
  const [endDate, setEndDate] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!user) {
        throw new Error('Você precisa estar logado para criar uma aposta')
      }

      // Validate form
      if (!title || !creatorName || !endDate || options.some(opt => !opt)) {
        throw new Error('Por favor, preencha todos os campos obrigatórios')
      }

      // Validate options
      if (options.length < 2) {
        throw new Error('Você precisa adicionar pelo menos 2 opções')
      }

      // Filter out empty options and trim whitespace
      const validOptions = options
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0)

      // Create bet
      const bet = await addBet({
        titulo: title,
        descricao: description,
        opcoes: validOptions,
        valor_aposta: betValue,
        data_encerramento: endDate,
        nome_criador: creatorName,
        email_criador: user.email || '',
      })

      // Show success message and copy link
      const betUrl = `${window.location.origin}/bet/${bet.id}`
      navigator.clipboard.writeText(betUrl)
      alert('Aposta criada com sucesso! O link foi copiado para a área de transferência.')
      
      // Redirect to bet page
      router.push(`/bet/${bet.id}`)
    } catch (error) {
      console.error('Error creating bet:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar aposta')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

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
          <h1 className="text-3xl font-bold">Criar Nova Aposta</h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Título da Aposta *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Ex: Quem vai ganhar o jogo?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300 min-h-[100px]"
                  placeholder="Detalhes adicionais sobre a aposta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Como você quer ser identificado"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Valor da Aposta *
                </label>
                <input
                  type="text"
                  value={betValue}
                  onChange={(e) => setBetValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Ex: 10,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Data de Encerramento *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Opções da Aposta *</h2>
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Adicionar Opção
              </button>
            </div>

            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                    placeholder={`Opção ${index + 1}`}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-900/50"
          >
            {isLoading ? 'Criando...' : 'Criar Aposta'}
          </button>
        </form>
      </div>
    </main>
  )
} 