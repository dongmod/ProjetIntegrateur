'use client'

import { useRouter } from 'next/navigation'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-10 rounded-lg text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-400 mb-4">Paiement annulé</h1>
        <p className="text-gray-400 mb-6">Votre paiement a été annulé. Aucun montant n'a été débité.</p>
        <button
          onClick={() => router.push('/factures')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Retour aux factures
        </button>
      </div>
    </div>
  )
}