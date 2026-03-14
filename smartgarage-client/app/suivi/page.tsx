'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

export default function SuiviPage() {
  const router = useRouter()
  const [taches, setTaches] = useState([])
  const [notifications, setNotifications] = useState<string[]>([])
  const [erreur, setErreur] = useState('')

  const getToken = () => localStorage.getItem('token')
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    chargerTaches(token)

    // Socket.IO pour notifications en temps réel
    const socket = io(API_URL)

    socket.on('connect', () => {
      console.log('Socket.IO connecté')
    })

    socket.on('rdv:update', (data: any) => {
      setNotifications(prev => [`Statut mis à jour: ${data.data?.statut || ''}`, ...prev])
      chargerTaches(token)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const chargerTaches = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/taches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setTaches(Array.isArray(data) ? data : [])
    } catch (error) {
      setErreur('Erreur de chargement des tâches')
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'termine': return 'text-green-400'
      case 'en_cours': return 'text-yellow-400'
      case 'en_attente': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatutEmoji = (statut: string) => {
    switch (statut) {
      case 'termine': return '✅'
      case 'en_cours': return '🔧'
      case 'en_attente': return '⏳'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
          <h1 className="text-2xl font-bold">🔧 Suivi de mon véhicule</h1>
        </div>
        {erreur && <p className="text-red-400 mb-4">{erreur}</p>}
        {notifications.length > 0 && (
          <div className="bg-blue-900 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">🔔 Notifications en temps réel</h2>
            {notifications.map((notif, index) => (
              <p key={index} className="text-blue-200 text-sm">{notif}</p>
            ))}
          </div>
        )}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tâches en cours</h2>
          {taches.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune tâche en cours</p>
          ) : (
            taches.map((t: any) => (
              <div key={t.id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {getStatutEmoji(t.statut)} {t.description}
                    </h3>
                    <p className={`font-semibold ${getStatutColor(t.statut)}`}>
                      Statut: {t.statut}
                    </p>
                    {t.commentaires && (
                      <p className="text-gray-400 mt-2">💬 {t.commentaires}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}