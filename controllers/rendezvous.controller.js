import supabase from '../config/supabaseClient.js'

/**
 * CREER RENDEZ-VOUS
 */
export const createRendezVous = async (req, res) => {
  const userId = req.user.id
  const { vehicule_id, garage_id, date_rendezvous, type_service } = req.body

  try {
    // véhicule appartient au client
    const { data: vehicule, error: vehiculeError } = await supabase
      .from('vehicules')
      .select('*')
      .eq('id', vehicule_id)
      .eq('client_id', userId)
      .single()

    if (vehiculeError || !vehicule) {
      return res.status(403).json({ message: "Véhicule invalide" })
    }

    //  conflit horaire
    const { data: conflit } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('garage_id', garage_id)
      .eq('date_rendezvous', date_rendezvous)

    if (conflit.length > 0) {
      return res.status(400).json({ message: "Créneau déjà réservé" })
    }

    // insérer rendez-vous
    const { data, error } = await supabase
      .from('rendez_vous')
      .insert([
        {
          vehicule_id,
          garage_id,
          date_rendezvous,
          type_service,
          statut: 'planifie'
        }
      ])
      .select()

    if (error) {
      return res.status(400).json(error)
    }

    res.status(201).json({
      message: "Rendez-vous créé avec succès",
      rendez_vous: data
    })

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })
  }
}
export const getMesRendezVous = async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('rendez_vous')
    .select(`
      *,
      vehicules (
        marque,
        modele,
        plaque
      )
    `)
    .in('vehicule_id',
      (
        await supabase
          .from('vehicules')
          .select('id')
          .eq('client_id', userId)
      ).data.map(v => v.id)
    )

  if (error) return res.status(400).json(error)

  res.json(data)
}
export const deleteRendezVous = async (req, res) => {
  const rdvId = req.params.id

  const { error } = await supabase
    .from('rendez_vous')
    .delete()
    .eq('id', rdvId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Rendez-vous supprimé" })
}

export const updateRendezVous = async (req, res) => {
  const rdvId = req.params.id
  const { date_rendezvous, type_service, statut } = req.body

  const { data, error } = await supabase
    .from('rendez_vous')
    .update({ date_rendezvous, type_service, statut })
    .eq('id', rdvId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}
