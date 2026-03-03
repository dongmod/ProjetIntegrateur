'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VehiculesPage() {
  const router = useRouter()
  const [vehicules, setVehicules] = useState([])
  const [marque, setMarque] = useState('')
  const [modele, setModele] = useState('')
  const [annee, setAnnee] = useState('')
  const [vin, setVin] = useState('')
  const [plaque, setPlaque] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState('')
  const [vehiculeEdit, setVehiculeEdit] = useState<any>(null)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUserId(payload.id)
    chargerVehicules(token)
  }, [])

  const chargerVehicules = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/vehicules', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setVehicules(Array.isArray(data) ? data : [])
    } catch (error) {
      setErreur('Erreur de chargement des véhicules')
    }
  }

  const scannerVIN = async (vinCode: string) => {
    if (vinCode.length !== 17) return
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vinCode}?format=json`)
      const data = await response.json()
      const results = data.Results
      const getValeur = (variable: string) =>
        results.find((r: any) => r.Variable === variable)?.Value || ''

      const marqueVIN = getValeur('Make')
      const modeleVIN = getValeur('Model')
      const anneeVIN = getValeur('Model Year')

      if (marqueVIN) setMarque(marqueVIN)
      if (modeleVIN) setModele(modeleVIN)
      if (anneeVIN) setAnnee(anneeVIN)

      setSucces('VIN décodé avec succès!')
    } catch (error) {
      setErreur('Erreur lors du décodage du VIN')
    }
  }

  const handleAjouter = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    const token = getToken()

    try {
      const response = await fetch('http://localhost:3000/api/vehicules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ marque, modele, annee, vin, plaque, utilisateur_id: userId })
      })

      const data = await response.json()

      if (response.ok) {
        setSucces('Véhicule ajouté!')
        setMarque('')
        setModele('')
        setAnnee('')
        setVin('')
        setPlaque('')
        setShowForm(false)
        chargerVehicules(token!)
      } else {
        setErreur(data.message || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const handleModifier = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getToken()

    try {
      const response = await fetch(`http://localhost:3000/api/vehicules/${vehiculeEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          marque: vehiculeEdit.marque,
          modele: vehiculeEdit.modele,
          annee: vehiculeEdit.annee,
          plaque: vehiculeEdit.plaque,
          vin: vehiculeEdit.vin
        })
      })

      if (response.ok) {
        setSucces('Véhicule modifié!')
        setVehiculeEdit(null)
        chargerVehicules(token!)
      } else {
        const data = await response.json()
        setErreur(data.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const handleSupprimer = async (id: string) => {
    const token = getToken()
    try {
      await fetch(`http://localhost:3000/api/vehicules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      chargerVehicules(token!)
    } catch (error) {
      setErreur('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
            <h1 className="text-2xl font-bold">🚗 Mes véhicules</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            + Ajouter un véhicule
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Nouveau véhicule</h2>
            <form onSubmit={handleAjouter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1">Marque</label>
                  <input
                    type="text"
                    value={marque}
                    onChange={(e) => setMarque(e.target.value)}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Modèle</label>
                  <input
                    type="text"
                    value={modele}
                    onChange={(e) => setModele(e.target.value)}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="Corolla"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Année</label>
                  <input
                    type="number"
                    value={annee}
                    onChange={(e) => setAnnee(e.target.value)}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="2020"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Plaque</label>
                  <input
                    type="text"
                    value={plaque}
                    onChange={(e) => setPlaque(e.target.value)}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-gray-300 block mb-1">VIN <span className="text-gray-500 text-sm">(17 caractères — remplit automatiquement)</span></label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => {
                      setVin(e.target.value)
                      scannerVIN(e.target.value)
                    }}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>
              </div>

              {erreur && <p className="text-red-400">{erreur}</p>}
              {succes && <p className="text-green-400">{succes}</p>}

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Sauvegarder
              </button>
            </form>
          </div>
        )}

        {vehiculeEdit && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Modifier le véhicule</h2>
            <form onSubmit={handleModifier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1">Marque</label>
                  <input
                    type="text"
                    value={vehiculeEdit.marque}
                    onChange={(e) => setVehiculeEdit({...vehiculeEdit, marque: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Modèle</label>
                  <input
                    type="text"
                    value={vehiculeEdit.modele}
                    onChange={(e) => setVehiculeEdit({...vehiculeEdit, modele: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Année</label>
                  <input
                    type="number"
                    value={vehiculeEdit.annee}
                    onChange={(e) => setVehiculeEdit({...vehiculeEdit, annee: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Plaque</label>
                  <input
                    type="text"
                    value={vehiculeEdit.plaque}
                    onChange={(e) => setVehiculeEdit({...vehiculeEdit, plaque: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">VIN</label>
                  <input
                    type="text"
                    value={vehiculeEdit.vin || ''}
                    onChange={(e) => setVehiculeEdit({...vehiculeEdit, vin: e.target.value})}
                    className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                  Sauvegarder
                </button>
                <button type="button" onClick={() => setVehiculeEdit(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {vehicules.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun véhicule enregistré</p>
          ) : (
            vehicules.map((v: any) => (
              <div key={v.id} className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{v.marque} {v.modele}</h3>
                  <p className="text-gray-400">Année: {v.annee}</p>
                  <p className="text-gray-400">Plaque: {v.plaque}</p>
                  {v.vin && <p className="text-gray-400">VIN: {v.vin}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVehiculeEdit(v)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleSupprimer(v.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}