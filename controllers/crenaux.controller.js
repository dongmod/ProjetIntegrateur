
import supabase from "../config/supabaseClient.js";
export const getCrenaux = async (req, res) => {
  try {
const { date, service_id } = req.query
  console.log("date =", date)
  console.log("service_id =", service_id)

    if (!date || !service_id) {
      return res.status(400).json({ message: "date et service_id requis" })
    }

    // 1️ Récupérer service
    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single()
      
  console.log("service =", service)
 if (!service) {
  return res.status(404).json({ message: "Service introuvable" })
}
    const duree = service.duree

    // 2️ Récupérer garage
    const { data: garages } = await supabase
      .from('garages')
      .select('*')
      .limit(1)
      .single()
   
  console.log("garages =", garages)


if (!garages) {
  return res.status(404).json({ message: "Garage introuvable" })
}
    const ouverture = normalizeTime(garages.heure_ouverture)
    const fermeture = normalizeTime(garages.heure_fermeture)
    //normalise les dates pour éviter les problèmes de format (ex: "08:00" vs "08:00:00")
function normalizeTime(time) {
  // Exemples possibles : "08:00", "08:00:00", "08:00:00.000000"
  return time.split(".")[0]        // enlève .000000
             .padEnd(8, ":00");    // ajoute les secondes si manquantes
}
    // 3️ Nombre postes
    const { count: totalPostes } = await supabase
      .from('postes_travail')
      .select('*', { count: 'exact', head: true })
console.log("totalPostes =", totalPostes)
    // 4️ RDV existants
    const { data: rdvs } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('date_rendezvous', `${date}T00:00:00`)

    const creneauxDisponibles = []

    let current = new Date(`${date}T${ouverture}`)
    const endDay = new Date(`${date}T${fermeture}`)
console.log("DEBUG → ouverture:", ouverture)
console.log("DEBUG → fermeture:", fermeture)
console.log("DEBUG → duree:", duree)
console.log("DEBUG → totalPostes:", totalPostes)
console.log("DEBUG → rdvs:", rdvs)
console.log("DEBUG → current:", current)
console.log("DEBUG → endDay:", endDay)
    while (current < endDay) {

      const start = new Date(current)
      const finish = new Date(current)
      finish.setMinutes(finish.getMinutes() + duree)

      if (finish > endDay) break

      let conflits = 0

      for (let rdv of rdvs) {

        const rdvStart = new Date(`${date}T${rdv.heure_debut}`)
        const rdvEnd = new Date(`${date}T${rdv.heure_fin}`)

        const chevauche =
          start < rdvEnd && finish > rdvStart

        if (chevauche) conflits++
      }

      if (conflits < totalPostes) {
        creneauxDisponibles.push({
          debut: start.toTimeString().slice(0,5),
          fin: finish.toTimeString().slice(0,5)
        })
      }

      current.setMinutes(current.getMinutes() + duree)
    }

    res.json(creneauxDisponibles)

  } catch (err) {
    console.error("Erreur getCrenaux :", err);

    res.status(500).json({ message: "Erreur serveur" })
  }
}
