'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FacturesPage() {
  const router = useRouter()
  const [factures, setFactures] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    chargerFactures(token)
  }, [])

  const chargerFactures = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/factures', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setFactures(Array.isArray(data) ? data : [])
    } catch (error) {
      setErreur('Erreur de chargement des factures')
    }
  }

  const handlePayer = async (facture: any) => {
    setChargement(true)
    const token = getToken()

    try {
      const response = await fetch('http://localhost:3000/api/payment/creatiopayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: facture.montant_total * 100,
          rendezvous_id: facture.id
        })
      })

      const data = await response.json()

      if (data.url_de_payement) {
        window.location.href = data.url_de_payement
      } else {
        setErreur('Erreur lors de la création du paiement')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    } finally {
      setChargement(false)
    }
  }

  const handleTelecharger = async (factureId: string) => {
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

  const handleEnvoyerEmail = async (factureId: string) => {
    const token = getToken()
    try {
      const response = await fetch(`http://localhost:3000/api/genererfacture/${factureId}/send-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        alert('Facture envoyée par email!')
      } else {
        setErreur('Erreur lors de l\'envoi')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'payee': return 'text-green-400'
      case 'en_attente': return 'text-yellow-400'
      case 'annulee': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
          <h1 className="text-2xl font-bold"> Mes factures</h1>
        </div>

        {erreur && <p className="text-red-400 mb-4">{erreur}</p>}

        <div className="space-y-4">
          {factures.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune facture disponible</p>
          ) : (
            factures.map((f: any) => (
              <div key={f.id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Facture #{f.id?.slice(0, 8)}</h3>
                    <p className="text-gray-400">Date: {new Date(f.created_at).toLocaleDateString('fr-CA')}</p>
                    <p className="text-gray-400">Montant: <span className="text-white font-semibold">{f.montant_total} $</span></p>
                    <p className={`font-semibold ${getStatutColor(f.statut)}`}>
                      Statut: {f.statut}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {f.statut !== 'payee' && (
                      <button
                        onClick={() => handlePayer(f)}
                        disabled={chargement}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        {chargement ? 'Chargement...' : ' Payer'}
                      </button>
                    )}
                    {f.statut === 'payee' && (
                      <span className="text-green-400 font-semibold"> Payée</span>
                    )}
                    <button
                      onClick={() => handleTelecharger(f.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                       Télécharger PDF
                    </button>
                    <button
                      onClick={() => handleEnvoyerEmail(f.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                       Recevoir par email
                    </button>
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