'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EvaluationsPage() {
  const router = useRouter()
  const [garages, setGarages] = useState([])
  const [garageId, setGarageId] = useState('')
  const [avis, setAvis] = useState([])
  const [monAvis, setMonAvis] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [note, setNote] = useState(5)
  const [qualite, setQualite] = useState(5)
  const [prix, setPrix] = useState(5)
  const [accueil, setAccueil] = useState(5)
  const [details, setDetails] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [moyenne, setMoyenne] = useState(0)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [userId, setUserId] = useState('')
  const [avisAModifier, setAvisAModifier] = useState<any>(null)

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    const payload = JSON.parse(atob(token.split('.')[1]))
setUserId(payload.id || payload.user_id)
    chargerGarages(token)
  }, [])

  useEffect(() => {
    if (garageId) {
      chargerAvis()
      chargerMoyenne()
    }
  }, [garageId])

  const chargerGarages = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/garages', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setGarages(Array.isArray(data) ? data : [])
    } catch (error) {
      setErreur('Erreur de chargement des garages')
    }
  }

  const chargerAvis = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/avis/getavis/${garageId}`)
      const data = await response.json()
      setAvis(Array.isArray(data) ? data : [])
    } catch (error) {
      setErreur('Erreur de chargement des avis')
    }
  }

  const chargerMoyenne = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/avis/moyenne/${garageId}`)
      const data = await response.json()
      setMoyenne(data.moyenne || 0)
    } catch (error) {
      console.log('Erreur moyenne')
    }
  }

  const handleSoumettreAvis = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')

    try {
      const response = await fetch('http://localhost:3000/api/avis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garage_id: garageId,
          utilisateur_id: userId,
          note,
          qualite,
          prix,
          accueil,
          details,
          commentaire
        })
      })

      const data = await response.json()
      if (response.ok) {
        setSucces('Avis soumis avec succès!')
        setShowForm(false)
        setCommentaire('')
        setNote(5)
        chargerAvis()
        chargerMoyenne()
      } else {
        setErreur(data.message || 'Erreur lors de la soumission')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const handleModifier = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')

    try {
      const response = await fetch(`http://localhost:3000/api/avis/modifieravis/${avisAModifier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: avisAModifier.note,
          commentaire: avisAModifier.commentaire,
          utilisateur_id: userId
        })
      })

      if (response.ok) {
        setSucces('Avis modifié!')
        setAvisAModifier(null)
        chargerAvis()
        chargerMoyenne()
      } else {
        const data = await response.json()
        setErreur(data.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      setErreur('Erreur de connexion au serveur')
    }
  }

  const handleSupprimer = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/avis/supprimeravis/${id}`, {
        method: 'DELETE'
      })
      chargerAvis()
      chargerMoyenne()
    } catch (error) {
      setErreur('Erreur lors de la suppression')
    }
  }

  const renderEtoiles = (valeur: number, onChange?: (v: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange && onChange(i)}
            className={`text-2xl ${i <= valeur ? 'text-yellow-400' : 'text-gray-600'} ${onChange ? 'cursor-pointer hover:text-yellow-300' : 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white mr-4">← Retour</button>
          <h1 className="text-2xl font-bold">⭐ Évaluations et avis</h1>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <label className="text-gray-300 block mb-1">Choisir un garage</label>
          <select
            value={garageId}
            onChange={(e) => setGarageId(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
          >
            <option value="">Sélectionner un garage</option>
            {garages.map((g: any) => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>

        {garageId && (
          <>
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex justify-between items-center">
              <div>
                <p className="text-gray-300">Note moyenne</p>
                <div className="flex items-center gap-2">
                  {renderEtoiles(Math.round(moyenne))}
                  <span className="text-yellow-400 font-bold text-xl">{moyenne.toFixed(1)}/5</span>
                </div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                + Laisser un avis
              </button>
            </div>

            {showForm && (
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Mon évaluation</h2>
                <form onSubmit={handleSoumettreAvis} className="space-y-4">
                  <div>
                    <label className="text-gray-300 block mb-1">Note globale</label>
                    {renderEtoiles(note, setNote)}
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1">Qualité</label>
                    {renderEtoiles(qualite, setQualite)}
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1">Prix</label>
                    {renderEtoiles(prix, setPrix)}
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1">Accueil</label>
                    {renderEtoiles(accueil, setAccueil)}
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1">Détails</label>
                    {renderEtoiles(details, setDetails)}
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1">Commentaire</label>
                    <textarea
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                      rows={4}
                      placeholder="Partagez votre expérience..."
                    />
                  </div>

                  {erreur && <p className="text-red-400">{erreur}</p>}
                  {succes && <p className="text-green-400">{succes}</p>}

                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                  >
                    Soumettre l'avis
                  </button>
                </form>
              </div>
            )}

            {avisAModifier && (
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Modifier mon avis</h2>
                <form onSubmit={handleModifier} className="space-y-4">
                  <div>
                    <label className="text-gray-300 block mb-1">Note</label>
                    {renderEtoiles(avisAModifier.note, (v) => setAvisAModifier({...avisAModifier, note: v}))}
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1">Commentaire</label>
                    <textarea
                      value={avisAModifier.commentaire}
                      onChange={(e) => setAvisAModifier({...avisAModifier, commentaire: e.target.value})}
                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                      Sauvegarder
                    </button>
                    <button type="button" onClick={() => setAvisAModifier(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded">
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Avis des clients</h2>
              {avis.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aucun avis pour ce garage</p>
              ) : (
                avis.map((a: any) => (
                  <div key={a.id} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{a.utilisateurs?.prenom} {a.utilisateurs?.nom}</p>
                        {renderEtoiles(a.note)}
                        <p className="text-gray-400 mt-2">{a.commentaire}</p>
                        <p className="text-gray-500 text-sm mt-1">{new Date(a.created_at).toLocaleDateString('fr-CA')}</p>
                      </div>
                      {a.utilisateur_id === userId && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAvisAModifier(a)}
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleSupprimer(a.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}