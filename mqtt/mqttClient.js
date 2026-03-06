/*import mqtt from "mqtt"
import supabase from "../config/supabaseClient.js"

const client = mqtt.connect("mqtt://localhost:1883")

client.on("connect", () => {
  console.log("MQTT connecté sur Raspberry")
  client.subscribe("garage/poste")
})

client.on("message", async (topic, message) => {

  try {
    const data = JSON.parse(message.toString())

    console.log("Message reçu :", data)

    await supabase
      .from("postes_travail")
      .update({ statut: data.statut })
      .eq("id", data.poste_id)

    console.log("Statut mis à jour en DB")

  } catch (err) {
    console.error("Erreur MQTT :", err)
  }
})
*/
import mqtt from "mqtt"
import supabase from "../config/supabaseClient.js"
import { da, de } from "zod/v4/locales"

const client = mqtt.connect("mqtt://localhost:1883")
const clientvin = mqtt.connect("mqtt://localhost:1883")
client.on("connect", () => {
  console.log("--------------------- Backend MQTT connecté,  --------continuer pour remplacer la plaque----------------")
  client.subscribe("garage/capteur")
})

// mqtt pour le telephone
clientvin.subscribe("garage/capteurvin")

clientvin.on("message", (topic, message) => {
  const data = JSON.parse(message.toString())

  if (data.type === "lecteur_vin") {
    console.log("VIN reçu dans le garage :", data.vin)
  }
})















client.on("message", async (topic, message) => {
  try {

    const payloaddata = JSON.parse(message.toString())

    console.log(" Message reçu :", payloaddata)

    //  Trouver poste associé au capteur
    const { data: capteur, error } = await supabase
      .from("capteurs")
      .select("poste_id")
      .eq("id", payloaddata.sensor_id)
      .single()

    if (error || !capteur) {
      console.log(" Capteur non trouvé en DB")
      return
    }

console.log(" Capteur trouvé en DB :", capteur)
switch (payloaddata.type) {
  case "capteurmagnétique":


    //  Calcul statut
    const statutsimul = 
      payloaddata.distance < 10 && payloaddata.valeurmagnetic === 1
        ? 1
        : 0
            const statutposte = 
      payloaddata.distance < 10 && payloaddata.valeurmagnetic === 1
        ? "occupé"
        : "libre"

    //  Update poste
    await supabase
      .from("postes_travail")
      .update({
        statut: statutposte,
      })
      .eq("id", capteur.poste_id)
   await supabase
      .from("capteurs")
      .update({
        derniere_mise_a_jour: new Date().toISOString(),
        derniere_valeur: statutsimul
      })
      .eq("id", payloaddata.sensor_id)
    console.log(" capteur mis à jour :", capteur.poste_id, statutsimul)

  break;
  case "lecteur_vin":
    await supabase
      .from("capteurs")
      .update({
        derniere_mise_a_jour: new Date().toISOString(),
        derniere_valeur: payloaddata.vin
      })
      .eq("id", payloaddata.sensor_id)
    console.log(" VIN mis à jour dans capteurs :", payloaddata.sensor_id, payloaddata.vin)

          //  Trouver le vin dans la DB pour associer à un véhicule
    const { data: vehicule, error: vehiculeError } = await supabase
      .from("vehicules") 
      .select("id,client_id,marque,modele,annee,plaque")
      .eq("plaque", payloaddata.vin)
      .single()
console.log(" Véhicule trouvé en DB :", vehicule)
    if (vehiculeError || !vehicule) {
      console.log(" Véhicule non trouvé en DB:")
      return data
    }

      //  Trouver le vehicule associé au rendezvous en cours pour ce poste
    const { data: rendezvous, error: rendezvousError } = await supabase
      .from("rendez_vous")
      .select("id,vehicule_id,statut")
      //.eq("poste_id", capteur.poste_id)
      .eq("statut", "planifie")
      .eq("vehicule_id", vehicule.id)
     .single()

    if (rendezvousError || !rendezvous) {
      console.log(" ....................Rendez-vous non trouvé en DB")
      return
    }
    console.log(" Rendez-vous trouvé en DB :", rendezvous)

    await supabase
      .from("rendez_vous")
      .update({
        statut: "en_cours",
        heure_debut: new Date().toTimeString().split(' ')[0]

      })
      .eq("id", rendezvous.id)
    console.log(" Rendez-vous mis à jour en 'en_cours' :", rendezvous.id)
// trouver la tache associée au rendez-vous et la mettre à jour en "en_cours"
    const { data: tache, error: tacheError } = await supabase
      .from("taches")
      .select("*")
      .eq("rendezvous_id", rendezvous.id)
      .single()
console.log(" .........................Tâche trouvée en DB :", tache)
    if (tacheError || !tache) {
      console.log(" Tâche non trouvée pour ce rendez-vous :", rendezvous.id)
      return
    }
  // mettre à jour la tache en "en_cours"
  await supabase
      .from("taches")
      .update({statut: "en_cours", heure_debut: new Date().toISOString()})
      .eq("rendezvous_id", rendezvous.id)
    console.log(" Tâche mise à jour en 'en_cours' :",rendezvous.id) 
    /*await supabase
      .from("taches")
      .update({
        statut: "en_cours",
        heure_debut: new Date().toTimeString().split(' ')[0]
      })
      .eq("id", tache.id)*/
  break;

    default:
    console.warn("Type inconnu :", payloaddata.type);
}



  } catch (err) {
    console.error(" Erreur MQTT :", err)
  }
})
