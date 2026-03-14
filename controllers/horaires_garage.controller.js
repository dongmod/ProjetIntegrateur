import supabase from '../config/supabaseClient.js'

// Schedule Garage
export const getHorairesGarage = async (req, res) => {
  const { garage_id } = req.query
  try {
    const { data, error } = await supabase
      .from('horaires_garage')
      .select('*')
      .eq('garage_id', garage_id)
      .order('jour', { ascending: true })

    if (error) return res.status(400).json(error)
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })
  }
}

// Create or update a daily schedule
export const upsertHoraireGarage = async (req, res) => {
  const { garage_id, jour, heure_ouverture, heure_fermeture, actif } = req.body
  try {
    const { data, error } = await supabase
      .from('horaires_garage')
      .upsert([{ garage_id, jour, heure_ouverture, heure_fermeture, actif }],
        { onConflict: 'garage_id,jour' })
      .select()

    if (error) return res.status(400).json(error)
    res.json(data[0])
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })
  }
}