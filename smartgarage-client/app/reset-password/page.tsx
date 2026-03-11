'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [userId, setUserId] = useState('')

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUserId(payload.id)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    const token = getToken()

    if (motDePasse !== confirmationMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/api/auth/resetMot_de_passe/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mot_de_passe: motDePasse,
          confirmation_mot_de_passe: confirmationMotDePasse
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSucces('Mot de passe modifié avec succès!')
        setMotDePasse('')
        setConfirmationMotDePasse('')
        setTimeout(() => router.push('/profil'), 2000)
      } else {
        setErreur(data.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/profil')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
          <h1 className="text-2xl font-bold">🔒 Réinitialiser mot de passe</h1>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 block mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="text-gray-300 block mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmationMotDePasse}
                onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="••••••••"
                required
              />
            </div>

            {erreur && <p className="text-red-400">{erreur}</p>}
            {succes && <p className="text-green-400">{succes}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold"
            >
              Modifier le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}