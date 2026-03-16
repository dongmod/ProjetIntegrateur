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
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    const payload = JSON.parse(atob(token.split('.')[1]))
    const id = payload.user_id || payload.id
    setUserId(id)

    fetch(`${API_URL}/api/auth/getUserbyId/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
    const user = Array.isArray(data) ? data[0] : data
    if (user) {
        setNom(user.nom || '')
        setPrenom(user.prenom || '')
        setEmail(user.email || '')
        const photos = user.photos
        if (Array.isArray(photos) && photos.length > 0) {
            setPhotoUrl(photos[0])
        } else if (typeof photos === 'string') {
            setPhotoUrl(photos)
        }
    }
})
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    const token = localStorage.getItem('token')

    try {
      if (photoFile) {
        const formData = new FormData()
        formData.append('photos', photoFile)
        formData.append('nom', nom)
        formData.append('prenom', prenom)
        formData.append('email', email)

        const response = await fetch(`${API_URL}/api/auth/profil/${userId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        const data = await response.json()
        if (response.ok) {
          const photos = data.photos
          if (Array.isArray(photos) && photos.length > 0) {
            setPhotoUrl(photos[0])
          }
          setPhotoFile(null)
          setPhotoPreview('')
          setSucces('Profil mis à jour avec succès!')
        } else {
          setErreur(data.message || 'Erreur lors de la mise à jour')
        }
      } else {
        const response = await fetch(`${API_URL}/api/auth/updateUser/${userId}`, {
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
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {photoPreview || photoUrl ? (
                <img
                  src={photoPreview || photoUrl}
                  alt="Photo de profil"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center border-4 border-gray-500">
                  <span className="text-4xl">👤</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => document.getElementById('photoInput')?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✏️
              </button>
            </div>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            {photoPreview && (
              <p className="text-gray-400 text-sm mt-2">Nouvelle photo sélectionnée — sauvegardez pour confirmer</p>
            )}
          </div>

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
            <button
              type="button"
              onClick={() => router.push('/reset-password')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded font-semibold mt-2"
            >
              Changer mon mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}