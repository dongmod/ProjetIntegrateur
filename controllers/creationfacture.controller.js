import supabase from "../config/supabaseClient.js";
import { io } from "../server.js";
export const createFacture = async (req, res) => {
  console.log("USER:", req.user);
  try {
    const { rendezvous_id, items,km_derniere_maint } = req.body
    // Vérifier que le rendez-vous existe et est terminé
    const rdvCheck = await supabase     
     .from('rendez_vous')
      .select('id, statut, vehicule_id')
      .eq('id', rendezvous_id)
      .single()
    if (rdvCheck.error || !rdvCheck.data) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    if (rdvCheck.data.statut !== 'termine') {
      return res.status(400).json({ message: "Impossible de créer une facture pour un rendez-vous non terminé" })
    }
    let total = 0

    items.forEach(item => {
      total += item.quantite * item.prix_unitaire
    })

    const { data: facture } = await supabase
      .from('factures')
      .insert({
        rendezvous_id,
        client_id: req.user.id,
        total
      })
      .select()
      .single()
      //rechercher le client dans vehicules pour mettre à jour le km_derniere_maint
      const { data: vehicule } = await supabase
      .from('vehicules')
      .select('id, km_derniere_maint,client_id')
      .eq('id', rdvCheck.data.vehicule_id)
      .single()
      // mise a jour du dernier kilométrage de maintenance du véhicule
    const { error: updateError } = await supabase
      .from("vehicules")
      .update({ km_derniere_maint: km_derniere_maint,client_id: vehicule.client_id })
      .eq("id", facture.vehicule_id)
//verifier si km_derniere_maint est vide ou null avant de faire la mise à jour
    if (updateError) {
      console.error("Erreur lors de la mise à jour du kilométrage de maintenance :", updateError);
    } else {
      console.log(`Mise à jour réussie du kilométrage de maintenance pour le véhicule ${facture.vehicule_id} avec km_derniere_maint = ${km_derniere_maint}`);
    }

    const itemsFormatted = items.map(i => ({// formater les items pour insertion tesl que chaque item a une référence à la facture créée
      facture_id: facture.id,
      description: i.description,
      quantite: i.quantite,
      prix_unitaire: i.prix_unitaire
    }))

    await supabase
      .from('facture_items')
      .insert(itemsFormatted)

    res.json({ message: "Facture créée", facture })

  } catch (err) {
    console.log("ERREUR SERVEUR:", err);
    res.status(500).json({ message: "Erreur serveur" })
  }
}
export const getMesfactures = async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('factures')
    .select('*')
    .eq('client_id', userId)



  if (error) return res.status(400).json(error)

  res.json(data) 
}
export const getfacturesall = async (req, res) => {

  const { data, error } = await supabase
    .from('factures')
    .select('*')



  if (error) return res.status(400).json(error)

  res.json(data)
}