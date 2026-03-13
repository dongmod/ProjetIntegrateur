'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HistoriquePage() {
  const router = useRouter()
  const [rendezvous, setRendezvous] = useState([])
  const [factures, setFactures] = useState([])
  const [filtre, setFiltre] = useState('tous')
  const [filtreDate, setFiltreDate] = useState('')
  const [erreur, setErreur] = useState('')

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
      const [rdvRes, facturesRes] = await Promise.all([
        fetch('http://localhost:3000/api/rendezvous', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/factures', { headers: { Authorization: `Bearer ${token}` } })
      ])
      const [rdvData, facturesData] = await Promise.all([
        rdvRes.json(), facturesRes.json()
      ])
      setRendezvous(Array.isArray(rdvData) ? rdvData : [])
      setFactures(Array.isArray(facturesData) ? facturesData : [])
    } catch (error) {
      setErreur('Erreur de chargement')
    }
  }

  const handleTelechargerFacture = async (factureId: string) => {
    const token = getToken()
    try {
      const response = await fetch(`http://localhost:3000/api/genererfacture/${factureId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${factureId}.pdf`
      a.click()
    } catch (error) {
      setErreur('Erreur lors du téléchargement')
    }
  }

  const getFacturePourRdv = (rdvId: string) => {
    return factures.find((f: any) => f.rendezvous_id === rdvId)
  }

  const rdvFiltres = rendezvous
    .filter((rdv: any) => {
      if (filtre !== 'tous' && rdv.type_service !== filtre) return false
      if (filtreDate && !rdv.date_rendezvous?.startsWith(filtreDate)) return false
      return true
    })

  const typesServices = [...new Set(rendezvous.map((rdv: any) => rdv.type_service))]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
          <h1 className="text-2xl font-bold"> Historique du véhicule</h1>
        </div>

        {erreur && <p className="text-red-400 mb-4">{erreur}</p>}

        <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-gray-300 block mb-1 text-sm">Filtrer par type</label>
            <select
              value={filtre}
              onChange={(e) => setFiltre(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="tous">Tous les services</option>
              {typesServices.map((type: any) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-gray-300 block mb-1 text-sm">Filtrer par date</label>
            <input
              type="date"
              value={filtreDate}
              onChange={(e) => setFiltreDate(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFiltre('tous'); setFiltreDate('') }}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {rdvFiltres.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun service trouvé</p>
          ) : (
            rdvFiltres.map((rdv: any) => {
              const facture = getFacturePourRdv(rdv.id)
              return (
                <div key={rdv.id} className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{rdv.type_service}</h3>
                      <p className="text-gray-400">Date: {new Date(rdv.date_rendezvous).toLocaleDateString('fr-CA')}</p>
                      <p className="text-gray-400">Statut: <span className={rdv.statut === 'termine' ? 'text-green-400' : 'text-yellow-400'}>{rdv.statut}</span></p>
                      {rdv.vehicules && <p className="text-gray-400">Véhicule: {rdv.vehicules.marque} {rdv.vehicules.modele}</p>}
                      {facture && <p className="text-gray-400">Montant: <span className="text-white font-semibold">{(facture as any).montant_total} $</span></p>}
                    </div>
                    {facture && (
                      <button
                        onClick={() => handleTelechargerFacture((facture as any).id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                         Télécharger facture
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}