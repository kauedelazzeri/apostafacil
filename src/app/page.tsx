import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Aposta Fácil</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Como funciona?</h2>
          <p className="text-gray-700 mb-4">
            Crie apostas divertidas com seus amigos de forma simples e rápida!
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Crie uma aposta com suas próprias opções</li>
            <li>Compartilhe o link com seus amigos</li>
            <li>Eles podem votar em suas opções favoritas</li>
            <li>Veja os resultados quando a aposta terminar</li>
          </ul>
        </div>

        <div className="text-center">
          <Link 
            href="/create-bet"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Criar uma nova aposta
          </Link>
        </div>
      </div>
    </main>
  )
}
