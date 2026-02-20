import supabase from '../config/supabaseClient.js'

export const getRdvToday = async (req, res) => {
  try {
    const today = new Date()

    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const { count, error } = await supabase
      .from('rendez_vous')
      .select('*', { count: 'exact', head: true })
      .gte('date_rendezvous', startOfDay.toISOString())
      .lte('date_rendezvous', endOfDay.toISOString())
//liste rdv
const { data: listeRdv, error: errorListe } = await supabase
      .from('rendez_vous')
      .select('*', { count: 'exact', head: false })
      .gte('date_rendezvous', startOfDay.toISOString())
      .lte('date_rendezvous', endOfDay.toISOString())



    if (error) return res.status(400).json(error)

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      nombre_rdv: count,
      liste_rdv: listeRdv
    })

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" })
  }
}
//liste rdv by date 
export const getRdvByDate = async (req, res) => {
  try {
    const { date } = req.query

    if (!date) {
      return res.status(400).json({
        message: "La date est obligatoire (format YYYY-MM-DD)"
      })
    }

    const startOfDay = new Date(`${date}T00:00:00`)
    const endOfDay = new Date(`${date}T23:59:59`)

    const { data, count, error } = await supabase
      .from('rendez_vous')
      .select('*', { count: 'exact' })
      .gte('date_rendezvous', startOfDay.toISOString())
      .lte('date_rendezvous', endOfDay.toISOString())

    if (error) {
      return res.status(400).json(error)
    }

    res.json({
      date,
      nombre_rdv: count,
      liste_rdvbydate: data
    })

  } catch (err) {
    res.status(500).json({
      message: "Erreur serveur"
    })
  }
}