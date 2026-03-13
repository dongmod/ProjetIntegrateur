'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.push('/factures')
    }, 5000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-10 rounded-lg text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-400 mb-4">Paiement réussi!</h1>
        <p className="text-gray-400 mb-6">Votre paiement a été traité avec succès. Vous recevrez une confirmation par email.</p>
        <p className="text-gray-500 text-sm mb-6">Redirection automatique dans 5 secondes...</p>
        <button
          onClick={() => router.push('/factures')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Voir mes factures
        </button>
      </div>
    </div>
  )
}