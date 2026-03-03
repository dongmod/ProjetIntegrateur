'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RendezvousPage() {
  const router = useRouter()
  const [rendezvous, setRendezvous] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [garages, setGarages] = useState([])
  const [services, setServices] = useState([])
  const [vehiculeId, setVehiculeId] = useState('')
  const [garageId, setGarageId] = useState('')
  const [dateRendezvous, setDateRendezvous] = useState('')
  const [typeService, setTypeService] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [rdvEdit, setRdvEdit] = useState<any>(null)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    chargerDonnees(token)
  }, [])

  const chargerDonnees = async (token: string) => {
    try {
      const [rdvRes, vehiculesRes, garagesRes, servicesRes] = await Promise.all([
        fetch('http://localhost:3000/api/rendezvous', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/vehicules', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/garages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/services', { headers: { Authorization: `Bearer ${token}` } })
      ])

      const [rdvData, vehiculesData, garagesData, servicesData] = await Promise.all([
        rdvRes.json(), vehiculesRes.json(), garagesRes.json(), servicesRes.json()
      ])

      setRendezvous(Array.isArray(rdvData) ? rdvData : [])
      setVehicules(Array.isArray(vehiculesData) ? vehiculesData : [])
      setGarages(Array.isArray(garagesData) ? garagesData : [])
      setServices(Array.isArray(servicesData) ? servicesData : [])
    } catch (error) {
      setErreur('Erreur de chargement')
    }
  }

  const handleAjouter = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    const token = getToken()

    try {
      const response = await fetch('http://localhost:3000/api/rendezvous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicule_id: vehiculeId,
          garage_id: garageId,
          date_rendezvous: dateRendezvous,
          type_service: typeService
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSucces('Rendez-vous créé!')
        setVehiculeId('')
        setGarageId('')
        setDateRendezvous('')
        setTypeService('')
        setShowForm(false)
        chargerDonnees(token!)
      } else {
        setErreur(data.message || 'Erreur lors de la création')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const handleModifier = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getToken()

    try {
      const response = await fetch(`http://localhost:3000/api/rendezvous/${rdvEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date_rendezvous: rdvEdit.date_rendezvous,
          type_service: rdvEdit.type_service,
          statut: rdvEdit.statut
        })
      })

      if (response.ok) {
        setSucces('Rendez-vous modifié!')
        setRdvEdit(null)
        chargerDonnees(token!)
      } else {
        const data = await response.json()
        setErreur(data.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const handleAnnuler = async (id: string) => {
    const token = getToken()
    try {
      await fetch(`http://localhost:3000/api/rendezvous/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      chargerDonnees(token!)
    } catch (error) {
      setErreur('Erreur lors de l\'annulation')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
            <h1 className="text-2xl font-bold">Mes rendez-vous</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            + Prendre un rendez-vous
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Nouveau rendez-vous</h2>
            <form onSubmit={handleAjouter} className="space-y-4">
              <div>
                <label className="text-gray-300 block mb-1">Mon véhicule</label>
                <select
                  value={vehiculeId}
                  onChange={(e) => setVehiculeId(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  required
                >
                  <option value="">Choisir un véhicule</option>
                  {vehicules.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.marque} {v.modele} - {v.plaque}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 block mb-1">Garage</label>
                <select
                  value={garageId}
                  onChange={(e) => setGarageId(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  required
                >
                  <option value="">Choisir un garage</option>
                  {garages.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 block mb-1">Type de service</label>
                <select
                  value={typeService}
                  onChange={(e) => setTypeService(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  required
                >
                  <option value="">Choisir un service</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.nom}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 block mb-1">Date et heure</label>
                <input
                  type="datetime-local"
                  value={dateRendezvous}
                  onChange={(e) => setDateRendezvous(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                  required
                />
              </div>

              {erreur && <p className="text-red-400">{erreur}</p>}
              {succes && <p className="text-green-400">{succes}</p>}

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Confirmer le rendez-vous
              </button>
            </form>
          </div>
        )}

        {rdvEdit && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Modifier le rendez-vous</h2>
            <form onSubmit={handleModifier} className="space-y-4">
              <div>
                <label className="text-gray-300 block mb-1">Date et heure</label>
                <input
                  type="datetime-local"
                  value={rdvEdit.date_rendezvous?.slice(0, 16)}
                  onChange={(e) => setRdvEdit({...rdvEdit, date_rendezvous: e.target.value})}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-300 block mb-1">Type de service</label>
                <input
                  type="text"
                  value={rdvEdit.type_service}
                  onChange={(e) => setRdvEdit({...rdvEdit, type_service: e.target.value})}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                  Sauvegarder
                </button>
                <button type="button" onClick={() => setRdvEdit(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {rendezvous.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun rendez-vous</p>
          ) : (
            rendezvous.map((rdv: any) => (
              <div key={rdv.id} className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{rdv.type_service}</h3>
                  <p className="text-gray-400">Date: {new Date(rdv.date_rendezvous).toLocaleString('fr-CA')}</p>
                  <p className="text-gray-400">Statut: {rdv.statut}</p>
                  {rdv.vehicules && <p className="text-gray-400">Véhicule: {rdv.vehicules.marque} {rdv.vehicules.modele}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRdvEdit(rdv)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleAnnuler(rdv.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    Annuler
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