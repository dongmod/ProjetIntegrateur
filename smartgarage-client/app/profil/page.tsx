'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const router = useRouter()
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    // Décoder le token pour obtenir l'id
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUserId(payload.id)

    // Charger les infos de l'utilisateur
    fetch(`http://localhost:3000/api/auth/getUserbyId/${payload.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data[0]) {
          setNom(data[0].nom || '')
          setPrenom(data[0].prenom || '')
          setEmail(data[0].email || '')
        }
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:3000/api/auth/updateUser/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nom, prenom, email })
      })

      const data = await response.json()

      if (response.ok) {
        setSucces('Profil mis à jour avec succès!')
      } else {
        setErreur(data.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
          <h1 className="text-2xl font-bold">Mon profil</h1>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 block mb-1">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-300 block mb-1">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-300 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>

            {erreur && <p className="text-red-400">{erreur}</p>}
            {succes && <p className="text-green-400">{succes}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold"
            >
              Sauvegarder
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}