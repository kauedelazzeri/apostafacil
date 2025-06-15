'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addBet } from '@/lib/storage'
import { useSupabase } from '@/providers/supabase-provider'
import { track } from '@/lib/amplitude'
import { ANALYTICS_EVENTS, getUserProperties } from '@/lib/analytics'

export default function CreateBetPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [betValue, setBetValue] = useState('')
  const [endDate, setEndDate] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [allowGuest, setAllowGuest] = useState(true)
  const [error, setError] = useState('')
  const [formInteractions, setFormInteractions] = useState(0)

  useEffect(() => {
    // Track page view
    track(ANALYTICS_EVENTS.PAGE_VIEW, {
      page: 'Create Bet',
      user: user ? getUserProperties(user) : null,
      timestamp: new Date().toISOString()
    });

    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, router, isLoading])

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    setFormInteractions(prev => prev + 1)
  }

  const addOption = () => {
    setOptions([...options, ''])
    setFormInteractions(prev => prev + 1)
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      setFormInteractions(prev => prev + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Track form submission attempt
    track(ANALYTICS_EVENTS.BET_CREATION_SUBMIT, {
      user: user ? getUserProperties(user) : null,
      formData: {
        title,
        description,
        creatorName,
        betValue,
        endDate,
        optionsCount: options.length,
        visibility,
        allowGuest,
        formInteractions
      },
      timestamp: new Date().toISOString()
    });

    try {
      if (!user) {
        throw new Error('Usuário não está logado')
      }

      if (!user?.email) {
        throw new Error('Email do usuário não encontrado')
      }

      const betData = {
        titulo: title,
        descricao: description,
        nome_criador: creatorName,
        valor_aposta: betValue,
        data_encerramento: endDate,
        opcoes: options.filter(opt => opt.trim() !== ''),
        visibilidade: visibility,
        permitir_sem_login: allowGuest,
        email_criador: user.email,
      }

      const newBet = await addBet(betData)

      // Track successful bet creation
      track(ANALYTICS_EVENTS.BET_CREATION_SUCCESS, {
        user: getUserProperties(user),
        betId: newBet.id,
        betTitle: newBet.titulo,
        betType: newBet.visibilidade,
        allowGuest: newBet.permitir_sem_login,
        optionsCount: newBet.opcoes.length,
        betValue: newBet.valor_aposta,
        endDate: newBet.data_encerramento,
        formInteractions,
        timestamp: new Date().toISOString()
      });

      router.push(`/bet/${newBet.id}`)
    } catch (error) {
      console.error('Error creating bet:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar aposta')

      // Track error
      track(ANALYTICS_EVENTS.BET_CREATION_ERROR, {
        user: user ? getUserProperties(user) : null,
        error: error instanceof Error ? error.message : 'Unknown error',
        formData: {
          title,
          description,
          creatorName,
          betValue,
          endDate,
          optionsCount: options.length,
          visibility,
          allowGuest,
          formInteractions
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track form field changes
  const trackFieldChange = (field: string, value: string) => {
    setFormInteractions(prev => prev + 1)
    track(ANALYTICS_EVENTS.BET_CREATION_FORM_FILL, {
      user: user ? getUserProperties(user) : null,
      field,
      valueLength: value.length,
      formInteractions: formInteractions + 1,
      timestamp: new Date().toISOString()
    });
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900 to-purple-800 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              track('Back Button Clicked', {
                pageFrom: 'Create Bet',
                pageTo: 'Home',
                user: user ? getUserProperties(user) : null,
                timestamp: new Date().toISOString()
              });
              router.push('/')
            }}
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
                <label className="block text-sm font-medium mb-2">Título da Aposta *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    trackFieldChange('title', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Ex: Quem vai ganhar o jogo?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    trackFieldChange('description', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Descreva os detalhes da aposta..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Seu Nome *</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => {
                    setCreatorName(e.target.value)
                    trackFieldChange('creatorName', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Como você quer ser identificado"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valor da Aposta *</label>
                <input
                  type="text"
                  value={betValue}
                  onChange={(e) => {
                    setBetValue(e.target.value)
                    trackFieldChange('betValue', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-purple-300"
                  placeholder="Ex: R$ 10,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data de Término *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    trackFieldChange('endDate', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Visibilidade</label>
                <select
                  value={visibility}
                  onChange={(e) => {
                    setVisibility(e.target.value as 'public' | 'private')
                    trackFieldChange('visibility', e.target.value)
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="public">Pública</option>
                  <option value="private">Privada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permitir apostas sem login?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowGuest"
                      value="true"
                      checked={allowGuest}
                      onChange={() => {
                        setAllowGuest(true)
                        trackFieldChange('allowGuest', 'true')
                      }}
                      className="form-radio text-purple-500"
                    />
                    <span className="text-gray-200">Sim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowGuest"
                      value="false"
                      checked={!allowGuest}
                      onChange={() => {
                        setAllowGuest(false)
                        trackFieldChange('allowGuest', 'false')
                      }}
                      className="form-radio text-purple-500"
                    />
                    <span className="text-gray-200">Não</span>
                  </label>
                </div>
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
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-900/50"
          >
            Criar Aposta
          </button>
        </form>
      </div>
    </main>
  )
} 