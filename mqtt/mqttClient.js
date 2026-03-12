
import mqtt from "mqtt"
import supabase from "../config/supabaseClient.js"

// ---------------- LOGGING ----------------
const log = {
  info: (...msg) => console.log("[INFO]", ...msg),
  warn: (...msg) => console.warn("[WARN]", ...msg),
  error: (...msg) => console.error("[ERROR]", ...msg),
};
const MQTT_URL = "mqtt://localhost:1883";
const TOPIC_CAPTEUR = "garage/capteur";
const TOPIC_ALERTES = "garage/alertes";
export const client = mqtt.connect(MQTT_URL)
const clientvin = mqtt.connect(MQTT_URL)

//// mes connections MQTT
client.on("connect", () => {
  console.log("--------------------- Backend MQTT connecté  capteur-------------")
  client.subscribe(TOPIC_CAPTEUR);
  client.subscribe(TOPIC_ALERTES);
  console.log("Abonné aux topics :", TOPIC_CAPTEUR, TOPIC_ALERTES)
})
/*
clientvin.on("connect", () => {
  console.log("--------------------- Backend MQTT connecté  vin-------------")
  clientvin.subscribe(TOPIC_VIN)
  console.log("Abonné aux topics : vin/capteurvin ")

})*/
//-----------------mqtt vin------------------
/*clientvin.on("message", (topic, message) => {
  try {
  const data = JSON.parse(message.toString())

  if (data.type === "lecteur_vin") {
    log.info("VIN reçu dans le garage :", data.vin)
  }else {
      log.warn("Message VIN avec type inconnu:", data);
    }
    } catch (err) {
    log.error("Erreur parsing message VIN:", err);
  }
});*/


client.on("message", async (topic, message) => {
  try {

    const payloaddata = JSON.parse(message.toString())

   if (topic === "garage/alertes") {
    const data = JSON.parse(message.toString());
    log.warn(" Alerte reçue Nous allons traiter :", data);
    return;
  }
    //  Trouver poste associé au capteur
    const { data: capteur, error } = await supabase
      .from("capteurs")
      .select("poste_id")
      .eq("id", payloaddata.sensor_id)
      .single()

    if (error || !capteur) {
      log.info(" Capteur non trouvé en DB")
      return
    }
    switch (payloaddata.type) {
      case "capteurmagnétique":
{


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
          log.info(" Poste mis à jour :", capteur.poste_id, statutposte)
        await supabase
          .from("capteurs")
          .update({
            derniere_mise_a_jour: new Date().toISOString(),
            derniere_valeur: statutsimul
          })
          .eq("id", payloaddata.sensor_id)

        log.info(" capteur mis à jour :", capteur.poste_id, statutsimul)

      break;
 }
      case "lecteur_vin":
{
        await supabase
          .from("capteurs")
          .update({
            derniere_mise_a_jour: new Date().toISOString(),
            derniere_valeur: payloaddata.vin
          })
          .eq("id", payloaddata.sensor_id)
        log.info(" VIN mis à jour dans capteurs :", payloaddata.sensor_id, payloaddata.vin)

       //  Trouver le vin dans la DB pour associer à un véhicule
        const { data: vehicule, error: vehiculeError } = await supabase
          .from("vehicules") 
          .select("id,client_id,marque,modele,annee,plaque")
          .eq("plaque", payloaddata.vin)
          .single()
         log.info(" Véhicule trouvé en DB :", vehicule)
        if (vehiculeError || !vehicule) {
          log.info(" Véhicule non trouvé en DB:")
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
          log.info(" ....................Rendez-vous non trouvé en DB")
          return
        }
        log.info(" Rendez-vous trouvé en DB :", rendezvous)

        await supabase
          .from("rendez_vous")
          .update({
            statut: "en_cours",
            heure_debut: new Date().toTimeString().split(' ')[0]

          })
          .eq("id", rendezvous.id)
        log.info(" Rendez-vous mis à jour en 'en_cours' :", rendezvous.id)
    // trouver la tache associée au rendez-vous et la mettre à jour en "en_cours"
        const { data: tache, error: tacheError } = await supabase
          .from("taches")
          .select("*")
          .eq("rendezvous_id", rendezvous.id)
          .single()
    log.info(" .........................Tâche trouvée en DB :", tache)
        if (tacheError || !tache) {
          log.info(" Tâche non trouvée pour ce rendez-vous :", rendezvous.id)
          return
        }
      // mettre à jour la tache en "en_cours"
      await supabase
          .from("taches")
          .update({statut: "en_cours", heure_debut: new Date().toISOString()})
          .eq("rendezvous_id", rendezvous.id)
        log.info(" Tâche mise à jour en 'en_cours' :",rendezvous.id) 

      break;
}
        default:
        log.warn("Type inconnu :", payloaddata.type);
    }



  } catch (err) {
    log.error(" Erreur MQTT :", err)
  }
});
export default client;