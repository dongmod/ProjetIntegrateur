'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    try {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email, 
      mot_de_passe: motDePasse, 
      confirmation_mot_de_passe: confirmationMotDePasse, 
      nom, 
      prenom,
      role: 'client'
    })
  })

  const data = await response.json()

  if (response.ok) {
    setSucces('Compte créé avec succès! Redirection...')
    setTimeout(() => router.push('/login'), 2000)
  } else {
    setErreur(data.message || 'Erreur lors de l\'inscription')
  }
} catch (error) {
  setErreur('Erreur de connexion au serveur')
}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Créer un compte</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-1">Prénom</label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              placeholder="Votre prénom"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              placeholder="Votre nom"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Mot de passe</label>
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
  <label className="text-gray-300 block mb-1">Confirmer mot de passe</label>
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
            Créer mon compte
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-center">
          Déjà un compte ? <a href="/login" className="text-blue-400">Se connecter</a>
        </p>
      </div>
    </div>
  )
}