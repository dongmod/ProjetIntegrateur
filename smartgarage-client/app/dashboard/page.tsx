'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
    const router = useRouter()
    const [token, setToken] = useState('')
    const [prenom, setPrenom] = useState('')
    const [photoUrl, setPhotoUrl] = useState('')

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    useEffect(() => {
        const t = localStorage.getItem('token')
        if (!t) {
            router.push('/login')
            return
        }
        setToken(t)

        // Charger les infos du profil
        const payload = JSON.parse(atob(t.split('.')[1]))
        const id = payload.user_id || payload.id

        fetch(`${API_URL}/api/auth/getUserbyId/${id}`, {
            headers: { Authorization: `Bearer ${t}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data[0]) {
                    setPrenom(data[0].prenom || '')
                    const photos = data[0].photos
                    if (Array.isArray(photos) && photos.length > 0) {
                        setPhotoUrl(photos[0])
                    } else if (typeof photos === 'string') {
                        setPhotoUrl(photos)
                    }
                }
            })
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt="Photo de profil"
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-500">
                                <span className="text-2xl">👤</span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            Bienvenue{prenom ? `, ${prenom}` : ''}!
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                    >
                        Se déconnecter
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/vehicules')}>
                        <h2 className="text-xl font-semibold mb-2">🚗 Mes véhicules</h2>
                        <p className="text-gray-400">Gérer vos véhicules</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/rendezvous')}>
                        <h2 className="text-xl font-semibold mb-2">📅 Mes rendez-vous</h2>
                        <p className="text-gray-400">Voir vos rendez-vous</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/profil')}>
                        <h2 className="text-xl font-semibold mb-2">👤 Mon profil</h2>
                        <p className="text-gray-400">Modifier votre profil</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/factures')}>
                        <h2 className="text-xl font-semibold mb-2">🧾 Mes factures</h2>
                        <p className="text-gray-400">Voir et payer vos factures</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/suivi')}>
                        <h2 className="text-xl font-semibold mb-2">🔧 Suivi en temps réel</h2>
                        <p className="text-gray-400">Voir l'avancement de votre service</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/notifications')}>
                        <h2 className="text-xl font-semibold mb-2">🔔 Notifications</h2>
                        <p className="text-gray-400">Voir vos notifications</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/historique')}>
                        <h2 className="text-xl font-semibold mb-2">📋 Historique</h2>
                        <p className="text-gray-400">Voir l'historique de vos services</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push('/evaluations')}>
                        <h2 className="text-xl font-semibold mb-2">⭐ Évaluations</h2>
                        <p className="text-gray-400">Voir et laisser des avis</p>
                    </div>
                </div>
            </div>
        </div>
    )
}