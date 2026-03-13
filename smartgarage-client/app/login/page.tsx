'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [motDePasse, setMotDePasse] = useState('')
    const [erreur, setErreur] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErreur('')

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, mot_de_passe: motDePasse })
            })

            const data = await response.json()

            if (data.token) {
                localStorage.setItem('token', data.token)
                router.push('/dashboard')
            } else {
                setErreur(data.message || 'Erreur de connexion')
            }
        } catch (error) {
            setErreur('Erreur de connexion au serveur')
        }
    }


return(
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Connexion Client</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {erreur && <p className="text-red-400">{erreur}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold"
          >
            Se connecter
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-center">
          Pas encore de compte ? <a href="/register" className="text-blue-400">Créer un compte</a>
        </p>
      </div>
    </div>
)

}