'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [connected, setConnected] = useState(false)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    const saved = localStorage.getItem('notifications')
    if (saved) {
      setNotifications(JSON.parse(saved))
    }

    const socket = io('http://localhost:3000')

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('notification', (message: string) => {
      const nouvelleNotif = {
        id: Date.now(),
        message,
        date: new Date().toLocaleString('fr-CA'),
        lu: false
      }
      setNotifications(prev => {
        const updated = [nouvelleNotif, ...prev]
        localStorage.setItem('notifications', JSON.stringify(updated))
        return updated
      })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const marquerLu = (id: number) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? {...n, lu: true} : n)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const effacerTout = () => {
    setNotifications([])
    localStorage.removeItem('notifications')
  }

  const nonLues = notifications.filter(n => !n.lu).length

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
            <h1 className="text-2xl font-bold">
              🔔 Notifications
              {nonLues > 0 && (
                <span className="ml-2 bg-red-600 text-white text-sm px-2 py-1 rounded-full">{nonLues}</span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? '🟢 Connecté' : '🔴 Déconnecté'}
            </span>
            {notifications.length > 0 && (
              <button onClick={effacerTout} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                Effacer tout
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔔</p>
              <p className="text-gray-400">Aucune notification pour l'instant</p>
              <p className="text-gray-500 text-sm mt-2">Vous serez notifié lors de la confirmation de RDV, rappels et quand votre véhicule est prêt</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border ${notif.lu ? 'bg-gray-800 border-gray-700' : 'bg-gray-700 border-blue-500'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`${notif.lu ? 'text-gray-400' : 'text-white font-semibold'}`}>
                      {notif.message}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{notif.date}</p>
                  </div>
                  {!notif.lu && (
                    <button
                      onClick={() => marquerLu(notif.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm ml-4"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}